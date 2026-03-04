/**
 * Account Page - Modern SaaS Design
 *
 * User account dashboard with subscription management, usage tracking, and calculator access.
 * Optimized: Server component with client components for interactivity.
 */

import { PageLayout } from "@/shared/components/layout/page-layout";
import { Section } from "@/shared/components/custom-ui/section";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { AccountInteractive } from "./account-interactive";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("common_account_dashboard"),
    description: t("metadata_account_description"),
    path: "/account",
  }).metadata;
}

export default async function AccountPage() {
  const t = await getTranslations();
  return (
    <PageLayout variant="customer">
      <Section maxWidth="7xl" padding="sm">
        {/* Header Section - Server Component */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("common_account_dashboard")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t(
              "common_manage_your_subscription_view_usage_and_access_calculators"
            )}
          </p>
        </div>

        {/* Interactive Tabs - Client Component */}
        <AccountInteractive />
      </Section>
    </PageLayout>
  );
}
