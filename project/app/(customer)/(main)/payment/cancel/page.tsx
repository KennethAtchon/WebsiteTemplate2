/**
 * Payment Cancel Page - Modern SaaS Design
 *
 * Page shown when user cancels the checkout process.
 * Optimized: Server component (static content only).
 */

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { XCircle, ArrowLeft, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/shared/components/layout/page-layout";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("metadata_payment_cancel_title"),
    description: t("metadata_payment_cancel_description"),
    path: "/payment/cancel",
  }).metadata;
}

// Force dynamic rendering since PageLayout uses NavBar which requires AppProvider context
export const dynamic = "force-dynamic";

export default async function PaymentCancelPage() {
  const t = await getTranslations();
  return (
    <PageLayout variant="customer">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          {/* Cancel Message */}
          <Card className="border-2 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
                <XCircle className="h-12 w-12 text-amber-600" />
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                {t("metadata_payment_cancel_title")}
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                {t(
                  "common_no_charges_were_made_your_subscription_was_not_activated"
                )}
              </p>

              {/* Actions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild size="lg" className="h-12 shadow-lg">
                  <Link href="/pricing">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    {t("payment_cancel_back_to_pricing")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 border-2"
                >
                  <Link href="/contact">
                    {t("payment_cancel_need_help")}
                    <HelpCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Why Cancel? */}
          <Card className="mt-6 border-2">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {t("payment_cancel_have_questions")}
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-2 font-medium">
                    {t("payment_cancel_free_trial_title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("payment_cancel_free_trial_description")}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-2 font-medium">
                    {t("payment_cancel_cancel_anytime_title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("payment_cancel_cancel_anytime_description")}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-2 font-medium">
                    {t("payment_cancel_guarantee_title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("payment_cancel_guarantee_description")}
                  </p>
                </div>
              </div>
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link href="/pricing">
                  {t("payment_cancel_view_plans")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
