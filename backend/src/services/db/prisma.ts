import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/lib/generated/prisma";
import { encrypt, decrypt } from "@/utils/security/encryption";
import {
  APP_ENV,
  DATABASE_URL,
  ENABLE_DB_HEALTH_CHECKS,
} from "@/utils/config/envUtil";
import debugLog from "@/utils/debug/debug";
import { sanitizeObject } from "@/utils/security/pii-sanitization";
import {
  recordDbQuery,
  recordConnectionPool,
} from "@/services/observability/metrics";

declare global {
  var prisma: ExtendedPrismaClient;
}

const CONTACT_MESSAGE_ENCRYPTED_FIELDS = [
  "name",
  "email",
  "phone",
  "subject",
  "message",
] as const;

type ContactMessageData = Record<string, unknown>;
type StringFieldUpdate = { set: string | null };
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

function encryptContactFields(data: ContactMessageData): void {
  if (!data) return;

  for (const field of CONTACT_MESSAGE_ENCRYPTED_FIELDS) {
    const value = data[field];

    if (isStringValue(value)) {
      data[field] = encrypt(value);
    } else if (isStringFieldUpdate(value)) {
      if (typeof value.set === "string") {
        value.set = encrypt(value.set);
      }
    }
  }
}

function decryptContactFields(data: ContactMessageData): void {
  if (!data) return;

  for (const field of CONTACT_MESSAGE_ENCRYPTED_FIELDS) {
    const value = data[field];

    if (isStringValue(value)) {
      try {
        data[field] = decrypt(value);
      } catch {
        // Leave corrupted/unencrypted data as-is
      }
    } else if (isStringFieldUpdate(value)) {
      if (typeof value.set === "string") {
        try {
          value.set = decrypt(value.set);
        } catch {
          // Leave corrupted/unencrypted data as-is
        }
      }
    }
  }
}

// Type guards
function isStringValue(value: unknown): value is string {
  return typeof value === "string";
}

function isStringFieldUpdate(value: unknown): value is StringFieldUpdate {
  return typeof value === "object" && value !== null && "set" in value;
}

// Performance monitoring state
interface QueryMetrics {
  model: string;
  operation: string;
  duration: number;
  timestamp: Date;
}

// Connection pool monitoring state
interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  timestamp: Date;
}

const queryMetrics: QueryMetrics[] = [];
const connectionPoolMetrics: ConnectionPoolMetrics[] = [];
const maxMetricsHistory = 1000;
const slowQueryThreshold = 100; // 100ms as per ticket #4 requirements
const poolMetricsInterval = 30000; // 30 seconds

// Database connection pool constants
const CONNECTION_POOL_CONFIG = {
  maxConnections: 20, // Maximum concurrent connections
  poolTimeout: 10, // Connection pool timeout in seconds
  queryTimeout: 5000, // Individual query timeout in milliseconds
  retryAttempts: 3, // Number of retry attempts for failed connections
  retryDelay: 1000, // Base delay between retries in milliseconds
  healthCheckInterval: 30000, // Health check interval in milliseconds
  connectionWarningThreshold: 0.8, // Warn when pool usage exceeds this percentage
} as const;

// Connection pool configuration for production readiness
const getConnectionPoolConfig = (): Prisma.PrismaClientOptions => {
  const isProduction = APP_ENV === "production";
  const isTestEnv = APP_ENV === "test";

  const config: Prisma.PrismaClientOptions = {
    log: isProduction
      ? ["error"]
      : isTestEnv
        ? []
        : ["query", "info", "warn", "error"],
    // Use datasourceUrl with connection pooling (skip pooling params in test to avoid hangs)
    datasourceUrl: isTestEnv ? DATABASE_URL || "" : getDatabaseUrlWithPooling(),
    // Error formatting for better debugging
    errorFormat: "colorless",
  };

  return config;
};

// Enhance DATABASE_URL with connection pooling parameters
function getDatabaseUrlWithPooling(): string {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const url = new URL(DATABASE_URL);

  // Use smaller connection pool for tests to avoid hanging
  const isTestEnv = APP_ENV === "test";
  const maxConnections = isTestEnv ? 5 : CONNECTION_POOL_CONFIG.maxConnections;

  // Connection pool settings for high availability
  const poolParams = new URLSearchParams({
    // Maximum number of connections in the pool (critical for preventing exhaustion)
    connection_limit: maxConnections.toString(),
    // Maximum time a connection can be idle before being closed
    pool_timeout: CONNECTION_POOL_CONFIG.poolTimeout.toString(),
    // Enable connection pooling
    pool: "true",
    // Schema (preserve existing if present)
    schema: url.searchParams.get("schema") || "public",
  });

  // Preserve existing search params and override with pool params
  for (const [key, value] of poolParams) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

const basePrisma = new PrismaClient(getConnectionPoolConfig());

let prisma: ExtendedPrismaClient;

function createPrismaClient() {
  return basePrisma.$extends({
    query: {
      // Performance monitoring for all models
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = Date.now();

          try {
            const result = await query(args);
            const duration = Date.now() - start;

            // Record query metrics
            recordQueryMetric({
              model: model || "unknown",
              operation,
              duration,
              timestamp: new Date(),
            });
            recordDbQuery(model || "unknown", operation, duration, "ok");

            // Alert on slow queries
            if (duration > slowQueryThreshold) {
              handleSlowQuery(model, operation, duration, args);
            }

            return result;
          } catch (error) {
            const duration = Date.now() - start;

            recordQueryMetric({
              model: model || "unknown",
              operation: `${operation}_ERROR`,
              duration,
              timestamp: new Date(),
            });
            recordDbQuery(model || "unknown", operation, duration, "error");

            debugLog.error(
              "Database query error",
              {
                service: "prisma-client",
                operation: "query",
              },
              {
                model,
                operation,
                duration,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            );

            throw error;
          }
        },
      },

      contactMessage: {
        // Write operations - encrypt before storing
        async create({ args, query }) {
          if (args.data) {
            encryptContactFields(args.data);
          }
          const result = await query(args);
          decryptContactFields(result);
          return result;
        },

        async update({ args, query }) {
          if (args.data) {
            encryptContactFields(args.data);
          }
          const result = await query(args);
          decryptContactFields(result);
          return result;
        },

        async upsert({ args, query }) {
          if (args.create) {
            encryptContactFields(args.create);
          }
          if (args.update) {
            encryptContactFields(args.update);
          }
          const result = await query(args);
          decryptContactFields(result);
          return result;
        },

        // Read operations - decrypt after retrieval
        async findFirst({ args, query }) {
          const result = await query(args);
          if (result) {
            decryptContactFields(result);
          }
          return result;
        },

        async findFirstOrThrow({ args, query }) {
          const result = await query(args);
          if (result) {
            decryptContactFields(result);
          }
          return result;
        },

        async findUnique({ args, query }) {
          const result = await query(args);
          if (result) {
            decryptContactFields(result);
          }
          return result;
        },

        async findUniqueOrThrow({ args, query }) {
          const result = await query(args);
          if (result) {
            decryptContactFields(result);
          }
          return result;
        },

        async findMany({ args, query }) {
          const result = await query(args);
          if (Array.isArray(result)) {
            result.forEach(decryptContactFields);
          }
          return result;
        },
      },
    },
  });
}

// Performance monitoring helper functions
function recordQueryMetric(metric: QueryMetrics) {
  queryMetrics.push(metric);

  // Keep only recent metrics to prevent memory leaks
  if (queryMetrics.length > maxMetricsHistory) {
    queryMetrics.splice(0, queryMetrics.length - maxMetricsHistory);
  }
}

function handleSlowQuery(
  model: string,
  operation: string,
  duration: number,
  args: any
) {
  const criticalThreshold = slowQueryThreshold * 10; // 1000ms
  const level = duration > criticalThreshold ? "error" : "warn";

  debugLog[level](
    "Slow database query detected",
    {
      service: "prisma-client",
      operation: "slow-query-alert",
    },
    {
      model,
      operation,
      duration: `${duration}ms`,
      threshold: `${slowQueryThreshold}ms`,
      args: sanitizeArgs(args),
    }
  );
}

function sanitizeArgs(args: any): any {
  if (!args) return args;

  // Use centralized PII sanitization
  return sanitizeObject({ ...args });
}

// Connection pool monitoring functions
function recordConnectionPoolMetric() {
  const metric: ConnectionPoolMetrics = {
    totalConnections: getConnectionCount(),
    activeConnections: getActiveConnectionCount(),
    idleConnections: getIdleConnectionCount(),
    waitingConnections: 0, // Prisma doesn't expose this directly
    timestamp: new Date(),
  };

  connectionPoolMetrics.push(metric);

  // Keep only recent metrics to prevent memory leaks
  if (connectionPoolMetrics.length > maxMetricsHistory) {
    connectionPoolMetrics.splice(
      0,
      connectionPoolMetrics.length - maxMetricsHistory
    );
  }

  recordConnectionPool(
    metric.activeConnections,
    metric.idleConnections,
    CONNECTION_POOL_CONFIG.maxConnections
  );

  // Alert on high connection usage
  const connectionUsagePercent =
    (metric.activeConnections / CONNECTION_POOL_CONFIG.maxConnections) * 100;
  if (
    connectionUsagePercent >
    CONNECTION_POOL_CONFIG.connectionWarningThreshold * 100
  ) {
    debugLog.warn(
      "High database connection usage detected",
      {
        service: "prisma-client",
        operation: "connection-pool-monitoring",
      },
      {
        totalConnections: metric.totalConnections,
        activeConnections: metric.activeConnections,
        usagePercent: `${Math.round(connectionUsagePercent)}%`,
        threshold: `${CONNECTION_POOL_CONFIG.connectionWarningThreshold * 100}%`,
      }
    );
  }
}

// Connection counting helpers (approximations since Prisma doesn't expose exact counts)
function getConnectionCount(): number {
  // This is an approximation - in production you'd want proper monitoring
  return Math.max(
    1,
    queryMetrics.filter((m) => Date.now() - m.timestamp.getTime() < 60000)
      .length
  );
}

function getActiveConnectionCount(): number {
  // Estimate based on recent query activity
  return Math.max(
    1,
    queryMetrics.filter((m) => Date.now() - m.timestamp.getTime() < 5000).length
  );
}

function getIdleConnectionCount(): number {
  return Math.max(0, getConnectionCount() - getActiveConnectionCount());
}

// Connection pool health check with retry logic
async function ensureConnectionHealth(): Promise<boolean> {
  const maxRetries = CONNECTION_POOL_CONFIG.retryAttempts;
  const retryDelay = CONNECTION_POOL_CONFIG.retryDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simple connectivity test
      await basePrisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      debugLog.warn(
        "Database connection attempt failed",
        {
          service: "prisma-client",
          operation: "connection-health-check",
        },
        {
          attempt,
          maxRetries,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );

      if (attempt === maxRetries) {
        debugLog.error(
          "Database connection health check failed after all retries",
          {
            service: "prisma-client",
            operation: "connection-health-check",
          },
          {
            attempts: maxRetries,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        );
        return false;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return false;
}

// Graceful connection cleanup
async function gracefulShutdown(): Promise<void> {
  debugLog.info("Initiating graceful database shutdown", {
    service: "prisma-client",
    operation: "graceful-shutdown",
  });

  try {
    await basePrisma.$disconnect();
    debugLog.info("Database connections closed successfully", {
      service: "prisma-client",
      operation: "graceful-shutdown",
    });
  } catch (error) {
    debugLog.error(
      "Error during database shutdown",
      {
        service: "prisma-client",
        operation: "graceful-shutdown",
      },
      {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    );
  }
}

// Start connection pool monitoring
let poolMonitoringInterval: NodeJS.Timeout | null = null;

function startConnectionPoolMonitoring() {
  if (poolMonitoringInterval) {
    return; // Already started
  }

  poolMonitoringInterval = setInterval(() => {
    recordConnectionPoolMetric();
  }, poolMetricsInterval);

  debugLog.info(
    "Connection pool monitoring started",
    {
      service: "prisma-client",
      operation: "pool-monitoring",
    },
    {
      interval: `${poolMetricsInterval / 1000}s`,
    }
  );
}

function stopConnectionPoolMonitoring() {
  if (poolMonitoringInterval) {
    clearInterval(poolMonitoringInterval);
    poolMonitoringInterval = null;
    debugLog.info("Connection pool monitoring stopped", {
      service: "prisma-client",
      operation: "pool-monitoring",
    });
  }
}

// Export monitoring functions
export function getQueryStats(minutes: number = 60) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const recentMetrics = queryMetrics.filter((m) => m.timestamp >= cutoff);

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
    (m) => m.duration > slowQueryThreshold
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

export function getConnectionPoolStats(minutes: number = 60) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const recentMetrics = connectionPoolMetrics.filter(
    (m) => m.timestamp >= cutoff
  );

  if (recentMetrics.length === 0) {
    return {
      totalConnections: 0,
      averageActiveConnections: 0,
      averageIdleConnections: 0,
      peakConnections: 0,
      poolUtilization: 0,
    };
  }

  const avgActive = Math.round(
    recentMetrics.reduce((sum, m) => sum + m.activeConnections, 0) /
      recentMetrics.length
  );
  const avgIdle = Math.round(
    recentMetrics.reduce((sum, m) => sum + m.idleConnections, 0) /
      recentMetrics.length
  );
  const peakConnections = Math.max(
    ...recentMetrics.map((m) => m.totalConnections)
  );

  return {
    totalConnections:
      recentMetrics[recentMetrics.length - 1]?.totalConnections || 0,
    averageActiveConnections: avgActive,
    averageIdleConnections: avgIdle,
    peakConnections,
    poolUtilization: Math.round(
      (avgActive / CONNECTION_POOL_CONFIG.maxConnections) * 100
    ),
  };
}

export {
  ensureConnectionHealth,
  gracefulShutdown,
  startConnectionPoolMonitoring,
  stopConnectionPoolMonitoring,
};

// Initialize Prisma client with connection pooling and monitoring
if (APP_ENV === "production") {
  prisma = createPrismaClient();
  // Start connection pool monitoring in production
  startConnectionPoolMonitoring();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
    // Only start monitoring in development, not in test environment
    if (APP_ENV !== "test") {
      startConnectionPoolMonitoring();
    }
  }
  prisma = global.prisma;
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  debugLog.info("SIGINT received, shutting down gracefully");
  stopConnectionPoolMonitoring();
  await gracefulShutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  debugLog.info("SIGTERM received, shutting down gracefully");
  stopConnectionPoolMonitoring();
  await gracefulShutdown();
  process.exit(0);
});

// Enhanced prisma client with connection health checks
// Only enable health checks and timeouts in production or when explicitly enabled
const shouldEnableHealthChecks =
  APP_ENV === "production" || ENABLE_DB_HEALTH_CHECKS;

const enhancedPrisma = new Proxy(prisma, {
  get(target, prop) {
    const originalMethod = target[prop as keyof typeof target];

    // Intercept database operations to ensure connection health (only in production)
    if (
      typeof originalMethod === "object" &&
      originalMethod !== null &&
      shouldEnableHealthChecks
    ) {
      return new Proxy(originalMethod, {
        get(modelTarget, modelProp) {
          const modelMethod =
            modelTarget[modelProp as keyof typeof modelTarget];

          if (typeof modelMethod === "function") {
            return async (...args: any[]) => {
              // Ensure connection health before executing operations
              const isHealthy = await ensureConnectionHealth();
              if (!isHealthy) {
                throw new Error(
                  "Database connection is unhealthy. Please try again."
                );
              }

              try {
                // Add query timeout
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => {
                    reject(
                      new Error(
                        `Database query timed out after ${CONNECTION_POOL_CONFIG.queryTimeout}ms`
                      )
                    );
                  }, CONNECTION_POOL_CONFIG.queryTimeout);
                });

                // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                const queryPromise = (modelMethod as Function).apply(
                  modelTarget,
                  args
                );

                return await Promise.race([queryPromise, timeoutPromise]);
              } catch (error) {
                // Log connection errors for monitoring
                if (
                  error instanceof Error &&
                  (error.message.includes("connection") ||
                    error.message.includes("timeout") ||
                    error.message.includes("pool"))
                ) {
                  debugLog.error(
                    "Database connection error detected",
                    {
                      service: "prisma-client",
                      operation: "connection-error",
                    },
                    {
                      model: String(prop),
                      method: String(modelProp),
                      error: error.message,
                    }
                  );
                }
                throw error;
              }
            };
          }

          return modelMethod;
        },
      });
    }

    return originalMethod;
  },
});

export default enhancedPrisma;
export { enhancedPrisma as prisma };
