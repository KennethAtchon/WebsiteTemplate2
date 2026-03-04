/**
 * Admin Subscriptions API Route - Modern SaaS Design
 *
 * GET: List all subscriptions with filtering and pagination
 * Queries Firestore subscriptions collection managed by Firebase Stripe Extension
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This route queries Firestore for SUBSCRIPTIONS only.
 *
 * For one-time orders:
 *   - Use: /api/admin/orders (queries Prisma)
 *   - Orders are stored in Prisma for one-time purchases
 *
 * Separation:
 *   - Subscriptions → Firestore (this route, managed by Firebase Extension)
 *   - One-time Orders → Prisma (/api/admin/orders)
 *
 * Subscriptions are automatically synced from Stripe to Firestore via Firebase Extension.
 * No manual sync needed - Firebase Extension handles all subscription lifecycle events.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import { getFirestore } from "firebase-admin/firestore";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { getTierConfig } from "@/shared/constants/subscription.constants";
import {
  extractSubscriptionTier,
  convertFirestoreTimestamp,
} from "@/shared/services/firebase/subscription-helpers";
import { getMonthlyUsageCount } from "@/features/calculator/services/usage-service";

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");
    const search = searchParams.get("search");

    const db = getFirestore();

    // Query all subscriptions from Firestore
    // Structure: customers/{uid}/subscriptions/{subscriptionId}
    const customersRef = db.collection("customers");
    const customersSnapshot = await customersRef.get();

    interface SubscriptionData {
      id: string;
      userId: string;
      user: { id: string; name: string; email: string };
      tier: string;
      status: string;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string;
      usageCount: number;
      usageLimit: number | null;
      currentPeriodStart: Date | null;
      currentPeriodEnd: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }

    const allSubscriptions: SubscriptionData[] = [];

    // Collect all subscriptions from all customers
    for (const customerDoc of customersSnapshot.docs) {
      const subscriptionsRef = customerDoc.ref.collection("subscriptions");
      const subscriptionsSnapshot = await subscriptionsRef.get();

      for (const subDoc of subscriptionsSnapshot.docs) {
        const subData = subDoc.data();

        // Get user info from Prisma
        const dbUser = await prisma.user.findUnique({
          where: { firebaseUid: customerDoc.id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        const tierFromMetadata = extractSubscriptionTier(subData);

        // Get usage data if user exists in Prisma
        let usageCount = 0;
        let usageLimit: number | null = null;

        if (dbUser) {
          try {
            const tierConfig = getTierConfig(
              tierFromMetadata as "basic" | "pro" | "enterprise"
            );
            usageLimit =
              tierConfig.features.maxCalculationsPerMonth === -1
                ? null
                : tierConfig.features.maxCalculationsPerMonth;

            usageCount = await getMonthlyUsageCount(dbUser.id);
          } catch (usageError) {
            debugLog.warn(
              "Failed to fetch usage for subscription",
              {
                service: "admin-subscriptions-api",
                userId: dbUser.id,
              },
              usageError
            );
          }
        }

        const subscription: SubscriptionData = {
          id: subDoc.id,
          userId: customerDoc.id,
          user: dbUser || {
            id: customerDoc.id,
            name: subData.metadata?.userEmail || "Unknown",
            email: subData.metadata?.userEmail || "",
          },
          tier: tierFromMetadata,
          status: subData.status || "incomplete",
          stripeCustomerId: subData.customer,
          stripeSubscriptionId: subData.id,
          usageCount,
          usageLimit,
          currentPeriodStart: convertFirestoreTimestamp(
            subData.current_period_start
          ),
          currentPeriodEnd: convertFirestoreTimestamp(
            subData.current_period_end
          ),
          createdAt: subData.created
            ? convertFirestoreTimestamp(subData.created) ||
              subDoc.createTime?.toDate() ||
              new Date()
            : subDoc.createTime?.toDate() || new Date(),
          updatedAt: subData.updated
            ? convertFirestoreTimestamp(subData.updated) ||
              subDoc.updateTime?.toDate() ||
              new Date()
            : subDoc.updateTime?.toDate() || new Date(),
        };

        // Apply filters
        if (status && status !== "all" && subscription.status !== status) {
          continue;
        }

        if (tier && tier !== "all" && subscription.tier !== tier) {
          continue;
        }

        if (search) {
          const searchLower = search.toLowerCase();
          const matchesSearch =
            subscription.userId.toLowerCase().includes(searchLower) ||
            subscription.stripeCustomerId
              ?.toLowerCase()
              .includes(searchLower) ||
            subscription.stripeSubscriptionId
              ?.toLowerCase()
              .includes(searchLower) ||
            subscription.user?.email?.toLowerCase().includes(searchLower);

          if (!matchesSearch) {
            continue;
          }
        }

        allSubscriptions.push(subscription);
      }
    }

    // Sort by createdAt descending
    allSubscriptions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Apply pagination
    const total = allSubscriptions.length;
    const skip = (page - 1) * limit;
    const paginatedSubscriptions = allSubscriptions.slice(skip, skip + limit);

    // Serialize dates to ISO strings for JSON response
    const serializedSubscriptions = paginatedSubscriptions.map((sub) => ({
      ...sub,
      currentPeriodStart: sub.currentPeriodStart
        ? sub.currentPeriodStart.toISOString()
        : null,
      currentPeriodEnd: sub.currentPeriodEnd
        ? sub.currentPeriodEnd.toISOString()
        : null,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    })) as Array<
      Omit<
        SubscriptionData,
        "currentPeriodStart" | "currentPeriodEnd" | "createdAt" | "updatedAt"
      > & {
        currentPeriodStart: string | null;
        currentPeriodEnd: string | null;
        createdAt: string;
        updatedAt: string;
      }
    >;

    debugLog.info("Admin subscriptions fetched from Firestore", {
      service: "admin-subscriptions-api",
      operation: "GET",
      count: paginatedSubscriptions.length,
      total,
    });

    // Return in old format for backward compatibility with existing components
    // TODO: Update components to use new { data, pagination } format
    return createSuccessResponse({
      subscriptions: serializedSubscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + paginatedSubscriptions.length < total,
      },
    });
  } catch (error) {
    debugLog.error(
      "Error fetching admin subscriptions",
      {
        service: "admin-subscriptions-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse("Failed to fetch subscriptions", error);
  }
}

import { adminSubscriptionsQuerySchema } from "@/shared/utils/validation/api-validation";

export const GET = withAdminProtection(getHandler, {
  querySchema: adminSubscriptionsQuerySchema,
  rateLimitType: "admin",
});
