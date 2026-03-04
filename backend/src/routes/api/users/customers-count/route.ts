import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";

async function getHandler(_request: NextRequest) {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

    // Total customers (all time)
    const totalCustomers = await prisma.user.count({
      where: {
        role: "user",
        isActive: true,
        isDeleted: false,
      },
    });

    // Customers created this month
    const thisMonthCustomers = await prisma.user.count({
      where: {
        role: "user",
        isActive: true,
        isDeleted: false,
        createdAt: {
          gte: startOfThisMonth,
          lte: now,
        },
      },
    });

    // Customers created last month
    const lastMonthCustomers = await prisma.user.count({
      where: {
        role: "user",
        isActive: true,
        isDeleted: false,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate percent change from last month to this month
    let percentChange = null;
    if (lastMonthCustomers > 0) {
      percentChange =
        ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;
    } else if (thisMonthCustomers > 0) {
      percentChange = 100;
    } else {
      percentChange = 0;
    }

    return NextResponse.json({
      totalCustomers,
      thisMonthCustomers,
      lastMonthCustomers,
      percentChange,
    });
  } catch (error) {
    debugLog.error(
      "Error fetching customers count",
      { service: "users", operation: "CUSTOMERS_COUNT" },
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch customers count" },
      { status: 500 }
    );
  }
}

export const GET = withUserProtection(getHandler, {
  rateLimitType: "auth",
});
