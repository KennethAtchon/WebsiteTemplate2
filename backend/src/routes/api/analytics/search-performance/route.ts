import { NextRequest, NextResponse } from "next/server";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";

async function postHandler(request: NextRequest) {
  try {
    const body = await request.text();
    const searchData = JSON.parse(body);

    debugLog.info(
      "Search performance metric received",
      {
        service: "analytics",
        operation: "search-performance",
      },
      searchData
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    debugLog.error(
      "Error processing search performance data",
      {
        service: "analytics",
        operation: "search-performance",
      },
      error
    );

    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function optionsHandler() {
  return new NextResponse(null, { status: 200 });
}

import { searchPerformanceSchema } from "@/shared/utils/validation/api-validation";

export const POST = withPublicProtection(postHandler, {
  bodySchema: searchPerformanceSchema,
  rateLimitType: "public",
});

export const OPTIONS = withPublicProtection(optionsHandler, {
  skipRateLimit: true,
});
