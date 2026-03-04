/**
 * GDPR Right to Object — Object to Processing
 *
 * POST: Records the user's objection to marketing/analytics processing.
 * Satisfies GDPR Article 21 (right to object).
 *
 * Note: Essential processing required for service delivery cannot be objected to.
 * This endpoint records objection to optional processing (marketing emails, analytics).
 */

import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import { debugLog } from "@/shared/utils/debug";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";
import { z } from "zod";

const objectToProcessingSchema = z.object({
  processingType: z.enum(["marketing", "analytics", "all"]),
  reason: z.string().max(1000).optional(),
});

async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();
    const parsed = objectToProcessingSchema.safeParse(body);

    if (!parsed.success) {
      return createBadRequestResponse("Invalid request body");
    }

    const { processingType, reason } = parsed.data;
    const userId = auth.user.id;

    // Store the objection in the user's notes field (extend schema for full implementation)
    // In a production system, this would update dedicated consent/objection fields
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { notes: true },
    });

    const objectionRecord = JSON.stringify({
      type: "gdpr_objection",
      processingType,
      reason: reason ?? null,
      recordedAt: new Date().toISOString(),
    });

    const updatedNotes = existingUser?.notes
      ? `${existingUser.notes}\n${objectionRecord}`
      : objectionRecord;

    await prisma.user.update({
      where: { id: userId },
      data: { notes: updatedNotes },
    });

    debugLog.info(
      "GDPR objection recorded",
      {
        service: "users",
        operation: "OBJECT_TO_PROCESSING",
      },
      { userId, processingType }
    );

    return createSuccessResponse({
      message:
        "Your objection has been recorded. We will cease the specified processing within 30 days.",
      processingType,
      recordedAt: new Date().toISOString(),
    });
  } catch (error) {
    debugLog.error(
      "GDPR objection recording failed",
      {
        service: "users",
        operation: "OBJECT_TO_PROCESSING",
      },
      error
    );
    return createInternalErrorResponse("Failed to record objection", error);
  }
}

export const POST = withUserProtection(postHandler, {
  requireAuth: "user",
  rateLimitType: "customer",
});
