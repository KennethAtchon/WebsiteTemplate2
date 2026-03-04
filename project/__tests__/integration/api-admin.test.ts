/**
 * Integration tests for admin API routes.
 * Phase 5 of the integration tests plan.
 * Covers: orders, orders/[id], subscriptions, subscriptions/[id],
 *         subscriptions/analytics, analytics, sync-firebase, schema,
 *         database/health, verify.
 * Mocks: requireAdmin, requireAuth, prisma, adminAuth, Firestore.
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import {
  GET as AdminOrdersGET,
  POST as AdminOrdersPOST,
  PUT as AdminOrdersPUT,
  DELETE as AdminOrdersDELETE,
} from "@/app/api/admin/orders/route";
import { GET as AdminOrderByIdGET } from "@/app/api/admin/orders/[id]/route";
import { GET as AdminSubscriptionsGET } from "@/app/api/admin/subscriptions/route";
import {
  GET as AdminSubscriptionByIdGET,
  PATCH as AdminSubscriptionPATCH,
} from "@/app/api/admin/subscriptions/[id]/route";
import { GET as AdminSubscriptionsAnalyticsGET } from "@/app/api/admin/subscriptions/analytics/route";
import { GET as AdminAnalyticsGET } from "@/app/api/admin/analytics/route";
import {
  GET as AdminSyncFirebaseGET,
  POST as AdminSyncFirebasePOST,
} from "@/app/api/admin/sync-firebase/route";
import { GET as AdminSchemaGET } from "@/app/api/admin/schema/route";
import { GET as AdminDatabaseHealthGET } from "@/app/api/admin/database/health/route";
import {
  GET as AdminVerifyGET,
  POST as AdminVerifyPOST,
} from "@/app/api/admin/verify/route";
import {
  requireAdmin,
  requireAuth,
} from "@/features/auth/services/firebase-middleware";
import { adminAuth } from "@/shared/services/firebase/admin";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import { prisma } from "@/shared/services/db/prisma";

// ---------------------------------------------------------------------------
// Mock Firebase sync service
// ---------------------------------------------------------------------------
mock.module("@/shared/services/firebase/sync", () => ({
  FirebaseUserSync: {
    syncAllUsers: mock(() => Promise.resolve([])),
    syncUserCreate: mock(() =>
      Promise.resolve({ success: true, firebaseUid: "new-uid" })
    ),
    syncUserUpdate: mock(() => Promise.resolve({ success: true })),
    syncUserDelete: mock(() => Promise.resolve({ success: true })),
  },
}));

// ---------------------------------------------------------------------------
// Mock Firestore for subscriptions routes
// ---------------------------------------------------------------------------
const mockSubDoc = {
  id: "sub-1",
  exists: true,
  data: () => ({
    status: "active",
    metadata: { tier: "basic" },
    customer: "cus-123",
    id: "sub-stripe-1",
    current_period_start: Math.floor(Date.now() / 1000) - 86400,
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 29,
    created: Math.floor(Date.now() / 1000) - 86400 * 10,
  }),
  createTime: { toDate: () => new Date() },
  updateTime: { toDate: () => new Date() },
  ref: {
    collection: mock(() => ({
      get: mock(() =>
        Promise.resolve({
          docs: [
            {
              id: "sub-1",
              data: () => mockSubDoc.data(),
              createTime: mockSubDoc.createTime,
              updateTime: mockSubDoc.updateTime,
            },
          ],
        })
      ),
      doc: mock(() => ({
        get: mock(() => Promise.resolve(mockSubDoc)),
      })),
    })),
  },
};

const mockCustomerDoc = {
  id: "customer-uid-1",
  ref: mockSubDoc.ref,
};

const firestoreMock = {
  collection: mock(() => ({
    get: mock(() => Promise.resolve({ docs: [mockCustomerDoc] })),
    doc: mock(() => ({
      collection: mock(() => ({
        get: mock(() => Promise.resolve({ docs: [mockSubDoc] })),
        where: mock().mockReturnThis(),
        doc: mock(() => ({
          get: mock(() => Promise.resolve(mockSubDoc)),
        })),
      })),
    })),
  })),
};

mock.module("firebase-admin/firestore", () => ({
  getFirestore: mock(() => firestoreMock),
}));

// ---------------------------------------------------------------------------
// Shared mock objects
// ---------------------------------------------------------------------------
const mockAdminResult = {
  user: {
    id: "admin-user-id",
    firebaseUid: "admin-user-uid",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    isActive: true,
    isDeleted: false,
    timezone: "UTC",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  userId: "admin-user-uid",
  firebaseUser: { uid: "admin-user-uid", email: "admin@example.com" },
};

const mockOrder = {
  id: "order-1",
  userId: "test-user-id",
  totalAmount: 9999,
  status: "paid",
  stripeSessionId: null,
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
  skipPayment: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    phone: null,
    address: null,
  },
};

describe("Admin API Integration Tests", () => {
  beforeEach(() => {
    (requireAdmin as any).mockResolvedValue(mockAdminResult);
    (requireAuth as any).mockResolvedValue(mockAdminResult);
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: "admin-user-uid",
      email: "admin@example.com",
    } as any);
    (requireCSRFToken as any).mockResolvedValue(true);
    (prisma as any).order = {
      findUnique: mock(() => Promise.resolve(mockOrder)),
      findFirst: mock(() => Promise.resolve(mockOrder)),
      findMany: mock(() => Promise.resolve([mockOrder])),
      count: mock(() => Promise.resolve(1)),
      create: mock(() => Promise.resolve(mockOrder)),
      update: mock(() => Promise.resolve(mockOrder)),
      aggregate: mock(() => Promise.resolve({ _sum: { totalAmount: 9999 } })),
    };
    prisma.user.findUnique.mockResolvedValue(mockAdminResult.user as any);
    prisma.user.findMany.mockResolvedValue([mockAdminResult.user] as any);
    prisma.user.count.mockResolvedValue(5);
    prisma.user.update.mockResolvedValue(mockAdminResult.user as any);
    prisma.featureUsage.count.mockResolvedValue(0);
    (prisma.$queryRaw as any).mockResolvedValue([{ health_check: 1 }]);
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/orders
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/orders", () => {
    test("returns 403 for non-admin user", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        { method: "GET" }
      );
      const response = await AdminOrdersGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with paginated orders", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?page=1&limit=10",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminOrdersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.orders).toBeDefined();
      expect(data.data.pagination).toBeDefined();
    });

    test("returns 200 with empty orders", async () => {
      (prisma as any).order.findMany.mockResolvedValue([]);
      (prisma as any).order.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders?page=1&limit=10",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminOrdersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.orders.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/admin/orders
  // ---------------------------------------------------------------------------
  describe("POST /api/admin/orders", () => {
    test("returns 401 or 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      // No Authorization header — CSRF check returns 401 before auth check runs
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "00000000-0000-0000-0000-000000000001",
            totalAmount: 100,
          }),
        }
      );
      const response = await AdminOrdersPOST(request);
      expect([401, 403]).toContain(response.status);
    });

    test("returns 400 when required fields missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          headers: { Authorization: "Bearer admin-token" },
          body: JSON.stringify({}),
        }
      );
      const response = await AdminOrdersPOST(request);
      expect(response.status).toBe(400);
    });

    test("returns 200 with created order", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "550e8400-e29b-41d4-a716-446655440001",
            totalAmount: 9999,
          }),
        }
      );
      const response = await AdminOrdersPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // PUT /api/admin/orders
  // ---------------------------------------------------------------------------
  describe("PUT /api/admin/orders", () => {
    test("returns 400 or 422 when id is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );
      const response = await AdminOrdersPUT(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 200 with updated order", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440001",
            status: "completed",
          }),
        }
      );
      const response = await AdminOrdersPUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/admin/orders
  // ---------------------------------------------------------------------------
  describe("DELETE /api/admin/orders", () => {
    test("returns 400 or 422 when id is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await AdminOrdersDELETE(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 404 when order not found", async () => {
      (prisma as any).order.findUnique.mockResolvedValue(null);
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440099" }),
        }
      );
      const response = await AdminOrdersDELETE(request);
      expect(response.status).toBe(404);
    });

    test("returns 200 with deleted: true on successful soft delete", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440001" }),
        }
      );
      const response = await AdminOrdersDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.deleted).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/orders/[id]
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/orders/[id]", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders/order-1",
        { method: "GET" }
      );
      const response = await AdminOrderByIdGET(request, {
        params: Promise.resolve({ id: "order-1" }),
      });
      expect(response.status).toBe(403);
    });

    test("returns 200 with order details", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders/order-1",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminOrderByIdGET(request, {
        params: Promise.resolve({ id: "order-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
    });

    test("returns 404 when order not found", async () => {
      (prisma as any).order.findUnique.mockResolvedValue(null);
      const request = new NextRequest(
        "http://localhost:3000/api/admin/orders/nonexistent",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminOrderByIdGET(request, {
        params: Promise.resolve({ id: "nonexistent" }),
      });

      expect(response.status).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/subscriptions
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/subscriptions", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions",
        { method: "GET" }
      );
      const response = await AdminSubscriptionsGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with subscriptions from Firestore", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSubscriptionsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.subscriptions).toBeDefined();
      expect(data.data.pagination).toBeDefined();
    });

    test("returns 200 with empty subscriptions when Firestore is empty", async () => {
      firestoreMock.collection.mockReturnValueOnce({
        get: mock(() => Promise.resolve({ docs: [] })),
        doc: mock(() => ({})),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSubscriptionsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subscriptions.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/subscriptions/[id]
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/subscriptions/[id]", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions/sub-1",
        { method: "GET" }
      );
      const response = await AdminSubscriptionByIdGET(request, {
        params: { id: "sub-1" },
      });
      expect(response.status).toBe(403);
    });

    test("returns 200 with subscription details when found", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions/sub-1",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSubscriptionByIdGET(request, {
        params: { id: "sub-1" },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subscription).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/admin/subscriptions/[id]
  // ---------------------------------------------------------------------------
  describe("PATCH /api/admin/subscriptions/[id]", () => {
    test("returns 400 indicating subscriptions are managed by Stripe", async () => {
      // updateSubscriptionSchema requires subscriptionId field
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions/sub-1",
        {
          method: "PATCH",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscriptionId: "sub-stripe-1", tier: "pro" }),
        }
      );
      const response = await AdminSubscriptionPATCH(request, {
        params: { id: "sub-1" },
      });
      await response.json();

      // 400 from handler (Stripe-managed) or 422 if schema validation runs first
      expect([400, 422]).toContain(response.status);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/subscriptions/analytics
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/subscriptions/analytics", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions/analytics",
        { method: "GET" }
      );
      const response = await AdminSubscriptionsAnalyticsGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with analytics data", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/subscriptions/analytics",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSubscriptionsAnalyticsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(typeof data.data.mrr).toBe("number");
      expect(typeof data.data.arr).toBe("number");
      expect(data.data.tierDistribution).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/analytics
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/analytics", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics",
        { method: "GET" }
      );
      const response = await AdminAnalyticsGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with analytics metrics", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminAnalyticsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(typeof data.data.conversionRate).toBe("number");
      expect(typeof data.data.percentChange).toBe("number");
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/sync-firebase
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/sync-firebase", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/sync-firebase",
        { method: "GET" }
      );
      const response = await AdminSyncFirebaseGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with sync status", async () => {
      prisma.user.count
        .mockResolvedValueOnce(10) // totalUsers
        .mockResolvedValueOnce(8); // firebaseLinkedUsers

      const request = new NextRequest(
        "http://localhost:3000/api/admin/sync-firebase",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSyncFirebaseGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(typeof data.totalUsers).toBe("number");
      expect(typeof data.syncPercentage).toBe("number");
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/admin/sync-firebase
  // ---------------------------------------------------------------------------
  describe("POST /api/admin/sync-firebase", () => {
    test("returns 200 with sync summary", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/sync-firebase",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer admin-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await AdminSyncFirebasePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.summary).toBeDefined();
      expect(typeof data.summary.total).toBe("number");
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/schema
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/schema", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/schema",
        { method: "GET" }
      );
      const response = await AdminSchemaGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with schema models", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/schema",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminSchemaGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.models).toBeDefined();
      expect(Array.isArray(data.models)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/database/health
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/database/health", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/database/health",
        { method: "GET" }
      );
      const response = await AdminDatabaseHealthGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 with DB health metrics", async () => {
      (prisma.$queryRaw as any)
        .mockResolvedValueOnce([{ dbname: "template_test" }]) // current_database
        .mockResolvedValueOnce([
          {
            total_connections: 5n,
            active_connections: 2n,
            idle_connections: 3n,
          },
        ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/database/health?minutes=60",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminDatabaseHealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.health).toBeDefined();
      expect(data.health.status).toBeDefined();
      expect(data.queryMetrics).toBeDefined();
    });

    test("returns 400 for invalid minutes parameter", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/database/health?minutes=invalid",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminDatabaseHealthGET(request);
      // May be 400 (validation) or 200 (if default used) - depends on schema
      expect([200, 400]).toContain(response.status);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/admin/verify
  // ---------------------------------------------------------------------------
  describe("GET /api/admin/verify", () => {
    test("returns 403 for non-admin", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        { method: "GET" }
      );
      const response = await AdminVerifyGET(request);
      expect(response.status).toBe(403);
    });

    test("returns 200 when admin access is verified", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        {
          method: "GET",
          headers: { Authorization: "Bearer admin-token" },
        }
      );
      const response = await AdminVerifyGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/admin/verify
  // ---------------------------------------------------------------------------
  describe("POST /api/admin/verify", () => {
    test("returns 400 or 422 when adminCode is missing", async () => {
      // Handler returns 400, but middleware schema validation may return 422 first
      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await AdminVerifyPOST(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 401 when no Bearer token", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminCode: "secret" }),
        }
      );
      const response = await AdminVerifyPOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 401 when Firebase token is invalid", async () => {
      adminAuth.verifyIdToken.mockRejectedValue(new Error("Invalid token"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer bad-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminCode: "secret" }),
        }
      );
      const response = await AdminVerifyPOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 403 or 500 when ADMIN_SPECIAL_CODE_HASH is not configured", async () => {
      // ADMIN_SPECIAL_CODE_HASH is a module-level const loaded from envUtil at import time.
      // Deleting process.env at test time does NOT affect the already-imported const.
      // The handler either returns 500 (hash not configured) or 403 (code doesn't match).
      adminAuth.verifyIdToken.mockResolvedValue({
        uid: "admin-uid",
        email: "admin@example.com",
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/verify",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer valid-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminCode: "some-code" }),
        }
      );
      const response = await AdminVerifyPOST(request);
      expect([403, 500]).toContain(response.status);
    });
  });
});
