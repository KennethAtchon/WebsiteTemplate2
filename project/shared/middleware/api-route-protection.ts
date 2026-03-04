import { NextRequest, NextResponse } from "next/server";
import { type RateLimitType } from "@/shared/services/rate-limit/comprehensive-rate-limiter";
import { debugLog } from "@/shared/utils/debug";
import { z } from "zod";
import {
  recordHttpRequest,
  isMetricsEnabled,
} from "@/shared/services/observability/metrics";
import {
  validateCORS,
  applyRateLimiting,
  validateCSRF,
  validateAuthentication,
  validateInputs,
  addSecurityHeaders,
  type AuthContext,
} from "@/shared/middleware/helper";
import type {
  AuthResult,
  AdminAuthResultWithDbUserId,
} from "@/features/auth/types/auth.types";

export type { AuthContext };

export interface ProtectionOptions {
  /** Skip rate limiting for this route */
  skipRateLimit?: boolean;
  /** Skip CSRF protection for this route */
  skipCSRF?: boolean;
  /** Custom rate limit type override */
  rateLimitType?: RateLimitType;
  /** Require authentication for this route - 'user' for any authenticated user, 'admin' for admin only */
  requireAuth?: "user" | "admin" | false;
  /** Custom CORS origins for this route */
  customCorsOrigins?: string[];
  /** Zod schema for validating request body (POST/PUT/PATCH/DELETE) */
  bodySchema?: z.ZodSchema<any>;
  /** Zod schema for validating query parameters (GET requests) */
  querySchema?: z.ZodSchema<any>;
}

/**
 * Context passed to every route handler by `withApiProtection`.
 *
 * - `auth`   — verified auth object when `requireAuth` is set, otherwise `null`.
 *              Use `auth` directly instead of calling `requireAuth`/`requireAdmin`
 *              inside the handler — the wrapper already verified the token once.
 * - `params` — dynamic route params forwarded from Next.js (e.g. `{ id: "123" }`
 *              for a `[id]` segment).
 */
export interface HandlerContext {
  auth: AuthContext;
  params?: any;
}

/** Generic handler — use `UserRouteHandler` or `AdminRouteHandler` for stronger typing. */
export interface RouteHandler {
  (
    request: NextRequest,
    context: HandlerContext
  ): Promise<NextResponse> | NextResponse;
}

/**
 * Handler for routes wrapped with `withUserProtection`.
 * `auth` is guaranteed to be a non-null `AuthResult`.
 */
export interface UserRouteHandler {
  (
    request: NextRequest,
    context: { auth: AuthResult; params?: any }
  ): Promise<NextResponse> | NextResponse;
}

/**
 * Handler for routes wrapped with `withAdminProtection`.
 * `auth` is guaranteed to be a non-null `AdminAuthResultWithDbUserId`.
 */
export interface AdminRouteHandler {
  (
    request: NextRequest,
    context: { auth: AdminAuthResultWithDbUserId; params?: any }
  ): Promise<NextResponse> | NextResponse;
}

/**
 * Higher-order function that wraps API routes with comprehensive protection:
 * CORS, rate limiting, CSRF, authentication, and input validation.
 *
 * The verified `AuthContext` is forwarded to the handler as `context.auth` so
 * handlers never need to call `requireAuth`/`requireAdmin` themselves — the token
 * is verified exactly once per request here, then passed through.
 *
 * @param handler - Route handler function (receives `HandlerContext` as second arg)
 * @param options - Protection options (auth level, rate limit type, schemas, etc.)
 */
export function withApiProtection(
  handler: RouteHandler,
  options: ProtectionOptions = {}
) {
  const protectedHandler = async (
    request: NextRequest,
    nextContext?: any
  ): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname;
    const method = request.method;
    const startTime = isMetricsEnabled() ? Date.now() : 0;

    debugLog.debug(
      "API route protection",
      {
        service: "api-route-protection",
        operation: "protection-start",
      },
      {
        pathname,
        options,
        request,
        context: nextContext,
        handlerName: handler.name,
      }
    );

    try {
      const corsResponse = validateCORS(request, options.customCorsOrigins);
      if (corsResponse) return corsResponse;

      if (!options.skipRateLimit) {
        const rateLimitResponse = await applyRateLimiting(
          request,
          pathname,
          options.rateLimitType
        );
        if (rateLimitResponse) return rateLimitResponse;
      }

      if (!options.skipCSRF) {
        const csrfResponse = await validateCSRF(request, pathname);
        if (csrfResponse) return csrfResponse;
      }

      // Verify auth once and capture the result to forward to the handler.
      // Handlers should use context.auth instead of calling requireAuth again.
      let authContext: AuthContext = null;
      if (options.requireAuth) {
        const { error, auth } = await validateAuthentication(
          request,
          options.requireAuth
        );
        if (error) return error;
        authContext = auth;
      }

      if (options.bodySchema || options.querySchema) {
        const validationResponse = await validateInputs(
          request,
          options.bodySchema,
          options.querySchema,
          pathname
        );
        if (validationResponse) return validationResponse;
      }

      // Forward auth and Next.js dynamic params to the handler
      const handlerContext: HandlerContext = {
        auth: authContext,
        params: nextContext?.params,
      };

      const response = await handler(request, handlerContext);

      if (isMetricsEnabled() && startTime > 0) {
        const durationMs = Date.now() - startTime;
        const status = response.status;
        recordHttpRequest(method, pathname, status, durationMs);
      }

      // This is what's actually returned to the client
      return addSecurityHeaders(
        response,
        request,
        pathname,
        options.rateLimitType,
        options.customCorsOrigins
      );
    } catch (error) {
      if (isMetricsEnabled() && startTime > 0) {
        const durationMs = Date.now() - startTime;
        recordHttpRequest(method, pathname, 500, durationMs);
      }
      debugLog.error(
        "API route protection error",
        { service: "api-route-protection" },
        error
      );
      return new NextResponse(
        JSON.stringify({
          error: "Internal server error",
          code: "PROTECTION_ERROR",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };

  return protectedHandler;
}

/**
 * Convenience wrapper for GET routes that typically don't need CSRF protection.
 * Accepts any handler shape (RouteHandler, UserRouteHandler, AdminRouteHandler).
 */
export function withGetProtection(
  handler: RouteHandler | UserRouteHandler | AdminRouteHandler,
  options: Omit<ProtectionOptions, "skipCSRF"> = {}
) {
  return withApiProtection(handler as RouteHandler, {
    ...options,
    skipCSRF: true,
  });
}

/**
 * Convenience wrapper for POST/PUT/DELETE routes that need full protection.
 */
export function withMutationProtection(
  handler: RouteHandler,
  options: ProtectionOptions = {}
) {
  return withApiProtection(handler, options);
}

/**
 * Convenience wrapper for admin routes with stricter protection.
 * Handlers receive `context.auth` typed as `AdminAuthResultWithDbUserId` — no
 * need to call `requireAdmin` inside the handler body.
 */
export function withAdminProtection(
  handler: AdminRouteHandler,
  options: ProtectionOptions = {}
) {
  return withApiProtection(handler as RouteHandler, {
    ...options,
    requireAuth: "admin",
    rateLimitType: "admin",
  });
}

/**
 * Convenience wrapper for user-authenticated routes.
 * Handlers receive `context.auth` typed as `AuthResult` — no need to call
 * `requireAuth` inside the handler body.
 */
export function withUserProtection(
  handler: UserRouteHandler,
  options: ProtectionOptions = {}
) {
  return withApiProtection(handler as RouteHandler, {
    ...options,
    requireAuth: "user",
    rateLimitType: options.rateLimitType || "customer",
  });
}

/**
 * Convenience wrapper for public routes with basic protection.
 */
export function withPublicProtection(
  handler: RouteHandler,
  options: ProtectionOptions = {}
) {
  return withApiProtection(handler, {
    ...options,
    skipCSRF: true,
    rateLimitType: "public",
  });
}
