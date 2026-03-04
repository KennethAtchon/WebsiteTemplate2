import { NextRequest, NextResponse } from "next/server";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";

/**
 * GET /api/live
 * Kubernetes/Container liveness probe endpoint
 *
 * This endpoint determines if the service process is alive and responsive.
 * It performs minimal checks to determine if the application process should be restarted.
 *
 * This should be the fastest possible health check - focusing only on:
 * - Process responsiveness
 * - Basic memory/CPU not critically exhausted
 * - Application hasn't deadlocked
 *
 * Returns:
 * - 200 OK: Service process is alive and should continue running
 * - 500/503: Service process is dead/hung and should be restarted
 */
async function getHandler(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Perform basic liveness checks
    const liveness = await checkProcessLiveness();

    const response = {
      alive: liveness.alive,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      response_time_ms: Date.now() - startTime,
      ...liveness.details,
    };

    const statusCode = liveness.alive ? 200 : 503;

    // Only log if not alive to reduce log noise
    if (!liveness.alive) {
      debugLog.error(
        "Liveness check failed",
        {
          service: "liveness-check",
          operation: "GET",
        },
        liveness.error
      );
    }

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    debugLog.error(
      "Liveness check error",
      {
        service: "liveness-check",
        operation: "GET",
      },
      error
    );

    return NextResponse.json(
      {
        alive: false,
        timestamp: new Date().toISOString(),
        error: "Liveness check failed",
        response_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Check if the process is alive and responsive
 * This should be the fastest possible check
 */
async function checkProcessLiveness(): Promise<LivenessCheckResult> {
  try {
    // Check 1: Memory usage - fail if critically exhausted
    const memUsage = process.memoryUsage();
    const totalMemoryMB = memUsage.rss / 1024 / 1024;

    // If using more than 1GB RSS memory, might indicate a memory leak
    if (totalMemoryMB > 1024) {
      return {
        alive: false,
        error: `High memory usage: ${totalMemoryMB.toFixed(0)}MB RSS`,
        details: { memory_mb: Math.round(totalMemoryMB) },
      };
    }

    // Check 2: CPU usage - basic check
    process.cpuUsage();
    const uptimeSeconds = process.uptime();

    // Check 3: Event loop responsiveness
    const eventLoopStart = Date.now();
    await new Promise((resolve) => setImmediate(resolve));
    const eventLoopDelay = Date.now() - eventLoopStart;

    // If event loop is delayed by more than 1 second, process might be hung
    if (eventLoopDelay > 1000) {
      return {
        alive: false,
        error: `Event loop blocked: ${eventLoopDelay}ms delay`,
        details: { event_loop_delay_ms: eventLoopDelay },
      };
    }

    // Process is alive and responsive
    return {
      alive: true,
      details: {
        memory_mb: Math.round(totalMemoryMB),
        uptime_seconds: Math.round(uptimeSeconds),
        event_loop_delay_ms: eventLoopDelay,
        node_version: process.version,
        pid: process.pid,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      alive: false,
      error: `Liveness check failed: ${errorMessage}`,
    };
  }
}

// Type definitions
interface LivenessCheckResult {
  alive: boolean;
  error?: string;
  details?: {
    memory_mb?: number;
    uptime_seconds?: number;
    event_loop_delay_ms?: number;
    node_version?: string;
    pid?: number;
  };
}

export const GET = withPublicProtection(getHandler, {
  rateLimitType: "health",
  skipCSRF: true,
});
