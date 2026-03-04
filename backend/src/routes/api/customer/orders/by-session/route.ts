import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { orderBySessionQuerySchema } from "@/shared/utils/validation/api-validation";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { formatOrderResponse } from "@/shared/utils/helpers/order-helpers";

async function getHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return createBadRequestResponse("Session ID is required");
    }

    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
        userId: auth.user.id,
        isDeleted: false,
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
      orderProducts: [], // Product feature removed
      stripeSessionId: order.stripeSessionId,
    };

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to fetch order by session",
      { service: "customer-orders-by-session", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch order", error);
  }
}

export const GET = withUserProtection(getHandler, {
  querySchema: orderBySessionQuerySchema,
  rateLimitType: "payment",
});
