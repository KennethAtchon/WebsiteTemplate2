import { NextRequest, NextResponse } from "next/server";
import { debugLog } from "@/shared/utils/debug";
import { withPublicProtection } from "@/shared/middleware/api-route-protection";

async function postHandler(request: NextRequest) {
  try {
    const body = await request.text();
    const webVitalData = JSON.parse(body);

    // Log web vital metrics for monitoring
    debugLog.info(
      "Web Vitals metric received",
      {
        service: "analytics",
        operation: "web-vitals",
      },
      {
        metric: webVitalData.name,
        value: webVitalData.value,
        rating: webVitalData.rating,
        url: webVitalData.url,
        userAgent: webVitalData.userAgent,
      }
    );

    // In a production environment, you might want to:
    // 1. Store metrics in a database
    // 2. Send to external analytics service (e.g., Google Analytics, DataDog)
    // 3. Aggregate metrics for performance dashboards
    // 4. Set up alerts for poor performance metrics

    // For now, we'll just acknowledge receipt
    return NextResponse.json(
      {
        success: true,
        message: "Web vital metric recorded",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    debugLog.error(
      "Error processing web vitals data",
      {
        service: "analytics",
        operation: "web-vitals",
      },
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process web vitals data",
      },
      {
        status: 500,
      }
    );
  }
}

async function optionsHandler() {
  return new NextResponse(null, { status: 200 });
}

import { webVitalsSchema } from "@/shared/utils/validation/api-validation";

export const POST = withPublicProtection(postHandler, {
  bodySchema: webVitalsSchema,
  rateLimitType: "public",
});

export const OPTIONS = withPublicProtection(optionsHandler, {
  skipRateLimit: true,
});
