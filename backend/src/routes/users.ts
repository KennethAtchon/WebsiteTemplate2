import { Hono } from "hono";
import { authMiddleware, csrfMiddleware, rateLimiter } from "../middleware/protection";

const users = new Hono();

// ─── GET /api/users ───────────────────────────────────────────────────────────

users.get(
  "/",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
      const search = c.req.query("search");
      const includeDeleted = c.req.query("includeDeleted") === "true";
      const skip = (page - 1) * limit;

      const where: any = includeDeleted ? {} : { isDeleted: false };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [allUsers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
          take: limit,
          skip,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return c.json({
        users: allUsers,
        pagination: { page, limit, total, totalPages, hasMore: page < totalPages, hasPrevious: page > 1 },
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  }
);

// ─── POST /api/users ──────────────────────────────────────────────────────────

users.post(
  "/",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { FirebaseUserSync } = await import("../shared/services/firebase/sync");
      const { name, email, password, createInFirebase, timezone } = await c.req.json();

      let firebaseUid: string | null = null;

      if (createInFirebase) {
        const syncResult = await FirebaseUserSync.syncUserCreate({ email, name, password, role: "user" });
        if (!syncResult.success) {
          return c.json({ error: `Failed to create Firebase user: ${syncResult.error}` }, 500);
        }
        firebaseUid = syncResult.firebaseUid || null;
      }

      const newUser = await prisma.user.create({
        data: { name, email, firebaseUid, role: "user", isActive: true, timezone: timezone || "UTC" },
      });

      return c.json(newUser, 201);
    } catch (error) {
      console.error("Failed to create user:", error);
      return c.json({ error: "Failed to create user" }, 500);
    }
  }
);

// ─── PATCH /api/users ─────────────────────────────────────────────────────────

users.patch(
  "/",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { FirebaseUserSync } = await import("../shared/services/firebase/sync");
      const { id, phone, address, role, name, password, email, isActive, timezone } = await c.req.json();

      if (!id) return c.json({ error: "User id is required" }, 400);

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) return c.json({ error: "User not found" }, 404);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(role !== undefined && { role }),
          ...(name !== undefined && { name }),
          ...(password !== undefined && { password }),
          ...(email !== undefined && { email }),
          ...(isActive !== undefined && { isActive }),
          ...(timezone !== undefined && { timezone }),
        },
      });

      if (existingUser.firebaseUid) {
        const syncData: Record<string, unknown> = {};
        if (email !== undefined) syncData.email = email;
        if (name !== undefined) syncData.name = name;
        if (role !== undefined) syncData.role = role;
        if (isActive !== undefined) syncData.isActive = isActive;

        if (Object.keys(syncData).length > 0) {
          await FirebaseUserSync.syncUserUpdate(existingUser.firebaseUid, syncData as any).catch(
            (err) => console.warn("Failed to sync user update to Firebase:", err)
          );
        }
      }

      return c.json(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  }
);

// ─── DELETE /api/users ────────────────────────────────────────────────────────

users.delete(
  "/",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { FirebaseUserSync } = await import("../shared/services/firebase/sync");
      const { id, hardDelete = false } = await c.req.json();

      if (!id) return c.json({ error: "User id is required" }, 400);

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) return c.json({ error: "User not found" }, 404);

      if (hardDelete) {
        await prisma.user.delete({ where: { id } });
      } else {
        await prisma.user.update({ where: { id }, data: { isActive: false } });
      }

      if (existingUser.firebaseUid) {
        await FirebaseUserSync.syncUserDelete(existingUser.firebaseUid, hardDelete).catch(
          (err) => console.warn("Failed to sync user deletion to Firebase:", err)
        );
      }

      return c.json({ success: true, message: hardDelete ? "User deleted permanently" : "User deactivated" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  }
);

// ─── GET /api/users/customers-count ──────────────────────────────────────────

users.get(
  "/customers-count",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

      const [totalCustomers, thisMonthCustomers, lastMonthCustomers] = await Promise.all([
        prisma.user.count({ where: { role: "user", isActive: true, isDeleted: false } }),
        prisma.user.count({ where: { role: "user", isActive: true, isDeleted: false, createdAt: { gte: startOfThisMonth, lte: now } } }),
        prisma.user.count({ where: { role: "user", isActive: true, isDeleted: false, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      ]);

      let percentChange = 0;
      if (lastMonthCustomers > 0) {
        percentChange = ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;
      } else if (thisMonthCustomers > 0) {
        percentChange = 100;
      }

      return c.json({ totalCustomers, thisMonthCustomers, lastMonthCustomers, percentChange });
    } catch (error) {
      console.error("Failed to fetch customers count:", error);
      return c.json({ error: "Failed to fetch customers count" }, 500);
    }
  }
);

// ─── DELETE /api/users/delete-account ────────────────────────────────────────

users.delete(
  "/delete-account",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { adminAuth } = await import("../services/firebase/admin");
      const auth = c.get("auth");

      const user = await prisma.user.findUnique({
        where: { firebaseUid: auth.firebaseUser.uid, isDeleted: false },
      });

      if (!user) return c.json({ error: "User not found" }, 404);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          name: "Deleted User",
          email: `deleted-${user.id}@example.com`,
          phone: null,
          address: null,
          firebaseUid: null,
          isActive: false,
        },
      });

      try {
        await adminAuth.deleteUser(auth.firebaseUser.uid);
      } catch { /* Best-effort Firebase deletion */ }

      return c.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Failed to delete account:", error);
      return c.json({ error: "Failed to delete account" }, 500);
    }
  }
);

// ─── GET /api/users/export-data ───────────────────────────────────────────────

users.get(
  "/export-data",
  rateLimiter("customer"),
  authMiddleware("user"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const auth = c.get("auth");

      const user = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { id: true, name: true, email: true, phone: true, address: true, timezone: true, createdAt: true },
      });

      const orders = await prisma.order.findMany({
        where: { userId: auth.user.id },
        select: { id: true, status: true, totalAmount: true, createdAt: true },
      });

      const exportData = { profile: user, orders };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="my-data.json"',
        },
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      return c.json({ error: "Failed to export data" }, 500);
    }
  }
);

// ─── POST /api/users/object-to-processing ────────────────────────────────────

users.post(
  "/object-to-processing",
  rateLimiter("admin"),
  csrfMiddleware(),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");
      const { userId } = await c.req.json();

      if (!userId) return c.json({ error: "userId is required" }, 400);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return c.json({ success: true, user });
    } catch (error) {
      console.error("Failed to update user processing status:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  }
);

export default users;
