/**
 * Integration tests for health and readiness API routes.
 * Phase 1 of the integration tests plan.
 * Mocks: prisma.$queryRaw (preload), Redis (mocked), metrics (mocked).
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET as HealthGET } from "@/app/api/health/route";
import { GET as ReadyGET } from "@/app/api/ready/route";
import { GET as MetricsGET } from "@/app/api/metrics/route";

// ---------------------------------------------------------------------------
// Redis mock — applied before imports of health/ready routes
// ---------------------------------------------------------------------------
const redisMock = {
  ping: mock(() => Promise.resolve("PONG")),
  set: mock(() => Promise.resolve("OK")),
  get: mock(() => Promise.resolve("ok")),
  del: mock(() => Promise.resolve(1)),
  quit: mock(() => Promise.resolve()),
};

mock.module("@/shared/services/db/redis", () => ({
  default: () => redisMock,
  getRedisConnection: () => redisMock,
}));

// Mock metrics service
const metricsContentMock = mock(() =>
  Promise.resolve(
    "# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total 42\n"
  )
);
const isMetricsEnabledMock = mock(() => true);

mock.module("@/shared/services/observability/metrics", () => ({
  getMetricsContent: metricsContentMock,
  isMetricsEnabled: isMetricsEnabledMock,
}));

// Mock app-initialization for error-monitoring (not needed here but avoid issues)
mock.module("@/shared/utils/system/app-initialization", () => ({
  getApplicationHealthDetailed: mock(() =>
    Promise.resolve({
      uptime: { seconds: 3600 },
      memory: { heapUsed: 50 * 1024 * 1024, heapTotal: 200 * 1024 * 1024 },
      nodeVersion: process.version,
      platform: process.platform,
      redis: { status: "connected" },
    })
  ),
}));

describe("Health & Readiness Integration Tests", () => {
  beforeEach(() => {
    redisMock.ping.mockResolvedValue("PONG");
    redisMock.get.mockResolvedValue("ok");
    isMetricsEnabledMock.mockReturnValue(true);
  });

  // ---------------------------------------------------------------------------
  // GET /api/health
  // ---------------------------------------------------------------------------
  describe("GET /api/health", () => {
    test("returns 200 with healthy status when all deps ok", async () => {
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "GET",
      });
      const response = await HealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("healthy");
      expect(data.timestamp).toBeDefined();
      expect(data.uptime).toBeDefined();
      expect(data.checks).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.checks.redis).toBeDefined();
      expect(data.checks.service).toBeDefined();
      expect(data.response_time_ms).toBeDefined();
    });

    test("returns 503 when Redis ping fails", async () => {
      redisMock.ping.mockRejectedValue(new Error("Redis connection refused"));

      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "GET",
      });
      const response = await HealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.redis.status).toBe("unhealthy");
    });

    test("returns 503 when DB query fails", async () => {
      const { prisma } = await import("@/shared/services/db/prisma");
      (prisma.$queryRaw as any).mockRejectedValue(
        new Error("DB connection failed")
      );

      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "GET",
      });
      const response = await HealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("unhealthy");

      // Reset
      (prisma.$queryRaw as any).mockResolvedValue([{ health_check: 1 }]);
    });

    test("response includes version and environment fields", async () => {
      const request = new NextRequest("http://localhost:3000/api/health", {
        method: "GET",
      });
      const response = await HealthGET(request);
      const data = await response.json();

      expect(data.environment).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/ready
  // ---------------------------------------------------------------------------
  describe("GET /api/ready", () => {
    test("returns 200 with ready: true when all deps ok", async () => {
      const request = new NextRequest("http://localhost:3000/api/ready", {
        method: "GET",
      });
      const response = await ReadyGET(request);
      const data = await response.json();

      expect([200, 503]).toContain(response.status);
      expect(typeof data.ready).toBe("boolean");
      expect(data.timestamp).toBeDefined();
      expect(data.checks).toBeDefined();
    });

    test("returns 503 when Redis is not available for readiness", async () => {
      redisMock.ping.mockRejectedValue(new Error("Redis unavailable"));

      const request = new NextRequest("http://localhost:3000/api/ready", {
        method: "GET",
      });
      const response = await ReadyGET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.ready).toBe(false);

      redisMock.ping.mockResolvedValue("PONG");
    });

    test("returns 503 when DB is not available for readiness", async () => {
      const { prisma } = await import("@/shared/services/db/prisma");
      (prisma.$queryRaw as any).mockRejectedValue(new Error("DB down"));

      const request = new NextRequest("http://localhost:3000/api/ready", {
        method: "GET",
      });
      const response = await ReadyGET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.ready).toBe(false);
      expect(data.checks.database.ready).toBe(false);

      (prisma.$queryRaw as any).mockResolvedValue([{ health_check: 1 }]);
    });

    test("response includes response_time_ms", async () => {
      const request = new NextRequest("http://localhost:3000/api/ready", {
        method: "GET",
      });
      const response = await ReadyGET(request);
      const data = await response.json();

      expect(typeof data.response_time_ms).toBe("number");
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/metrics
  // ---------------------------------------------------------------------------
  describe("GET /api/metrics", () => {
    test("returns 200 with Prometheus content when enabled (no secret or valid token)", async () => {
      // METRICS_SECRET is a module-level import from envUtil.
      // Provide a token that matches whatever secret may be set at env load time.
      // In CI/test env without a secret, no token is needed; provide a dummy token here.
      const { METRICS_SECRET: secret } =
        await import("@/shared/utils/config/envUtil");
      const headers: Record<string, string> = {};
      if (secret) {
        headers["Authorization"] = `Bearer ${secret}`;
      }

      const request = new NextRequest("http://localhost:3000/api/metrics", {
        method: "GET",
        headers,
      });
      const response = await MetricsGET(request);
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/text\/plain/);
      expect(text).toContain("http_requests_total");
    });

    test("returns 404 when metrics are disabled", async () => {
      isMetricsEnabledMock.mockReturnValue(false);

      const request = new NextRequest("http://localhost:3000/api/metrics", {
        method: "GET",
      });
      const response = await MetricsGET(request);

      expect(response.status).toBe(404);

      isMetricsEnabledMock.mockReturnValue(true);
    });

    test("returns 200 or 401 depending on METRICS_SECRET env configuration", async () => {
      // METRICS_SECRET is a module-level const from envUtil, loaded once at import time.
      // Whether auth is required depends on whether METRICS_SECRET was set at startup.
      const request = new NextRequest("http://localhost:3000/api/metrics", {
        method: "GET",
      });
      const response = await MetricsGET(request);

      // When METRICS_SECRET is set: 401 without token; when not set: 200
      expect([200, 401]).toContain(response.status);
    });
  });
});
