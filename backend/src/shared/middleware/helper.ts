import { NextRequest, NextResponse } from "next/server";
import {
  applyRateLimit,
  determineRateLimitType,
  getRateLimitHeaders,
  type RateLimitType,
} from "@/shared/services/rate-limit/comprehensive-rate-limiter";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import {
  requireAuth,
  requireAdmin,
} from "@/features/auth/services/firebase-middleware";
import { adminAuth } from "@/shared/services/firebase/admin";
import { debugLog } from "@/shared/utils/debug";
import { getAllowedCorsOrigins } from "@/shared/utils/config/envUtil";
import {
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
  CORS_EXPOSE_HEADERS,
} from "@/shared/utils/config/cors-constants";
import { z } from "zod";
import { validateInput } from "@/shared/utils/validation/api-validation";
import type {
  AuthResult,
  AdminAuthResultWithDbUserId,
} from "@/features/auth/types/auth.types";

/** The decoded auth object forwarded to route handlers after the wrapper verifies it. */
export type AuthContext = AuthResult | AdminAuthResultWithDbUserId | null;

/**
 * Validates CORS for the request
 * NOTE: This provides per-route CORS validation (allows custom origins via options.customCorsOrigins)
 * Middleware also validates CORS, but this allows route-specific overrides
 * SECURITY: Never use wildcard (*) with credentials enabled
 */
export function validateCORS(
  request: NextRequest,
  customOrigins?: string[]
): NextResponse | null {
  const origin = request.headers.get("origin");

  if (!origin) return null; // Same-origin requests don't have origin header

  const allowedOrigins = customOrigins || getAllowedCorsOrigins();

  // SECURITY FIX (SEC-001): Explicitly validate origin, never allow wildcard
  if (!allowedOrigins.includes(origin)) {
    return new NextResponse(
      JSON.stringify({ error: "CORS: Origin not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null;
}

/**
 * Applies rate limiting to the request
 */
export async function applyRateLimiting(
  request: NextRequest,
  pathname: string,
  customRateLimitType?: string
): Promise<NextResponse | null> {
  const rateLimitType = customRateLimitType || determineRateLimitType(pathname);
  return await applyRateLimit(request, rateLimitType as RateLimitType);
}

/**
 * Validates CSRF token for authenticated endpoints
 * SECURITY FIX (SEC-007): Default to requiring CSRF for all mutation operations
 * Only skip CSRF for GET requests and explicitly whitelisted endpoints
 */
export async function validateCSRF(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  // Skip CSRF for GET requests (read-only operations)
  if (request.method === "GET") {
    return null;
  }

  // Skip CSRF for the CSRF token endpoint itself
  if (pathname.endsWith("/csrf")) {
    return null;
  }

  // SECURITY: Require CSRF for all mutation operations (POST, PUT, PATCH, DELETE)
  // Previously only checked specific endpoint prefixes, now defaults to requiring CSRF
  // for all mutations unless explicitly skipped via options.skipCSRF

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse(
      JSON.stringify({
        error: "Authentication required for CSRF validation",
        code: "AUTH_REQUIRED",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const token = authHeader.substring(7);
    // checkRevoked: true — CSRF validation must also reject revoked tokens
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const firebaseUID = decodedToken.uid;

    const isValidCSRF = await requireCSRFToken(request, firebaseUID);
    if (!isValidCSRF) {
      return new NextResponse(
        JSON.stringify({
          error: "CSRF token validation failed",
          code: "CSRF_TOKEN_INVALID",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return null;
  } catch (error) {
    debugLog.error(
      "CSRF validation error",
      { service: "api-route-protection" },
      error
    );
    return new NextResponse(
      JSON.stringify({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Validates authentication for protected routes using Firebase middleware.
 *
 * Returns a discriminated union so the caller receives both the error response
 * (if auth failed) and the verified auth object (if auth passed) in one call.
 * This lets `withApiProtection` forward the auth result to the handler, eliminating
 * the need for handlers to call `requireAuth`/`requireAdmin` a second time.
 */
export async function validateAuthentication(
  request: NextRequest,
  authLevel: "user" | "admin"
): Promise<
  { error: NextResponse; auth: null } | { error: null; auth: AuthContext }
> {
  try {
    if (authLevel === "admin") {
      const result = await requireAdmin(request);
      if (result instanceof NextResponse) return { error: result, auth: null };
      return { error: null, auth: result };
    } else {
      const result = await requireAuth(request);
      if (result instanceof NextResponse) return { error: result, auth: null };
      return { error: null, auth: result };
    }
  } catch {
    return {
      error: new NextResponse(
        JSON.stringify({
          error: "Authentication validation failed",
          code: "AUTH_VALIDATION_ERROR",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      ),
      auth: null,
    };
  }
}

/**
 * Validates request body and/or query parameters using Zod schemas
 */
export async function validateInputs(
  request: NextRequest,
  bodySchema?: z.ZodSchema<any>,
  querySchema?: z.ZodSchema<any>,
  pathname?: string
): Promise<NextResponse | null> {
  const method = request.method.toUpperCase();
  const context = pathname || request.nextUrl.pathname;

  try {
    if (bodySchema && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      let body: unknown;

      const clonedRequest = request.clone();
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        try {
          body = await clonedRequest.json();
        } catch (error) {
          debugLog.debug("Failed to parse JSON body", {
            service: "api-route-protection",
            error: error,
            context,
          });
          return new NextResponse(
            JSON.stringify({
              error: "Invalid JSON in request body",
              code: "INVALID_JSON",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        try {
          const formData = await clonedRequest.formData();
          body = Object.fromEntries(formData.entries());
        } catch (error) {
          debugLog.debug("Failed to parse form data", {
            service: "api-route-protection",
            error: error,
            context,
          });
          return new NextResponse(
            JSON.stringify({
              error: "Invalid form data",
              code: "INVALID_FORM_DATA",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        body = undefined;
      }

      if (body !== undefined) {
        const validationResult = validateInput(bodySchema, body, context);
        if (!validationResult.success) {
          debugLog.debug("Request body validation failed", {
            service: "api-route-protection",
            context,
            errors: validationResult.details,
          });
          return new NextResponse(
            JSON.stringify({
              error: "Validation failed",
              code: "VALIDATION_ERROR",
              message: validationResult.error,
              details: validationResult.details,
            }),
            {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    if (querySchema) {
      const searchParams = request.nextUrl.searchParams;
      const query: Record<string, string | string[]> = {};

      for (const [key, value] of searchParams.entries()) {
        if (query[key]) {
          // Multiple values for same key
          const existing = query[key];
          query[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing as string, value];
        } else {
          query[key] = value;
        }
      }

      const validationResult = validateInput(querySchema, query, context);
      if (!validationResult.success) {
        debugLog.debug("Query parameters validation failed", {
          service: "api-route-protection",
          context,
          errors: validationResult.details,
        });
        return new NextResponse(
          JSON.stringify({
            error: "Invalid query parameters",
            code: "VALIDATION_ERROR",
            message: validationResult.error,
            details: validationResult.details,
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return null;
  } catch (error) {
    debugLog.error(
      "Input validation error",
      { service: "api-route-protection", context },
      error
    );
    return new NextResponse(
      JSON.stringify({
        error: "Input validation failed",
        code: "VALIDATION_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Adds API-specific headers to the response: CORS, rate limiting, and cache control.
 *
 * Division of responsibility with middleware.ts:
 * - middleware.ts (`applySecurityHeaders`) handles broad security headers for ALL requests:
 *   X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, CSP, HSTS, Referrer-Policy, etc.
 * - This function handles headers that are API-route-specific or need per-route customization:
 *   - CORS: middleware handles the OPTIONS preflight, but actual responses need CORS headers too,
 *     and some routes require custom allowed origins (via `customCorsOrigins`)
 *   - Rate limit headers: route-level info exposed to clients (X-Rate-Limit-*)
 *   - Cache-Control: API responses must never be cached; pages have different caching needs
 *
 * NOTE: X-Frame-Options, X-Content-Type-Options, and X-XSS-Protection are intentionally
 * NOT set here — middleware.ts already applies them to every request, so setting them again
 * would be redundant.
 *
 * SECURITY: Never use wildcard (*) with credentials enabled (SEC-001)
 */
export function addSecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  pathname: string,
  rateLimitType?: string,
  customCorsOrigins?: string[]
): NextResponse {
  // Reflect the exact requesting origin back (instead of wildcard) so cookies/auth
  // headers are permitted. Only set if the origin is explicitly allowlisted.
  // SECURITY FIX (SEC-001): Never use wildcard (*) with credentials enabled
  const origin = request.headers.get("origin");
  if (origin) {
    const allowedOrigins = customCorsOrigins || getAllowedCorsOrigins();
    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      // Allow the browser to send cookies and Authorization headers cross-origin
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  // Declare which HTTP methods are permitted for cross-origin requests
  response.headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
  // Declare which request headers the browser is allowed to send cross-origin
  response.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
  // Whitelist response headers that the browser JS can read (hidden by default for cross-origin)
  response.headers.set("Access-Control-Expose-Headers", CORS_EXPOSE_HEADERS);

  // Expose rate limit state to clients so they can back off before hitting a 429
  const limitType = rateLimitType || determineRateLimitType(pathname);
  const rateLimitHeaders = getRateLimitHeaders(limitType as RateLimitType);

  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Prevent any layer (browser, CDN, proxy) from caching API responses —
  // stale API data can leak sensitive info or serve outdated state
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  // Legacy HTTP/1.0 cache directive, kept for older proxy compatibility
  response.headers.set("Pragma", "no-cache");
  // Forces proxies that ignore Cache-Control to treat the response as already expired
  response.headers.set("Expires", "0");

  return response;
}
