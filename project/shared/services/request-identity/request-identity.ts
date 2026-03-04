/**
 * Request identity utilities: IP resolution, security IP, IP blocking, and token→UID extraction.
 * Used by rate limiting, security middleware, and error reporting. Not rate-limiting logic itself.
 */

import { NextRequest } from "next/server";
import { systemLogger } from "@/shared/utils/system/system-logger";
import { adminAuth } from "@/shared/services/firebase/admin";
import { debugLog } from "@/shared/utils/debug";
import { IS_RAILWAY } from "@/shared/utils/config/envUtil";

// Token cache for Firebase UID extraction (prevents repeated token verification). TODO: Move to Redis
const tokenCache = new Map<string, { uid: string; expires: number }>();

/**
 * Extracts Firebase UID from token (with caching)
 */
export async function extractUserIdFromToken(
  token: string
): Promise<string | null> {
  try {
    const cached = tokenCache.get(token);
    if (cached && cached.expires > Date.now()) {
      return cached.uid;
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    tokenCache.set(token, {
      uid,
      expires: Date.now() + 55 * 60 * 1000, // 55 minutes
    });

    return uid;
  } catch (error) {
    debugLog.error(
      "Failed to extract user ID from token",
      { service: "request-identity" },
      error
    );
    return null;
  }
}

/**
 * Cleanup function for token cache (prevent memory leaks)
 */
export function cleanupTokenCache(): void {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (data.expires <= now) {
      tokenCache.delete(token);
    }
  }
}

/** NextRequest may have .ip / .connection in Node or platform runtimes (e.g. Vercel); not on Web Request type. */
type RequestWithIp = NextRequest & {
  ip?: string | null;
  connection?: { remoteAddress?: string } | null;
  socket?: { remoteAddress?: string } | null;
};

/**
 * Railway's edge appends the real client IP to X-Forwarded-For (rightmost = client).
 * Standard proxies append so leftmost = client. We use env IS_RAILWAY to pick the correct segment.
 */
function parseXForwardedFor(headerValue: string | null): string | null {
  if (!headerValue?.trim()) return null;
  const parts = headerValue
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return IS_RAILWAY ? parts[parts.length - 1]! : parts[0]!;
}

/**
 * When does header-based IP detection work?
 * - Only when something in front of your app sets these headers or request.ip.
 * - Railway: sets X-Real-Ip (trusted) and appends client IP to X-Forwarded-For (rightmost = client). We use rightmost when IS_RAILWAY.
 * - Cloudflare: sets cf-connecting-ip (and often x-forwarded-for).
 * - Vercel: sets request.ip on NextRequest in serverless/Node.
 * - nginx / your proxy: set x-real-ip (and optionally x-forwarded-for); leftmost in X-Forwarded-For = client.
 *
 * To verify: call getRequestIpSources(request) from a debug/internal route and log the result.
 */
export function getRequestIpSources(
  request: NextRequest
): Record<string, string | null> {
  const req = request as RequestWithIp;
  return {
    "x-forwarded-for": parseXForwardedFor(
      request.headers.get("x-forwarded-for")
    ),
    "x-real-ip": request.headers.get("x-real-ip") || null,
    "cf-connecting-ip": request.headers.get("cf-connecting-ip") || null,
    "nextjs-ip": req.ip ?? null,
    host: request.headers.get("host") || null,
    "connection-remote": req.connection?.remoteAddress ?? null,
    "socket-remote": req.socket?.remoteAddress ?? null,
  };
}

/**
 * Gets the REAL client IP address for security purposes (blocking, monitoring).
 * Returns the actual IP even for localhost (for development vs production).
 *
 * Trust: Prefer proxy-set headers in order below. Only cf-connecting-ip and
 * x-real-ip (when set by your own proxy) are safe from client spoofing;
 * x-forwarded-for can be spoofed unless your proxy overwrites it.
 */
export function getSecurityIp(request: NextRequest): {
  ip: string;
  source: string;
  isLocalhost: boolean;
  allSources: Record<string, string | null>;
} {
  const sources = getRequestIpSources(request);

  // Order matters: trusted proxy headers first, then platform/Node fallbacks
  const ipCandidates = [
    { ip: sources["cf-connecting-ip"], source: "CloudFlare" },
    { ip: sources["x-real-ip"], source: "Proxy-Real-IP" },
    { ip: sources["x-forwarded-for"], source: "Proxy-Forwarded" },
    { ip: sources["nextjs-ip"], source: "NextJS-Request" },
    { ip: sources["connection-remote"], source: "Connection-Remote" },
    { ip: sources["socket-remote"], source: "Socket-Remote" },
  ];

  for (const candidate of ipCandidates) {
    if (candidate.ip && candidate.ip !== "unknown" && candidate.ip !== "null") {
      const isLocalhost =
        candidate.ip === "::1" ||
        candidate.ip === "127.0.0.1" ||
        candidate.ip === "localhost";

      systemLogger.info(
        "Security IP detected",
        {
          service: "request-identity",
          operation: "getSecurityIp",
        },
        {
          detectedIp: candidate.ip,
          source: candidate.source,
          isLocalhost,
          allSources: sources,
        }
      );

      return {
        ip: candidate.ip,
        source: candidate.source,
        isLocalhost,
        allSources: sources,
      };
    }
  }

  systemLogger.warn(
    "No security IP detected, using unknown",
    {
      service: "request-identity",
      operation: "getSecurityIp",
    },
    { allSources: sources }
  );

  return {
    ip: "unknown",
    source: "fallback",
    isLocalhost: false,
    allSources: sources,
  };
}

/**
 * Check if an IP should be blocked (for security middleware)
 */
export function checkIpBlocking(
  request: NextRequest,
  blockedIps: string[] = []
): {
  shouldBlock: boolean;
  reason?: string;
  securityInfo: ReturnType<typeof getSecurityIp>;
} {
  const securityInfo = getSecurityIp(request);

  if (blockedIps.includes(securityInfo.ip)) {
    systemLogger.security(
      "warn",
      "Blocked IP attempted access",
      "ip-blocking",
      {
        blockedIp: securityInfo.ip,
        source: securityInfo.source,
        pathway: new URL(request.url).pathname,
        userAgent: request.headers.get("user-agent")?.substring(0, 100),
      }
    );

    return {
      shouldBlock: true,
      reason: "IP_BLOCKED",
      securityInfo,
    };
  }

  return {
    shouldBlock: false,
    securityInfo,
  };
}

/**
 * Extracts client IP address from request headers (for rate limiting, logging, etc.)
 */
export function getClientIp(request: NextRequest): string {
  const requestIp = (request as RequestWithIp).ip ?? undefined;

  const debugInfo = {
    "nextjs-ip": requestIp,
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "x-real-ip": request.headers.get("x-real-ip"),
    "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
    host: request.headers.get("host"),
    "user-agent": request.headers.get("user-agent")?.substring(0, 50),
  };

  systemLogger.info(
    "IP detection analysis",
    {
      service: "request-identity",
      operation: "getClientIp-debug",
    },
    debugInfo
  );

  const possibleIps = [
    requestIp,
    parseXForwardedFor(request.headers.get("x-forwarded-for")),
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
  ].filter(Boolean);

  for (const ip of possibleIps) {
    if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
      systemLogger.info(
        "Localhost IP detected",
        {
          service: "request-identity",
          operation: "getClientIp",
        },
        {
          detectedIp: "localhost-dev",
          actualIp: ip,
          method: "localhost-detection",
          allIps: possibleIps,
        }
      );
      return "localhost-dev";
    }
  }

  const forwardedFor = parseXForwardedFor(
    request.headers.get("x-forwarded-for")
  );
  if (forwardedFor && forwardedFor !== "unknown") {
    systemLogger.info(
      "IP detected via x-forwarded-for",
      {
        service: "request-identity",
        operation: "getClientIp",
      },
      {
        detectedIp: forwardedFor,
        method: "x-forwarded-for",
        headers: debugInfo,
      }
    );
    return forwardedFor;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp !== "unknown") {
    systemLogger.info(
      "IP detected via x-real-ip",
      {
        service: "request-identity",
        operation: "getClientIp",
      },
      {
        detectedIp: realIp,
        method: "x-real-ip",
        headers: debugInfo,
      }
    );
    return realIp;
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp !== "unknown") {
    systemLogger.info(
      "IP detected via cf-connecting-ip",
      {
        service: "request-identity",
        operation: "getClientIp",
      },
      {
        detectedIp: cfIp,
        method: "cf-connecting-ip",
        headers: debugInfo,
      }
    );
    return cfIp;
  }

  if (
    requestIp &&
    requestIp !== "::1" &&
    requestIp !== "127.0.0.1" &&
    requestIp !== "localhost"
  ) {
    systemLogger.info(
      "IP detected via NextJS request.ip",
      {
        service: "request-identity",
        operation: "getClientIp",
      },
      {
        detectedIp: requestIp,
        method: "nextjs-request-ip",
        headers: debugInfo,
      }
    );
    return requestIp;
  }

  const host = request.headers.get("host");
  if (host?.includes("localhost") || host?.includes("127.0.0.1")) {
    systemLogger.info(
      "Localhost development IP detected",
      {
        service: "request-identity",
        operation: "getClientIp",
      },
      {
        detectedIp: "localhost-dev",
        method: "localhost-detection",
        host,
        headers: debugInfo,
      }
    );
    return "localhost-dev";
  }

  systemLogger.warn(
    "Unable to detect client IP, using unknown",
    {
      service: "request-identity",
      operation: "getClientIp",
    },
    {
      detectedIp: "unknown",
      method: "fallback",
      headers: debugInfo,
    }
  );

  return "unknown";
}
