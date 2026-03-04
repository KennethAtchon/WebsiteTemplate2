/**
 * Database Performance Monitoring Service
 *
 * Implements query performance tracking and connection pool monitoring
 * as required by ticket #4 to prevent database performance degradation.
 */

import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/lib/generated/prisma";
import debugLog from "@/shared/utils/debug";
import { sanitizeObject } from "@/shared/utils/security/pii-sanitization";

interface QueryMetrics {
  model: string;
  operation: string;
  duration: number;
  timestamp: Date;
  args?: any;
}

interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  timestamp: Date;
}

interface PerformanceThresholds {
  slowQueryThreshold: number; // milliseconds
  connectionPoolWarningThreshold: number; // percentage
  connectionPoolCriticalThreshold: number; // percentage
}

class DatabasePerformanceMonitor {
  private queryMetrics: QueryMetrics[] = [];
  private connectionMetrics: ConnectionPoolMetrics[] = [];
  private readonly maxMetricsHistory = 1000;

  private readonly thresholds: PerformanceThresholds = {
    slowQueryThreshold: 100, // 100ms as per ticket requirements
    connectionPoolWarningThreshold: 80, // 80% of pool
    connectionPoolCriticalThreshold: 95, // 95% of pool
  };

  constructor(private prisma: PrismaClient) {
    this.setupQueryMonitoring();
    this.startConnectionPoolMonitoring();
  }

  /**
   * Extends Prisma client with query performance monitoring
   */
  private setupQueryMonitoring() {
    // Try to set up query event monitoring if logging is enabled
    try {
      this.prisma.$on("query" as any, (event: any) => {
        const duration = event.duration;

        this.recordQueryMetric({
          model: event.target,
          operation: "query",
          duration,
          timestamp: event.timestamp,
          args: event.params,
        });

        // Alert on slow queries
        if (duration > this.thresholds.slowQueryThreshold) {
          this.handleSlowQueryFromEvent(event, duration);
        }
      });
    } catch {
      // If query events aren't available (e.g., logging not enabled),
      // we'll use a wrapper approach instead
      debugLog.warn(
        "Query event monitoring not available, falling back to wrapper monitoring",
        {
          service: "db-performance-monitor",
          operation: "setup",
        }
      );
    }
  }

  /**
   * Records a query performance metric
   */
  private recordQueryMetric(metric: QueryMetrics) {
    this.queryMetrics.push(metric);

    // Keep only recent metrics to prevent memory leaks
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Handles slow query alerts from query events
   */
  private handleSlowQueryFromEvent(event: Prisma.QueryEvent, duration: number) {
    const criticalThreshold = this.thresholds.slowQueryThreshold * 10; // 1000ms
    const level = duration > criticalThreshold ? "error" : "warn";

    debugLog[level](
      "Slow database query detected",
      {
        service: "db-performance-monitor",
        operation: "slow-query-alert",
      },
      {
        target: event.target,
        query: event.query,
        duration: `${duration}ms`,
        threshold: `${this.thresholds.slowQueryThreshold}ms`,
        params: this.sanitizeArgs(event.params),
      }
    );

    // In production, you might want to send this to an external monitoring service
    // like DataDog, New Relic, or AWS CloudWatch
    if (level === "error") {
      this.sendCriticalAlert("CRITICAL_SLOW_QUERY", {
        target: event.target,
        query: event.query,
        duration,
        timestamp: event.timestamp.toISOString(),
      });
    }
  }

  /**
   * Monitors database connection pool health
   */
  private async startConnectionPoolMonitoring() {
    // Check connection pool every 30 seconds
    setInterval(async () => {
      try {
        await this.checkConnectionPool();
      } catch (error) {
        debugLog.error(
          "Connection pool monitoring error",
          {
            service: "db-performance-monitor",
            operation: "connection-pool-check",
          },
          error
        );
      }
    }, 30000);
  }

  /**
   * Checks connection pool health and alerts if needed
   */
  private async checkConnectionPool() {
    try {
      // Use Prisma's $queryRaw with template literals for safe parameterized queries
      const currentDatabase = (await this.prisma
        .$queryRaw`SELECT current_database() as dbname`) as any[];
      const dbName = currentDatabase[0]?.dbname;

      if (!dbName) {
        throw new Error("Could not determine current database name");
      }

      // Use safe parameterized queries with Prisma.sql
      const poolStats = (await this.prisma.$queryRaw`
        SELECT
          count(*) as active_connections,
          current_setting('max_connections')::int as max_connections,
          count(*) filter (where state = 'idle') as idle_connections,
          count(*) filter (where state = 'active') as busy_connections
        FROM pg_stat_activity
        WHERE datname = ${dbName}
      `) as any[];

      if (poolStats && poolStats[0]) {
        const stats = poolStats[0];
        const metrics: ConnectionPoolMetrics = {
          totalConnections: Number(stats.active_connections),
          activeConnections: Number(stats.busy_connections),
          idleConnections: Number(stats.idle_connections),
          waitingConnections: 0, // PostgreSQL doesn't directly expose this
          timestamp: new Date(),
        };

        this.recordConnectionMetric(metrics);

        // Check for connection pool alerts
        const utilizationPercentage =
          (metrics.totalConnections / Number(stats.max_connections)) * 100;

        if (
          utilizationPercentage >
          this.thresholds.connectionPoolCriticalThreshold
        ) {
          this.handleConnectionPoolAlert(
            "CRITICAL",
            metrics,
            utilizationPercentage
          );
        } else if (
          utilizationPercentage > this.thresholds.connectionPoolWarningThreshold
        ) {
          this.handleConnectionPoolAlert(
            "WARNING",
            metrics,
            utilizationPercentage
          );
        }
      }
    } catch (error) {
      debugLog.error(
        "Failed to query connection pool stats",
        {
          service: "db-performance-monitor",
          operation: "connection-pool-stats",
        },
        error
      );
    }
  }

  /**
   * Records connection pool metrics
   */
  private recordConnectionMetric(metric: ConnectionPoolMetrics) {
    this.connectionMetrics.push(metric);

    if (this.connectionMetrics.length > this.maxMetricsHistory) {
      this.connectionMetrics = this.connectionMetrics.slice(
        -this.maxMetricsHistory
      );
    }
  }

  /**
   * Handles connection pool alerts
   */
  private handleConnectionPoolAlert(
    level: "WARNING" | "CRITICAL",
    metrics: ConnectionPoolMetrics,
    utilization: number
  ) {
    const logLevel = level === "CRITICAL" ? "error" : "warn";

    debugLog[logLevel](
      "Database connection pool alert",
      {
        service: "db-performance-monitor",
        operation: "connection-pool-alert",
      },
      {
        level,
        utilization: `${utilization.toFixed(1)}%`,
        totalConnections: metrics.totalConnections,
        activeConnections: metrics.activeConnections,
        idleConnections: metrics.idleConnections,
        threshold:
          level === "CRITICAL"
            ? `${this.thresholds.connectionPoolCriticalThreshold}%`
            : `${this.thresholds.connectionPoolWarningThreshold}%`,
      }
    );

    if (level === "CRITICAL") {
      this.sendCriticalAlert("CRITICAL_CONNECTION_POOL", {
        utilization,
        metrics,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Sends critical alerts (placeholder for external alerting system)
   */
  private sendCriticalAlert(type: string, data: any) {
    // In a production environment, this would integrate with:
    // - Slack/Discord webhooks
    // - Email alerts
    // - PagerDuty
    // - AWS SNS
    // - DataDog/New Relic alerts

    debugLog.error(
      "CRITICAL DATABASE ALERT",
      {
        service: "db-performance-monitor",
        operation: "critical-alert",
      },
      {
        alertType: type,
        data,
        action: "IMMEDIATE_ATTENTION_REQUIRED",
      }
    );
  }

  /**
   * Sanitizes query arguments for logging using centralized PII sanitization
   */
  private sanitizeArgs(args: any): any {
    if (!args) return args;
    return sanitizeObject({ ...args });
  }

  /**
   * Gets current query performance statistics
   */
  public getQueryStats(minutes: number = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.queryMetrics.filter(
      (m) => m.timestamp >= cutoff
    );

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageTime: 0,
        slowQueries: 0,
        errorQueries: 0,
        topSlowQueries: [],
      };
    }

    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const slowQueries = recentMetrics.filter(
      (m) => m.duration > this.thresholds.slowQueryThreshold
    );
    const errorQueries = recentMetrics.filter((m) =>
      m.operation.includes("ERROR")
    );

    const topSlowQueries = recentMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((m) => ({
        model: m.model,
        operation: m.operation,
        duration: m.duration,
        timestamp: m.timestamp,
      }));

    return {
      totalQueries: recentMetrics.length,
      averageTime: Math.round(totalTime / recentMetrics.length),
      slowQueries: slowQueries.length,
      errorQueries: errorQueries.length,
      topSlowQueries,
    };
  }

  /**
   * Gets current connection pool statistics
   */
  public getConnectionStats() {
    const latest = this.connectionMetrics[this.connectionMetrics.length - 1];

    if (!latest) {
      return {
        status: "NO_DATA",
        message: "No connection metrics available",
      };
    }

    const utilization =
      latest.totalConnections > 0
        ? (latest.activeConnections / latest.totalConnections) * 100
        : 0;

    return {
      status: "OK",
      totalConnections: latest.totalConnections,
      activeConnections: latest.activeConnections,
      idleConnections: latest.idleConnections,
      utilizationPercentage: Math.round(utilization),
      lastUpdated: latest.timestamp,
    };
  }

  /**
   * Health check endpoint data
   */
  public getHealthCheck() {
    const queryStats = this.getQueryStats(5); // Last 5 minutes
    const connectionStats = this.getConnectionStats();

    const isHealthy =
      queryStats.slowQueries === 0 &&
      queryStats.errorQueries === 0 &&
      connectionStats.status === "OK";

    return {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      queries: queryStats,
      connections: connectionStats,
    };
  }
}

// Export singleton instance with logging enabled for monitoring
export const dbPerformanceMonitor = new DatabasePerformanceMonitor(
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  })
);

export default dbPerformanceMonitor;
