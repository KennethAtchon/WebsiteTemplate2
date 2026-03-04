import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale, getTranslations } from "next-intl/server";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import ThemeProviderWrapper from "@/shared/components/layout/theme-provider-wrapper";
import { AppProvider } from "@/shared/contexts/app-context";
import { generateBusinessMetadata } from "@/shared/services/seo/metadata";
import { StructuredDataStatic } from "@/shared/components/marketing/structured-data";
import { CookieConsentBanner } from "@/shared/components/marketing/cookie-consent-banner";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  DEFAULT_BUSINESS_INFO,
} from "@/shared/services/seo/structured-data";
import { ErrorBoundary } from "@/shared/components/layout/error-boundary";
import { WebVitalsReporter } from "@/shared/components/analytics/web-vitals-reporter";
import { QueryProvider } from "@/shared/providers/query-provider";
import { locales, defaultLocale, type Locale } from "@/shared/i18n/config";
import type { Metadata } from "next";

// Initialize error handling and monitoring on server side only
if (typeof window === "undefined") {
  import("@/shared/utils/system/app-initialization")
    .then(({ initializeApp }) => {
      initializeApp();
    })
    .catch(() => {
      // Silently handle initialization errors
    });
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return generateBusinessMetadata({
    title: t("order_detail_pdf_company_name"),
    description: t("metadata_root_description"),
    image: "/images/og-default.jpg",
  });
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const organizationSchema = generateOrganizationSchema(DEFAULT_BUSINESS_INFO);
const websiteSchema = generateWebsiteSchema(
  DEFAULT_BUSINESS_INFO.url,
  DEFAULT_BUSINESS_INFO.name
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie or Accept-Language header, fallback to defaultLocale
  // Wrap in try-catch to handle cases where getLocale() might fail in root layout
  let locale: Locale = defaultLocale;
  try {
    const detectedLocale = await getLocale();
    if (detectedLocale && locales.includes(detectedLocale as Locale)) {
      locale = detectedLocale as Locale;
    }
  } catch (error) {
    // Fallback to default locale if getLocale() fails
    console.warn("Failed to get locale, using default:", error);
    locale = defaultLocale;
  }

  // Load messages for the detected locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    // If messages fail to load, try default locale
    console.warn("Failed to load messages for locale, using default:", error);
    messages = await getMessages({ locale: defaultLocale });
    locale = defaultLocale;
  }

  return (
    <html lang={locale} suppressHydrationWarning className="light">
      <head>
        <StructuredDataStatic
          data={[organizationSchema, websiteSchema]}
          id="global"
        />
      </head>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <AppProvider>
                <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
              </AppProvider>
            </QueryProvider>
            <WebVitalsReporter />
            <CookieConsentBanner />
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
