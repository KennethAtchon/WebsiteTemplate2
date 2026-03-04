/**
 * Payment Success Page - Modern SaaS Design
 *
 * Success page after payment completion (both subscriptions and one-time orders).
 * Optimized: Server component with client component for interactivity.
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This page handles BOTH subscription and one-time order payments.
 *
 * When a subscription checkout completes:
 *   - Firebase Extension automatically creates subscription in Firestore
 *   - Firebase Extension sets custom claims (stripeRole)
 *   - NO Order record is created in Prisma (by design)
 *
 * When a one-time purchase completes:
 *   - OrderCreator component creates Order in Prisma
 *   - One-time orders are tracked separately from subscriptions
 *
 * Separation:
 *   - Subscriptions → Firestore (no OrderCreator needed)
 *   - One-time Orders → Prisma (uses OrderCreator component)
 */

import { PaymentSuccessInteractive } from "./payment-success-interactive";
import { PageLayout } from "@/shared/components/layout/page-layout";
import { createPageMetadata } from "@/shared/services/seo/page-metadata";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("metadata_payment_success_title"),
    description: t("metadata_payment_success_description"),
    path: "/payment/success",
  }).metadata;
}

export const revalidate = 3600;

export default function PaymentSuccessPage() {
  return (
    <PageLayout variant="customer">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <PaymentSuccessInteractive />
      </div>
    </PageLayout>
  );
}
