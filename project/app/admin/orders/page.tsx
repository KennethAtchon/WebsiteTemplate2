/**
 * Admin Orders Page - Modern SaaS Design
 *
 * Orders management page for viewing and managing customer orders.
 * Optimized: Server component with client view component.
 */

import { OrdersView } from "@/features/admin/components/orders/orders-view";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_orders_title"),
    description: t("metadata_admin_orders_description"),
  };
}

export default function OrdersPage() {
  return <OrdersView />;
}
