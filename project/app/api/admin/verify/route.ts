import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { adminAuth } from "@/shared/services/firebase/admin";
import { prisma } from "@/shared/services/db/prisma";
import { ADMIN_SPECIAL_CODE_HASH } from "@/shared/utils/config/envUtil";
import { debugLog } from "@/shared/utils/debug/debug";
import type { AdminAuthResultWithDbUserId } from "@/features/auth/types/auth.types";
import {
  withAdminProtection,
  withUserProtection,
} from "@/shared/middleware/api-route-protection";

// Constants
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  ADMIN_CODE_REQUIRED: "Admin code is required",
  AUTH_TOKEN_REQUIRED: "Authorization token required",
  INVALID_AUTH_TOKEN: "Invalid authentication token",
  INVALID_ADMIN_CODE: "Invalid admin code",
  CONFIG_ERROR: "Admin verification not properly configured",
  ROLE_ASSIGNMENT_FAILED: "Failed to set admin role",
  INTERNAL_ERROR: "Internal server error",
  VERIFICATION_FAILED: "Admin verification failed",
} as const;

/**
 * POST /api/admin/verify
 * Verifies admin code and grants admin role to authenticated user.
 *
 * @param {Object} body - Request body containing admin verification code
 * @returns {Object} Success confirmation or error message
 */
async function postHandler(request: NextRequest) {
  try {
    const { adminCode } = await request.json();

    debugLog.info("Admin verification attempt", {
      service: "admin-verify",
      operation: "POST",
    });

    if (!adminCode) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ADMIN_CODE_REQUIRED },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Get and verify the user's Firebase token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH_TOKEN_REQUIRED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const idToken = authHeader.slice(7);
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      debugLog.error(
        "Invalid Firebase token",
        { service: "admin-verify", operation: "POST" },
        error
      );
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Verify admin code
    if (!ADMIN_SPECIAL_CODE_HASH) {
      debugLog.error("ADMIN_SPECIAL_CODE_HASH environment variable not set", {
        service: "admin-verify",
        operation: "POST",
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONFIG_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    console.log(adminCode, ADMIN_SPECIAL_CODE_HASH);
    const hashedInput = createHash("sha256").update(adminCode).digest("hex");
    const trueAdminHash = createHash("sha256")
      .update(ADMIN_SPECIAL_CODE_HASH)
      .digest("hex");
    const isValidCode = hashedInput === trueAdminHash;

    if (!isValidCode) {
      debugLog.warn(
        "Invalid admin code attempt",
        {
          service: "admin-verify",
          operation: "POST",
        },
        { email: decodedToken.email }
      );
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_ADMIN_CODE },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Code is valid - set admin role. Database first (source of truth), then Firebase.
    // This avoids a window where Firebase=admin but DB=user if the DB update failed.
    const uid = decodedToken.uid;

    try {
      debugLog.info(
        "Granting admin role",
        {
          service: "admin-verify",
          operation: "POST",
        },
        { email: decodedToken.email, uid }
      );

      // 1. Update database first (source of truth). If this fails, we never touch Firebase.
      await prisma.user.upsert({
        where: { firebaseUid: uid },
        create: {
          firebaseUid: uid,
          email: decodedToken.email || "",
          name: decodedToken.name || "Admin User",
          role: "admin",
          isActive: true,
        },
        update: {
          role: "admin",
          lastLogin: new Date(),
        },
      });

      // 2. Sync to Firebase so token claims stay in sync. If this fails, next requireAdmin will re-sync from DB.
      await adminAuth.setCustomUserClaims(uid, { role: "admin" });

      debugLog.info(
        "Admin role granted successfully",
        {
          service: "admin-verify",
          operation: "POST",
        },
        { email: decodedToken.email, uid }
      );

      return NextResponse.json({
        success: true,
        message: "Admin role granted successfully",
      });
    } catch (error) {
      debugLog.error(
        "Error setting admin role",
        { service: "admin-verify", operation: "POST" },
        error
      );
      return NextResponse.json(
        { error: ERROR_MESSAGES.ROLE_ASSIGNMENT_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  } catch (error) {
    debugLog.error(
      "Error in admin verification",
      { service: "admin-verify", operation: "POST" },
      error
    );
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * GET /api/admin/verify
 * Checks if current user has admin access.
 *
 * @returns {Object} Admin verification status and user information
 */
async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AdminAuthResultWithDbUserId }
) {
  try {
    debugLog.info("Admin access verification check", {
      service: "admin-verify",
      operation: "GET",
    });

    debugLog.info(
      "Admin access verified",
      {
        service: "admin-verify",
        operation: "GET",
      },
      { userId: auth.user.id }
    );

    return NextResponse.json({
      success: true,
      message: "Admin access verified",
      user: auth.user,
    });
  } catch (error) {
    debugLog.error(
      "Error in admin verification",
      { service: "admin-verify", operation: "GET" },
      error
    );
    return NextResponse.json(
      { error: ERROR_MESSAGES.VERIFICATION_FAILED },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }
}

import { adminVerifySchema } from "@/shared/utils/validation/api-validation";

export const POST = withUserProtection(postHandler, {
  bodySchema: adminVerifySchema,
  rateLimitType: "customer",
});
export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
