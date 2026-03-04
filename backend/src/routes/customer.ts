import { Hono } from "hono";
import {
  authMiddleware,
  csrfMiddleware,
  rateLimiter,
  validateBody,
} from "../middleware/protection";

const customer = new Hono();

// ─── Profile ───────────────────────────────────────────────────────────────────

/**
 * GET /api/customer/profile
 */
customer.get(
  "/profile",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");
      const { adminAuth } = await import("../services/firebase/admin");

      const user = await prisma.user.findUnique({
        where: { id: auth.user.id, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return c.json({ error: "User not found" }, 404);

      let isOAuthUser = false;
      try {
        if (auth.firebaseUser?.uid) {
          const fbUser = await adminAuth.getUser(auth.firebaseUser.uid);
          isOAuthUser = !fbUser.providerData.some(
            (p: any) => p.providerId === "password"
          );
        }
      } catch {
        // Continue without provider info
      }

      return c.json({ profile: user, isOAuthUser });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return c.json({ error: "Failed to fetch profile" }, 500);
    }
  }
);

/**
 * PUT /api/customer/profile
 */
customer.put(
  "/profile",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const body = await c.req.json();
      const { name, email, phone, address, timezone } = body;
      const { prisma } = await import("../services/db/prisma");
      const { adminAuth } = await import("../services/firebase/admin");

      // Handle email change with Firebase
      if (email !== undefined && email !== auth.user.email) {
        const fbUser = await adminAuth.getUser(auth.firebaseUser.uid);
        const hasEmailProvider = fbUser.providerData.some(
          (p: any) => p.providerId === "password"
        );

        if (!hasEmailProvider) {
          return c.json(
            {
              error:
                "Cannot change email for OAuth accounts. Update through your OAuth provider.",
              code: "OAUTH_EMAIL_CHANGE_NOT_ALLOWED",
            },
            400
          );
        }

        try {
          await adminAuth.getUserByEmail(email);
          return c.json(
            { error: "Email already in use", code: "EMAIL_ALREADY_EXISTS" },
            400
          );
        } catch (e: any) {
          if (e.code !== "auth/user-not-found") throw e;
        }

        await adminAuth.updateUser(auth.firebaseUser.uid, { email });
      }

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone || null;
      if (address !== undefined) updateData.address = address || null;
      if (timezone !== undefined) updateData.timezone = timezone;

      if (Object.keys(updateData).length === 0) {
        return c.json(
          { error: "No fields to update", code: "NO_FIELDS_PROVIDED" },
          400
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: auth.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return c.json({ message: "Profile updated successfully", profile: updatedUser });
    } catch (error: any) {
      if (error?.code === "P2002") {
        return c.json(
          { error: "Email already exists", code: "EMAIL_ALREADY_EXISTS" },
          400
        );
      }
      console.error("Failed to update profile:", error);
      return c.json({ error: "Failed to update profile" }, 500);
    }
  }
);

// ─── Orders ────────────────────────────────────────────────────────────────────

/**
 * GET /api/customer/orders
 */
customer.get(
  "/orders",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = parseInt(c.req.query("limit") || "10", 10);
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId: auth.user.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: { userId: auth.user.id } }),
      ]);

      return c.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  }
);

/**
 * POST /api/customer/orders
 */
customer.post(
  "/orders",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const body = await c.req.json();
      const { prisma } = await import("../services/db/prisma");

      const order = await prisma.order.create({
        data: {
          ...body,
          userId: auth.user.id, // Always use authenticated user ID
        },
      });

      return c.json(order, 201);
    } catch (error) {
      console.error("Failed to create order:", error);
      return c.json({ error: "Failed to create order" }, 500);
    }
  }
);

/**
 * GET /api/customer/orders/:orderId
 */
customer.get(
  "/orders/:orderId",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const orderId = c.req.param("orderId");
      const { prisma } = await import("../services/db/prisma");

      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: auth.user.id },
      });

      if (!order) return c.json({ error: "Order not found" }, 404);
      return c.json(order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return c.json({ error: "Failed to fetch order" }, 500);
    }
  }
);

/**
 * GET /api/customer/orders/by-session
 */
customer.get(
  "/orders/by-session",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const sessionId = c.req.query("sessionId");
      if (!sessionId)
        return c.json({ error: "sessionId is required" }, 400);

      const { prisma } = await import("../services/db/prisma");

      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId, userId: auth.user.id },
      });

      if (!order) return c.json({ error: "Order not found" }, 404);
      return c.json(order);
    } catch (error) {
      console.error("Failed to fetch order by session:", error);
      return c.json({ error: "Failed to fetch order" }, 500);
    }
  }
);

/**
 * GET /api/customer/orders/total-revenue
 */
customer.get(
  "/orders/total-revenue",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");

      const result = await prisma.order.aggregate({
        where: { userId: auth.user.id, status: "completed" },
        _sum: { amount: true },
      });

      return c.json({ totalRevenue: result._sum.amount || 0 });
    } catch (error) {
      console.error("Failed to fetch total revenue:", error);
      return c.json({ error: "Failed to fetch total revenue" }, 500);
    }
  }
);

/**
 * POST /api/customer/fix-stripe-customer
 */
customer.post(
  "/fix-stripe-customer",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { prisma } = await import("../services/db/prisma");

      // Clear invalid Stripe customer ID
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { stripeCustomerId: null },
      });

      return c.json({ message: "Stripe customer ID cleared successfully" });
    } catch (error) {
      console.error("Failed to fix Stripe customer:", error);
      return c.json({ error: "Failed to fix Stripe customer" }, 500);
    }
  }
);

export default customer;
