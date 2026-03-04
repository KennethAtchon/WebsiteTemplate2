/**
 * Contact Messages Page - Modern SaaS Design
 *
 * Admin page for viewing and managing customer contact messages.
 * Optimized: Server component with client component for interactivity.
 */

import { MessageSquare } from "lucide-react";
import { ContactMessagesInteractive } from "./contact-messages-interactive";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_contact_messages_title"),
    description: t(
      "common_view_and_manage_customer_inquiries_and_support_requests"
    ),
  };
}

export default async function ContactMessagesPage() {
  const t = await getTranslations();
  return (
    <div className="space-y-6">
      {/* Header - Server Component */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          {t("metadata_admin_contact_messages_title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("common_view_and_manage_customer_inquiries_and_support_requests")}
        </p>
      </div>

      {/* Interactive Table - Client Component */}
      <ContactMessagesInteractive />
    </div>
  );
}
