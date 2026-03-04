import { NextRequest, NextResponse } from "next/server";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";

async function postHandler(request: NextRequest) {
  try {
    const body = await request.text();
    const progressData = JSON.parse(body);

    debugLog.info(
      "Form progress metric received",
      {
        service: "analytics",
        operation: "form-progress",
      },
      progressData
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    debugLog.error(
      "Error processing form progress data",
      {
        service: "analytics",
        operation: "form-progress",
      },
      error
    );

    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function optionsHandler() {
  return new NextResponse(null, { status: 200 });
}

import { formProgressSchema } from "@/shared/utils/validation/api-validation";

export const POST = withPublicProtection(postHandler, {
  bodySchema: formProgressSchema,
  rateLimitType: "public",
});

export const OPTIONS = withPublicProtection(optionsHandler, {
  skipRateLimit: true,
});
