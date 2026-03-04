/**
 * Current User Subscription API
 *
 * API endpoint to get the current authenticated user's subscription details
 * including tier and billing cycle.
 */

import { NextRequest } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { debugLog } from "@/shared/utils/debug";
import { STRIPE_MAP } from "@/shared/constants/stripe.constants";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import { prisma } from "@/shared/services/db/prisma";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  const { user } = auth;

  try {
    if (!user.firebaseUid) {
      return createBadRequestResponse("Invalid user data");
    }

    const db = getFirestore();
    const customerRef = db.collection("customers").doc(user.firebaseUid);
    const subscriptionsRef = customerRef.collection("subscriptions");

    // Get active subscriptions
    const subscriptionsSnapshot = await subscriptionsRef
      .where("status", "in", ["active", "trialing"])
      .get();

    if (subscriptionsSnapshot.empty) {
      return createSuccessResponse({
        subscription: null,
        tier: null,
        billingCycle: null,
      });
    }

    // Get the first active subscription
    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subData = subscriptionDoc.data();

    // Mark hasUsedFreeTrial when user has any active subscription (trialing or active)
    // This ensures the flag is set whenever a subscription is successfully created
    if (subData.status === "trialing" || subData.status === "active") {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { hasUsedFreeTrial: true },
        });

        // Mark hasUsedFreeTrial if not already marked
        if (dbUser && !dbUser.hasUsedFreeTrial) {
          await prisma.user.update({
            where: { id: user.id },
            data: { hasUsedFreeTrial: true },
          });
          debugLog.info("Marked user as having used free trial", {
            service: "subscriptions-api",
            operation: "GET_CURRENT",
            userId: user.id,
            subscriptionStatus: subData.status,
          });
        }
      } catch (error) {
        // Log but don't fail the request if marking fails
        debugLog.error(
          "Failed to mark hasUsedFreeTrial",
          {
            service: "subscriptions-api",
            operation: "GET_CURRENT",
          },
          error
        );
      }
    }

    // Extract tier from metadata
    const tierFromMetadata = subData.metadata?.tier || "basic";

    // Determine billing cycle from Stripe price ID or metadata
    let billingCycle: "monthly" | "annual" | null = null;

    if (subData.metadata?.billingCycle) {
      billingCycle = subData.metadata.billingCycle as "monthly" | "annual";
    } else if (subData.items?.data?.[0]?.price?.interval) {
      // Extract from Stripe subscription items
      const interval = subData.items.data[0].price.interval;
      billingCycle = interval === "month" ? "monthly" : "annual";
    } else if (subData.items?.data?.[0]?.price?.id) {
      // Determine from price ID by checking against STRIPE_MAP
      const priceId = subData.items.data[0].price.id;
      for (const [, tierConfig] of Object.entries(STRIPE_MAP.tiers)) {
        if (tierConfig.prices.monthly.priceId === priceId) {
          billingCycle = "monthly";
          break;
        } else if (tierConfig.prices.annual.priceId === priceId) {
          billingCycle = "annual";
          break;
        }
      }
    }

    // Check if subscription is in trial
    const isInTrial = subData.status === "trialing";
    const trialEnd = subData.trial_end
      ? new Date(subData.trial_end * 1000).toISOString()
      : null;

    return createSuccessResponse({
      subscription: {
        id: subscriptionDoc.id,
        tier: tierFromMetadata,
        billingCycle,
        status: subData.status || "inactive",
        currentPeriodStart: subData.current_period_start
          ? new Date(subData.current_period_start * 1000).toISOString()
          : null,
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000).toISOString()
          : null,
        isInTrial,
        trialEnd,
      },
      tier: tierFromMetadata,
      billingCycle,
      isInTrial,
    });
  } catch (error) {
    debugLog.error(
      "Error fetching current subscription",
      {
        service: "subscriptions-api",
        operation: "GET_CURRENT",
      },
      error
    );

    return createInternalErrorResponse("Failed to fetch subscription", error);
  }
}

export const GET = withUserProtection(getHandler, {
  rateLimitType: "auth",
});
