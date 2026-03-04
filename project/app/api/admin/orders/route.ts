import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import { Prisma } from "@/infrastructure/database/lib/generated/prisma";
import { debugLog } from "@/shared/utils/debug";
import {
  orderSearchSchema,
  validateSearchInput,
} from "@/shared/utils/validation/search-validation";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createAdminOrderSchema,
  updateAdminOrderSchema,
  adminOrdersQuerySchema,
  deleteOrderSchema,
} from "@/shared/utils/validation/api-validation";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createNotFoundResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { formatOrderResponse } from "@/shared/utils/helpers/order-helpers";

// Constants (DEFAULT_AVATAR is now managed by shared/utils/helpers/order-helpers.ts)

// Error messages
const ERROR_MESSAGES = {
  INVALID_INPUT: "userId and totalAmount are required",
  ORDER_ID_REQUIRED_UPDATE: "id is required for update",
  ORDER_ID_REQUIRED_DELETE: "id is required for delete",
  ORDER_NOT_FOUND: "Order not found",
  FETCH_FAILED: "Failed to fetch orders",
  CREATE_FAILED: "Failed to create order",
  UPDATE_FAILED: "Failed to update order",
  DELETE_FAILED: "Failed to delete order",
} as const;

/**
 * GET /api/admin/orders
 * Retrieves paginated ONE-TIME ORDERS (Admin only).
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This route queries Prisma Orders, which track ONE-TIME purchases only.
 *
 * For subscriptions:
 *   - Use: /api/admin/subscriptions (queries Firestore)
 *   - Subscriptions are managed by Firebase Stripe Extension in Firestore
 *   - Subscriptions are NOT stored in Prisma Orders
 *
 * Separation:
 *   - One-time Orders → Prisma (this route)
 *   - Subscriptions → Firestore (/api/admin/subscriptions)
 */
async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = validateSearchInput(
      orderSearchSchema,
      {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search"),
        customerId: searchParams.get("customerId"),
      },
      "admin-orders-search"
    );

    if (!validationResult.success) {
      debugLog.warn(
        "Invalid search parameters",
        {
          service: "admin-orders",
          operation: "GET",
        },
        { error: validationResult.error }
      );

      return createBadRequestResponse(
        `Invalid search parameters: ${validationResult.error}`
      );
    }

    const validatedData = validationResult.data;
    const { page, limit, search, customerId } = validatedData;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {};

    if (customerId) {
      whereClause.userId = customerId;
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const totalCount = await prisma.order.count({ where: whereClause });

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    const formattedOrders = orders.map(formatOrderResponse);

    const paginationMeta = {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page < Math.ceil(totalCount / limit),
      hasPrevious: page > 1,
      showing: orders.length,
      from: skip + 1,
      to: skip + orders.length,
    };

    return createSuccessResponse({
      orders: formattedOrders,
      pagination: paginationMeta,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch orders",
      { service: "admin-orders", operation: "GET" },
      error
    );
    return createInternalErrorResponse(ERROR_MESSAGES.FETCH_FAILED, error);
  }
}

/**
 * POST /api/admin/orders
 * Creates a new order (Admin only).
 */
async function postHandler(request: NextRequest) {
  try {
    const body: {
      userId: string;
      totalAmount: number;
      status?: string;
    } = await request.json();
    const { userId, totalAmount, status } = body;

    if (!userId || totalAmount === undefined) {
      return createBadRequestResponse(ERROR_MESSAGES.INVALID_INPUT);
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: status || "pending",
      },
      include: {
        user: true,
      },
    });

    const formattedOrder = formatOrderResponse(order);

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to create order",
      { service: "admin-orders", operation: "POST" },
      error
    );
    return createInternalErrorResponse(ERROR_MESSAGES.CREATE_FAILED, error);
  }
}

/**
 * PUT /api/admin/orders
 * Updates an existing order (Admin only).
 */
async function putHandler(request: NextRequest) {
  try {
    const body: {
      id: string;
      userId?: string;
      totalAmount?: number;
      status?: string;
    } = await request.json();
    const { id, userId, totalAmount, status } = body;

    if (!id) {
      return createBadRequestResponse(ERROR_MESSAGES.ORDER_ID_REQUIRED_UPDATE);
    }

    const updateData: Prisma.OrderUpdateInput = {};
    if (userId) {
      updateData.user = { connect: { id: userId } };
    }
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (status !== undefined) updateData.status = status;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });

    const formattedOrder = formatOrderResponse(order);

    return createSuccessResponse({ order: formattedOrder });
  } catch (error) {
    debugLog.error(
      "Failed to update order",
      { service: "admin-orders", operation: "PUT" },
      error
    );
    return createInternalErrorResponse(ERROR_MESSAGES.UPDATE_FAILED, error);
  }
}

/**
 * DELETE /api/admin/orders
 * Soft deletes an existing order (Admin only).
 */
async function deleteHandler(request: NextRequest) {
  try {
    const body: { id: string; deletedBy?: string } = await request.json();
    const { id, deletedBy } = body;

    if (!id) {
      return createBadRequestResponse(ERROR_MESSAGES.ORDER_ID_REQUIRED_DELETE);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return createNotFoundResponse(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy || "admin",
      },
      include: {
        user: true,
      },
    });

    const formattedOrder = formatOrderResponse(order);

    return createSuccessResponse({ order: formattedOrder, deleted: true });
  } catch (error) {
    debugLog.error(
      "Failed to soft delete order",
      { service: "admin-orders", operation: "DELETE" },
      error
    );
    return createInternalErrorResponse(ERROR_MESSAGES.DELETE_FAILED, error);
  }
}

/**
 * Formats order data for API response.
 */

export const GET = withAdminProtection(getHandler, {
  querySchema: adminOrdersQuerySchema,
  rateLimitType: "admin",
});
export const POST = withAdminProtection(postHandler, {
  bodySchema: createAdminOrderSchema,
  rateLimitType: "admin",
});
export const PUT = withAdminProtection(putHandler, {
  bodySchema: updateAdminOrderSchema,
  rateLimitType: "admin",
});
export const DELETE = withAdminProtection(deleteHandler, {
  bodySchema: deleteOrderSchema,
  rateLimitType: "admin",
});
