/**
 * Admin Settings Page - Modern SaaS Design
 *
 * Admin settings page for updating user profile and password.
 * Optimized: Server component with client component for interactivity.
 */

import { Settings } from "lucide-react";
import { SettingsInteractive } from "./settings-interactive";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_settings_title"),
    description: t("common_manage_your_account_settings_and_preferences"),
  };
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header - Server Component */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Interactive Form - Client Component */}
      <SettingsInteractive />
    </div>
  );
}
