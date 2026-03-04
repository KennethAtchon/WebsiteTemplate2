import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";
import { IS_DEVELOPMENT } from "@/shared/utils/config/envUtil";

type MetricName = "CLS" | "INP" | "FCP" | "LCP" | "TTFB";

interface Metric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

// Thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(
  name: MetricName,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics 4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      custom_map: {
        metric_rating: metric.rating,
        metric_value: metric.value,
      },
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== "undefined" && navigator.sendBeacon) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    navigator.sendBeacon("/api/analytics/web-vitals", body);
  }

  // Console logging for development
  if (IS_DEVELOPMENT) {
    console.log(
      `%c[Web Vitals] ${metric.name}`,
      `color: ${metric.rating === "good" ? "green" : metric.rating === "needs-improvement" ? "orange" : "red"}`,
      metric
    );
  }
}

function onPerfEntry(metric: Metric) {
  metric.rating = getRating(metric.name, metric.value);
  sendToAnalytics(metric);
}

export function reportWebVitals() {
  if (typeof window === "undefined") return;

  try {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  } catch (error) {
    console.error("Error reporting web vitals:", error);
  }
}

// Enhanced performance monitoring for medical services
export function reportMedicalServicePerformance() {
  if (typeof window === "undefined") return;

  // Track therapy page load performance
  if (window.location.pathname.includes("/therapies")) {
    const therapyLoadStart = performance.now();

    window.addEventListener("load", () => {
      const therapyLoadEnd = performance.now();
      const loadTime = therapyLoadEnd - therapyLoadStart;

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics/therapy-performance",
          JSON.stringify({
            type: "therapy_page_load",
            loadTime,
            url: window.location.href,
            timestamp: Date.now(),
          })
        );
      }
    });
  }
}

// Monitor form completion rates for medical forms
export function trackMedicalFormPerformance() {
  if (typeof window === "undefined") return;

  const forms = document.querySelectorAll("form[data-medical-form]");

  forms.forEach((form) => {
    const formStart = performance.now();
    let fieldsCompleted = 0;
    const totalFields = form.querySelectorAll("input, select, textarea").length;

    // Track field completion
    form.addEventListener("input", () => {
      const completedFields = form.querySelectorAll(
        "input:valid, select:valid, textarea:valid"
      ).length;
      if (completedFields > fieldsCompleted) {
        fieldsCompleted = completedFields;

        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/analytics/form-progress",
            JSON.stringify({
              type: "form_progress",
              completedFields,
              totalFields,
              completionRate: (completedFields / totalFields) * 100,
              timeToComplete: performance.now() - formStart,
              formType: form.getAttribute("data-medical-form"),
              url: window.location.href,
              timestamp: Date.now(),
            })
          );
        }
      }
    });

    // Track form submission
    form.addEventListener("submit", () => {
      const formEnd = performance.now();
      const totalTime = formEnd - formStart;

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics/form-completion",
          JSON.stringify({
            type: "form_completion",
            totalTime,
            totalFields,
            formType: form.getAttribute("data-medical-form"),
            url: window.location.href,
            timestamp: Date.now(),
          })
        );
      }
    });
  });
}

// Monitor medical service search performance
export function trackSearchPerformance() {
  if (typeof window === "undefined") return;

  const searchInputs = document.querySelectorAll(
    'input[type="search"], input[data-search]'
  );

  searchInputs.forEach((input) => {
    let searchStart: number;

    input.addEventListener("input", () => {
      searchStart = performance.now();
    });

    // Monitor search results loading
    const observer = new MutationObserver(() => {
      if (searchStart) {
        const searchEnd = performance.now();
        const searchTime = searchEnd - searchStart;

        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/analytics/search-performance",
            JSON.stringify({
              type: "search_performance",
              searchTime,
              query: (input as HTMLInputElement).value,
              url: window.location.href,
              timestamp: Date.now(),
            })
          );
        }

        searchStart = 0;
      }
    });

    const resultsContainer = document.querySelector("[data-search-results]");
    if (resultsContainer) {
      observer.observe(resultsContainer, { childList: true, subtree: true });
    }
  });
}

// Initialize all performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Wait for page to be fully loaded
  if (document.readyState === "complete") {
    reportWebVitals();
    reportMedicalServicePerformance();
    trackMedicalFormPerformance();
    trackSearchPerformance();
  } else {
    window.addEventListener("load", () => {
      reportWebVitals();
      reportMedicalServicePerformance();
      trackMedicalFormPerformance();
      trackSearchPerformance();
    });
  }
}

// Types for global gtag
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
