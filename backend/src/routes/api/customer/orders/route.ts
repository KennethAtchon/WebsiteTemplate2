/**
 * Customer Orders API Route - ONE-TIME PURCHASES only
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This route handles ONE-TIME ORDERS only (stored in Prisma).
 *
 * For subscriptions:
 *   - Subscriptions are stored in Firestore (not Prisma)
 *   - View subscriptions: Use useSubscription hook or /account/subscription page
 *   - Subscriptions are managed by Firebase Stripe Extension
 *
 * Separation:
 *   - One-time Orders → Prisma (this route)
 *   - Subscriptions → Firestore (managed by Firebase Extension)
 */

import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import type { AuthResult } from "@/features/auth/types/auth.types";
import {
  createSuccessResponse,
  createInternalErrorResponse,
  createNotFoundResponse,
} from "@/shared/utils/api/response-helpers";
import { formatOrderResponse } from "@/shared/utils/helpers/order-helpers";
import {
  createCustomerOrderSchema,
  ordersQuerySchema,
} from "@/shared/utils/validation/api-validation";

async function getHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("id");
    const includeDeleted = url.searchParams.get("includeDeleted") === "true";

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
          userId: auth.user.id,
          ...(includeDeleted ? {} : { isDeleted: false }),
        },
        include: {
          user: true,
        },
      });

      if (!order) {
        return createNotFoundResponse("Order not found");
      }

      const formattedOrder = {
        ...formatOrderResponse(order),
        products: [], // Product feature removed
        appointments: [], // Appointments feature removed
      };

      return createSuccessResponse({ order: formattedOrder });
    } else {
      const { searchParams } = new URL(request.url);

      const { parsePaginationParams, createDateRangeConditions } =
        await import("@/shared/utils/helpers/pagination");

      const { page, limit, skip } = parsePaginationParams(
        {
          page: searchParams.get("page"),
          limit: searchParams.get("limit"),
          search: null, // No text search for customer orders
        },
        {
          defaultLimit: 20,
          maxLimit: 50,
        }
      );

      const status = searchParams.get("status");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const dateConditions = createDateRangeConditions(
        dateFrom,
        dateTo,
        "createdAt"
      );
      const whereConditions = {
        userId: auth.user.id,
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...dateConditions,
        ...(status && { status }),
      };

      const totalCount = await prisma.order.count({
        where: whereConditions,
      });

      const orders = await prisma.order.findMany({
        where: whereConditions,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      });

      const formattedOrders = orders.map((order) => ({
        ...formatOrderResponse(order),
        products: [], // Product feature removed
        appointments: [], // Appointments feature removed
      }));

      return createSuccessResponse({
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + formattedOrders.length < totalCount,
        },
      });
    }
  } catch (error) {
    debugLog.error(
      "Failed to fetch customer orders",
      { service: "customer-orders", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch orders", error);
  }
}

async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();
    const { totalAmount, status = "pending", stripeSessionId } = body;

    // SECURITY (SEC-010): Use authenticated user's ID, never trust userId from body (prevents privilege escalation)
    const order = await prisma.order.create({
      data: {
        userId: auth.user.id, // Always use authenticated user's ID
        totalAmount,
        status,
        stripeSessionId,
      },
      include: {
        user: true,
      },
    });

    const formattedOrder = {
      ...formatOrderResponse(order),
      therapies: [], // OrderTherapy feature removed
      appointments: [], // Appointments feature removed
    };

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to create customer order",
      { service: "customer-orders", operation: "POST" },
      error
    );
    return createInternalErrorResponse("Failed to create order", error);
  }
}

export const GET = withUserProtection(getHandler, {
  querySchema: ordersQuerySchema,
  rateLimitType: "customer",
});
export const POST = withUserProtection(postHandler, {
  bodySchema: createCustomerOrderSchema,
  rateLimitType: "customer",
});
