import { NextRequest, NextResponse } from "next/server";
import { getCSRFTokenResponse } from "@/shared/services/csrf/csrf-protection";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import { requireAuth } from "@/features/auth/services/firebase-middleware";
import { debugLog } from "@/shared/utils/debug";

/**
 * CSRF Token API
 * Returns CSRF tokens for AUTHENTICATED users only
 * Unauthenticated users don't need CSRF protection
 */
async function getHandler(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      debugLog.debug("CSRF token request rejected - not authenticated", {
        service: "csrf-api",
      });
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          message: "CSRF tokens are only available for authenticated users.",
        },
        { status: 401 }
      );
    }

    // Generate CSRF token bound to Firebase UID
    const tokenData = getCSRFTokenResponse(authResult.userId);

    debugLog.debug("CSRF token generated for user", {
      service: "csrf-api",
    });

    return NextResponse.json(tokenData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    debugLog.error(
      "CSRF token generation error",
      { service: "csrf-api" },
      error
    );
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

// Require authentication but skip CSRF (can't require CSRF to get CSRF token)
export const GET = withUserProtection(getHandler, {
  rateLimitType: "auth",
  skipCSRF: true,
});
