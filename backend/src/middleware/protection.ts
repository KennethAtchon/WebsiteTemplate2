import type { Context, MiddlewareHandler } from "hono";
import { z } from "zod";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: { id: string; email: string; role: string };
  firebaseUser: {
    uid: string;
    email: string;
    stripeRole?: string;
    [key: string]: unknown;
  };
}

export interface AdminAuthResult extends AuthResult {
  user: { id: string; email: string; role: "admin" };
}

export type AuthContext = AuthResult | AdminAuthResult | null;

export type RateLimitType =
  | "public"
  | "customer"
  | "admin"
  | "health"
  | "payment"
  | "auth";

export interface ProtectionOptions {
  skipRateLimit?: boolean;
  skipCSRF?: boolean;
  rateLimitType?: RateLimitType;
  requireAuth?: "user" | "admin" | false;
  bodySchema?: z.ZodSchema<any>;
  querySchema?: z.ZodSchema<any>;
}

// ─── Auth Middleware ────────────────────────────────────────────────────────────

/**
 * Firebase auth middleware for Hono.
 * Verifies the Bearer token and attaches the user to the context.
 */
export function authMiddleware(
  level: "user" | "admin" = "user",
): MiddlewareHandler {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return c.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        401,
      );
    }

    try {
      const token = authHeader.substring(7);

      // Dynamic import to avoid loading firebase-admin at module level
      const { adminAuth } = await import("../services/firebase/admin");
      const decodedToken = await adminAuth.verifyIdToken(token, true);

      // Look up user in database
      const { prisma } = await import("../services/db/prisma");
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
      }

      if (level === "admin" && user.role !== "admin") {
        return c.json(
          { error: "Admin access required", code: "ADMIN_REQUIRED" },
          403,
        );
      }

      // Attach auth context to Hono context
      const authResult: AuthResult = {
        user: { id: user.id, email: user.email, role: user.role },
        firebaseUser: {
          uid: decodedToken.uid,
          email: decodedToken.email || user.email,
          stripeRole: (decodedToken as Record<string, unknown>).stripeRole as
            | string
            | undefined,
        },
      };

      c.set("auth", authResult);
      await next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return c.json(
        { error: "Invalid or expired token", code: "INVALID_TOKEN" },
        401,
      );
    }
  };
}

// ─── CSRF Middleware ────────────────────────────────────────────────────────────

/**
 * CSRF protection middleware for mutation operations.
 * Skips GET requests and the CSRF token endpoint.
 */
export function csrfMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    // Skip for GET requests (read-only)
    if (c.req.method === "GET") {
      await next();
      return;
    }

    // Skip for the CSRF token endpoint itself
    if (c.req.path.endsWith("/csrf")) {
      await next();
      return;
    }

    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json(
        {
          error: "Authentication required for CSRF validation",
          code: "AUTH_REQUIRED",
        },
        401,
      );
    }

    try {
      const token = authHeader.substring(7);
      const { adminAuth } = await import("../services/firebase/admin");
      const decodedToken = await adminAuth.verifyIdToken(token, true);
      const firebaseUID = decodedToken.uid;

      const { requireCSRFToken } =
        await import("../services/csrf/csrf-protection");
      const csrfHeader = c.req.header("X-CSRF-Token") || "";

      const isValid = await requireCSRFToken(csrfHeader, firebaseUID);
      if (!isValid) {
        return c.json(
          { error: "CSRF token validation failed", code: "CSRF_TOKEN_INVALID" },
          403,
        );
      }

      await next();
    } catch (error) {
      console.error("CSRF validation error:", error);
      return c.json(
        { error: "Invalid authentication token", code: "INVALID_TOKEN" },
        401,
      );
    }
  };
}

// ─── Rate Limiting Middleware ───────────────────────────────────────────────────

/**
 * Rate limiting middleware using Redis.
 */
export function rateLimiter(type: RateLimitType = "public"): MiddlewareHandler {
  return async (c, next) => {
    try {
      const { checkRateLimit } =
        await import("../services/rate-limit/rate-limit-redis");
      const { getRateLimitConfig } = await import("../constants/rate-limit.config");
      
      const config = getRateLimitConfig(type);
      const ip =
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("x-real-ip") ||
        "unknown";

      const result = await checkRateLimit(ip, {
        maxRequests: config.maxRequests,
        window: config.window,
        keyPrefix: config.keyPrefix
      });

      if (!result) {
        const resetTime = Date.now() + (config.window * 1000);
        c.res.headers.set("X-Rate-Limit-Limit", String(config.maxRequests));
        c.res.headers.set("X-Rate-Limit-Remaining", "0");
        c.res.headers.set("X-Rate-Limit-Reset", String(resetTime));
        c.res.headers.set("Retry-After", String(config.window));

        return c.json(
          { error: "Too many requests", code: "RATE_LIMIT_EXCEEDED" },
          429,
        );
      }

      // Attach rate limit headers to be added after response
      c.set("rateLimitHeaders", {
        "X-Rate-Limit-Limit": String(config.maxRequests),
        "X-Rate-Limit-Remaining": "1", // We don't track exact count with this simple implementation
        "X-Rate-Limit-Reset": String(Date.now() + (config.window * 1000)),
      });

      await next();

      // Add rate limit headers to response
      const headers = c.get("rateLimitHeaders") as
        | Record<string, string>
        | undefined;
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          c.res.headers.set(key, value);
        });
      }
    } catch (error) {
      console.error("Rate limit error:", error);
      // Fail secure — block request when rate limiting is unavailable
      return c.json(
        {
          error: "Service temporarily unavailable",
          code: "SERVICE_UNAVAILABLE",
        },
        503,
      );
    }
  };
}

// ─── Body Validation Middleware ─────────────────────────────────────────────────

/**
 * Validates request body against a Zod schema.
 */
export function validateBody(schema: z.ZodSchema<any>): MiddlewareHandler {
  return async (c, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
      await next();
      return;
    }

    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: result.error.flatten(),
          },
          422,
        );
      }

      // Store validated body for handler to use
      c.set("validatedBody", result.data);
      await next();
    } catch {
      return c.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        400,
      );
    }
  };
}

// ─── Query Validation Middleware ─────────────────────────────────────────────────

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery(schema: z.ZodSchema<any>): MiddlewareHandler {
  return async (c, next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      return c.json(
        {
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
          details: result.error.flatten(),
        },
        422,
      );
    }

    c.set("validatedQuery", result.data);
    await next();
  };
}

// ─── Response Helpers ──────────────────────────────────────────────────────────

/** Standard success response */
export function jsonSuccess(c: Context, data: unknown, status = 200) {
  return c.json(data, status as any);
}

/** Standard error responses */
export function jsonError(
  c: Context,
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return c.json({ error: message, ...extra }, status as any);
}

export function jsonNotFound(c: Context, message = "Not found") {
  return jsonError(c, message, 404);
}

export function jsonBadRequest(
  c: Context,
  message = "Bad request",
  extra?: Record<string, unknown>,
) {
  return jsonError(c, message, 400, extra);
}

export function jsonForbidden(
  c: Context,
  message = "Forbidden",
  extra?: Record<string, unknown>,
) {
  return jsonError(c, message, 403, extra);
}

export function jsonInternalError(
  c: Context,
  message = "Internal server error",
  _error?: unknown,
) {
  return jsonError(c, message, 500, { code: "INTERNAL_ERROR" });
}
