/**
 * Admin Dashboard Page - Modern SaaS Design
 *
 * Main admin dashboard page with business metrics and analytics.
 * Optimized: Server component with client view component.
 */

import { DashboardView } from "@/features/admin/components/dashboard/dashboard-view";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_dashboard_title"),
    description: t("common_dashboard_overview"),
  };
}

export default async function DashboardPage() {
  return <DashboardView />;
}
