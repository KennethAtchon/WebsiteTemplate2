/**
 * Calculator Calculate API Route - Modern SaaS Design
 *
 * POST: Perform a calculation based on type and inputs
 */

// External packages
import { NextRequest } from "next/server";

// Features (domain logic)
import type { AuthResult } from "@/features/auth/types/auth.types";
import { CalculatorService } from "@/features/calculator/services/calculator-service";
import {
  CalculationType,
  VALID_CALCULATION_TYPES,
  MortgageInputs,
  LoanInputs,
  InvestmentInputs,
  RetirementInputs,
  CalculationResponse,
} from "@/features/calculator/types/calculator.types";
import {
  mortgageInputSchema,
  loanInputSchema,
  investmentInputSchema,
  retirementInputSchema,
  validateCalculatorInput,
} from "@/features/calculator/types/calculator-validation";
import { calculationRequestSchema } from "@/shared/utils/validation/api-validation";

// Shared (reusable code)
import {
  getTierConfig,
  toSubscriptionTier,
} from "@/shared/constants/subscription.constants";
import {
  hasFeatureAccess,
  FEATURE_TIER_REQUIREMENTS,
} from "@/shared/utils/permissions/core-feature-permissions";
import { prisma } from "@/shared/services/db/prisma";
import { getMonthlyUsageCount } from "@/features/calculator/services/usage-service";
import { debugLog } from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createForbiddenResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();
    const { type, inputs } = body;

    // Validate calculation type
    if (!type || !VALID_CALCULATION_TYPES.includes(type as CalculationType)) {
      return createBadRequestResponse("Invalid calculation type");
    }

    const calculationType = type as CalculationType;

    // Validate inputs based on calculation type
    let validatedInputs:
      | MortgageInputs
      | LoanInputs
      | InvestmentInputs
      | RetirementInputs;

    switch (calculationType) {
      case "mortgage": {
        const validation = validateCalculatorInput(mortgageInputSchema, inputs);
        if (!validation.success) {
          return createBadRequestResponse(
            "Invalid mortgage inputs",
            validation.details
          );
        }
        validatedInputs = validation.data;
        break;
      }
      case "loan": {
        const validation = validateCalculatorInput(loanInputSchema, inputs);
        if (!validation.success) {
          return createBadRequestResponse(
            "Invalid loan inputs",
            validation.details
          );
        }
        validatedInputs = validation.data;
        break;
      }
      case "investment": {
        const validation = validateCalculatorInput(
          investmentInputSchema,
          inputs
        );
        if (!validation.success) {
          return createBadRequestResponse(
            "Invalid investment inputs",
            validation.details
          );
        }
        validatedInputs = validation.data;
        break;
      }
      case "retirement": {
        const validation = validateCalculatorInput(
          retirementInputSchema,
          inputs
        );
        if (!validation.success) {
          return createBadRequestResponse(
            "Invalid retirement inputs",
            validation.details
          );
        }
        validatedInputs = validation.data;
        break;
      }
      default:
        return createBadRequestResponse("Unsupported calculation type");
    }

    // Centralized permission check using single source of truth
    // Use type guard instead of unsafe type assertion
    const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);

    // Check calculator access using centralized permission system
    if (!hasFeatureAccess(stripeRole, calculationType)) {
      const requiredTier = FEATURE_TIER_REQUIREMENTS[calculationType];

      if (requiredTier === null) {
        // Mortgage - should never reach here, but handle gracefully
        return createInternalErrorResponse(
          "Unexpected error checking calculator access"
        );
      }

      if (!stripeRole) {
        return createForbiddenResponse(
          "Active subscription required to use this calculator"
        );
      }

      return createForbiddenResponse(
        `This calculation type requires ${requiredTier} tier or higher. Your current plan: ${stripeRole}. Please upgrade to access this feature.`
      );
    }

    // Check usage limit - only count gated calculators (free calculators don't count)
    if (FEATURE_TIER_REQUIREMENTS[calculationType] !== null && stripeRole) {
      const tierConfig = getTierConfig(stripeRole);
      const usageLimit =
        tierConfig.features.maxCalculationsPerMonth === -1
          ? null
          : tierConfig.features.maxCalculationsPerMonth;

      if (usageLimit !== null) {
        const usageCount = await getMonthlyUsageCount(auth.user.id);
        if (usageCount >= usageLimit) {
          return createForbiddenResponse(
            "Monthly calculation limit reached. Please upgrade your plan or wait for the next billing cycle."
          );
        }
      }
    }

    // Perform calculation using service method
    // Inputs are now validated and type-safe
    // Use switch to ensure type narrowing works with function overloads
    let calculationResponse: CalculationResponse;
    switch (calculationType) {
      case "mortgage":
        calculationResponse = CalculatorService.performCalculation(
          "mortgage",
          validatedInputs as MortgageInputs
        );
        break;
      case "loan":
        calculationResponse = CalculatorService.performCalculation(
          "loan",
          validatedInputs as LoanInputs
        );
        break;
      case "investment":
        calculationResponse = CalculatorService.performCalculation(
          "investment",
          validatedInputs as InvestmentInputs
        );
        break;
      case "retirement":
        calculationResponse = CalculatorService.performCalculation(
          "retirement",
          validatedInputs as RetirementInputs
        );
        break;
      default: {
        const _exhaustive: never = calculationType;
        return createBadRequestResponse(
          `Unsupported calculation type: ${_exhaustive}`
        );
      }
    }

    // Save calculation history (no subscriptionId needed anymore)
    try {
      // Serialize results to JSON-compatible format for Prisma Json field
      const serializedResults = JSON.parse(
        JSON.stringify(calculationResponse.results)
      ) as Record<string, unknown>;

      await prisma.featureUsage.create({
        data: {
          userId: auth.user.id,
          featureType: calculationType,
          inputData: calculationResponse.inputs,
          resultData: serializedResults,
          usageTimeMs: calculationResponse.calculationTime,
        },
      });
    } catch (error) {
      debugLog.warn(
        "Failed to save calculation history",
        {
          service: "calculator-api",
          operation: "POST",
        },
        error
      );
      // Don't fail the request if history save fails
    }

    debugLog.info("Calculation performed", {
      service: "calculator-api",
      operation: "POST",
      userId: auth.user.id,
      type: calculationType,
      calculationTime: calculationResponse.calculationTime,
    });

    return createSuccessResponse(calculationResponse);
  } catch (error) {
    debugLog.error(
      "Error performing calculation",
      {
        service: "calculator-api",
        operation: "POST",
      },
      error
    );

    const errorMessage =
      error instanceof Error ? error.message : "Failed to perform calculation";
    return createInternalErrorResponse(errorMessage, error);
  }
}

export const POST = withUserProtection(postHandler, {
  bodySchema: calculationRequestSchema,
  rateLimitType: "customer",
});
