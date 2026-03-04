/**
 * Admin Subscription by ID API Route - Modern SaaS Design
 *
 * GET: Get subscription details from Firestore
 * PATCH: Admin cannot update subscriptions - managed by Stripe/Firebase Extension
 *
 * Note: Subscriptions are managed by Stripe and synced to Firestore via Firebase Extension.
 * Admin updates should be done through Stripe Dashboard or Stripe API.
 */

import { NextRequest } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { prisma } from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import { updateSubscriptionSchema } from "@/shared/utils/validation/api-validation";
import {
  createSuccessResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
  createBadRequestResponse,
} from "@/shared/utils/api/response-helpers";

async function getHandler(
  _request: NextRequest,
  context: { auth?: unknown; params?: { id: string } }
) {
  const params = context.params!;
  try {
    const db = getFirestore();
    const customersRef = db.collection("customers");
    const customersSnapshot = await customersRef.get();

    // Search for subscription across all customers
    let subscriptionDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    let customerId: string | null = null;

    for (const customerDoc of customersSnapshot.docs) {
      const subscriptionsRef = customerDoc.ref.collection("subscriptions");
      const subDoc = await subscriptionsRef.doc(params.id).get();

      if (subDoc.exists) {
        subscriptionDoc = subDoc;
        customerId = customerDoc.id;
        break;
      }
    }

    if (!subscriptionDoc || !subscriptionDoc.exists) {
      return createNotFoundResponse("Subscription not found");
    }

    const subData = subscriptionDoc.data();
    if (!subData) {
      return createNotFoundResponse("Subscription data not found");
    }

    // Get user info from Prisma
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: customerId! },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Extract tier from metadata
    const tierFromMetadata =
      subData.metadata?.tier ||
      subData.items?.data?.[0]?.price?.product?.metadata?.firebaseRole ||
      "basic";

    const subscription = {
      id: subscriptionDoc.id,
      userId: customerId,
      user: dbUser || {
        id: customerId!,
        name: subData.metadata?.userEmail || "Unknown",
        email: subData.metadata?.userEmail || "",
      },
      tier: tierFromMetadata,
      status: subData.status || "incomplete",
      stripeCustomerId: subData.customer,
      stripeSubscriptionId: subData.id,
      currentPeriodStart: subData.current_period_start
        ? new Date(subData.current_period_start * 1000)
        : null,
      currentPeriodEnd: subData.current_period_end
        ? new Date(subData.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subData.cancel_at_period_end || false,
      canceledAt: subData.canceled_at
        ? new Date(subData.canceled_at * 1000)
        : null,
      createdAt: subData.created
        ? new Date(subData.created * 1000)
        : subscriptionDoc.createTime?.toDate() || new Date(),
      updatedAt: subData.updated
        ? new Date(subData.updated * 1000)
        : subscriptionDoc.updateTime?.toDate() || new Date(),
      // Include full Firestore data for admin reference
      firestoreData: subData,
    };

    return createSuccessResponse({ subscription });
  } catch (error) {
    debugLog.error(
      "Error fetching subscription",
      {
        service: "admin-subscriptions-api",
        operation: "GET",
      },
      error
    );

    return createInternalErrorResponse("Failed to fetch subscription", error);
  }
}

async function patchHandler(
  _request: NextRequest,
  _context: { auth?: unknown; params?: { id: string } }
) {
  // Subscriptions are managed by Stripe and synced via Firebase Extension
  // Admin updates should be done through Stripe Dashboard or Stripe API
  return createBadRequestResponse(
    "Subscription updates are managed by Stripe. Please use Stripe Dashboard or Stripe API to update subscriptions.",
    {
      message:
        "Subscriptions are automatically synced from Stripe to Firestore via Firebase Extension.",
    }
  );
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});

export const PATCH = withAdminProtection(patchHandler, {
  bodySchema: updateSubscriptionSchema,
  rateLimitType: "admin",
});
