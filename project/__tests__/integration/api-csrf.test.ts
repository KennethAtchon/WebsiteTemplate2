/**
 * Integration tests for GET /api/csrf (token endpoint).
 * Mocks: requireAuth, getCSRFTokenResponse (preload).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/api/csrf/route";
import { requireAuth } from "@/features/auth/services/firebase-middleware";

const mockAuthResult = {
  userId: "test-uid",
  user: { id: "u1", firebaseUid: "test-uid" },
  firebaseUser: { uid: "test-uid" },
};

describe("GET /api/csrf", () => {
  beforeEach(() => {
    (requireAuth as any).mockClear?.();
  });

  test("returns 401 when not authenticated", async () => {
    (requireAuth as any).mockResolvedValue(
      NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    );
    const request = new NextRequest("http://localhost:3000/api/csrf", {
      method: "GET",
    });
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
    expect(data.code).toBe("AUTH_REQUIRED");
    if (typeof data.message === "string") {
      expect(data.message).toContain("CSRF tokens are only available");
    }
  });

  test("returns 200 with csrfToken when authenticated", async () => {
    (requireAuth as any).mockResolvedValue(mockAuthResult);
    const request = new NextRequest("http://localhost:3000/api/csrf", {
      method: "GET",
      headers: { Authorization: "Bearer test-token" },
    });
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.csrfToken).toBeDefined();
    expect(data.expires).toBeDefined();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
