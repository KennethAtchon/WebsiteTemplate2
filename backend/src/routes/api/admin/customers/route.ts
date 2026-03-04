import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import {
  customerSearchSchema,
  validateSearchInput,
} from "@/shared/utils/validation/search-validation";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

/**
 * GET /api/admin/customers
 * Returns paginated list of active customers for admin dashboard (Admin only).
 * Query parameters:
 * - page: Page number (1-based, default: 1)
 * - limit: Records per page (1-50, default: 20)
 * - search: Search term to filter by email
 */
async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate input parameters using security schema
    const validationResult = validateSearchInput(
      customerSearchSchema,
      {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search"),
      },
      "admin-customers-search"
    );

    if (!validationResult.success) {
      debugLog.warn(
        "Invalid search parameters for customer search",
        {
          service: "admin-customers",
          operation: "GET",
        },
        { error: validationResult.error }
      );

      return createBadRequestResponse(
        `Invalid search parameters: ${validationResult.error}`
      );
    }

    const validatedData = validationResult.data;
    const { page, limit, search } = validatedData;
    const skip = (page - 1) * limit;

    debugLog.info(
      "Fetching paginated customers",
      {
        service: "admin-customers",
        operation: "GET",
      },
      { page, limit, skip, search }
    );

    // Build search filter conditions
    const whereConditions = {
      // Admin can see all customers including deleted ones for audit purposes
      // Only filtering by role and search criteria
      role: "user",
      ...(search && {
        email: { contains: search, mode: "insensitive" as const },
      }),
    };

    // Get total count for pagination metadata
    const totalCount = await prisma.user.count({
      where: whereConditions,
    });

    // Get paginated active users
    const customers = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    // Transform the data to match the expected format
    const customerSelect = customers.map((customer) => ({
      id: customer.id,
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || null,
      address: customer.address || null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      isActive: customer.isActive !== undefined ? customer.isActive : true,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    const paginationMeta = {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasMore,
      hasPrevious,
      showing: customers.length,
      from: skip + 1,
      to: skip + customers.length,
    };

    debugLog.info(
      "Successfully fetched paginated customers",
      {
        service: "admin-customers",
        operation: "GET",
      },
      { ...paginationMeta }
    );

    return createSuccessResponse({
      customers: customerSelect,
      pagination: paginationMeta,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch customers",
      { service: "admin-customers", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch customers", error);
  }
}

import { adminCustomersQuerySchema } from "@/shared/utils/validation/api-validation";

export const GET = withAdminProtection(getHandler, {
  querySchema: adminCustomersQuerySchema,
  rateLimitType: "admin",
});
