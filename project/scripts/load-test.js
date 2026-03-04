/**
 * k6 Load Test Script
 *
 * Tests the critical API endpoints under realistic load.
 * Requires k6: https://k6.io/docs/getting-started/installation/
 *
 * Usage:
 *   k6 run scripts/load-test.js
 *   k6 run --env BASE_URL=https://your-app.com scripts/load-test.js
 *   k6 run --vus 50 --duration 5m scripts/load-test.js
 *
 * Stages:
 *   Ramp up → Sustained load → Spike → Cool down
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ─── Custom Metrics ─────────────────────────────────────────────────────────
const errorRate = new Rate("error_rate");
const apiLatency = new Trend("api_latency_ms");
const pageLatency = new Trend("page_latency_ms");
const calcErrors = new Counter("calculator_errors");

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Thresholds — test FAILS if any are breached
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 VUs
    { duration: "3m", target: 20 }, // Sustained load
    { duration: "1m", target: 50 }, // Spike
    { duration: "1m", target: 20 }, // Recover
    { duration: "1m", target: 0 }, // Cool down
  ],
  thresholds: {
    // Error rate below 1%
    error_rate: ["rate<0.01"],
    // 95th percentile API latency under 2 seconds
    api_latency_ms: ["p(95)<2000"],
    // 95th percentile page load under 3 seconds
    page_latency_ms: ["p(95)<3000"],
    // Standard k6 HTTP request duration
    http_req_duration: ["p(95)<3000"],
    // At most 1% of requests fail
    http_req_failed: ["rate<0.01"],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function headers(token) {
  const h = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// ─── Public Page Tests ───────────────────────────────────────────────────────
function testPublicPages() {
  const pages = [
    "/",
    "/pricing",
    "/faq",
    "/about",
    "/support",
    "/api-documentation",
  ];

  for (const path of pages) {
    const res = http.get(`${BASE_URL}${path}`);
    const ok = check(res, {
      [`${path} returns 200`]: (r) => r.status === 200,
      [`${path} has content`]: (r) => r.body && r.body.length > 100,
    });
    pageLatency.add(res.timings.duration);
    errorRate.add(!ok);
    sleep(0.5);
  }
}

// ─── API Health Tests ─────────────────────────────────────────────────────────
function testHealthEndpoints() {
  const endpoints = ["/api/health", "/api/ready"];

  for (const path of endpoints) {
    const res = http.get(`${BASE_URL}${path}`);
    const ok = check(res, {
      [`${path} returns 200`]: (r) => r.status === 200,
      [`${path} responds fast`]: (r) => r.timings.duration < 500,
    });
    apiLatency.add(res.timings.duration);
    errorRate.add(!ok);
    sleep(0.2);
  }
}

// ─── Calculator API Tests (unauthenticated — expect 401) ─────────────────────
function testCalculatorAPIAuth() {
  // Verify auth is enforced — unauthenticated requests must return 401
  const res = http.post(
    `${BASE_URL}/api/calculator/calculate`,
    JSON.stringify({ type: "mortgage", inputs: {} }),
    { headers: headers(null) }
  );
  const ok = check(res, {
    "calculator API rejects unauthenticated requests": (r) =>
      r.status === 401 || r.status === 403,
  });
  apiLatency.add(res.timings.duration);
  errorRate.add(!ok);
  if (!ok) calcErrors.add(1);
  sleep(0.3);
}

// ─── Main Virtual User Scenario ─────────────────────────────────────────────
export default function () {
  // Simulate a realistic user journey
  testHealthEndpoints();
  testPublicPages();
  testCalculatorAPIAuth();
  sleep(1);
}

// ─── Teardown ─────────────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    "load-test-results.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, opts) {
  const indent = (opts && opts.indent) || "";
  const thresholdsPassed = Object.values(data.metrics)
    .filter((m) => m.thresholds)
    .every((m) => Object.values(m.thresholds).every((t) => !t.ok === false));

  return `
${indent}Load Test Summary
${indent}=================
${indent}Duration:     ${data.state.testRunDurationMs}ms
${indent}VUs max:      ${data.metrics.vus_max?.values?.max || "N/A"}
${indent}Requests:     ${data.metrics.http_reqs?.values?.count || 0}
${indent}Error rate:   ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%
${indent}p95 latency:  ${Math.round(data.metrics.http_req_duration?.values["p(95)"] || 0)}ms
${indent}Thresholds:   ${thresholdsPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}
`;
}
