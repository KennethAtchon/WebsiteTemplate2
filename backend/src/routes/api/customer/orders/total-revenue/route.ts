import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { totalRevenueQuerySchema } from "@/shared/utils/validation/api-validation";

async function getHandler(_request: NextRequest) {
  try {
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "paid",
      },
    });
    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

    const lastMonthRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "paid",
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });
    const lastMonthRevenue = Number(
      lastMonthRevenueResult._sum.totalAmount || 0
    );

    const thisMonthRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "paid",
        createdAt: {
          gte: startOfThisMonth,
          lte: now,
        },
      },
    });
    const thisMonthRevenue = Number(
      thisMonthRevenueResult._sum.totalAmount || 0
    );

    let percentChange = null;
    if (lastMonthRevenue > 0) {
      percentChange =
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      percentChange = 100;
    } else {
      percentChange = 0;
    }

    return createSuccessResponse({
      totalRevenue,
      lastMonthRevenue,
      thisMonthRevenue,
      percentChange,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch total revenue",
      { service: "customer-orders-revenue", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch total revenue", error);
  }
}

export const GET = withUserProtection(getHandler, {
  querySchema: totalRevenueQuerySchema,
  rateLimitType: "payment",
});
