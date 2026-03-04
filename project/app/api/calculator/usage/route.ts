/**
 * Calculator Usage API Route - Modern SaaS Design
 *
 * GET: Get current usage statistics for the authenticated user
 * Uses Firebase Auth custom claims (stripeRole) to determine tier limits
 */

// External packages
import { NextRequest } from "next/server";

// Features (domain logic)
import type { AuthResult } from "@/features/auth/types/auth.types";

// Shared (reusable code)
import {
  getTierConfig,
  toSubscriptionTier,
} from "@/shared/constants/subscription.constants";
import { getMonthlyUsageCount } from "@/features/calculator/services/usage-service";
import { debugLog } from "@/shared/utils/debug";
import { withGetProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    // Get subscription tier from Firebase Auth custom claims
    // Use type guard instead of unsafe type assertion
    const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);

    if (!stripeRole) {
      return createSuccessResponse({
        currentUsage: 0,
        usageLimit: null,
        percentageUsed: 0,
        limitReached: false,
      });
    }

    const tierConfig = getTierConfig(stripeRole);
    const usageLimit =
      tierConfig.features.maxCalculationsPerMonth === -1
        ? null
        : tierConfig.features.maxCalculationsPerMonth;

    const currentUsage = await getMonthlyUsageCount(auth.user.id);

    const percentageUsed =
      usageLimit === null
        ? 0
        : Math.min(100, (currentUsage / usageLimit) * 100);
    const limitReached = usageLimit !== null && currentUsage >= usageLimit;

    // Reset date is the first day of next month
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return createSuccessResponse({
      currentUsage,
      usageLimit,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      limitReached,
      resetDate: resetDate.toISOString(),
    });
  } catch (error) {
    debugLog.error(
      "Error fetching usage stats",
      {
        service: "calculator-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse(
      "Failed to fetch usage statistics",
      error
    );
  }
}

import { calculatorUsageQuerySchema } from "@/shared/utils/validation/api-validation";

export const GET = withGetProtection(getHandler, {
  querySchema: calculatorUsageQuerySchema,
  requireAuth: "user",
  rateLimitType: "customer",
});
