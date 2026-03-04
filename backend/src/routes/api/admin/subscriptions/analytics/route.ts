/**
 * Admin Subscription Analytics API Route - Modern SaaS Design
 *
 * GET: Get subscription analytics including MRR, ARR, churn rate, and tier distribution
 * Queries Firestore subscriptions collection managed by Firebase Stripe Extension
 */

import { NextRequest } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import {
  getTierConfig,
  SubscriptionTier,
} from "@/shared/constants/subscription.constants";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(_request: NextRequest) {
  try {
    const db = getFirestore();
    const customersRef = db.collection("customers");
    const customersSnapshot = await customersRef.get();

    const allSubscriptions: Array<{
      tier: string;
      status: string;
      canceledAt: Date | null;
    }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Collect all subscriptions from Firestore
    for (const customerDoc of customersSnapshot.docs) {
      const subscriptionsRef = customerDoc.ref.collection("subscriptions");
      const subscriptionsSnapshot = await subscriptionsRef.get();

      for (const subDoc of subscriptionsSnapshot.docs) {
        const subData = subDoc.data();

        // Extract tier from metadata or product metadata
        const tierFromMetadata =
          subData.metadata?.tier ||
          subData.items?.data?.[0]?.price?.product?.metadata?.firebaseRole ||
          "basic";

        const status = subData.status || "incomplete";
        const canceledAt = subData.canceled_at
          ? new Date(subData.canceled_at * 1000)
          : null;

        allSubscriptions.push({
          tier: tierFromMetadata,
          status,
          canceledAt,
        });
      }
    }

    // Filter active subscriptions
    const activeSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    activeSubscriptions.forEach((sub) => {
      const tierConfig = getTierConfig(sub.tier as SubscriptionTier);
      if (tierConfig) {
        mrr += tierConfig.price;
      }
    });

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calculate ARPU (Average Revenue Per User)
    const arpu =
      activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;

    // Calculate tier distribution
    const tierDistribution = {
      basic: activeSubscriptions.filter((s) => s.tier === "basic").length,
      pro: activeSubscriptions.filter((s) => s.tier === "pro").length,
      enterprise: activeSubscriptions.filter((s) => s.tier === "enterprise")
        .length,
    };

    // Calculate status distribution
    const statusDistribution = {
      active: allSubscriptions.filter((s) => s.status === "active").length,
      trialing: allSubscriptions.filter((s) => s.status === "trialing").length,
      past_due: allSubscriptions.filter((s) => s.status === "past_due").length,
      canceled: allSubscriptions.filter((s) => s.status === "canceled").length,
    };

    // Get canceled subscriptions in last 30 days for churn calculation
    const canceledRecently = allSubscriptions.filter(
      (sub) =>
        sub.status === "canceled" &&
        sub.canceledAt &&
        sub.canceledAt >= thirtyDaysAgo
    ).length;

    // Simple churn rate calculation (canceled in last 30 days / total active)
    const churnRate =
      activeSubscriptions.length > 0
        ? (canceledRecently / activeSubscriptions.length) * 100
        : 0;

    // Calculate revenue by tier
    const revenueByTier = [
      {
        tier: "basic",
        revenue: tierDistribution.basic * getTierConfig("basic").price,
        count: tierDistribution.basic,
      },
      {
        tier: "pro",
        revenue: tierDistribution.pro * getTierConfig("pro").price,
        count: tierDistribution.pro,
      },
      {
        tier: "enterprise",
        revenue:
          tierDistribution.enterprise * getTierConfig("enterprise").price,
        count: tierDistribution.enterprise,
      },
    ];

    debugLog.info("Subscription analytics fetched from Firestore", {
      service: "admin-subscriptions-api",
      operation: "GET",
    });

    return createSuccessResponse({
      activeSubscriptions: activeSubscriptions.length,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
      tierDistribution,
      statusDistribution,
      revenueByTier,
      total: {
        total: allSubscriptions.length,
        active: statusDistribution.active,
        trialing: statusDistribution.trialing,
      },
    });
  } catch (error) {
    debugLog.error(
      "Error fetching subscription analytics",
      {
        service: "admin-subscriptions-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse(
      "Failed to fetch subscription analytics",
      error
    );
  }
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
