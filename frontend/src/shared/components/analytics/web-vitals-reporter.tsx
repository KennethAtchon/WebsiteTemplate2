"use client";

import { useEffect } from "react";
import { initializePerformanceMonitoring } from "@/shared/utils/system/web-vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize performance monitoring when component mounts
    initializePerformanceMonitoring();
  }, []);

  // This component doesn't render anything
  return null;
}
