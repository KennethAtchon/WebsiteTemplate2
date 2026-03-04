"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { localeMetadata, type Locale } from "@/shared/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const _router = useRouter();
  const _pathname = usePathname();
  const [_isPending] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    // Set cookie with new locale preference
    // next-intl uses 'NEXT_LOCALE' as the default cookie name
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Reload the page to apply new locale
    // The middleware will detect the cookie and use the new locale
    window.location.reload();
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeMetadata).map(([code, meta]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{meta.flag}</span>
              <span>{meta.nativeName}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
