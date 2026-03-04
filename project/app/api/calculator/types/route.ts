/**
 * Calculator Types API Route - Modern SaaS Design
 *
 * GET: List available calculator types based on subscription tier
 * Uses Firebase Auth custom claims (stripeRole) to check subscription tier
 */

// External packages
import { NextRequest, NextResponse } from "next/server";

// Features (domain logic)
import { requireAuth } from "@/features/auth/services/firebase-middleware";

// Shared (reusable code)
import { toSubscriptionTier } from "@/shared/constants/subscription.constants";
import { hasFeatureAccess } from "@/shared/utils/permissions/core-feature-permissions";
import { getAllCalculatorConfigs } from "@/features/calculator/constants/calculator.constants";
import { debugLog } from "@/shared/utils/debug";
import { withGetProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Check subscription tier from Firebase Auth custom claims
    // Firebase Extension sets stripeRole custom claim based on subscription
    // Use type guard instead of unsafe type assertion
    const stripeRole = toSubscriptionTier(authResult.firebaseUser.stripeRole);

    // Build calculator types from centralized configuration
    const allTypes = getAllCalculatorConfigs().map((config) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      available: hasFeatureAccess(stripeRole, config.id),
      requiredTier: config.tierRequirement,
    }));

    if (!stripeRole) {
      return createSuccessResponse({
        types: allTypes,
        currentTier: null,
      });
    }

    return createSuccessResponse({
      types: allTypes,
      currentTier: stripeRole,
    });
  } catch (error) {
    debugLog.error(
      "Error fetching calculator types",
      {
        service: "calculator-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse(
      "Failed to fetch calculator types",
      error
    );
  }
}

export const GET = withGetProtection(getHandler, {
  requireAuth: "user",
  rateLimitType: "customer",
});
