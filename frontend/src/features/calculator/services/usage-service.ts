/**
 * Calculator Usage Service
 *
 * Centralised business logic for querying and checking monthly calculator usage.
 * Previously this query was copy-pasted in three places:
 *   - app/api/calculator/calculate/route.ts  (limit enforcement)
 *   - app/api/calculator/usage/route.ts      (usage stats for the client)
 *   - app/api/admin/subscriptions/route.ts   (admin view)
 */

// import { prisma } from "@/shared/services/db/prisma";
import {
  FEATURE_TIER_REQUIREMENTS,
  isFeatureFree,
} from "@/shared/utils/permissions/core-feature-permissions";

// TODO: Replace with actual Prisma client when database is integrated
const prisma: any = null;
import { getMonthBoundaries } from "@/shared/utils/helpers/date";

/**
 * Returns the list of gated (non-free) calculator feature keys.
 * These are the only ones that count toward monthly usage limits.
 */
export function getGatedCalculatorTypes(): string[] {
  return (
    Object.keys(FEATURE_TIER_REQUIREMENTS) as Array<
      keyof typeof FEATURE_TIER_REQUIREMENTS
    >
  ).filter((calc) => !isFeatureFree(calc));
}

/**
 * Returns the number of gated calculator uses for a user in the current
 * calendar month. Free calculators are excluded from the count.
 */
export async function getMonthlyUsageCount(userId: string): Promise<number> {
  if (!prisma) {
    console.warn("Prisma not available, returning 0 usage");
    return 0;
  }

  const { startOfThisMonth } = getMonthBoundaries();
  const gatedTypes = getGatedCalculatorTypes();

  return prisma.featureUsage.count({
    where: {
      userId,
      featureType: { notIn: gatedTypes },
      createdAt: { gte: startOfThisMonth },
    },
  });
}
