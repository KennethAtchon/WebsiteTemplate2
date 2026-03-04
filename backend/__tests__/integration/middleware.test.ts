/**
 * Integration tests for root middleware (CORS preflight, security headers).
 * Uses real envUtil; CORS_ALLOWED_ORIGINS is set in preload.
 */
import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import { getAllowedCorsOrigins } from "@/shared/utils/config/envUtil";
import { middleware, config } from "../../middleware";

describe("middleware", () => {
  describe("config", () => {
    it("exports matcher that excludes _next, _vercel, and static files", () => {
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher[0]).toContain("_next");
      expect(config.matcher[0]).toContain("_vercel");
    });
  });

  describe("CORS preflight (OPTIONS /api/*)", () => {
    it("returns 403 when origin is not allowed", async () => {
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "OPTIONS",
        headers: { Origin: "https://evil.com" },
      });
      const response = await middleware(request);
      expect(response.status).toBe(403);
    });

    it("returns 403 when origin header is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "OPTIONS",
      });
      const response = await middleware(request);
      expect(response.status).toBe(403);
    });

    it("returns 200 with CORS headers when origin is allowed", async () => {
      const allowed = getAllowedCorsOrigins();
      expect(allowed.length).toBeGreaterThan(0);
      const origin = allowed[0];
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "OPTIONS",
        headers: { Origin: origin },
      });
      const response = await middleware(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
        "true"
      );
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
        "GET"
      );
      expect(response.headers.get("Access-Control-Allow-Headers")).toContain(
        "Authorization"
      );
    });
  });

  describe("non-OPTIONS requests", () => {
    it("returns NextResponse.next() with security headers for GET /api/*", async () => {
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "GET",
      });
      const response = await middleware(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(response.headers.get("Permissions-Policy")).toBeDefined();
      expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe(
        "same-origin-allow-popups"
      );
    });

    it("returns next with security headers for GET page request", async () => {
      const request = new NextRequest("http://localhost:3000/", {
        method: "GET",
      });
      const response = await middleware(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });
  });
});
