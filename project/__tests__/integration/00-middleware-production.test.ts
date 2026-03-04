/**
 * Covers HSTS branch in middleware (lines 123-126).
 * Run with APP_ENV=production to cover: APP_ENV=production bun test __tests__/integration/00-middleware-production.test.ts
 */
import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";

describe("middleware (production)", () => {
  it("sets Strict-Transport-Security when IS_PRODUCTION", async () => {
    const request = new NextRequest("http://localhost:3000/", {
      method: "GET",
    });
    const response = await middleware(request);
    if (process.env.APP_ENV === "production") {
      expect(response.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains; preload"
      );
    } else {
      expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    }
  });
});
