import { NextRequest, NextResponse } from "hono";
import { checkRateLimit } from "./rate-limit-redis";
import { debugLog } from "@/utils/debug";
import { systemLogger } from "@/utils/system/system-logger";
import {
  getClientIp,
  getSecurityIp,
  extractUserIdFromToken,
} from "@/services/request-identity";
import {
  RATE_LIMIT_CONFIGS,
  getRateLimitConfig,
  shouldAlertOnExceed,
  type RateLimitType,
} from "@/constants/rate-limit.config";

// Re-export RateLimitType for convenience
export type { RateLimitType };

// Re-export request-identity helpers for backward compatibility (IP/blocking are not rate-limit logic)
export {
  getClientIp,
  getSecurityIp,
  checkIpBlocking,
  cleanupTokenCache,
} from "@/services/request-identity";

/** Path segments used to classify routes for rate limiting (pathname.includes(segment)). Map order = match priority. */
const RATE_LIMIT_PATH_SEGMENTS = new Map<RateLimitType, readonly string[]>([
  ["auth", ["/auth/", "/login", "/register", "/verify"]],
  ["payment", ["/orders/create", "/payment", "/checkout"]],
  ["upload", ["/upload", "/upload-from-url"]],
  ["admin", ["/admin/"]],
  ["customer", ["/customer/"]],
  ["health", ["/health", "/ready", "/live", "/system"]],
  ["public", ["/public/"]],
]);

function pathMatchesSegments(
  pathname: string,
  segments: readonly string[],
): boolean {
  return segments.some((seg) => pathname.includes(seg));
}

/**
 * Determines rate limit type based on the request path
 */
export function determineRateLimitType(pathname: string): RateLimitType {
  for (const [rateLimitType, segments] of RATE_LIMIT_PATH_SEGMENTS) {
    if (pathMatchesSegments(pathname, segments)) return rateLimitType;
  }
  return "default";
}

/**
 * Gets a unique identifier for rate limiting (Firebase UID for authenticated, IP for unauthenticated)
 */
async function getRateLimitKey(request: NextRequest): Promise<string> {
  // Try to get Firebase UID from Authorization header (if authenticated)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token && token.length > 10) {
      // Extract actual Firebase UID from token
      const userId = await extractUserIdFromToken(token);
      if (userId) {
        // Use Firebase UID for authenticated users (stable across token refreshes)
        return `user:${userId}`;
      }
    }
  }

  // Unauthenticated: use IP-based rate limiting
  const ip = getClientIp(request);
  return `ip:${ip}`;
}

/**
 * Comprehensive rate limiting middleware that can be applied to any API route
 */
export async function applyRateLimit(
  request: NextRequest,
  customType?: RateLimitType,
  customConfig?: { window?: number; maxRequests?: number; keyPrefix?: string },
): Promise<NextResponse | null> {
  try {
    // Get rate limit key (now async)
    const rateLimitKey = await getRateLimitKey(request);
    const securityIp = getSecurityIp(request);
    const pathname = new URL(request.url).pathname;

    // Determine rate limit type
    const limitType = customType || determineRateLimitType(pathname);
    const baseConfig = getRateLimitConfig(limitType);
    const config = customConfig || {
      window: baseConfig.window,
      maxRequests: baseConfig.maxRequests,
      keyPrefix: baseConfig.keyPrefix,
    };

    // Log the rate limit check with both rate limiting key AND real IP
    systemLogger.info(
      "Rate limit check initiated",
      {
        service: "rate-limiter",
        operation: "applyRateLimit",
      },
      {
        rateLimitKey,
        securityIp: securityIp.ip,
        securitySource: securityIp.source,
        isLocalhost: securityIp.isLocalhost,
        pathname,
        limitType,
        config,
        method: request.method,
      },
    );

    // Check rate limit using the user/session/IP key
    const allowed = await checkRateLimit(rateLimitKey, {
      window: config.window,
      maxRequests: config.maxRequests,
      keyPrefix: config.keyPrefix,
    });

    if (!allowed) {
      const baseConfig = getRateLimitConfig(limitType);
      const shouldAlert = shouldAlertOnExceed(limitType);

      // Log rate limit violation
      const logData = {
        rateLimitKey,
        securityIp: securityIp.ip,
        securitySource: securityIp.source,
        isLocalhost: securityIp.isLocalhost,
        pathname,
        limitType,
        config: {
          window: config.window,
          maxRequests: config.maxRequests,
          tps: baseConfig.tps,
        },
        description: baseConfig.description,
      };

      if (shouldAlert) {
        // Use error level for alertable rate limits
        systemLogger.rateLimit(
          "Rate limit exceeded (ALERT)",
          "applyRateLimit",
          logData,
        );
      } else {
        // Use warn level for non-alertable rate limits
        systemLogger.rateLimit(
          "Rate limit exceeded",
          "applyRateLimit",
          logData,
        );
      }

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please wait before trying again.`,
          retryAfter: config.window,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": (config.maxRequests ?? 30).toString(),
            "X-RateLimit-Window": (config.window ?? 60).toString(),
            "X-RateLimit-Type": limitType,
            "Retry-After": (config.window ?? 60).toString(),
          },
        },
      );
    }

    // Rate limit passed, continue with request
    return null;
  } catch (error) {
    debugLog.error(
      "Rate limit check failed",
      {
        service: "rate-limiter",
        operation: "applyRateLimit",
      },
      error,
    );

    // SECURITY FIX (SEC-003): Fail secure - block requests when rate limiting is unavailable
    // This prevents DoS attacks during Redis outages
    return NextResponse.json(
      {
        error: "Rate limit service unavailable",
        message: "Service temporarily unavailable. Please try again later.",
      },
      {
        status: 503, // Service Unavailable
        headers: {
          "Retry-After": "60", // Suggest retry after 60 seconds
        },
      },
    );
  }
}

/**
 * Enhanced rate limiting that supports user-based limits for authenticated users
 */
export async function applyUserBasedRateLimit(
  request: NextRequest,
  userId?: string,
  limitType?: RateLimitType,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const pathname = new URL(request.url).pathname;
  const rateLimitType = limitType || determineRateLimitType(pathname);
  const config = RATE_LIMIT_CONFIGS[rateLimitType];

  try {
    // Extract user ID from token if not provided
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        userId = (await extractUserIdFromToken(token)) || undefined;
      }
    }

    // For authenticated users, use both IP and user-based rate limiting
    if (userId) {
      // Check user-based rate limit (typically more generous)
      const userConfig = {
        ...config,
        keyPrefix: `user_${config.keyPrefix}`,
        maxRequests: Math.floor(config.maxRequests * 1.5), // 50% more generous for authenticated users
      };

      const userAllowed = await checkRateLimit(userId, userConfig);
      if (!userAllowed) {
        debugLog.warn(
          "User rate limit exceeded",
          {
            service: "rate-limiter",
            operation: "applyUserBasedRateLimit",
          },
          {
            userId,
            ip,
            pathname,
            limitType: rateLimitType,
          },
        );

        return NextResponse.json(
          {
            error: "User rate limit exceeded",
            message:
              "You have made too many requests. Please wait before trying again.",
            retryAfter: userConfig.window,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": (userConfig.maxRequests ?? 45).toString(),
              "X-RateLimit-Window": (userConfig.window ?? 60).toString(),
              "X-RateLimit-Type": `user_${rateLimitType}`,
              "Retry-After": (userConfig.window ?? 60).toString(),
            },
          },
        );
      }
    }

    // Always check IP-based rate limit as well
    return applyRateLimit(request, rateLimitType);
  } catch (error) {
    debugLog.error(
      "User-based rate limit check failed",
      {
        service: "rate-limiter",
        operation: "applyUserBasedRateLimit",
      },
      error,
    );

    // Fallback to IP-based rate limiting
    return applyRateLimit(request, rateLimitType);
  }
}

/**
 * Rate limit headers for successful requests
 */
export function getRateLimitHeaders(
  limitType: RateLimitType,
  remaining?: number,
): Record<string, string> {
  const config = getRateLimitConfig(limitType);

  return {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Window": config.window.toString(),
    "X-RateLimit-Type": limitType,
    "X-RateLimit-TPS": config.tps.toFixed(2),
    ...(remaining !== undefined && {
      "X-RateLimit-Remaining": remaining.toString(),
    }),
  };
}
