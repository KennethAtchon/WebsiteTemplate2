/**
 * GDPR Data Portability — Export Personal Data
 *
 * GET: Returns all personal data for the authenticated user as JSON.
 * Satisfies GDPR Article 20 (right to data portability).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { withGetProtection } from "@/shared/middleware/api-route-protection";
import { debugLog } from "@/shared/utils/debug";
import { createInternalErrorResponse } from "@/shared/utils/api/response-helpers";
import { APP_NAME } from "@/shared/constants/app.constants";

async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const userId = auth.user.id;

    // Collect all personal data for this user
    const [user, orders, featureUsages] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          timezone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          hasUsedFreeTrial: true,
        },
      }),
      prisma.order.findMany({
        where: { userId, isDeleted: false },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          orderType: true,
          createdAt: true,
        },
      }),
      prisma.featureUsage.findMany({
        where: { userId },
        select: {
          id: true,
          featureType: true,
          inputData: true,
          resultData: true,
          usageTimeMs: true,
          createdAt: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      dataController: APP_NAME,
      gdprBasis: "Article 20 — Right to Data Portability",
      profile: user,
      orders,
      calculationHistory: featureUsages,
    };

    debugLog.info(
      "GDPR data export",
      {
        service: "users",
        operation: "EXPORT_DATA",
      },
      { userId }
    );

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-data-export-${new Date().toISOString().split("T")[0]}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    debugLog.error(
      "GDPR data export failed",
      {
        service: "users",
        operation: "EXPORT_DATA",
      },
      error
    );
    return createInternalErrorResponse("Failed to export data", error);
  }
}

export const GET = withGetProtection(getHandler, {
  requireAuth: "user",
  rateLimitType: "customer",
});
