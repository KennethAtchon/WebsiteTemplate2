import { Hono } from "hono";
import {
  authMiddleware,
  csrfMiddleware,
  rateLimiter,
} from "../middleware/protection";

const calculator = new Hono();

/**
 * POST /api/calculator/calculate
 */
calculator.post(
  "/calculate",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const body = await c.req.json();
      const { type, inputs } = body;

      const { CalculatorService } = await import(
        "../features/calculator/services/calculator-service"
      );
      const {
        VALID_CALCULATION_TYPES,
        type: CalculationType,
      } = await import("../features/calculator/types/calculator.types");
      const {
        mortgageInputSchema,
        loanInputSchema,
        investmentInputSchema,
        retirementInputSchema,
        validateCalculatorInput,
      } = await import("../features/calculator/types/calculator-validation");
      const {
        hasFeatureAccess,
        FEATURE_TIER_REQUIREMENTS,
      } = await import("../utils/permissions/core-feature-permissions");
      const {
        getTierConfig,
        toSubscriptionTier,
      } = await import("../constants/subscription.constants");
      const { getMonthlyUsageCount } = await import(
        "../features/calculator/services/usage-service"
      );
      const { prisma } = await import("../services/db/prisma");

      // Validate calculation type
      if (!type || !VALID_CALCULATION_TYPES.includes(type)) {
        return c.json({ error: "Invalid calculation type" }, 400);
      }

      // Validate inputs based on type
      const schemaMap: Record<string, any> = {
        mortgage: mortgageInputSchema,
        loan: loanInputSchema,
        investment: investmentInputSchema,
        retirement: retirementInputSchema,
      };

      const schema = schemaMap[type];
      if (!schema) return c.json({ error: "Unsupported calculation type" }, 400);

      const validation = validateCalculatorInput(schema, inputs);
      if (!validation.success) {
        return c.json(
          { error: `Invalid ${type} inputs`, details: validation.details },
          400
        );
      }

      // Check access permissions
      const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);
      if (!hasFeatureAccess(stripeRole, type)) {
        const requiredTier = FEATURE_TIER_REQUIREMENTS[type];
        if (!stripeRole) {
          return c.json(
            { error: "Active subscription required to use this calculator" },
            403
          );
        }
        return c.json(
          {
            error: `This calculation type requires ${requiredTier} tier or higher. Your current plan: ${stripeRole}.`,
          },
          403
        );
      }

      // Check usage limits
      if (FEATURE_TIER_REQUIREMENTS[type] !== null && stripeRole) {
        const tierConfig = getTierConfig(stripeRole);
        const usageLimit =
          tierConfig.features.maxCalculationsPerMonth === -1
            ? null
            : tierConfig.features.maxCalculationsPerMonth;

        if (usageLimit !== null) {
          const usageCount = await getMonthlyUsageCount(auth.user.id);
          if (usageCount >= usageLimit) {
            return c.json(
              {
                error:
                  "Monthly calculation limit reached. Please upgrade your plan.",
              },
              403
            );
          }
        }
      }

      // Perform calculation
      const result = CalculatorService.performCalculation(
        type,
        validation.data
      );

      // Save calculation history
      try {
        const serializedResults = JSON.parse(
          JSON.stringify(result.results)
        );
        await prisma.featureUsage.create({
          data: {
            userId: auth.user.id,
            featureType: type,
            inputData: result.inputs,
            resultData: serializedResults,
            usageTimeMs: result.calculationTime,
          },
        });
      } catch {
        // Don't fail if history save fails
      }

      return c.json(result);
    } catch (error) {
      console.error("Calculation error:", error);
      return c.json({ error: "Failed to perform calculation" }, 500);
    }
  }
);

/**
 * GET /api/calculator/history
 */
calculator.get(
  "/history",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const type = c.req.query("type");
      const skip = (page - 1) * limit;

      const where: any = { userId: auth.user.id };
      if (type) where.featureType = type;

      const [history, total] = await Promise.all([
        prisma.featureUsage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.featureUsage.count({ where }),
      ]);

      return c.json({
        history,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return c.json({ error: "Failed to fetch calculation history" }, 500);
    }
  }
);

/**
 * GET /api/calculator/usage
 */
calculator.get(
  "/usage",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { getMonthlyUsageCount } = await import(
        "../features/calculator/services/usage-service"
      );
      const {
        getTierConfig,
        toSubscriptionTier,
      } = await import("../constants/subscription.constants");

      const usageCount = await getMonthlyUsageCount(auth.user.id);
      const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);
      const tierConfig = stripeRole ? getTierConfig(stripeRole) : null;
      const limit = tierConfig?.features.maxCalculationsPerMonth ?? 0;

      return c.json({
        used: usageCount,
        limit: limit === -1 ? "unlimited" : limit,
        remaining: limit === -1 ? "unlimited" : Math.max(0, limit - usageCount),
      });
    } catch (error) {
      console.error("Failed to fetch usage:", error);
      return c.json({ error: "Failed to fetch usage" }, 500);
    }
  }
);

/**
 * GET /api/calculator/types
 */
calculator.get(
  "/types",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const { VALID_CALCULATION_TYPES } = await import(
        "../features/calculator/types/calculator.types"
      );
      const {
        hasFeatureAccess,
        FEATURE_TIER_REQUIREMENTS,
      } = await import("../utils/permissions/core-feature-permissions");
      const { toSubscriptionTier } = await import(
        "../constants/subscription.constants"
      );

      const auth = c.get("auth");
      const stripeRole = toSubscriptionTier(auth.firebaseUser.stripeRole);

      const types = VALID_CALCULATION_TYPES.map((type: string) => ({
        type,
        hasAccess: hasFeatureAccess(stripeRole, type),
        requiredTier: FEATURE_TIER_REQUIREMENTS[type],
      }));

      return c.json({ types });
    } catch (error) {
      console.error("Failed to fetch types:", error);
      return c.json({ error: "Failed to fetch calculator types" }, 500);
    }
  }
);

/**
 * GET /api/calculator/export
 */
calculator.get(
  "/export",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");
      const format = c.req.query("format") || "json";

      const history = await prisma.featureUsage.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (format === "csv") {
        const csvRows = [
          "Date,Type,Inputs,Results,Time(ms)",
          ...history.map(
            (h: any) =>
              `${h.createdAt.toISOString()},${h.featureType},"${JSON.stringify(h.inputData)}","${JSON.stringify(h.resultData)}",${h.usageTimeMs}`
          ),
        ];
        return new Response(csvRows.join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="calculations.csv"',
          },
        });
      }

      return c.json({ history });
    } catch (error) {
      console.error("Failed to export:", error);
      return c.json({ error: "Failed to export calculations" }, 500);
    }
  }
);

export default calculator;
