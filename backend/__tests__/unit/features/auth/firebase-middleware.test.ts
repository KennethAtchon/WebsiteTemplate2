/**
 * Unit tests for authMiddleware (protection.ts).
 * Uses preload mocks for firebase-admin and prisma.
 */
import { describe, it, expect, mock, beforeEach } from "bun:test";

const mockVerifyIdToken = mock();
const mockFindUnique = mock();

mock.module("@/services/firebase/admin", () => ({
  adminAuth: { verifyIdToken: mockVerifyIdToken },
}));
mock.module("@/services/db/prisma", () => ({
  prisma: { user: { findUnique: mockFindUnique } },
}));

import { Hono } from "hono";
import { authMiddleware } from "@/middleware/protection";

function makeApp(level: "user" | "admin" = "user") {
  const app = new Hono();
  app.get("/protected", authMiddleware(level), (c) =>
    c.json({ ok: true, auth: c.get("auth") })
  );
  return app;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
    mockFindUnique.mockReset();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const app = makeApp();
    const res = await app.request("/protected");
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.code).toBe("AUTH_REQUIRED");
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const app = makeApp();
    const res = await app.request("/protected", {
      headers: { Authorization: "Basic abc123" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 when token verification fails", async () => {
    const app = makeApp();
    mockVerifyIdToken.mockRejectedValue(new Error("Token expired"));
    const res = await app.request("/protected", {
      headers: { Authorization: "Bearer bad-token" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when user not found in database", async () => {
    const app = makeApp();
    mockVerifyIdToken.mockResolvedValue({ uid: "firebase-uid" });
    mockFindUnique.mockResolvedValue(null);
    const res = await app.request("/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.code).toBe("USER_NOT_FOUND");
  });

  it("attaches auth context and passes through for valid user token", async () => {
    const app = makeApp("user");
    mockVerifyIdToken.mockResolvedValue({
      uid: "firebase-uid",
      email: "user@example.com",
    });
    mockFindUnique.mockResolvedValue({
      id: "db-user-id",
      email: "user@example.com",
      role: "user",
    });
    const res = await app.request("/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.auth.user.id).toBe("db-user-id");
  });

  it("returns 403 when non-admin user accesses admin route", async () => {
    const app = makeApp("admin");
    mockVerifyIdToken.mockResolvedValue({ uid: "firebase-uid" });
    mockFindUnique.mockResolvedValue({
      id: "db-user-id",
      email: "user@example.com",
      role: "user",
    });
    const res = await app.request("/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.code).toBe("ADMIN_REQUIRED");
  });

  it("passes through for admin user on admin route", async () => {
    const app = makeApp("admin");
    mockVerifyIdToken.mockResolvedValue({ uid: "firebase-uid" });
    mockFindUnique.mockResolvedValue({
      id: "admin-db-id",
      email: "admin@example.com",
      role: "admin",
    });
    const res = await app.request("/protected", {
      headers: { Authorization: "Bearer admin-token" },
    });
    expect(res.status).toBe(200);
  });
});
