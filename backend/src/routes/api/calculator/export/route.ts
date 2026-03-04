/**
 * Calculator Export API Route - Modern SaaS Design
 *
 * POST: Export calculation results in various formats (PDF, Excel, CSV)
 * Uses Firebase Auth custom claims (stripeRole) to check subscription tier
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
import { prisma } from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createForbiddenResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { calculatorExportSchema } from "@/shared/utils/validation/api-validation";

async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();
    const { calculationId, format } = body;

    // Validate format
    const validFormats = ["pdf", "excel", "csv"];
    if (!format || !validFormats.includes(format.toLowerCase())) {
      return createBadRequestResponse(
        "Invalid export format. Supported formats: pdf, excel, csv"
      );
    }

    // Check subscription tier from Firebase Auth custom claims
    // Firebase Extension sets stripeRole custom claim based on subscription
    // Use type guard instead of unsafe type assertion
    const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);

    if (!stripeRole) {
      return createForbiddenResponse(
        "Active subscription required to export calculations"
      );
    }

    // Check if tier supports this export format
    const tierConfig = getTierConfig(stripeRole);
    const formatLower = format.toLowerCase();
    if (!tierConfig.features.exportFormats.includes(formatLower)) {
      return createForbiddenResponse(
        `Export to ${format.toUpperCase()} is not available in your ${stripeRole} plan. Please upgrade to access this feature.`
      );
    }

    // Get calculation data
    const calculation = await prisma.featureUsage.findFirst({
      where: {
        id: calculationId,
        userId: auth.user.id,
      },
    });

    if (!calculation) {
      return createNotFoundResponse("Calculation not found");
    }

    // TODO: Implement actual export generation
    // For now, return a placeholder response
    debugLog.info("Export requested", {
      service: "calculator-api",
      operation: "POST",
      userId: auth.user.id,
      calculationId,
      format,
    });

    return createSuccessResponse({
      message: "Export functionality will be implemented soon",
      calculationId,
      format,
      // In production, this would return the file URL or file data
    });
  } catch (error) {
    debugLog.error(
      "Error exporting calculation",
      {
        service: "calculator-api",
        operation: "POST",
      },
      error
    );

    const errorMessage =
      error instanceof Error ? error.message : "Failed to export calculation";
    return createInternalErrorResponse(errorMessage, error);
  }
}

export const POST = withUserProtection(postHandler, {
  bodySchema: calculatorExportSchema,
  rateLimitType: "customer",
});
