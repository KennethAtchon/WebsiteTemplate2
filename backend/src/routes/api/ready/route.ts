import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import getRedisConnection from "@/shared/services/db/redis";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";
import { REDIS_URL } from "@/shared/utils/config/envUtil";

// Readiness check timeout - faster than health check for load balancer efficiency
// Readiness check timeout (READINESS_TIMEOUT removed as unused)
const CRITICAL_SERVICES_TIMEOUT = 800; // 800ms for critical services

/**
 * GET /api/ready
 * Kubernetes/Load Balancer readiness probe endpoint
 *
 * This endpoint determines if the service is ready to accept traffic.
 * It performs fast checks of critical dependencies required for request processing.
 *
 * Returns:
 * - 200 OK: Service is ready to accept traffic
 * - 503 Service Unavailable: Service is not ready (load balancer should not route traffic)
 */
async function getHandler(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Perform readiness checks on critical services only
    const readinessChecks = await Promise.allSettled([
      checkDatabaseReadiness(),
      checkCriticalServicesReadiness(),
    ]);

    const [dbResult, servicesResult] = readinessChecks;

    // Build readiness report
    const readiness = {
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: extractReadinessResult(dbResult),
        services: extractReadinessResult(servicesResult),
      },
      response_time_ms: Date.now() - startTime,
    };

    // Determine if service is ready
    const isReady = Object.values(readiness.checks).every(
      (check) => check.ready
    );
    readiness.ready = isReady;

    const statusCode = readiness.ready ? 200 : 503;

    // Log only failures to reduce noise in production logs
    if (!readiness.ready) {
      debugLog.warn(
        "Service not ready",
        {
          service: "readiness-check",
          operation: "GET",
        },
        {
          ready: readiness.ready,
          responseTimeMs: readiness.response_time_ms,
          failedChecks: Object.entries(readiness.checks)
            .filter(([, check]) => !check.ready)
            .map(([name]) => name),
        }
      );
    }

    return NextResponse.json(readiness, { status: statusCode });
  } catch (error) {
    debugLog.error(
      "Readiness check failed",
      {
        service: "readiness-check",
        operation: "GET",
      },
      error
    );

    return NextResponse.json(
      {
        ready: false,
        timestamp: new Date().toISOString(),
        error: "Readiness check failed",
        response_time_ms: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}

/**
 * Check if database is ready for queries
 * Fast check focused on connection availability
 */
async function checkDatabaseReadiness(): Promise<ReadinessCheckResult> {
  const startTime = Date.now();

  try {
    // Fast database connection check with timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Database readiness timeout")),
          CRITICAL_SERVICES_TIMEOUT
        )
      ),
    ]);

    return {
      ready: true,
      response_time_ms: Date.now() - startTime,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      ready: false,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Check if critical services are ready
 * This includes memory, basic process health, and Redis (required for rate limiting/CSRF)
 */
async function checkCriticalServicesReadiness(): Promise<ReadinessCheckResult> {
  const startTime = Date.now();

  try {
    // Check memory usage - fail if critically low
    const memUsage = process.memoryUsage();
    const heapUsedPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // If heap usage is above 90%, consider not ready
    if (heapUsedPercentage > 90) {
      throw new Error(`High memory usage: ${heapUsedPercentage.toFixed(1)}%`);
    }

    // Check if process has been running long enough to be considered stable
    if (process.uptime() < 5) {
      // Less than 5 seconds uptime
      throw new Error("Service still starting up");
    }

    // Redis is required - fail readiness if not configured or not responsive
    if (!REDIS_URL) {
      throw new Error(
        "Redis not configured (required for rate limiting and CSRF)"
      );
    }

    const redis = getRedisConnection();
    await Promise.race([
      redis.ping(),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 200) // Very fast Redis check
      ),
    ]);

    return {
      ready: true,
      response_time_ms: Date.now() - startTime,
      details: {
        memory_usage_percent: heapUsedPercentage.toFixed(1),
        uptime: process.uptime(),
        redis: "connected",
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      ready: false,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Extract readiness result from Promise.allSettled result
 */
function extractReadinessResult(
  result: PromiseSettledResult<ReadinessCheckResult>
): ReadinessCheckResult {
  if (result.status === "fulfilled") {
    return result.value;
  } else {
    return {
      ready: false,
      response_time_ms: 0,
      error: result.reason?.message || "Check failed",
    };
  }
}

// Type definitions
interface ReadinessCheckResult {
  ready: boolean;
  response_time_ms: number;
  details?: Record<string, unknown>;
  error?: string;
}

export const GET = withPublicProtection(getHandler, {
  rateLimitType: "health",
  skipCSRF: true,
});
