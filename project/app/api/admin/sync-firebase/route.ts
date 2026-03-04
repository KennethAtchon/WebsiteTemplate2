import { NextRequest, NextResponse } from "next/server";
import { FirebaseUserSync } from "@/shared/services/firebase/sync";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import { adminSyncFirebaseSchema } from "@/shared/utils/validation/api-validation";

// Constants
const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
} as const;

const PERCENTAGE_MULTIPLIER = 100;

// Error messages
const ERROR_MESSAGES = {
  SYNC_FAILED: "Failed to sync with Firebase",
  STATUS_FAILED: "Failed to get sync status",
} as const;

// Types
interface SyncSummary {
  total: number;
  successful: number;
  failed: number;
  results: unknown[];
}

interface SyncStatus {
  totalUsers: number;
  firebaseLinkedUsers: number;
  databaseOnlyUsers: number;
  syncPercentage: number;
}

/**
 * POST /api/admin/sync-firebase
 * Manually triggers synchronization of all users with Firebase (Admin only).
 *
 * @returns {Object} Sync completion summary with success/failure counts
 */
async function postHandler(_request: NextRequest) {
  try {
    debugLog.info("Starting Firebase user sync", {
      service: "admin-sync-firebase",
      operation: "POST",
    });

    const results = await FirebaseUserSync.syncAllUsers();

    const summary: SyncSummary = {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results: results,
    };

    debugLog.info(
      "Firebase sync completed",
      {
        service: "admin-sync-firebase",
        operation: "POST",
      },
      summary
    );

    return NextResponse.json({
      message: "Firebase sync completed",
      summary,
    });
  } catch (error) {
    debugLog.error(
      "Failed to sync with Firebase",
      { service: "admin-sync-firebase", operation: "POST" },
      error
    );
    return NextResponse.json(
      { error: ERROR_MESSAGES.SYNC_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * GET /api/admin/sync-firebase
 * Retrieves current Firebase synchronization status and statistics (Admin only).
 *
 * @returns {SyncStatus} Current sync statistics including total users and sync percentage
 */
async function getHandler(_request: NextRequest) {
  try {
    debugLog.info("Fetching Firebase sync status", {
      service: "admin-sync-firebase",
      operation: "GET",
    });

    const { prisma } = await import("@/shared/services/db/prisma");

    // Get user counts and calculate statistics
    const totalUsers = await prisma.user.count();
    const firebaseLinkedUsers = await prisma.user.count({
      where: {
        firebaseUid: {
          not: null,
        },
      },
    });

    const syncStatus: SyncStatus = {
      totalUsers,
      firebaseLinkedUsers,
      databaseOnlyUsers: totalUsers - firebaseLinkedUsers,
      syncPercentage: calculateSyncPercentage(firebaseLinkedUsers, totalUsers),
    };

    debugLog.info(
      "Successfully fetched sync status",
      {
        service: "admin-sync-firebase",
        operation: "GET",
      },
      syncStatus
    );

    return NextResponse.json(syncStatus);
  } catch (error) {
    debugLog.error(
      "Failed to get sync status",
      { service: "admin-sync-firebase", operation: "GET" },
      error
    );
    return NextResponse.json(
      { error: ERROR_MESSAGES.STATUS_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Calculates sync percentage with proper handling of division by zero.
 *
 * @param linked - Number of Firebase-linked users
 * @param total - Total number of users
 * @returns Sync percentage as rounded integer
 */
function calculateSyncPercentage(linked: number, total: number): number {
  return total > 0 ? Math.round((linked / total) * PERCENTAGE_MULTIPLIER) : 0;
}

export const POST = withAdminProtection(postHandler, {
  bodySchema: adminSyncFirebaseSchema,
  rateLimitType: "admin",
});
export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
