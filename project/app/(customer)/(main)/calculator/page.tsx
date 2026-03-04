/**
 * Calculator Page - Modern SaaS Design
 *
 * Main calculator page with calculator type selection and usage tracking.
 * Optimized: Server component with client components for interactivity.
 */

import { Calculator } from "lucide-react";
import { PageLayout } from "@/shared/components/layout/page-layout";
import { Section } from "@/shared/components/custom-ui/section";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { CalculatorInteractive } from "./calculator-interactive";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CORE_FEATURE_PATH } from "@/shared/constants/app.constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("common_financial_calculators"),
    description: t("metadata_calculator_description"),
    path: CORE_FEATURE_PATH,
  }).metadata;
}

export default async function CalculatorPage() {
  const t = await getTranslations();
  return (
    <PageLayout variant="customer">
      <Section maxWidth="7xl" padding="sm">
        {/* Header Section - Server Component */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                {t("common_financial_calculators")}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {t("metadata_calculator_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Calculator Section - Client Component */}
        <CalculatorInteractive />
      </Section>
    </PageLayout>
  );
}
