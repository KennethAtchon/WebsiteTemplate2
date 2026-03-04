import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import { adminAuth } from "@/shared/services/firebase/admin";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";

async function deleteHandler(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    // checkRevoked: true — account deletion is destructive and must reject revoked sessions
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const firebaseUid = decodedToken.uid;

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: {
        firebaseUid,
        isDeleted: false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    debugLog.info(
      "Starting account deletion process",
      {
        service: "users",
        operation: "DELETE_ACCOUNT",
      },
      {
        userId: user.id,
        firebaseUid,
        currentlyDeleted: user.isDeleted,
      }
    );

    // Soft delete with anonymization
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        // Anonymize personal data for GDPR compliance
        name: "Deleted User",
        email: `deleted-${user.id}@example.com`,
        phone: null,
        address: null,
        firebaseUid: null, // Unlink Firebase account
        isActive: false,
      },
    });

    debugLog.info(
      "Database soft delete completed",
      {
        service: "users",
        operation: "DELETE_ACCOUNT",
      },
      {
        userId: user.id,
        isDeleted: updatedUser.isDeleted,
        deletedAt: updatedUser.deletedAt?.toISOString(),
        isActive: updatedUser.isActive,
        anonymizedEmail: updatedUser.email,
      }
    );

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(firebaseUid);
    } catch (firebaseError) {
      debugLog.error(
        "Failed to delete Firebase user",
        {
          service: "users",
          operation: "DELETE_ACCOUNT",
          step: "firebase_deletion",
        },
        firebaseError
      );
      // Continue - database deletion succeeded
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    debugLog.error(
      "Error deleting account",
      { service: "users", operation: "DELETE_ACCOUNT" },
      error
    );
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

import { deleteAccountSchema } from "@/shared/utils/validation/api-validation";

export const DELETE = withUserProtection(deleteHandler, {
  bodySchema: deleteAccountSchema,
  rateLimitType: "auth",
});
