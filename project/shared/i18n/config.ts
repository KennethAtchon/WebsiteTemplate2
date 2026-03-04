/**
 * i18n Configuration
 *
 * This configuration is for CLIENT-SIDE and UI translations only.
 *
 * ⚠️ IMPORTANT: DO NOT use translations in API routes (/app/api/<endpoint>/route.ts)
 *
 * Why API routes should NOT use translations:
 * - API responses are consumed by client code, not directly by users
 * - Error messages should use error codes that client UI translates
 * - Hardcoded English messages maintain consistency across API consumers
 * - HTTP status codes serve as the primary communication protocol
 * - Avoids complexity of determining locale for backend-to-backend communication
 *
 * Translation usage:
 * ✅ USE in: Page components, UI components, client-side code
 * ❌ DO NOT USE in: API route handlers, server actions returning raw data
 *
 * See: project/shared/utils/api/response-helpers.ts for API response patterns
 */

import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "it",
  "ja",
  "zh",
] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// Locale metadata for UI display
export const localeMetadata = {
  en: { name: "English", flag: "🇺🇸", nativeName: "English" },
  es: { name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  fr: { name: "French", flag: "🇫🇷", nativeName: "Français" },
  de: { name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  pt: { name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  it: { name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  ja: { name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  zh: { name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
} as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // Fallback to default locale instead of calling notFound() to avoid errors in root layout
  const validLocale: Locale =
    locale && locales.includes(locale as Locale)
      ? (locale as Locale)
      : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../../translations/${validLocale}.json`)).default,
  };
});
