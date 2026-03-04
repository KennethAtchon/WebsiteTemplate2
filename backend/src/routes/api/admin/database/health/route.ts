import { NextRequest, NextResponse } from "next/server";
import { prisma, getQueryStats } from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import {
  dbHealthSchema,
  validateSearchInput,
} from "@/shared/utils/validation/search-validation";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";

/**
 * GET /api/admin/database/health
 *
 * Database health and performance monitoring endpoint (Admin only).
 *
 * Returns:
 * - Query performance statistics
 * - Connection pool status
 * - Slow query alerts
 * - Overall database health status
 *
 * Query parameters:
 * - minutes: Time range for query stats (default: 60)
 */
async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate input parameters using security schema
    const validationResult = validateSearchInput(
      dbHealthSchema,
      {
        minutes: searchParams.get("minutes"),
      },
      "admin-database-health"
    );

    if (!validationResult.success) {
      debugLog.warn(
        "Invalid parameters for database health check",
        {
          service: "admin-database-health",
          operation: "GET",
        },
        { error: validationResult.error }
      );

      return NextResponse.json(
        { error: `Invalid parameters: ${validationResult.error}` },
        { status: 400 }
      );
    }

    const { minutes } = validationResult.data;

    debugLog.info(
      "Fetching database health metrics",
      {
        service: "admin-database-health",
        operation: "GET",
      },
      { minutes }
    );

    // Get performance metrics
    const queryStats = getQueryStats(minutes);

    // Get connection stats from PostgreSQL using safe parameterized queries
    let connectionStats = {
      status: "OK",
      utilizationPercentage: 0,
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
    };
    try {
      // Get current database name safely
      const currentDbResult = await prisma.$queryRaw<
        Array<{ dbname: string }>
      >`SELECT current_database() as dbname`;
      const currentDbName = currentDbResult[0]?.dbname;

      if (!currentDbName) {
        throw new Error("Could not determine current database name");
      }

      // Use parameterized query for safety
      const connResult = await prisma.$queryRaw<
        Array<{
          total_connections: bigint;
          active_connections: bigint;
          idle_connections: bigint;
        }>
      >`
        SELECT
          count(*) as total_connections,
          count(*) filter (where state = 'active') as active_connections,
          count(*) filter (where state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = ${currentDbName}
      `;

      if (connResult[0]) {
        const stats = connResult[0];
        connectionStats = {
          status: "OK",
          totalConnections: Number(stats.total_connections),
          activeConnections: Number(stats.active_connections),
          idleConnections: Number(stats.idle_connections),
          utilizationPercentage:
            Math.round(
              (Number(stats.active_connections) /
                Number(stats.total_connections)) *
                100
            ) || 0,
        };
      }
    } catch (error) {
      debugLog.warn(
        "Could not fetch connection stats",
        { service: "admin-database-health" },
        error
      );
    }

    const isHealthy =
      queryStats.slowQueries === 0 && queryStats.errorQueries === 0;

    // Determine overall health status
    const overallHealth = {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      summary: {
        totalQueries: queryStats.totalQueries,
        averageQueryTime: queryStats.averageTime,
        slowQueries: queryStats.slowQueries,
        errorQueries: queryStats.errorQueries,
        connectionUtilization: connectionStats.utilizationPercentage || 0,
      },
    };

    // Add recommendations based on metrics
    const recommendations = generateHealthRecommendations(
      queryStats,
      connectionStats
    );

    debugLog.info(
      "Successfully retrieved database health metrics",
      {
        service: "admin-database-health",
        operation: "GET",
      },
      {
        status: overallHealth.status,
        totalQueries: queryStats.totalQueries,
        slowQueries: queryStats.slowQueries,
      }
    );

    return NextResponse.json({
      health: overallHealth,
      queryMetrics: {
        timeRange: `${minutes} minutes`,
        totalQueries: queryStats.totalQueries,
        averageQueryTime: `${queryStats.averageTime}ms`,
        slowQueries: {
          count: queryStats.slowQueries,
          threshold: "100ms",
        },
        errorQueries: queryStats.errorQueries,
        topSlowQueries: queryStats.topSlowQueries,
      },
      connectionMetrics: {
        status: connectionStats.status,
        totalConnections: connectionStats.totalConnections,
        activeConnections: connectionStats.activeConnections,
        idleConnections: connectionStats.idleConnections,
        utilizationPercentage: connectionStats.utilizationPercentage,
        lastUpdated: new Date().toISOString(),
      },
      recommendations,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch database health metrics",
      {
        service: "admin-database-health",
        operation: "GET",
      },
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch database health metrics" },
      { status: 500 }
    );
  }
}

/**
 * Generate health recommendations based on current metrics
 */
interface QueryStats {
  slowQueries: number;
  totalQueries: number;
  errorQueries: number;
  averageTime: number;
  topSlowQueries?: unknown[];
}

interface ConnectionStats {
  utilizationPercentage: number;
  status?: string;
}

function generateHealthRecommendations(
  queryStats: QueryStats,
  connectionStats: ConnectionStats
): Array<{
  type: "info" | "warning" | "critical";
  message: string;
  action?: string;
}> {
  const recommendations: Array<{
    type: "info" | "warning" | "critical";
    message: string;
    action?: string;
  }> = [];

  // Query performance recommendations
  if (queryStats.slowQueries > 0) {
    const ratio = (queryStats.slowQueries / queryStats.totalQueries) * 100;

    if (ratio > 10) {
      recommendations.push({
        type: "critical",
        message: `${ratio.toFixed(1)}% of queries are slow (>${100}ms)`,
        action: "Review query patterns and consider adding indexes",
      });
    } else if (ratio > 5) {
      recommendations.push({
        type: "warning",
        message: `${ratio.toFixed(1)}% of queries are slow (>${100}ms)`,
        action: "Monitor query performance and optimize if needed",
      });
    }
  }

  if (queryStats.errorQueries > 0) {
    recommendations.push({
      type: "critical",
      message: `${queryStats.errorQueries} database errors detected`,
      action: "Check application logs for database error details",
    });
  }

  // Connection pool recommendations
  if (connectionStats.utilizationPercentage > 95) {
    recommendations.push({
      type: "critical",
      message: `Connection pool utilization is ${connectionStats.utilizationPercentage}%`,
      action:
        "Consider increasing max_connections or optimizing connection usage",
    });
  } else if (connectionStats.utilizationPercentage > 80) {
    recommendations.push({
      type: "warning",
      message: `Connection pool utilization is ${connectionStats.utilizationPercentage}%`,
      action: "Monitor connection usage and prepare for scaling",
    });
  }

  // Performance recommendations
  if (queryStats.averageTime > 50) {
    recommendations.push({
      type: "warning",
      message: `Average query time is ${queryStats.averageTime}ms`,
      action: "Consider optimizing frequently used queries",
    });
  }

  // Success message when everything is healthy
  if (recommendations.length === 0) {
    recommendations.push({
      type: "info",
      message: "Database performance is healthy",
      action: "Continue monitoring for any changes",
    });
  }

  return recommendations;
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
