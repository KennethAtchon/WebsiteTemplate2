import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import { Prisma } from "@/infrastructure/database/lib/generated/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

// Constants
const ERROR_MESSAGES = {
  ORDER_ID_REQUIRED: "Order ID is required",
  ORDER_NOT_FOUND: "Order not found",
  FETCH_FAILED: "Failed to fetch order",
} as const;

// Types
type OrderWithInclude = Prisma.OrderGetPayload<{
  include: {
    user: true;
  };
}>;

interface DetailedOrder {
  id: string;
  totalAmount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: string | null;
  createdAt: Date;
}

/**
 * GET /api/admin/orders/[id]
 * Retrieves detailed information for a specific order (Admin only).
 */
async function getHandler(
  request: NextRequest,
  context: { auth?: unknown; params?: Promise<{ id: string }> }
) {
  const { id } = await context.params!;

  try {
    if (!id) {
      return createBadRequestResponse(ERROR_MESSAGES.ORDER_ID_REQUIRED);
    }

    debugLog.info(
      "Fetching order details",
      {
        service: "admin-orders",
        operation: "GET_BY_ID",
      },
      { orderId: id }
    );

    const order = await prisma.order.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      debugLog.warn(
        "Order not found or deleted",
        {
          service: "admin-orders",
          operation: "GET_BY_ID",
        },
        { orderId: id }
      );
      return createNotFoundResponse(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    const formattedOrder = formatDetailedOrder(order);

    debugLog.info(
      "Successfully fetched order details",
      {
        service: "admin-orders",
        operation: "GET_BY_ID",
      },
      { orderId: id }
    );

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to fetch order details",
      { service: "admin-orders", operation: "GET_BY_ID" },
      error
    );
    return createInternalErrorResponse(ERROR_MESSAGES.FETCH_FAILED, error);
  }
}

/**
 * Formats order data with detailed information.
 */
function formatDetailedOrder(order: OrderWithInclude): DetailedOrder {
  const customer = order.user;

  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
    status: order.status || "PENDING",
    createdAt: order.createdAt,
  };
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
