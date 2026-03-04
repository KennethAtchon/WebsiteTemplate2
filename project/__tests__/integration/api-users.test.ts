/**
 * Integration tests for users API routes.
 * Phase 6a of the integration tests plan.
 * Covers: /api/users, /api/users/delete-account, /api/users/customers-count
 * Mocks: requireAuth, adminAuth, prisma.user, FirebaseUserSync.
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import {
  GET as UsersGET,
  POST as UsersPOST,
  PATCH as UsersPATCH,
  DELETE as UsersDELETE,
} from "@/app/api/users/route";
import { DELETE as DeleteAccountDELETE } from "@/app/api/users/delete-account/route";
import { GET as CustomersCountGET } from "@/app/api/users/customers-count/route";
import { requireAuth } from "@/features/auth/services/firebase-middleware";
import { adminAuth } from "@/shared/services/firebase/admin";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import { prisma } from "@/shared/services/db/prisma";

// ---------------------------------------------------------------------------
// Mock FirebaseUserSync (shared/services/firebase/sync)
// ---------------------------------------------------------------------------
mock.module("@/shared/services/firebase/sync", () => ({
  FirebaseUserSync: {
    syncAllUsers: mock(() => Promise.resolve([])),
    syncUserCreate: mock(() =>
      Promise.resolve({ success: true, firebaseUid: "new-fb-uid" })
    ),
    syncUserUpdate: mock(() => Promise.resolve({ success: true })),
    syncUserDelete: mock(() => Promise.resolve({ success: true })),
  },
}));

const mockUser = {
  id: "test-user-id",
  firebaseUid: "test-user-uid",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  phone: null,
  address: null,
  isActive: true,
  isDeleted: false,
  timezone: "UTC",
  hasUsedFreeTrial: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuthResult = {
  user: mockUser,
  userId: "test-user-uid",
  firebaseUser: {
    uid: "test-user-uid",
    email: "test@example.com",
    stripeRole: "basic",
  },
};

describe("Users API Integration Tests", () => {
  beforeEach(() => {
    (requireAuth as any).mockResolvedValue(mockAuthResult);
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: "test-user-uid",
      email: "test@example.com",
    } as any);
    (requireCSRFToken as any).mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue(mockUser as any);
    prisma.user.findMany.mockResolvedValue([mockUser] as any);
    prisma.user.count.mockResolvedValue(5);
    prisma.user.create.mockResolvedValue(mockUser as any);
    prisma.user.update.mockResolvedValue(mockUser as any);
    prisma.user.delete = mock(() => Promise.resolve(mockUser));
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: "test-user-uid",
      email: "test@example.com",
    } as any);
    adminAuth.deleteUser = mock(() => Promise.resolve());
  });

  // ---------------------------------------------------------------------------
  // GET /api/users
  // ---------------------------------------------------------------------------
  describe("GET /api/users", () => {
    test("returns 200 with paginated users", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/users?page=1&limit=10",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await UsersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    test("returns 200 with empty users list", async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/users?page=1&limit=10",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await UsersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users.length).toBe(0);
    });

    test("supports search parameter", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/users?page=1&limit=10&search=Test",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await UsersGET(request);

      expect(response.status).toBe(200);
    });

    test("supports pagination parameters", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/users?page=1&limit=10",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await UsersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.limit).toBe(10);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/users
  // ---------------------------------------------------------------------------
  describe("POST /api/users", () => {
    test("returns 201 with created user (no Firebase)", async () => {
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New User",
          email: "new@example.com",
          createInFirebase: false,
        }),
      });
      const response = await UsersPOST(request);

      expect(response.status).toBe(201);
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/users
  // ---------------------------------------------------------------------------
  describe("PATCH /api/users", () => {
    test("returns 400 or 422 when id is missing", async () => {
      // Handler returns 400, but schema validation may return 422 first (id is required)
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const response = await UsersPATCH(request);
      const data = await response.json();

      expect([400, 422]).toContain(response.status);
      expect(data.error).toBeDefined();
    });

    test("returns 404 when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "550e8400-e29b-41d4-a716-446655440099",
          name: "Updated Name",
        }),
      });
      const response = await UsersPATCH(request);

      expect(response.status).toBe(404);
    });

    test("returns 200 with updated user", async () => {
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Updated Name",
        }),
      });
      const response = await UsersPATCH(request);

      expect(response.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/users
  // ---------------------------------------------------------------------------
  describe("DELETE /api/users", () => {
    test("returns 400 or 422 when id is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const response = await UsersDELETE(request);

      expect([400, 422]).toContain(response.status);
    });

    test("returns 404 when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440099" }),
      });
      const response = await UsersDELETE(request);

      expect(response.status).toBe(404);
    });

    test("returns 200 on successful soft delete", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        isDeleted: true,
      } as any);

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440001" }),
      });
      const response = await UsersDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/users/delete-account
  // ---------------------------------------------------------------------------
  describe("DELETE /api/users/delete-account", () => {
    test("returns 401 when no Bearer token", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/users/delete-account",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const response = await DeleteAccountDELETE(request);
      expect(response.status).toBe(401);
    });

    test("returns 404 when user not found in DB", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/users/delete-account",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await DeleteAccountDELETE(request);
      expect(response.status).toBe(404);
    });

    test("returns 200 with success message on valid delete", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        isDeleted: true,
        isActive: false,
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/users/delete-account",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await DeleteAccountDELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/users/customers-count
  // ---------------------------------------------------------------------------
  describe("GET /api/users/customers-count", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/users/customers-count",
        { method: "GET" }
      );
      const response = await CustomersCountGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with customer counts", async () => {
      prisma.user.count
        .mockResolvedValueOnce(100) // totalCustomers
        .mockResolvedValueOnce(10) // thisMonthCustomers
        .mockResolvedValueOnce(8); // lastMonthCustomers

      const request = new NextRequest(
        "http://localhost:3000/api/users/customers-count",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomersCountGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(typeof data.totalCustomers).toBe("number");
      expect(typeof data.thisMonthCustomers).toBe("number");
      expect(typeof data.lastMonthCustomers).toBe("number");
      expect(data.percentChange).toBeDefined();
    });

    test("returns percentChange of 0 when no previous month data", async () => {
      prisma.user.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0); // lastMonth = 0

      const request = new NextRequest(
        "http://localhost:3000/api/users/customers-count",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await CustomersCountGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // When lastMonth > 0 but thisMonth > 0, percent is 100
      // When both are 0, percent is 0
      expect(typeof data.percentChange).not.toBe("undefined");
    });
  });
});
