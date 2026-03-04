/**
 * Admin Subscriptions Page - Modern SaaS Design
 *
 * Admin view for managing all subscriptions, viewing analytics,
 * and subscription-related operations.
 * Optimized: Server component with client view component.
 */

import { SubscriptionsView } from "@/features/admin/components/subscriptions/subscriptions-view";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

// Force dynamic rendering since this page requires authentication and user context
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_subscriptions_title"),
    description: t("metadata_admin_subscriptions_description"),
  };
}

export default function AdminSubscriptionsPage() {
  return <SubscriptionsView />;
}
