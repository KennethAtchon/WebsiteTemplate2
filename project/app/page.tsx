/**
 * Homepage - Modern SaaS Design
 *
 * Modern SaaS landing page with hero section, features, and CTA.
 */

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { PageLayout } from "@/shared/components/layout/page-layout";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("order_detail_pdf_company_tagline"),
    description: t("metadata_home_description"),
    path: "/",
  }).metadata;
}

export const revalidate = 3600;

const REDIRECT_PATH = "/pricing";

export default async function Home() {
  const t = await getTranslations();
  return (
    <PageLayout variant="public">
      {/* Hero Section - Modern SaaS Style */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {t("home_hero_badge")}
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              {t("common_financial_calculators")}
              <span className="block bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
                {t("common_built_for_professionals")}
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto leading-relaxed">
              {t("home_hero_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 h-12 shadow-lg hover:shadow-xl transition-all saas-button"
              >
                <Link href={`/sign-up?redirect_url=${REDIRECT_PATH}`}>
                  {t("home_hero_cta_start_trial")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 h-12 border-2 saas-button"
              >
                <Link href="/pricing">{t("home_hero_cta_view_pricing")}</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("home_hero_footer")}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>{t("common_10_000_active_users")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>{t("common_99_9_uptime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>{t("common_bank_level_security")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>{t("faq_hero_24_7_support")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section className="container py-20 md:py-28">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("home_features_title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("home_features_description")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("home_features_mortgage_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home_features_mortgage_description")}
              </p>
            </CardContent>
          </Card>
          <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("home_features_investment_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home_features_investment_description")}
              </p>
            </CardContent>
          </Card>
          <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("home_features_loan_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home_features_loan_description")}
              </p>
            </CardContent>
          </Card>
          <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("home_features_retirement_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home_features_retirement_description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section - Modern Layout */}
      <section className="border-y bg-gradient-to-b from-muted/50 to-background py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t("common_why_professionals_choose_calcpro")}
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t("common_accurate_calculations")}
                </h3>
                <p className="text-muted-foreground">
                  {t("home_benefits_accurate_description")}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t("home_benefits_export_title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("home_benefits_export_description")}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t("home_benefits_secure_title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("home_benefits_secure_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="container py-20 md:py-28">
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              {t("features_ready_to_start")}
            </h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("home_cta_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 h-12 shadow-lg">
                <Link href="/pricing">
                  {t("common_view_pricing_plans")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 h-12 border-2"
              >
                <Link href="/contact">{t("home_cta_contact_sales")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageLayout>
  );
}
