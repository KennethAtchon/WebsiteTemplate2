/**
 * Unit tests for API route protection middleware
 * Mocks are provided by __tests__/setup/bun-preload.ts
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import {
  withApiProtection,
  withGetProtection,
  withMutationProtection,
} from "@/shared/middleware/api-route-protection";
import {
  requireAuth,
  requireAdmin,
} from "@/features/auth/services/firebase-middleware";
import {
  requireCSRFToken,
  generateCSRFToken,
} from "@/shared/services/csrf/csrf-protection";
import { applyRateLimit } from "@/shared/services/rate-limit/comprehensive-rate-limiter";
import { adminAuth } from "@/shared/services/firebase/admin";

declare const global: typeof globalThis & {
  __testMocks__?: { applyRateLimit: { mockResolvedValue: (v: null) => void } };
};

describe("API Route Protection Middleware - Unit Tests", () => {
  beforeEach(() => {
    mock.clearAllMocks();
    global.__testMocks__?.applyRateLimit.mockResolvedValue(null);
  });

  describe("1. Authentication Checks on All API Routes", () => {
    test("should require authentication when requireAuth is set to 'user'", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
      expect(mockHandler).not.toHaveBeenCalled();
      expect(requireAuth).toHaveBeenCalledWith(request);
    });

    test("should allow authenticated requests when requireAuth is set to 'user'", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAuth as any).mockResolvedValue({
        firebaseUser: { uid: "test-uid" },
        userId: "test-uid",
        user: { id: "test-id", role: "user" },
      });

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
        headers: { Authorization: "Bearer valid-token" },
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test("should not require authentication when requireAuth is false", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: false,
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(requireAuth).not.toHaveBeenCalled();
      expect(requireAdmin).not.toHaveBeenCalled();
    });
  });

  describe("2. Admin Role Verification on Admin Routes", () => {
    test("should require admin role when requireAuth is set to 'admin'", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "admin",
      });
      const request = new NextRequest("http://localhost:3000/api/admin/test", {
        method: "GET",
        headers: { Authorization: "Bearer user-token" },
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Admin access required");
      expect(mockHandler).not.toHaveBeenCalled();
      expect(requireAdmin).toHaveBeenCalledWith(request);
    });

    test("should allow admin requests when requireAuth is set to 'admin'", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAdmin as any).mockResolvedValue({
        firebaseUser: { uid: "admin-uid" },
        userId: "admin-uid",
        user: { id: "admin-id", role: "admin" },
        dbUserId: "admin-id",
        staffId: "admin-id",
      });

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "admin",
      });
      const request = new NextRequest("http://localhost:3000/api/admin/test", {
        method: "GET",
        headers: { Authorization: "Bearer admin-token" },
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test("should reject regular users from admin routes", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAdmin as any).mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 403 })
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "admin",
      });
      const request = new NextRequest("http://localhost:3000/api/admin/test", {
        method: "GET",
        headers: { Authorization: "Bearer user-token" },
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Admin access required");
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("3. CSRF Protection Testing", () => {
    test("should require CSRF token for POST requests to sensitive endpoints", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      adminAuth.verifyIdToken.mockResolvedValue({ uid: "test-uid" } as any);
      (requireCSRFToken as any).mockResolvedValue(false);

      const protectedHandler = withApiProtection(mockHandler as any, {
        skipCSRF: false,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid-token",
          },
          body: JSON.stringify({ name: "Test" }),
        }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("CSRF token validation failed");
      expect(data.code).toBe("CSRF_TOKEN_INVALID");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test("should allow requests with valid CSRF token", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      adminAuth.verifyIdToken.mockResolvedValue({
        uid: "test-session-id",
      } as any);
      (requireCSRFToken as any).mockResolvedValue(true);

      const protectedHandler = withApiProtection(mockHandler as any, {
        skipCSRF: false,
      });
      const csrfToken = generateCSRFToken("test-session-id");
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            Authorization: "Bearer valid-token",
          },
          body: JSON.stringify({ name: "Test" }),
        }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test("should skip CSRF for GET requests", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {
        skipCSRF: false,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        { method: "GET" }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(requireCSRFToken).not.toHaveBeenCalled();
    });

    test("should skip CSRF when skipCSRF option is true", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {
        skipCSRF: true,
      });
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(requireCSRFToken).not.toHaveBeenCalled();
    });
  });

  describe("4. Rate Limiting on Public Endpoints", () => {
    test("should apply rate limiting to public endpoints by default", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {
        skipRateLimit: false,
        rateLimitType: "public",
      });
      const request = new NextRequest(
        "http://localhost:3000/api/public/system",
        { method: "GET" }
      );
      await protectedHandler(request);

      expect(
        global.__testMocks__?.applyRateLimit ?? applyRateLimit
      ).toHaveBeenCalledWith(expect.any(NextRequest), "public");
    });

    test("should reject requests when rate limit is exceeded", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (applyRateLimit as any).mockResolvedValue(
        NextResponse.json(
          { error: "Rate limit exceeded", retryAfter: 60 },
          { status: 429 }
        )
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        skipRateLimit: false,
        rateLimitType: "public",
      });
      const request = new NextRequest(
        "http://localhost:3000/api/public/system",
        { method: "GET" }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test("should skip rate limiting when skipRateLimit is true", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {
        skipRateLimit: true,
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      await protectedHandler(request);
      expect(
        global.__testMocks__?.applyRateLimit ?? applyRateLimit
      ).not.toHaveBeenCalled();
    });
  });

  describe("5. API Route Authorization Logic", () => {
    test("should enforce authentication before authorization", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
      });
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        { method: "GET" }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test("should apply all protection layers in correct order", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (applyRateLimit as any).mockResolvedValue(null);
      adminAuth.verifyIdToken.mockResolvedValue({
        uid: "test-firebase-uid",
      } as any);
      (requireCSRFToken as any).mockResolvedValue(true);
      (requireAuth as any).mockResolvedValue({
        firebaseUser: { uid: "test-uid" },
        userId: "test-uid",
        user: { id: "test-id", role: "user" },
      });

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
        skipCSRF: false,
        skipRateLimit: false,
      });
      const csrfToken = generateCSRFToken("test-firebase-uid");
      const request = new NextRequest(
        "http://localhost:3000/api/customer/profile",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer valid-token",
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Test" }),
        }
      );
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test("should stop at first failing protection layer", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      (applyRateLimit as any).mockResolvedValue(
        NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      );

      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
        skipCSRF: false,
        skipRateLimit: false,
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
      expect(requireCSRFToken).not.toHaveBeenCalled();
      expect(requireAuth).not.toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("6. Security Headers", () => {
    test("should add security headers to all responses", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      );
      const protectedHandler = withApiProtection(mockHandler as any, {});
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const response = await protectedHandler(request);

      // X-Content-Type-Options, X-Frame-Options, X-XSS-Protection are applied globally
      // by middleware.ts — addSecurityHeaders handles API-response-specific headers:
      expect(response.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });
  });

  describe("7. Handler throws", () => {
    test("should return 500 PROTECTION_ERROR when handler throws", async () => {
      const mockHandler = mock(() =>
        Promise.reject(new Error("Handler error"))
      );
      (requireAuth as any).mockResolvedValue({
        firebaseUser: { uid: "test-uid" },
        userId: "test-uid",
        user: { id: "test-id" },
      });
      const protectedHandler = withApiProtection(mockHandler as any, {
        requireAuth: "user",
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.code).toBe("PROTECTION_ERROR");
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("8. Convenience wrappers", () => {
    test("withGetProtection wraps handler with skipCSRF true", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ ok: true }))
      );
      const protectedHandler = withGetProtection(mockHandler as any);
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const response = await protectedHandler(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test("withMutationProtection wraps handler with full protection", async () => {
      const mockHandler = mock(() =>
        Promise.resolve(NextResponse.json({ created: true }))
      );
      (requireAuth as any).mockResolvedValue({
        firebaseUser: { uid: "u1" },
        userId: "u1",
        user: { id: "1" },
      });
      (requireCSRFToken as any).mockResolvedValue(true);
      const protectedHandler = withMutationProtection(mockHandler as any, {
        requireAuth: "user",
      });
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": "t",
          Authorization: "Bearer x",
        },
        body: "{}",
      });
      const response = await protectedHandler(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.created).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
