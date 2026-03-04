/**
 * Admin Layout - Modern SaaS Design
 *
 * Root layout for admin pages with authentication guard.
 */

import type React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { DashboardLayout } from "@/features/admin/components/dashboard/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_layout_title"),
    description: t("metadata_admin_dashboard_description"),
  };
}

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard authType="admin">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
