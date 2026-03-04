/**
 * Customer Portal API Route
 *
 * Creates a Stripe Customer Portal link for users to manage their subscriptions.
 * Uses Firebase Extension's createPortalLink function via HTTP call.
 */

import { NextRequest } from "next/server";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { debugLog } from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createUnauthorizedResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import {
  BASE_URL,
  FIREBASE_PROJECT_ID_SERVER,
  FIREBASE_PROJECT_ID,
} from "@/shared/utils/config/envUtil";

async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    // Get Firebase ID token from the authenticated user
    // Note: Plan switching during trial is enabled. Users can switch tiers during trial,
    // and Stripe will handle trial period extensions appropriately. Our trial eligibility
    // check prevents abuse by ensuring users can only have one trial period.
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("__session")?.value;

    if (!token) {
      return createUnauthorizedResponse("Authentication required");
    }

    const baseUrl =
      BASE_URL !== "[BASE_URL]" ? BASE_URL : request.nextUrl.origin;
    const projectId = FIREBASE_PROJECT_ID_SERVER || FIREBASE_PROJECT_ID;
    const region = "us-central1"; // Default region for Firebase Extension

    // Firebase Extension callable function URL
    // Callable functions use this format: https://[region]-[project-id].cloudfunctions.net/[function-name]
    const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/ext-firestore-stripe-payments-createPortalLink`;

    // Firebase callable functions expect data in a specific format
    // Configure portal to allow subscription updates (plan switching)
    // Note: The Firebase Extension may use Stripe Dashboard portal configuration as fallback
    const callableData = {
      data: {
        returnUrl: `${baseUrl}/account`,
        locale: "auto",
        // Enable subscription updates to allow plan switching during trial
        // This allows users to change their subscription tier/price
        features: {
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price"], // Allow price/tier changes
            proration_behavior: "none", // No proration during trial (no charges anyway)
          },
        },
      },
    };

    // Call Firebase Extension function via HTTP
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(callableData),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      debugLog.error("Firebase Extension returned error", {
        service: "subscriptions-portal",
        operation: "POST",
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.error?.message || errorData.error || `HTTP ${response.status}`
      );
    }

    const result = await response.json();

    // Log the full response structure for debugging
    debugLog.info("Firebase Extension response received", {
      service: "subscriptions-portal",
      operation: "POST",
      userId: auth.user.id,
      responseKeys: Object.keys(result),
      hasData: !!result.data,
      hasUrl: !!result.url,
      hasResult: !!result.result,
      dataKeys: result.data ? Object.keys(result.data) : [],
      fullResponse: JSON.stringify(result, null, 2).substring(0, 500), // First 500 chars for debugging
    });

    // Firebase callable functions can return data in different formats when called via HTTP:
    // 1. result.data.url (standard callable format)
    // 2. result.url (direct format)
    // 3. result.result?.url (nested format)
    // 4. result.result?.data?.url (double nested)
    // 5. result.data (if data is the URL string itself)
    // 6. Check for error in response
    if (result.error) {
      debugLog.error("Firebase Extension returned error in response", {
        service: "subscriptions-portal",
        operation: "POST",
        error: result.error,
      });
      throw new Error(
        result.error.message || result.error || "Firebase Extension error"
      );
    }

    const portalUrl =
      result.data?.url ||
      result.url ||
      result.result?.url ||
      result.result?.data?.url ||
      (typeof result.data === "string" ? result.data : null) ||
      (typeof result === "string" ? result : null);

    if (!portalUrl) {
      debugLog.error("No portal URL found in response", {
        service: "subscriptions-portal",
        operation: "POST",
        responseStructure: JSON.stringify(result, null, 2),
      });
      throw new Error(
        `No portal URL in response. Response structure: ${JSON.stringify(result).substring(0, 200)}`
      );
    }

    debugLog.info("Portal link created successfully", {
      service: "subscriptions-portal",
      operation: "POST",
      userId: auth.user.id,
    });

    return createSuccessResponse({
      url: portalUrl,
    });
  } catch (error) {
    debugLog.error(
      "Error creating portal link",
      {
        service: "subscriptions-portal",
        operation: "POST",
      },
      error
    );

    return createInternalErrorResponse("Failed to create portal link", error);
  }
}

export const POST = withUserProtection(postHandler, {
  rateLimitType: "customer",
});
