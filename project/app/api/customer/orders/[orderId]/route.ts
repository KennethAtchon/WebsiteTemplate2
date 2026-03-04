import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { deriveInitials } from "@/shared/utils/helpers/order-helpers";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

// GET specific customer order (PROTECTED - only authenticated customers can view their orders)
async function getHandler(
  _request: NextRequest,
  context: { auth: AuthResult; params?: { orderId: string } }
) {
  const { auth } = context;
  const { orderId } = context.params!;
  try {
    if (!orderId) {
      return createBadRequestResponse("Order ID is required");
    }

    // Fetch the specific order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: auth.user.id, // Ensure customer can only access their own orders
        isDeleted: false, // Only show active orders to customers
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      return createNotFoundResponse("Order not found");
    }

    // Format order for the response
    const customer = order.user;
    const formattedOrder = {
      id: order.id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        avatar: "/placeholder-user.jpg",
        initials: deriveInitials(customer.name),
      },
      products: [], // Product feature removed
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      createdAt: order.createdAt,
      stripeSessionId: order.stripeSessionId,
      appointments: [], // Appointments feature removed
    };

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to fetch customer order",
      { service: "customer-orders", operation: "GET", orderId: orderId },
      error
    );
    return createInternalErrorResponse("Failed to fetch order", error);
  }
}

export const GET = withUserProtection(getHandler, {
  rateLimitType: "payment",
});
