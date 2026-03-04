/**
 * Calculator History API Route - Modern SaaS Design
 *
 * GET: Get calculation history for the authenticated user
 */

import { NextRequest } from "next/server";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { prisma } from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withGetProtection } from "@/shared/middleware/api-route-protection";
import {
  createPaginatedResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // Optional filter by calculation type

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: auth.user.id,
    };

    if (type) {
      where.featureType = type;
    }

    const [rows, total] = await Promise.all([
      prisma.featureUsage.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          featureType: true,
          inputData: true,
          resultData: true,
          usageTimeMs: true,
          createdAt: true,
        },
      }),
      prisma.featureUsage.count({ where }),
    ]);

    // Map to response shape (backward-compatible field names for client)
    const calculations = rows.map((r) => ({
      id: r.id,
      type: r.featureType,
      calculationType: r.featureType,
      inputData: r.inputData,
      resultData: r.resultData,
      calculationTime: r.usageTimeMs,
      createdAt: r.createdAt,
    }));

    debugLog.info("Calculation history fetched", {
      service: "calculator-api",
      operation: "GET",
      userId: auth.user.id,
      count: calculations.length,
    });

    return createPaginatedResponse(calculations, page, limit, total);
  } catch (error) {
    debugLog.error(
      "Error fetching calculation history",
      {
        service: "calculator-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse(
      "Failed to fetch calculation history",
      error
    );
  }
}

import { calculatorHistoryQuerySchema } from "@/shared/utils/validation/api-validation";

export const GET = withGetProtection(getHandler, {
  querySchema: calculatorHistoryQuerySchema,
  requireAuth: "user",
  rateLimitType: "customer",
});
