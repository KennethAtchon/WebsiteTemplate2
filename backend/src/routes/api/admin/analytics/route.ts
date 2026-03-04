import { NextRequest } from "next/server";
import prisma from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import {
  getMonthBoundaries,
  calculatePercentChange,
} from "@/shared/utils/helpers/date";

// Constants
const USER_ROLE = "user";
const PAID_ORDER_STATUS = "paid";
// Appointments feature removed
const PERCENT_MULTIPLIER = 100;

/**
 * Analytics API route for admin dashboard.
 * Returns conversion rates and month-over-month comparisons.
 */
async function getHandler(_request: NextRequest) {
  // Verify admin authentication
  try {
    const now = new Date();
    const { startOfThisMonth, startOfLastMonth, endOfLastMonth } =
      getMonthBoundaries();

    // Total customers (all time)
    const totalCustomers = await prisma.user.count({
      where: { role: USER_ROLE },
    });

    // Customers with paid orders (all time)
    const customersWithPaidOrders = await prisma.user.count({
      where: {
        role: USER_ROLE,
        Orders: {
          some: {
            status: PAID_ORDER_STATUS,
          },
        },
      },
    });

    // Customers created last month
    const lastMonthCustomers = await prisma.user.count({
      where: {
        role: USER_ROLE,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Customers with paid orders last month
    const lastMonthCustomersWithPaidOrders = await prisma.user.count({
      where: {
        role: USER_ROLE,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        Orders: {
          some: {
            status: PAID_ORDER_STATUS,
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        },
      },
    });

    // Customers created this month
    const thisMonthCustomers = await prisma.user.count({
      where: {
        role: USER_ROLE,
        createdAt: {
          gte: startOfThisMonth,
          lte: now,
        },
      },
    });

    // Customers with paid orders this month
    const thisMonthCustomersWithPaidOrders = await prisma.user.count({
      where: {
        role: USER_ROLE,
        createdAt: {
          gte: startOfThisMonth,
          lte: now,
        },
        Orders: {
          some: {
            status: PAID_ORDER_STATUS,
            createdAt: {
              gte: startOfThisMonth,
              lte: now,
            },
          },
        },
      },
    });

    // Calculate conversion rates
    const conversionRate =
      totalCustomers > 0
        ? (customersWithPaidOrders / totalCustomers) * PERCENT_MULTIPLIER
        : 0;
    const lastMonthConversionRate =
      lastMonthCustomers > 0
        ? (lastMonthCustomersWithPaidOrders / lastMonthCustomers) *
          PERCENT_MULTIPLIER
        : 0;
    const thisMonthConversionRate =
      thisMonthCustomers > 0
        ? (thisMonthCustomersWithPaidOrders / thisMonthCustomers) *
          PERCENT_MULTIPLIER
        : 0;

    // Calculate percent change from last month to this month
    const percentChange = calculatePercentChange(
      lastMonthConversionRate,
      thisMonthConversionRate
    );

    return createSuccessResponse({
      conversionRate,
      lastMonthConversionRate,
      thisMonthConversionRate,
      percentChange,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch analytics data",
      { service: "admin-analytics", operation: "GET" },
      error
    );
    return createInternalErrorResponse("Failed to fetch analytics data", error);
  }
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
