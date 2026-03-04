import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import { adminAuth } from "@/shared/services/firebase/admin";
import { safeLogError } from "@/shared/utils/security/pii-sanitization";
import { updateProfileSchema } from "@/shared/utils/validation/api-validation";
import { debugLog } from "@/shared/utils/debug";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createNotFoundResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: auth.user.id,
        isDeleted: false, // Only allow active users to access profile
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return createNotFoundResponse("User not found");
    }

    // Get Firebase user to check authentication provider
    let isOAuthUser = false;
    try {
      if (auth.firebaseUser?.uid) {
        const firebaseUser = await adminAuth.getUser(auth.firebaseUser.uid);
        isOAuthUser = !firebaseUser.providerData.some(
          (provider) => provider.providerId === "password"
        );
      }
    } catch (error) {
      safeLogError("Failed to check Firebase provider", error, {
        service: "profile",
        operation: "GET",
      });
      // Continue without provider info if Firebase check fails
    }

    return createSuccessResponse({
      profile: user,
      isOAuthUser,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch customer profile",
      { service: "profile", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch profile", error);
  }
}

/**
 * PUT /api/customer/profile
 * Updates authenticated customer's profile with comprehensive validation.
 *
 * @param {UpdateProfileInput} body - Profile update data
 * @returns {Object} Updated profile information
 */
async function putHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();

    // Body is already validated by middleware (bodySchema: updateProfileSchema)
    // No need to validate again - just use the validated data
    const { name, email, phone, address, timezone } = body;

    debugLog.info(
      "Processing profile update",
      {
        service: "customer-profile",
        operation: "PUT",
      },
      {
        customerId: auth.user.id,
        fieldsToUpdate: Object.keys(body).filter(
          (key) => body[key as keyof typeof body] !== undefined
        ),
      }
    );

    // Check if email is being changed and handle Firebase auth update
    if (email !== undefined && email !== auth.user.email) {
      try {
        // Get Firebase user to check provider
        const firebaseUser = await adminAuth.getUser(auth.firebaseUser.uid);

        // Check if user uses email/password authentication (not OAuth)
        const hasEmailProvider = firebaseUser.providerData.some(
          (provider) => provider.providerId === "password"
        );

        if (!hasEmailProvider) {
          debugLog.warn(
            "Attempted email change for OAuth user",
            {
              service: "customer-profile",
              operation: "PUT",
            },
            { customerId: auth.user.id, newEmail: email }
          );

          return createBadRequestResponse(
            "Cannot change email for OAuth accounts. Please update through your OAuth provider.",
            { code: "OAUTH_EMAIL_CHANGE_NOT_ALLOWED" }
          );
        }

        // Check if the new email is already in use
        try {
          await adminAuth.getUserByEmail(email);
          // If we get here, email is already in use
          return createBadRequestResponse(
            "This email is already in use by another account",
            { code: "EMAIL_ALREADY_EXISTS" }
          );
        } catch (error: unknown) {
          // If getUserByEmail throws, email is not in use (which is what we want)
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code !== "auth/user-not-found"
          ) {
            throw error; // Re-throw unexpected errors
          }
        }

        // Update Firebase email
        await adminAuth.updateUser(auth.firebaseUser.uid, {
          email: email,
        });

        debugLog.info(
          "Firebase email updated successfully",
          {
            service: "customer-profile",
            operation: "PUT",
          },
          { customerId: auth.user.id }
        );
      } catch (firebaseError: unknown) {
        debugLog.error(
          "Failed to update Firebase email",
          {
            service: "customer-profile",
            operation: "PUT",
          },
          {
            customerId: auth.user.id,
            error: firebaseError,
          }
        );

        // Handle specific Firebase errors
        const firebaseErrorCode =
          firebaseError &&
          typeof firebaseError === "object" &&
          "code" in firebaseError
            ? firebaseError.code
            : null;
        if (firebaseErrorCode === "auth/email-already-exists") {
          return createBadRequestResponse(
            "This email is already in use by another account",
            { code: "EMAIL_ALREADY_EXISTS" }
          );
        }

        if (firebaseErrorCode === "auth/invalid-email") {
          return createBadRequestResponse("Invalid email format", {
            code: "INVALID_EMAIL",
          });
        }

        return createInternalErrorResponse(
          "Failed to update email in authentication system",
          { code: "AUTH_UPDATE_FAILED" }
        );
      }
    }

    // Build update data object with only defined fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (timezone !== undefined) updateData.timezone = timezone;

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return createBadRequestResponse("No fields to update", {
        code: "NO_FIELDS_PROVIDED",
      });
    }

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    debugLog.info(
      "Profile updated successfully",
      {
        service: "customer-profile",
        operation: "PUT",
      },
      {
        customerId: auth.user.id,
        updatedFields: Object.keys(updateData),
      }
    );

    return createSuccessResponse(
      {
        message: "Profile updated successfully",
        profile: updatedUser,
      },
      undefined,
      200
    );
  } catch (error: unknown) {
    debugLog.error(
      "Failed to update user profile",
      {
        service: "customer-profile",
        operation: "PUT",
      },
      {
        customerId: auth.user.id,
        error,
      }
    );

    // Handle Prisma-specific errors
    const errorCode =
      error && typeof error === "object" && "code" in error ? error.code : null;
    if (errorCode === "P2002") {
      return createBadRequestResponse("Email already exists", {
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    return createInternalErrorResponse("Failed to update profile", {
      code: "UPDATE_FAILED",
    });
  }
}

export const GET = withUserProtection(getHandler, {
  rateLimitType: "customer",
});
export const PUT = withUserProtection(putHandler, {
  bodySchema: updateProfileSchema,
  rateLimitType: "customer",
});
