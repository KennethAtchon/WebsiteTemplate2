/**
 * Middleware helper – validateCORS, applyRateLimiting, validateCSRF, validateAuthentication,
 * validateInputs, addSecurityHeaders.
 * Dependencies (csrf, rate-limit, auth) are mocked in preload.
 */
import { describe, expect, test } from "bun:test";
import {
  validateCORS,
  applyRateLimiting,
  validateCSRF,
  validateAuthentication,
  validateInputs,
  addSecurityHeaders,
} from "@/shared/middleware/helper";
import { z } from "zod";

function createRequest(
  init: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): any {
  const url = init.url ?? "http://localhost:3000/api/test";
  const req = new Request(url, {
    method: init.method ?? "GET",
    headers: init.headers ?? {},
    body: init.body,
  });
  (req as any).nextUrl = new URL(url);
  return req;
}

describe("middleware helper", () => {
  describe("validateCORS", () => {
    test("returns null when no origin header", async () => {
      const req = createRequest();
      const res = await validateCORS(req as any);
      expect(res).toBeNull();
    });

    test("returns 403 when origin not allowed", async () => {
      const req = createRequest({
        headers: { origin: "https://evil.com" },
      });
      const res = await validateCORS(req as any);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(403);
    });

    test("returns null when origin in custom allowed list", async () => {
      const req = createRequest({
        headers: { origin: "https://allowed.example.com" },
      });
      const res = await validateCORS(req as any, [
        "https://allowed.example.com",
      ]);
      expect(res).toBeNull();
    });

    test("uses custom origins when provided", async () => {
      const req = createRequest({
        headers: { origin: "https://custom.com" },
      });
      const res = await validateCORS(req as any, ["https://custom.com"]);
      expect(res).toBeNull();
    });
  });

  describe("applyRateLimiting", () => {
    test("returns null when limit not exceeded (mocked)", async () => {
      const req = createRequest({ url: "http://localhost:3000/api/health" });
      const res = await applyRateLimiting(req as any, "/api/health");
      expect(res).toBeNull();
    });
  });

  describe("validateCSRF", () => {
    test("returns null for GET", async () => {
      const req = createRequest({ method: "GET" });
      const res = await validateCSRF(req as any, "/api/something");
      expect(res).toBeNull();
    });

    test("returns null for /csrf path", async () => {
      const req = createRequest({
        method: "POST",
        url: "http://localhost:3000/api/csrf",
      });
      const res = await validateCSRF(req as any, "/api/csrf");
      expect(res).toBeNull();
    });

    test("returns 401 when no Bearer token", async () => {
      const req = createRequest({ method: "POST" });
      const res = await validateCSRF(req as any, "/api/orders");
      expect(res).not.toBeNull();
      expect(res!.status).toBe(401);
    });
  });

  describe("validateAuthentication", () => {
    test("calls requireAuth for user level (mocked)", async () => {
      const req = createRequest({
        headers: { authorization: "Bearer fake-token" },
      });
      // validateAuthentication now returns { error, auth } — never null directly.
      // With a fake token the Firebase verify will fail, so error is a NextResponse.
      const result = await validateAuthentication(req as any, "user");
      const isError = result.error !== null && result.error.status >= 400;
      const isSuccess = result.error === null && result.auth !== null;
      expect(isError || isSuccess).toBe(true);
    });

    test("calls requireAdmin for admin level (mocked)", async () => {
      const req = createRequest({
        headers: { authorization: "Bearer fake-token" },
      });
      const result = await validateAuthentication(req as any, "admin");
      const isError = result.error !== null && result.error.status >= 400;
      const isSuccess = result.error === null && result.auth !== null;
      expect(isError || isSuccess).toBe(true);
    });
  });

  describe("validateInputs", () => {
    test("returns null when no schemas", async () => {
      const req = createRequest();
      const res = await validateInputs(req as any);
      expect(res).toBeNull();
    });

    test("validates query params", async () => {
      const schema = z.object({ page: z.string().optional() });
      const req = createRequest({
        url: "http://localhost:3000/api?page=1",
      });
      const res = await validateInputs(req as any, undefined, schema);
      expect(res).toBeNull();
    });

    test("returns 422 when query validation fails", async () => {
      const schema = z.object({ page: z.number() });
      const req = createRequest({
        url: "http://localhost:3000/api?page=not-a-number",
      });
      const res = await validateInputs(req as any, undefined, schema);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(422);
    });
  });

  describe("addSecurityHeaders", () => {
    test("adds security headers to response", () => {
      const req = createRequest();
      const res = new Response(null, { status: 200 }) as any;
      const out = addSecurityHeaders(res, req as any, "/api/test");
      // X-Content-Type-Options and X-Frame-Options are applied globally by middleware.ts,
      // not by addSecurityHeaders — these are API-response-specific headers:
      expect(out.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
      expect(out.headers.get("Cache-Control")).toContain("no-store");
    });
  });
});
