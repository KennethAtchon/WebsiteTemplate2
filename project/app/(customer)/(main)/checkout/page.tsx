/**
 * Checkout Page - Modern SaaS Design
 *
 * Handles both subscription and one-time order checkouts.
 * Optimized: Server component with client component for interactivity.
 */

import { CheckoutInteractive } from "./checkout-interactive";
import { PageLayout } from "@/shared/components/layout/page-layout";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("metadata_checkout_title"),
    description: t("metadata_checkout_description"),
    path: "/checkout",
  }).metadata;
}

export const revalidate = 3600;

export default function CheckoutPage() {
  return (
    <PageLayout variant="customer">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <CheckoutInteractive />
      </div>
    </PageLayout>
  );
}
