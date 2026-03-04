/**
 * Integration tests for customer orders API routes.
 * Phase 3 of the integration tests plan.
 * Mocks: requireAuth, prisma.order, prisma.user (preload + per-test overrides).
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import {
  GET as CustomerOrdersGET,
  POST as CustomerOrdersPOST,
} from "@/app/api/customer/orders/route";
import { GET as CustomerOrderByIdGET } from "@/app/api/customer/orders/[orderId]/route";
import { POST as CustomerOrdersCreatePOST } from "@/app/api/customer/orders/create/route";
import { GET as TotalRevenueGET } from "@/app/api/customer/orders/total-revenue/route";
import { GET as OrderBySessionGET } from "@/app/api/customer/orders/by-session/route";
import { requireAuth } from "@/features/auth/services/firebase-middleware";
import { adminAuth } from "@/shared/services/firebase/admin";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import { prisma } from "@/shared/services/db/prisma";

// ---------------------------------------------------------------------------
// Mock email service (used by create route)
// ---------------------------------------------------------------------------
mock.module("@/shared/services/email/resend", () => ({
  sendOrderConfirmationEmail: mock(() =>
    Promise.resolve({ success: true, id: "email-1" })
  ),
}));

const mockAuthResult = {
  user: {
    id: "test-user-id",
    firebaseUid: "test-user-uid",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isActive: true,
    isDeleted: false,
    timezone: "UTC",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  userId: "test-user-uid",
  firebaseUser: {
    uid: "test-user-uid",
    email: "test@example.com",
    stripeRole: "basic",
  },
};

const mockOrder = {
  id: "order-1",
  userId: "test-user-id",
  totalAmount: 9999,
  status: "paid",
  stripeSessionId: "sess-123",
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

describe("Customer Orders API Integration Tests", () => {
  beforeEach(() => {
    (requireAuth as any).mockResolvedValue(mockAuthResult);
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: "test-user-uid",
      email: "test@example.com",
    } as any);
    (requireCSRFToken as any).mockResolvedValue(true);
    (prisma as any).order = {
      findUnique: mock(),
      findFirst: mock(),
      findMany: mock(),
      count: mock(),
      create: mock(),
      update: mock(),
      aggregate: mock(),
    };
    (prisma as any).order.findMany.mockResolvedValue([mockOrder]);
    (prisma as any).order.count.mockResolvedValue(1);
    (prisma as any).order.findUnique.mockResolvedValue(mockOrder);
    (prisma as any).order.findFirst.mockResolvedValue(mockOrder);
    (prisma as any).order.create.mockResolvedValue(mockOrder);
    (prisma as any).order.aggregate.mockResolvedValue({
      _sum: { totalAmount: 9999 },
    });
    prisma.user.findUnique.mockResolvedValue(mockAuthResult.user as any);
  });

  // ---------------------------------------------------------------------------
  // GET /api/customer/orders
  // ---------------------------------------------------------------------------
  describe("GET /api/customer/orders", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        { method: "GET" }
      );
      const response = await CustomerOrdersGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with orders list", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomerOrdersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.orders).toBeDefined();
      expect(Array.isArray(data.data.orders)).toBe(true);
      expect(data.data.pagination).toBeDefined();
    });

    test("returns 200 with empty orders when none exist", async () => {
      (prisma as any).order.findMany.mockResolvedValue([]);
      (prisma as any).order.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomerOrdersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.orders.length).toBe(0);
      expect(data.data.pagination.total).toBe(0);
    });

    test("returns order data in expected shape", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomerOrdersGET(request);
      const data = await response.json();

      const order = data.data.orders[0];
      expect(order.id).toBeDefined();
      expect(order.customer).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.totalAmount).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/customer/orders
  // ---------------------------------------------------------------------------
  describe("POST /api/customer/orders", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        {
          method: "POST",
          body: JSON.stringify({ totalAmount: 100 }),
        }
      );
      const response = await CustomerOrdersPOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with created order", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalAmount: 9999, status: "pending" }),
        }
      );
      const response = await CustomerOrdersPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.order).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/customer/orders/[orderId]
  // ---------------------------------------------------------------------------
  describe("GET /api/customer/orders/[orderId]", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/order-1",
        { method: "GET" }
      );
      const response = await CustomerOrderByIdGET(request, {
        params: { orderId: "order-1" },
      });
      expect(response.status).toBe(401);
    });

    test("returns 200 with order details", async () => {
      (prisma as any).order.findUnique.mockResolvedValue(mockOrder);
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/order-1",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomerOrderByIdGET(request, {
        params: { orderId: "order-1" },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
      expect(data.data.order.id).toBe("order-1");
    });

    test("returns 404 when order not found", async () => {
      (prisma as any).order.findUnique.mockResolvedValue(null);
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/nonexistent",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomerOrderByIdGET(request, {
        params: { orderId: "nonexistent" },
      });

      expect(response.status).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/customer/orders/create
  // ---------------------------------------------------------------------------
  describe("POST /api/customer/orders/create", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/create",
        {
          method: "POST",
          body: JSON.stringify({ totalAmount: 100 }),
        }
      );
      const response = await CustomerOrdersCreatePOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 400 or 422 when totalAmount is missing", async () => {
      // Middleware schema validation may return 422; handler returns 400
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/create",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await CustomerOrdersCreatePOST(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 400 or 422 when totalAmount is not a number", async () => {
      // Middleware schema validation may return 422; handler returns 400
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/create",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalAmount: "not-a-number" }),
        }
      );
      const response = await CustomerOrdersCreatePOST(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 201 with created order for valid input", async () => {
      (prisma as any).order.findFirst.mockResolvedValue(null); // No duplicate
      (prisma as any).order.create.mockResolvedValue({
        ...mockOrder,
        skipPayment: true, // skip email for test simplicity
      });

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/create",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalAmount: 9999, skipPayment: true }),
        }
      );
      const response = await CustomerOrdersCreatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.order).toBeDefined();
    });

    test("returns existing order when stripeSessionId already exists", async () => {
      (prisma as any).order.findFirst.mockResolvedValue(mockOrder);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/create",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalAmount: 9999,
            stripeSessionId: "cs_test_session123",
          }),
        }
      );
      const response = await CustomerOrdersCreatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/customer/orders/total-revenue
  // ---------------------------------------------------------------------------
  describe("GET /api/customer/orders/total-revenue", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/total-revenue",
        { method: "GET" }
      );
      const response = await TotalRevenueGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with revenue stats", async () => {
      (prisma as any).order.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 50000 } }) // all-time
        .mockResolvedValueOnce({ _sum: { totalAmount: 5000 } }) // last month
        .mockResolvedValueOnce({ _sum: { totalAmount: 8000 } }); // this month

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/total-revenue",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TotalRevenueGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(typeof data.data.totalRevenue).toBe("number");
      expect(typeof data.data.percentChange).toBe("number");
    });

    test("handles zero revenue correctly", async () => {
      (prisma as any).order.aggregate.mockResolvedValue({
        _sum: { totalAmount: null },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/total-revenue",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TotalRevenueGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.totalRevenue).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/customer/orders/by-session
  // ---------------------------------------------------------------------------
  describe("GET /api/customer/orders/by-session", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/by-session?session_id=sess-123",
        { method: "GET" }
      );
      const response = await OrderBySessionGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 400 or 422 when session_id is missing", async () => {
      // The query schema may return 422 (unprocessable entity) or 400 (bad request)
      // depending on where validation occurs (middleware vs. handler).
      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/by-session",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await OrderBySessionGET(request);
      expect([400, 422]).toContain(response.status);
    });

    test("returns 200 with order for valid session_id", async () => {
      (prisma as any).order.findFirst.mockResolvedValue(mockOrder);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/by-session?session_id=sess-123",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await OrderBySessionGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.order).toBeDefined();
      expect(data.data.order.stripeSessionId).toBe("sess-123");
    });

    test("returns 404 when no order found for session", async () => {
      (prisma as any).order.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/orders/by-session?session_id=nonexistent-session",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await OrderBySessionGET(request);

      expect(response.status).toBe(404);
    });
  });
});
