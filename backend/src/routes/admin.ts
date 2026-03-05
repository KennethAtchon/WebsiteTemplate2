import { Hono } from "hono";
import { authMiddleware, csrfMiddleware, rateLimiter } from "../middleware/protection";
import { ADMIN_SPECIAL_CODE_HASH } from "../utils/config/envUtil";
import { createHash } from "crypto";

const admin = new Hono();

// ─── GET /api/admin/verify ────────────────────────────────────────────────────

admin.get(
  "/verify",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    const auth = c.get("auth");
    return c.json({ success: true, message: "Admin access verified", user: auth.user });
  }
);

// ─── POST /api/admin/verify ───────────────────────────────────────────────────

admin.post(
  "/verify",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const body = await c.req.json();
      const { adminCode } = body;

      if (!adminCode) return c.json({ error: "Admin code is required" }, 400);

      if (!ADMIN_SPECIAL_CODE_HASH) {
        return c.json({ error: "Admin verification not properly configured" }, 500);
      }

      const hashedInput = createHash("sha256").update(adminCode).digest("hex");
      const trueAdminHash = createHash("sha256").update(ADMIN_SPECIAL_CODE_HASH).digest("hex");

      if (hashedInput !== trueAdminHash) {
        return c.json({ error: "Invalid admin code" }, 403);
      }

      const { adminAuth } = await import("../services/firebase/admin");
      const { prisma } = await import("../services/db/prisma");
      const auth = c.get("auth");
      const uid = auth.firebaseUser.uid;

      await prisma.user.upsert({
        where: { firebaseUid: uid },
        create: {
          firebaseUid: uid,
          email: auth.firebaseUser.email || "",
          name: auth.firebaseUser.name as string || "Admin User",
          role: "admin",
          isActive: true,
        },
        update: { role: "admin", lastLogin: new Date() },
      });

      await adminAuth.setCustomUserClaims(uid, { role: "admin" });

      return c.json({ success: true, message: "Admin role granted successfully" });
    } catch (error) {
      console.error("Admin verification error:", error);
      return c.json({ error: "Admin verification failed" }, 500);
    }
  }
);

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────

admin.get(
  "/analytics",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { getMonthBoundaries, calculatePercentChange } = await import(
        "../utils/helpers/date"
      );

      const now = new Date();
      const { startOfThisMonth, startOfLastMonth, endOfLastMonth } = getMonthBoundaries();

      const [
        totalCustomers,
        customersWithPaidOrders,
        lastMonthCustomers,
        lastMonthCustomersWithPaidOrders,
        thisMonthCustomers,
        thisMonthCustomersWithPaidOrders,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "user" } }),
        prisma.user.count({
          where: { role: "user", Orders: { some: { status: "paid" } } },
        }),
        prisma.user.count({
          where: { role: "user", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
        prisma.user.count({
          where: {
            role: "user",
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
            Orders: { some: { status: "paid", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } },
          },
        }),
        prisma.user.count({
          where: { role: "user", createdAt: { gte: startOfThisMonth, lte: now } },
        }),
        prisma.user.count({
          where: {
            role: "user",
            createdAt: { gte: startOfThisMonth, lte: now },
            Orders: { some: { status: "paid", createdAt: { gte: startOfThisMonth, lte: now } } },
          },
        }),
      ]);

      const conversionRate = totalCustomers > 0 ? (customersWithPaidOrders / totalCustomers) * 100 : 0;
      const lastMonthConversionRate = lastMonthCustomers > 0
        ? (lastMonthCustomersWithPaidOrders / lastMonthCustomers) * 100 : 0;
      const thisMonthConversionRate = thisMonthCustomers > 0
        ? (thisMonthCustomersWithPaidOrders / thisMonthCustomers) * 100 : 0;
      const percentChange = calculatePercentChange(lastMonthConversionRate, thisMonthConversionRate);

      return c.json({ conversionRate, lastMonthConversionRate, thisMonthConversionRate, percentChange });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      return c.json({ error: "Failed to fetch analytics data" }, 500);
    }
  }
);

// ─── GET /api/admin/customers ─────────────────────────────────────────────────

admin.get(
  "/customers",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 50);
      const search = c.req.query("search");
      const skip = (page - 1) * limit;

      const where: any = { role: "user" };
      if (search) {
        where.email = { contains: search, mode: "insensitive" };
      }

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true, name: true, email: true, phone: true, address: true,
            createdAt: true, updatedAt: true, isActive: true,
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return c.json({
        customers: customers.map((c) => ({
          ...c,
          name: c.name || "",
          email: c.email || "",
          isActive: c.isActive !== undefined ? c.isActive : true,
        })),
        pagination: {
          total, page, limit, totalPages,
          hasMore: page < totalPages, hasPrevious: page > 1,
          showing: customers.length, from: skip + 1, to: skip + customers.length,
        },
      });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      return c.json({ error: "Failed to fetch customers" }, 500);
    }
  }
);

// ─── GET /api/admin/orders ────────────────────────────────────────────────────

admin.get(
  "/orders",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { formatOrderResponse } = await import("../utils/helpers/order-helpers");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
      const search = c.req.query("search");
      const customerId = c.req.query("customerId");
      const skip = (page - 1) * limit;

      const where: any = {};
      if (customerId) where.userId = customerId;
      if (search?.trim()) {
        where.OR = [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return c.json({
        orders: orders.map(formatOrderResponse),
        pagination: {
          total, page, limit, totalPages,
          hasMore: page < totalPages, hasPrevious: page > 1,
          showing: orders.length, from: skip + 1, to: skip + orders.length,
        },
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  }
);

// ─── POST /api/admin/orders ───────────────────────────────────────────────────

admin.post(
  "/orders",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { formatOrderResponse } = await import("../utils/helpers/order-helpers");
      const body = await c.req.json();
      const { userId, totalAmount, status } = body;

      if (!userId || totalAmount === undefined) {
        return c.json({ error: "userId and totalAmount are required" }, 400);
      }

      const order = await prisma.order.create({
        data: { userId, totalAmount, status: status || "pending" },
        include: { user: true },
      });

      return c.json({ order: formatOrderResponse(order) }, 201);
    } catch (error) {
      console.error("Failed to create order:", error);
      return c.json({ error: "Failed to create order" }, 500);
    }
  }
);

// ─── PUT /api/admin/orders ────────────────────────────────────────────────────

admin.put(
  "/orders",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { formatOrderResponse } = await import("../utils/helpers/order-helpers");
      const body = await c.req.json();
      const { id, userId, totalAmount, status } = body;

      if (!id) return c.json({ error: "id is required" }, 400);

      const updateData: any = {};
      if (userId) updateData.user = { connect: { id: userId } };
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
      if (status !== undefined) updateData.status = status;

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });

      return c.json({ order: formatOrderResponse(order) });
    } catch (error) {
      console.error("Failed to update order:", error);
      return c.json({ error: "Failed to update order" }, 500);
    }
  }
);

// ─── DELETE /api/admin/orders ─────────────────────────────────────────────────

admin.delete(
  "/orders",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { formatOrderResponse } = await import("../utils/helpers/order-helpers");
      const body = await c.req.json();
      const { id, deletedBy } = body;

      if (!id) return c.json({ error: "id is required" }, 400);

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) return c.json({ error: "Order not found" }, 404);

      const order = await prisma.order.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: deletedBy || "admin" },
        include: { user: true },
      });

      return c.json({ order: formatOrderResponse(order), deleted: true });
    } catch (error) {
      console.error("Failed to delete order:", error);
      return c.json({ error: "Failed to delete order" }, 500);
    }
  }
);

// ─── GET /api/admin/orders/:id ────────────────────────────────────────────────

admin.get(
  "/orders/:id",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { formatOrderResponse } = await import("../utils/helpers/order-helpers");
      const id = c.req.param("id");

      const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
      if (!order) return c.json({ error: "Order not found" }, 404);

      return c.json({ order: formatOrderResponse(order) });
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return c.json({ error: "Failed to fetch order" }, 500);
    }
  }
);

// ─── GET /api/admin/subscriptions ────────────────────────────────────────────

admin.get(
  "/subscriptions",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { adminDb } = await import("../services/firebase/admin");
      const { prisma } = await import("../services/db/prisma");
      const { extractSubscriptionTier, convertFirestoreTimestamp } = await import(
        "../services/firebase/subscription-helpers"
      );
      const { getTierConfig } = await import("../constants/subscription.constants");
      const { getMonthlyUsageCount } = await import(
        "../features/calculator/services/usage-service"
      );

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = parseInt(c.req.query("limit") || "50", 10);
      const status = c.req.query("status");
      const tier = c.req.query("tier");
      const search = c.req.query("search");

      const customersSnapshot = await adminDb.collection("customers").get();
      const allSubscriptions: any[] = [];

      for (const customerDoc of customersSnapshot.docs) {
        const subscriptionsSnapshot = await customerDoc.ref.collection("subscriptions").get();

        for (const subDoc of subscriptionsSnapshot.docs) {
          const subData = subDoc.data();

          const dbUser = await prisma.user.findUnique({
            where: { firebaseUid: customerDoc.id },
            select: { id: true, name: true, email: true },
          });

          const tierFromMetadata = extractSubscriptionTier(subData);

          let usageCount = 0;
          let usageLimit: number | null = null;
          if (dbUser) {
            try {
              const tierConfig = getTierConfig(tierFromMetadata as "basic" | "pro" | "enterprise");
              usageLimit = tierConfig.features.maxCalculationsPerMonth === -1
                ? null : tierConfig.features.maxCalculationsPerMonth;
              usageCount = await getMonthlyUsageCount(dbUser.id);
            } catch { /* skip usage on error */ }
          }

          const subscription = {
            id: subDoc.id,
            userId: customerDoc.id,
            user: dbUser || { id: customerDoc.id, name: subData.metadata?.userEmail || "Unknown", email: subData.metadata?.userEmail || "" },
            tier: tierFromMetadata,
            status: subData.status || "incomplete",
            stripeCustomerId: subData.customer,
            stripeSubscriptionId: subData.id,
            usageCount,
            usageLimit,
            currentPeriodStart: convertFirestoreTimestamp(subData.current_period_start),
            currentPeriodEnd: convertFirestoreTimestamp(subData.current_period_end),
            createdAt: subData.created ? convertFirestoreTimestamp(subData.created) || subDoc.createTime?.toDate() || new Date() : subDoc.createTime?.toDate() || new Date(),
            updatedAt: subData.updated ? convertFirestoreTimestamp(subData.updated) || subDoc.updateTime?.toDate() || new Date() : subDoc.updateTime?.toDate() || new Date(),
          };

          if (status && status !== "all" && subscription.status !== status) continue;
          if (tier && tier !== "all" && subscription.tier !== tier) continue;
          if (search) {
            const q = search.toLowerCase();
            const matches = subscription.userId.toLowerCase().includes(q) ||
              subscription.stripeCustomerId?.toLowerCase().includes(q) ||
              subscription.stripeSubscriptionId?.toLowerCase().includes(q) ||
              subscription.user?.email?.toLowerCase().includes(q);
            if (!matches) continue;
          }

          allSubscriptions.push(subscription);
        }
      }

      allSubscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = allSubscriptions.length;
      const skip = (page - 1) * limit;
      const paginated = allSubscriptions.slice(skip, skip + limit).map((sub) => ({
        ...sub,
        currentPeriodStart: sub.currentPeriodStart ? sub.currentPeriodStart.toISOString() : null,
        currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      }));

      return c.json({
        subscriptions: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + paginated.length < total },
      });
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      return c.json({ error: "Failed to fetch subscriptions" }, 500);
    }
  }
);

// ─── GET /api/admin/subscriptions/analytics ───────────────────────────────────

admin.get(
  "/subscriptions/analytics",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { adminDb } = await import("../services/firebase/admin");
      const { getTierConfig } = await import("../constants/subscription.constants");
      const { extractSubscriptionTier, convertFirestoreTimestamp } = await import(
        "../services/firebase/subscription-helpers"
      );

      const customersSnapshot = await adminDb.collection("customers").get();
      const allSubscriptions: Array<{ tier: string; status: string; canceledAt: Date | null }> = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const customerDoc of customersSnapshot.docs) {
        const subscriptionsSnapshot = await customerDoc.ref.collection("subscriptions").get();
        for (const subDoc of subscriptionsSnapshot.docs) {
          const subData = subDoc.data();
          const tier = extractSubscriptionTier(subData);
          const status = subData.status || "incomplete";
          const canceledAt = subData.canceled_at
            ? new Date(subData.canceled_at * 1000) : null;
          allSubscriptions.push({ tier, status, canceledAt });
        }
      }

      const activeSubscriptions = allSubscriptions.filter((s) =>
        ["active", "trialing"].includes(s.status)
      );

      const tierDistribution: Record<string, number> = {};
      for (const sub of activeSubscriptions) {
        tierDistribution[sub.tier] = (tierDistribution[sub.tier] || 0) + 1;
      }

      let mrr = 0;
      for (const sub of activeSubscriptions) {
        try {
          const config = getTierConfig(sub.tier as "basic" | "pro" | "enterprise");
          mrr += (config.prices?.monthly || 0) / 100;
        } catch { /* skip unknown tiers */ }
      }

      const canceledLast30Days = allSubscriptions.filter(
        (s) => s.canceledAt && s.canceledAt >= thirtyDaysAgo
      ).length;

      const churnRate = activeSubscriptions.length > 0
        ? (canceledLast30Days / activeSubscriptions.length) * 100 : 0;

      return c.json({
        totalActive: activeSubscriptions.length,
        totalTrialing: allSubscriptions.filter((s) => s.status === "trialing").length,
        mrr,
        arr: mrr * 12,
        churnRate,
        tierDistribution,
      });
    } catch (error) {
      console.error("Failed to fetch subscription analytics:", error);
      return c.json({ error: "Failed to fetch subscription analytics" }, 500);
    }
  }
);

// ─── GET /api/admin/subscriptions/:id ────────────────────────────────────────

admin.get(
  "/subscriptions/:id",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { adminDb } = await import("../services/firebase/admin");
      const id = c.req.param("id");
      const customersSnapshot = await adminDb.collection("customers").get();

      for (const customerDoc of customersSnapshot.docs) {
        const subDoc = await customerDoc.ref.collection("subscriptions").doc(id).get();
        if (subDoc.exists) {
          return c.json({ subscription: { id: subDoc.id, ...subDoc.data() } });
        }
      }

      return c.json({ error: "Subscription not found" }, 404);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      return c.json({ error: "Failed to fetch subscription" }, 500);
    }
  }
);

// ─── GET /api/admin/schema ────────────────────────────────────────────────────

admin.get(
  "/schema",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { Prisma } = await import("@prisma/client");
      const dmmf = (Prisma as any).dmmf;

      if (!dmmf?.datamodel) {
        return c.json({ error: "DMMF not available" }, 500);
      }

      const models = dmmf.datamodel.models.map((model: any) => ({
        name: model.name,
        fields: model.fields.map((field: any) => ({
          name: field.name,
          type: field.type,
          isRequired: field.isRequired,
          isId: field.isId,
          hasDefaultValue: field.hasDefaultValue,
          isList: field.isList,
        })),
      }));

      return c.json({ models });
    } catch (error) {
      console.error("Failed to fetch schema:", error);
      return c.json({ error: "Failed to fetch schema" }, 500);
    }
  }
);

// ─── POST /api/admin/sync-firebase ────────────────────────────────────────────

admin.post(
  "/sync-firebase",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { FirebaseUserSync } = await import("../services/firebase/sync");
      const results = await FirebaseUserSync.syncAllUsers();

      const summary = {
        total: results.length,
        successful: results.filter((r: any) => r.success).length,
        failed: results.filter((r: any) => !r.success).length,
        results,
      };

      return c.json({ success: true, summary });
    } catch (error) {
      console.error("Failed to sync Firebase:", error);
      return c.json({ error: "Failed to sync with Firebase" }, 500);
    }
  }
);

// ─── GET /api/admin/database/health ──────────────────────────────────────────

admin.get(
  "/database/health",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      await prisma.$queryRaw`SELECT 1`;
      return c.json({ status: "healthy", database: "connected" });
    } catch (error) {
      console.error("Database health check failed:", error);
      return c.json({ status: "unhealthy", database: "disconnected", error: String(error) }, 503);
    }
  }
);

export default admin;
