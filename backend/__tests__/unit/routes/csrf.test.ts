/**
 * Unit tests for the /api/csrf route.
 * Verifies CSRF token generation for authenticated users.
 */
import { describe, it, expect, mock } from "bun:test";

const mockGenerateCSRFToken = (uid: string) => `csrf-${uid}`;

mock.module("@/middleware/protection", () => ({
  rateLimiter: () => async (_c: any, next: any) => next(),
  authMiddleware: () => async (c: any, next: any) => {
    c.set("auth", {
      user: { id: "db-user-id", email: "test@example.com", role: "user" },
      firebaseUser: { uid: "firebase-uid", email: "test@example.com" },
    });
    await next();
  },
}));

mock.module("@/services/csrf/csrf-protection", () => ({
  generateCSRFToken: mockGenerateCSRFToken,
}));

import { Hono } from "hono";
import csrfRoutes from "@/routes/csrf";

const app = new Hono();
app.route("/api/csrf", csrfRoutes);

describe("GET /api/csrf", () => {
  it("returns 200 with csrfToken and expires", async () => {
    const res = await app.request("/api/csrf");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.csrfToken).toBe("csrf-firebase-uid");
    expect(data.expires).toBeDefined();
  });

  it("returns an expires timestamp in the future", async () => {
    const res = await app.request("/api/csrf");
    const data = await res.json();
    const expires = new Date(data.expires).getTime();
    expect(expires).toBeGreaterThan(Date.now());
  });

  it("returns csrfToken scoped to the authenticated user uid", async () => {
    const res = await app.request("/api/csrf");
    const data = await res.json();
    expect(data.csrfToken).toContain("firebase-uid");
  });
});
