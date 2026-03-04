/**
 * Lighthouse CI Configuration
 *
 * Performance budgets and accessibility thresholds.
 * Run: bun run lighthouse
 */

/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/pricing",
        "http://localhost:3000/faq",
        "http://localhost:3000/about",
        "http://localhost:3000/api-documentation",
        "http://localhost:3000/support",
      ],
      numberOfRuns: 3,
      startServerCommand: "bun start",
      startServerReadyPattern: "started server on",
      startServerReadyTimeout: 30000,
      settings: {
        // Simulate a mid-range mobile device on 4G
        preset: "desktop",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Disable third-party audits that require network
        skipAudits: ["uses-http2", "uses-long-cache-ttl"],
      },
    },
    assert: {
      // Performance budgets — P3 targets
      assertions: {
        // Core Web Vitals
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        interactive: ["warn", { maxNumericValue: 3800 }],
        "speed-index": ["warn", { maxNumericValue: 3400 }],

        // Category scores (0–1 scale)
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Specific accessibility audits
        "color-contrast": ["error", { minScore: 1 }],
        "image-alt": ["error", { minScore: 1 }],
        label: ["error", { minScore: 1 }],
        tabindex: ["error", { minScore: 1 }],
        "html-has-lang": ["error", { minScore: 1 }],
        "meta-viewport": ["error", { minScore: 1 }],

        // Performance budgets
        "uses-optimized-images": ["warn", { minScore: 0 }],
        "uses-webp-images": ["warn", { minScore: 0 }],
        "unused-javascript": ["warn", { maxNumericValue: 100000 }], // 100 KB
        "unused-css-rules": ["warn", { maxNumericValue: 50000 }], // 50 KB
        "total-byte-weight": ["warn", { maxNumericValue: 1600000 }], // 1.6 MB
        "render-blocking-resources": ["warn", { maxNumericValue: 0 }],
      },
    },
    upload: {
      // Store reports locally during development; use temporary-public-storage in CI
      target: "filesystem",
      outputDir: "./lighthouse-results",
    },
  },
};
