"use client";

import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/admin/components/dashboard/dashboard-layout";

function AdminLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/admin/_layout")({
  component: AdminLayout,
});
