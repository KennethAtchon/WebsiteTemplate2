/**
 * GET /api/metrics
 * Prometheus-format metrics for Grafana Cloud (or any Prometheus scraper).
 * Protected by METRICS_SECRET bearer token when set.
 */

import { NextRequest, NextResponse } from "next/server";
import { METRICS_SECRET } from "@/shared/utils/config/envUtil";
import {
  getMetricsContent,
  isMetricsEnabled,
} from "@/shared/services/observability/metrics";

const PROMETHEUS_CONTENT_TYPE =
  "text/plain; version=0.0.4; charset=utf-8" as const;

export async function GET(request: NextRequest) {
  if (!isMetricsEnabled()) {
    return new NextResponse("Metrics disabled", { status: 404 });
  }

  if (METRICS_SECRET) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token !== METRICS_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  try {
    const content = await getMetricsContent();
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": PROMETHEUS_CONTENT_TYPE,
      },
    });
  } catch {
    return new NextResponse("Error generating metrics", { status: 500 });
  }
}
