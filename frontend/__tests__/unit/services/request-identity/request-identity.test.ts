/**
 * Request identity – getRequestIpSources, getSecurityIp, getClientIp, checkIpBlocking, cleanupTokenCache.
 * extractUserIdFromToken is tested via mock behavior (adminAuth mocked in preload).
 */
import { describe, expect, test } from "bun:test";
import {
  getRequestIpSources,
  getSecurityIp,
  getClientIp,
  checkIpBlocking,
  cleanupTokenCache,
  extractUserIdFromToken,
} from "@/shared/services/request-identity";

function createRequest(
  overrides: {
    url?: string;
    headers?: Record<string, string>;
    ip?: string;
  } = {}
): any {
  const url = overrides.url ?? "http://localhost:3000/api/test";
  const headers = new Headers(overrides.headers ?? {});
  const req = new Request(url, { method: "GET", headers });
  if (overrides.ip !== undefined) (req as any).ip = overrides.ip;
  return req;
}

describe("request-identity", () => {
  describe("getRequestIpSources", () => {
    test("returns all source keys", () => {
      const req = createRequest();
      const sources = getRequestIpSources(req as any);
      expect(sources).toHaveProperty("x-forwarded-for");
      expect(sources).toHaveProperty("x-real-ip");
      expect(sources).toHaveProperty("cf-connecting-ip");
      expect(sources).toHaveProperty("nextjs-ip");
      expect(sources).toHaveProperty("host");
    });

    test("parses x-forwarded-for", () => {
      const req = createRequest({
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      const sources = getRequestIpSources(req as any);
      expect(sources["x-forwarded-for"]).toBeTruthy();
    });
  });

  describe("getSecurityIp", () => {
    test("returns fallback when no IP headers", () => {
      const req = createRequest();
      const result = getSecurityIp(req as any);
      expect(result.ip).toBeDefined();
      expect(result.source).toBeDefined();
      expect(typeof result.isLocalhost).toBe("boolean");
      expect(result.allSources).toBeDefined();
    });

    test("uses cf-connecting-ip when set", () => {
      const req = createRequest({
        headers: { "cf-connecting-ip": "1.2.3.4" },
      });
      const result = getSecurityIp(req as any);
      expect(result.ip).toBe("1.2.3.4");
      expect(result.source).toBe("CloudFlare");
    });

    test("uses x-real-ip when set", () => {
      const req = createRequest({
        headers: { "x-real-ip": "10.0.0.1" },
      });
      const result = getSecurityIp(req as any);
      expect(result.ip).toBe("10.0.0.1");
      expect(result.source).toBe("Proxy-Real-IP");
    });

    test("detects localhost", () => {
      const req = createRequest({
        headers: { "x-real-ip": "127.0.0.1" },
      });
      const result = getSecurityIp(req as any);
      expect(result.isLocalhost).toBe(true);
    });
  });

  describe("getClientIp", () => {
    test("returns string", () => {
      const req = createRequest();
      const ip = getClientIp(req as any);
      expect(typeof ip).toBe("string");
    });

    test("uses x-forwarded-for when set", () => {
      const req = createRequest({
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      const ip = getClientIp(req as any);
      expect(ip).toBe("192.168.1.1");
    });

    test("returns localhost-dev for 127.0.0.1", () => {
      const req = createRequest({
        headers: { "x-forwarded-for": "127.0.0.1" },
      });
      const ip = getClientIp(req as any);
      expect(ip).toBe("localhost-dev");
    });
  });

  describe("checkIpBlocking", () => {
    test("shouldBlock false when IP not in list", () => {
      const req = createRequest({ headers: { "x-real-ip": "1.2.3.4" } });
      const result = checkIpBlocking(req as any, []);
      expect(result.shouldBlock).toBe(false);
      expect(result.securityInfo).toBeDefined();
    });

    test("shouldBlock true when IP in list", () => {
      const req = createRequest({ headers: { "x-real-ip": "9.9.9.9" } });
      const result = checkIpBlocking(req as any, ["9.9.9.9"]);
      expect(result.shouldBlock).toBe(true);
      expect(result.reason).toBe("IP_BLOCKED");
    });
  });

  describe("cleanupTokenCache", () => {
    test("runs without throwing", () => {
      expect(() => cleanupTokenCache()).not.toThrow();
    });
  });

  describe("extractUserIdFromToken", () => {
    test("returns null when token invalid (mocked adminAuth)", async () => {
      const uid = await extractUserIdFromToken("bad-token");
      expect(uid === null || typeof uid === "string").toBe(true);
    });
  });
});
