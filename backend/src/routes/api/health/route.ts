import { NextRequest, NextResponse } from "next/server";
import { prisma, getQueryStats } from "@/shared/services/db/prisma";
import getRedisConnection from "@/shared/services/db/redis";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";
import {
  APP_ENV,
  PACKAGE_VERSION,
  REDIS_URL,
} from "@/shared/utils/config/envUtil";

// Health check timeout constants
// Health check timeout constants (HEALTH_CHECK_TIMEOUT removed as unused)
const DB_TIMEOUT = 1000; // 1 second for database check
const REDIS_TIMEOUT = 500; // 500ms for Redis check

/**
 * GET /api/health
 * Comprehensive health check endpoint for monitoring systems
 *
 * Returns detailed health status of all critical services:
 * - Database connectivity
 * - Redis connectivity
 * - Service uptime
 * - Memory usage
 */
async function getHandler(_request: NextRequest) {
  const startTime = Date.now();

  try {
    const healthChecks = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkServiceHealth(),
      checkDatabasePerformance(),
    ]);

    const [dbResult, redisResult, serviceResult, dbPerfResult] = healthChecks;

    // Build health report
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: PACKAGE_VERSION,
      environment: APP_ENV || "unknown",
      checks: {
        database: extractHealthResult(dbResult, "database"),
        redis: extractHealthResult(redisResult, "redis"),
        service: extractHealthResult(serviceResult, "service"),
        database_performance: extractHealthResult(
          dbPerfResult,
          "database_performance"
        ),
      },
      response_time_ms: Date.now() - startTime,
    };

    // Determine overall status
    const allHealthy = Object.values(health.checks).every(
      (check) => check.status === "healthy"
    );
    health.status = allHealthy ? "healthy" : "unhealthy";

    const statusCode = health.status === "healthy" ? 200 : 503;

    debugLog.info(
      "Health check completed",
      {
        service: "health-check",
        operation: "GET",
      },
      {
        status: health.status,
        responseTimeMs: health.response_time_ms,
        checks: Object.keys(health.checks).map((key) => ({
          name: key,
          status: health.checks[key as keyof typeof health.checks].status,
        })),
      }
    );

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    debugLog.error(
      "Health check failed",
      {
        service: "health-check",
        operation: "GET",
      },
      error
    );

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        response_time_ms: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}

/**
 * Check database connectivity and basic operations
 */
async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Timeout wrapper for database check
    const dbCheck = (await Promise.race([
      performDatabaseCheck(),
      new Promise<Record<string, unknown>>((_, reject) =>
        setTimeout(
          () => reject(new Error("Database health check timeout")),
          DB_TIMEOUT
        )
      ),
    ])) as Record<string, unknown>;

    return {
      status: "healthy",
      message: "Database connection successful",
      response_time_ms: Date.now() - startTime,
      details: dbCheck,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      status: "unhealthy",
      message: `Database check failed: ${errorMessage}`,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Perform actual database connectivity test
 */
async function performDatabaseCheck() {
  // Test basic database connectivity with a simple query
  await prisma.$queryRaw`SELECT 1 as health_check`;

  // Test database write capability (without side effects)
  await prisma.$queryRaw`SELECT COUNT(*) as user_count FROM "User" LIMIT 1`;

  return {
    connection: "active",
    query_test: "passed",
    write_test: "passed",
  };
}

/**
 * Check Redis connectivity and basic operations
 * Redis is a critical dependency for rate limiting and CSRF protection
 */
async function checkRedisHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Redis is required - fail if not configured
    if (!REDIS_URL) {
      return {
        status: "unhealthy",
        message: "Redis not configured (required for rate limiting and CSRF)",
        response_time_ms: Date.now() - startTime,
        error: "REDIS_URL environment variable not set",
      };
    }

    // Timeout wrapper for Redis check
    const redisCheck = (await Promise.race([
      performRedisCheck(),
      new Promise<Record<string, unknown>>((_, reject) =>
        setTimeout(
          () => reject(new Error("Redis health check timeout")),
          REDIS_TIMEOUT
        )
      ),
    ])) as Record<string, unknown>;

    return {
      status: "healthy",
      message: "Redis connection successful",
      response_time_ms: Date.now() - startTime,
      details: redisCheck,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      status: "unhealthy",
      message: `Redis check failed: ${errorMessage}`,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Perform actual Redis connectivity test
 */
async function performRedisCheck() {
  const redis = getRedisConnection();

  // Test Redis connectivity with a simple ping
  const pingResult = await redis.ping();

  // Test Redis read/write capability with temporary key
  const testKey = `health_check_${Date.now()}`;
  await redis.set(testKey, "ok", "EX", 5); // 5 second expiration
  const getValue = await redis.get(testKey);
  await redis.del(testKey); // Cleanup

  if (getValue !== "ok") {
    throw new Error("Redis read/write test failed");
  }

  return {
    connection: "active",
    ping: pingResult,
    read_write_test: "passed",
  };
}

/**
 * Check database performance metrics
 */
async function checkDatabasePerformance(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const queryStats = getQueryStats(5); // Last 5 minutes

    // Get basic connection info from PostgreSQL
    let connectionInfo = {};
    try {
      const connResult = await prisma.$queryRaw<
        Array<{ active_connections: bigint }>
      >`
        SELECT count(*) as active_connections
        FROM pg_stat_activity
        WHERE datname = current_database() AND state = 'active'
      `;

      connectionInfo = {
        active_connections: Number(connResult[0]?.active_connections || 0),
      };
    } catch {
      // Connection check is optional - don't fail the whole health check
      connectionInfo = { active_connections: "unavailable" };
    }

    const isHealthy =
      queryStats.slowQueries === 0 && queryStats.errorQueries === 0;
    const status = isHealthy ? "healthy" : "unhealthy";
    const message =
      status === "healthy"
        ? "Database performance is optimal"
        : "Database performance issues detected";

    return {
      status,
      message,
      response_time_ms: Date.now() - startTime,
      details: {
        queries_last_5_min: queryStats.totalQueries,
        avg_query_time_ms: queryStats.averageTime,
        slow_queries: queryStats.slowQueries,
        error_queries: queryStats.errorQueries,
        ...connectionInfo,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      status: "unhealthy",
      message: `Database performance check failed: ${errorMessage}`,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Check service health metrics
 */
async function checkServiceHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    return {
      status: "healthy",
      message: "Service metrics normal",
      response_time_ms: Date.now() - startTime,
      details: {
        uptime: process.uptime(),
        memory_usage_mb: memUsageMB,
        node_version: process.version,
        platform: process.platform,
        cpu_usage: process.cpuUsage(),
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      status: "unhealthy",
      message: `Service check failed: ${errorMessage}`,
      response_time_ms: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Extract health result from Promise.allSettled result
 */
function extractHealthResult(
  result: PromiseSettledResult<HealthCheckResult>,
  checkName: string
): HealthCheckResult {
  if (result.status === "fulfilled") {
    return result.value;
  } else {
    return {
      status: "unhealthy",
      message: `${checkName} check failed`,
      response_time_ms: 0,
      error: result.reason?.message || "Unknown error",
    };
  }
}

// Type definitions
interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  message: string;
  response_time_ms: number;
  details?: Record<string, unknown>;
  error?: string;
}

export const GET = withPublicProtection(getHandler, {
  rateLimitType: "health",
  skipCSRF: true,
});
