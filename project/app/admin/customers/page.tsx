/**
 * Admin Customers Page - Modern SaaS Design
 *
 * Customers management page for viewing and managing customer accounts.
 * Optimized: Server component with client view component.
 */

import { CustomersView } from "@/features/admin/components/customers/customers-view";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_customers_title"),
    description: t("metadata_admin_customers_description"),
  };
}

export default function CustomersPage() {
  return <CustomersView />;
}
