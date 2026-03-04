import { NextRequest, NextResponse } from "next/server";
import {
  getAllowedCorsOrigins,
  IS_PRODUCTION,
} from "@/shared/utils/config/envUtil";
import {
  CORS_ALLOW_METHODS,
  CORS_ALLOW_HEADERS,
} from "@/shared/utils/config/cors-constants";

/**
 * CORS configuration with strict origin validation
 */
const getAllowedOrigins = getAllowedCorsOrigins;

/**
 * Validates if the origin is allowed for CORS requests
 */
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

/**
 * Handles CORS preflight requests
 * SECURITY: Never use wildcard (*) with credentials enabled
 */
const handleCorsPreflightRequest = (request: NextRequest): NextResponse => {
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, { status: 200 });

  // SECURITY FIX (SEC-001): Never use wildcard when credentials are enabled
  // Only set origin if it's explicitly allowed
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
};

/**
 * Security headers middleware for comprehensive protection
 *
 * SCOPE: This middleware runs on EVERY request (pages + API), not just /api/*
 * - Page requests: /, /about, /admin, etc. (gets security headers)
 * - API requests: /api/* (gets security headers + CORS handling)
 * - Static files: Excluded (images, fonts, etc. don't go through middleware)
 *
 * What it does:
 * - CORS: Handles OPTIONS preflight requests for /api/* routes only
 *   (CORS validation and headers are handled by api-route-protection.ts to support custom origins)
 * - Security headers: Applied to ALL requests (CSP, HSTS, X-Frame-Options, etc.)
 * - Cache control: Only for /admin and /api/* routes
 *
 * Note: Rate limiting and CSRF are handled at API route level (not in middleware)
 * due to edge runtime limitations (can't use Redis/crypto in edge runtime)
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle CORS preflight requests for API routes
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return handleCorsPreflightRequest(request);
  }

  // OpenTelemetry tracing is disabled in Prisma client configuration
  // to prevent traceparent header issues with undici library

  // CSRF protection is handled at the API route level due to edge runtime limitations
  // The crypto module used by CSRF protection is not available in edge runtime

  // Rate limiting is handled at the API route level due to edge runtime limitations
  // The Redis connection used by rate limiting is not available in edge runtime

  // Locale detection is handled in layout.tsx via getLocale() from next-intl/server
  // No middleware routing needed when using localePrefix: "never"

  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response, request);

  return response;
}

/**
 * Applies comprehensive security headers to a response
 */
function applySecurityHeaders(
  response: NextResponse,
  _request: NextRequest
): void {
  // Isolates the browsing context so popup windows (e.g. OAuth flows) opened by this
  // page can't access it via window.opener, while still allowing this page to open popups
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );

  // Prevents the page from being embedded in an <iframe>, blocking clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Stops browsers from guessing the content type from the response body —
  // prevents attacks where a file upload is served as a different MIME type
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Controls how much referrer info is sent with outgoing requests:
  // sends full URL for same-origin, only the origin (no path) for cross-origin
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Tells browsers to only connect via HTTPS for the next year, including subdomains.
  // Submitted to the browser preload list so it applies even on the first visit.
  // Only enabled in production — dev needs plain HTTP.
  if (IS_PRODUCTION) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Restricts access to browser APIs on a per-feature basis.
  // Empty () means blocked entirely; (self) means only this origin can use it.
  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Blocks FLoC tracking
    "payment=(self)",
    "usb=()",
    "serial=()",
    "accelerometer=()",
    "gyroscope=()",
    "magnetometer=()",
    "fullscreen=(self)",
  ].join(", ");

  response.headers.set("Permissions-Policy", permissionsPolicy);

  // Legacy XSS filter built into older browsers (IE/early Chrome/Safari).
  // Modern browsers have removed it, but kept here for broad compatibility.
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevents browsers from pre-resolving DNS for links on the page,
  // which can leak browsing intent to third-party DNS servers
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // Prevents Adobe Flash and PDF readers from making cross-domain requests
  // on behalf of this domain (largely historical, but low-cost to include)
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Content-Security-Policy: declares which sources are trusted for each resource type.
  // Anything not listed is blocked by the browser before it even loads.
  // 'unsafe-inline' is required for Next.js hydration scripts and CSS-in-JS;
  // a nonce-based approach can replace this once Next.js nonce support is stable.
  const csp = [
    // Fallback for any resource type not explicitly listed below
    "default-src 'self'",
    // Scripts: self + Next.js inline + Stripe (payment widget) + Google Maps + GTM
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://www.googletagmanager.com",
    // Styles: self + inline (CSS-in-JS/Tailwind) + Google Fonts stylesheet
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts: self + Google Fonts CDN serving the actual font files
    "font-src 'self' https://fonts.gstatic.com",
    // Images: self + data URIs (base64) + blob URLs + any HTTPS source (avatars, CDN assets)
    "img-src 'self' data: blob: https:",
    // Fetch/XHR/WebSocket: self + Firebase + Google APIs + Stripe API
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.stripe.com wss://*.firebaseio.com",
    // Iframes: only Stripe's payment and webhook iframes are allowed
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    // Blocks Flash, Java applets, and other plugins entirely
    "object-src 'none'",
    // Restricts <base> tag to same origin, preventing base-tag injection attacks
    "base-uri 'self'",
    // Restricts where forms can submit to, preventing form hijacking
    "form-action 'self'",
    // Instructs the browser to upgrade any remaining http:// sub-requests to https://
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
}

/**
 * Middleware configuration - applies to all routes except static files
 */
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
