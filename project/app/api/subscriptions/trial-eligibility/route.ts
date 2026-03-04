/**
 * Trial Eligibility API
 *
 * Checks if the current user is eligible for a free trial.
 * Users can only use free trial once.
 */

import { NextRequest } from "next/server";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { prisma } from "@/shared/services/db/prisma";
import { debugLog } from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import {
  createSuccessResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { getFirestore } from "firebase-admin/firestore";

async function getHandler(
  _request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  const { user } = auth;

  try {
    // Check if user has already used free trial
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hasUsedFreeTrial: true },
    });

    if (!dbUser) {
      return createInternalErrorResponse("User not found");
    }

    // Check if user is currently in a trial
    let isInTrial = false;
    if (user.firebaseUid) {
      const db = getFirestore();
      const subscriptionsRef = db
        .collection("customers")
        .doc(user.firebaseUid)
        .collection("subscriptions");

      const trialingSubscriptions = await subscriptionsRef
        .where("status", "==", "trialing")
        .get();

      isInTrial = !trialingSubscriptions.empty;
    }

    const isEligible = !dbUser.hasUsedFreeTrial && !isInTrial;

    return createSuccessResponse({
      isEligible,
      hasUsedFreeTrial: dbUser.hasUsedFreeTrial,
      isInTrial,
    });
  } catch (error) {
    debugLog.error(
      "Error checking trial eligibility",
      {
        service: "subscriptions-api",
        operation: "GET_TRIAL_ELIGIBILITY",
      },
      error
    );

    return createInternalErrorResponse(
      "Failed to check trial eligibility",
      error
    );
  }
}

export const GET = withUserProtection(getHandler, {
  rateLimitType: "auth",
});
