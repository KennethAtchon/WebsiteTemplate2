/**
 * Error Monitoring Health Check Endpoint
 * Provides detailed information about error handling status and metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getErrorMetrics } from "@/shared/utils/error-handling/global-error-handler";
import { getApplicationHealthDetailed } from "@/shared/utils/system/app-initialization";
import { withStandardErrorHandling } from "@/shared/utils/error-handling/api-error-wrapper";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";

async function handler(_request: NextRequest): Promise<NextResponse> {
  const errorMetrics = getErrorMetrics();
  const appHealth = await getApplicationHealthDetailed();

  const healthReport = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    errorHandling: {
      globalHandlersInstalled: process.listenerCount("unhandledRejection") > 0,
      unhandledRejectionHandlers: process.listenerCount("unhandledRejection"),
      uncaughtExceptionHandlers: process.listenerCount("uncaughtException"),
      processWarningHandlers: process.listenerCount("warning"),
    },
    errorMetrics: {
      ...errorMetrics,
      errorRate: calculateErrorRate(errorMetrics),
      healthScore: calculateHealthScore(errorMetrics, appHealth),
    },
    processInfo: {
      uptime: appHealth.uptime,
      memory: appHealth.memory,
      nodeVersion: appHealth.nodeVersion,
      platform: appHealth.platform,
    },
    redis: appHealth.redis,
    recommendations: generateRecommendations(errorMetrics, appHealth),
  };

  return NextResponse.json(healthReport);
}

/**
 * Calculates error rate over the last hour
 */
interface ErrorMetrics {
  unhandledRejections: number;
  uncaughtExceptions: number;
  errorsByCategory: Record<string, number>;
}

interface AppHealth {
  memory: {
    heapUsed: number;
    heapTotal: number;
  };
  uptime: {
    seconds: number;
  };
}

function calculateErrorRate(metrics: ErrorMetrics): number {
  const totalErrors = metrics.unhandledRejections + metrics.uncaughtExceptions;
  const uptimeHours = process.uptime() / 3600;

  if (uptimeHours === 0) return 0;

  return Math.round((totalErrors / uptimeHours) * 100) / 100; // errors per hour
}

/**
 * Calculates overall health score (0-100)
 */
function calculateHealthScore(
  metrics: ErrorMetrics,
  appHealth: AppHealth
): number {
  let score = 100;

  // Deduct points for errors
  score -= metrics.unhandledRejections * 5;
  score -= metrics.uncaughtExceptions * 10;

  // Deduct points for high memory usage
  const memoryUsagePercent =
    (appHealth.memory.heapUsed / appHealth.memory.heapTotal) * 100;
  if (memoryUsagePercent > 80) {
    score -= (memoryUsagePercent - 80) * 2;
  }

  // Deduct points for high error rates
  const totalErrors = Object.values(metrics.errorsByCategory).reduce(
    (sum: number, count: number) => sum + count,
    0
  );
  if (totalErrors > 10) {
    score -= (totalErrors - 10) * 2;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generates recommendations based on current metrics
 */
function generateRecommendations(
  metrics: ErrorMetrics,
  appHealth: AppHealth
): string[] {
  const recommendations: string[] = [];

  if (metrics.unhandledRejections > 0) {
    recommendations.push(
      "Investigate and fix sources of unhandled promise rejections"
    );
  }

  if (metrics.uncaughtExceptions > 0) {
    recommendations.push(
      "Critical: Fix sources of uncaught exceptions immediately"
    );
  }

  const memoryUsagePercent =
    (appHealth.memory.heapUsed / appHealth.memory.heapTotal) * 100;
  if (memoryUsagePercent > 80) {
    recommendations.push(
      "High memory usage detected - consider optimizing memory usage or increasing heap size"
    );
  }

  if (appHealth.uptime.seconds < 3600) {
    recommendations.push(
      "Application has been restarted recently - monitor for stability issues"
    );
  }

  const totalErrors = Object.values(
    metrics.errorsByCategory as Record<string, number>
  ).reduce((sum: number, count: number) => sum + count, 0);
  if (totalErrors > 20) {
    recommendations.push(
      "High error count detected - review error logs and fix recurring issues"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Error handling appears to be working correctly");
  }

  return recommendations;
}

// Export the wrapped handler
const getHandler = withStandardErrorHandling(handler);

export const GET = withPublicProtection(getHandler, {
  rateLimitType: "health",
  skipCSRF: true,
});
