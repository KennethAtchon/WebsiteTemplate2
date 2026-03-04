/**
 * Integration tests for API security requirements
 * Mocks are provided by __tests__/setup/bun-preload.ts
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import { GET as AdminCustomersGET } from "@/app/api/admin/customers/route";
import {
  GET as CustomerProfileGET,
  PUT as CustomerProfilePUT,
} from "@/app/api/customer/profile/route";
import { GET as CSRFTokenGET } from "@/app/api/csrf/route";
import {
  requireAuth,
  requireAdmin,
} from "@/features/auth/services/firebase-middleware";
import {
  generateCSRFToken,
  validateCSRFToken,
  requireCSRFToken,
} from "@/shared/services/csrf/csrf-protection";
import { adminAuth } from "@/shared/services/firebase/admin";
import { checkRateLimit } from "@/shared/services/rate-limit/rate-limit-redis";
import { prisma } from "@/shared/services/db/prisma";

/** Auth result shape returned by mocked requireAuth for authenticated user */
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
  firebaseUser: { uid: "test-user-uid", email: "test@example.com" },
};

describe("API Security Integration Tests", () => {
  beforeEach(() => {
    mock.clearAllMocks();
    (checkRateLimit as any).mockResolvedValue(true);
  });

  describe("1. Authentication Checks on All API Routes", () => {
    test("should reject unauthenticated requests to protected customer routes", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );

      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "GET",
        }
      );

      const response = await CustomerProfileGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
    });

    test("should allow authenticated requests to customer routes", async () => {
      (requireAuth as any).mockResolvedValue(mockAuthResult);

      // Mock Prisma and adminAuth for getHandler (findUnique by id, getUser for provider check)
      prisma.user.findUnique.mockResolvedValue({
        id: "test-user-id",
        firebaseUid: "test-user-uid",
        email: "test@example.com",
        name: "Test User",
        phone: null,
        address: null,
        role: "user",
        timezone: "UTC",
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      adminAuth.getUser.mockResolvedValue({
        uid: "test-user-uid",
        displayName: "Test User",
        providerData: [{ providerId: "password" }],
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer valid-firebase-token",
          },
        }
      );

      const response = await CustomerProfileGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty("profile");
    });
  });

  describe("2. Admin Role Verification on Admin Routes", () => {
    test("should reject non-admin users from admin routes", async () => {
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/customers",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer user-token",
          },
        }
      );

      const response = await AdminCustomersGET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Admin access required");
    });

    test("should allow admin users to access admin routes", async () => {
      (requireAdmin as any).mockResolvedValue({
        user: {
          id: "admin-id",
          firebaseUid: "admin-uid",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          isActive: true,
          isDeleted: false,
          timezone: "UTC",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        userId: "admin-uid",
        firebaseUser: {
          uid: "admin-uid",
          email: "admin@example.com",
          role: "admin",
        },
        dbUserId: "admin-id",
        staffId: "admin-id",
      });

      prisma.user.count.mockResolvedValue(0);
      prisma.user.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/customers?page=1&limit=20",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer admin-token",
          },
        }
      );

      const response = await AdminCustomersGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty("customers");
      expect(data.data).toHaveProperty("pagination");
    });
  });

  describe("3. CSRF Protection Testing", () => {
    test("should require CSRF token for POST/PUT requests to sensitive endpoints", async () => {
      adminAuth.verifyIdToken.mockResolvedValue({
        uid: "test-user-uid",
      } as any);
      (requireCSRFToken as any).mockResolvedValue(false);

      // Request without CSRF token
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer valid-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Updated Name" }),
        }
      );

      const response = await CustomerProfilePUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("CSRF token validation failed");
      expect(data.code).toBe("CSRF_TOKEN_INVALID");
    });

    test("should allow requests with valid CSRF token", async () => {
      (requireAuth as any).mockResolvedValue(mockAuthResult);
      (requireCSRFToken as any).mockResolvedValue(true);

      prisma.user.update.mockResolvedValue({
        id: "test-user-id",
        firebaseUid: "test-user-uid",
        email: "test@example.com",
        name: "Updated Name",
        role: "user",
        isActive: true,
        isDeleted: false,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const firebaseUID = "test-user-uid";
      const csrfToken = generateCSRFToken(firebaseUID);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer valid-token",
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ name: "Updated Name" }),
        }
      );

      const response = await CustomerProfilePUT(request);

      // Should pass CSRF check and proceed (may fail on validation, but not CSRF)
      expect([200, 400]).toContain(response.status);
      // If it's 400, it means CSRF passed but validation failed (which is expected)
      // If it's 200, it means everything passed
    });

    test("should skip CSRF for GET requests", async () => {
      (requireAuth as any).mockResolvedValue(mockAuthResult);

      prisma.user.findUnique.mockResolvedValue({
        id: "test-user-id",
        firebaseUid: "test-user-uid",
        email: "test@example.com",
        name: "Test User",
        phone: null,
        address: null,
        role: "user",
        timezone: "UTC",
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      adminAuth.getUser.mockResolvedValue({
        uid: "test-user-uid",
        displayName: "Test User",
        providerData: [{ providerId: "password" }],
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer valid-token",
          },
        }
      );

      const response = await CustomerProfileGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty("profile");
    });
  });

  describe("4. Rate Limiting on Public Endpoints", () => {
    // Note: Public system route was removed, rate limiting is tested via middleware unit tests
  });

  describe("5. CSRF Token Endpoint", () => {
    test("should provide CSRF tokens for authenticated clients", async () => {
      (requireAuth as any).mockResolvedValue(mockAuthResult);

      const request = new NextRequest("http://localhost:3000/api/csrf", {
        method: "GET",
        headers: {
          Authorization: "Bearer valid-token",
        },
      });

      const response = await CSRFTokenGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("csrfToken");
      expect(data).toHaveProperty("expires");

      // Verify token is valid for the Firebase UID
      const isValid = validateCSRFToken(data.csrfToken, "test-user-uid");
      expect(isValid).toBe(true);
    });
  });

  describe("6. Security Headers", () => {
    test("should include security headers in API responses", async () => {
      (requireAuth as any).mockResolvedValue(mockAuthResult);

      prisma.user.findUnique.mockResolvedValue({
        id: "test-user-id",
        firebaseUid: "test-user-uid",
        email: "test@example.com",
        name: "Test User",
        phone: null,
        address: null,
        role: "user",
        timezone: "UTC",
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      adminAuth.getUser.mockResolvedValue({
        uid: "test-user-uid",
        displayName: "Test User",
        providerData: [{ providerId: "password" }],
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer valid-token",
          },
        }
      );

      const response = await CustomerProfileGET(request);

      // X-Content-Type-Options, X-Frame-Options, X-XSS-Protection are set globally by
      // middleware.ts and are not present on direct route handler responses in unit/integration tests.
      // Verify API-layer headers set by addSecurityHeaders instead:
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
    });
  });
});
