/**
 * Developer Page - Modern SaaS Design
 *
 * Developer tools for database table visualization and manipulation.
 * Optimized: Server component with client component for interactivity.
 */

import { Code } from "lucide-react";
import { DeveloperInteractive } from "./developer-interactive";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("metadata_admin_developer_title"),
    description: t(
      "common_visualize_database_tables_and_add_elements_with_json"
    ),
  };
}

export default async function DeveloperPage() {
  const t = await getTranslations();
  return (
    <div className="space-y-6">
      {/* Header - Server Component */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Code className="h-6 w-6 text-primary" />
          </div>
          {t("metadata_admin_developer_title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("common_visualize_database_tables_and_add_elements_with_json")}
        </p>
      </div>

      {/* Interactive Tools - Client Component */}
      <DeveloperInteractive />
    </div>
  );
}
