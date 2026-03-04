/**
 * SEO Metadata Generation - Template
 *
 * Generates SEO-optimized metadata using app constants (APP_NAME, etc.).
 */

import { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/shared/constants/app.constants";
import { BASE_URL, APP_ENV } from "@/shared/utils/config/envUtil";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

const DEFAULT_CONFIG = {
  siteName: APP_NAME,
  baseUrl: BASE_URL,
  defaultImage: "/images/og-default.jpg",
  twitterHandle: `@${APP_NAME.toLowerCase().replace(/\s+/g, "")}`,
  defaultKeywords: [
    "financial calculator",
    "mortgage calculator",
    "loan calculator",
    "investment calculator",
    "retirement planner",
    "financial planning",
    "SaaS calculator",
    "professional calculator",
    "calculator suite",
  ],
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    image,
    noIndex = false,
    noFollow = false,
  } = config;

  const fullTitle = title.includes(DEFAULT_CONFIG.siteName)
    ? title
    : `${DEFAULT_CONFIG.siteName} - ${title}`;

  const imageUrl = image || DEFAULT_CONFIG.defaultImage;
  const canonicalUrl = canonical || DEFAULT_CONFIG.baseUrl;
  const allKeywords = [...DEFAULT_CONFIG.defaultKeywords, ...keywords];

  // Determine metadataBase URL - use BASE_URL if available, otherwise use localhost for dev
  // This is used by Next.js to resolve relative image URLs for OpenGraph/Twitter cards
  const baseUrlForMetadata =
    DEFAULT_CONFIG.baseUrl !== "[BASE_URL]" && DEFAULT_CONFIG.baseUrl
      ? DEFAULT_CONFIG.baseUrl
      : APP_ENV === "production"
        ? "https://example.com" // Template fallback; set NEXT_PUBLIC_BASE_URL in production
        : "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrlForMetadata),
    title: fullTitle,
    description,
    keywords: allKeywords.length > 0 ? allKeywords.join(", ") : undefined,
    authors: [{ name: DEFAULT_CONFIG.siteName }],
    creator: DEFAULT_CONFIG.siteName,
    publisher: DEFAULT_CONFIG.siteName,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: DEFAULT_CONFIG.siteName,
      title: fullTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: DEFAULT_CONFIG.twitterHandle,
      creator: DEFAULT_CONFIG.twitterHandle,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      "theme-color": "#1f2937",
    },
  };
}

export function generateBusinessMetadata(
  config: Omit<SEOConfig, "title" | "description"> & {
    title: string;
    description: string;
  }
): Metadata {
  const _businessName = DEFAULT_CONFIG.siteName;
  const _businessDescription = APP_DESCRIPTION;

  return generateMetadata({
    keywords: [
      ...DEFAULT_CONFIG.defaultKeywords,
      "SaaS",
      "subscription",
      "financial tools",
      "business calculator",
    ],
    ...config,
  });
}

export function generateProductMetadata(
  productName: string,
  description: string,
  price?: number,
  config?: Partial<SEOConfig>
): Metadata {
  const businessName = DEFAULT_CONFIG.siteName;

  return generateMetadata({
    title: `${productName} - ${businessName}`,
    description: `${description} Professional calculator from ${businessName}. ${price !== undefined ? `Starting at $${price}` : "Learn more today"}.`,
    keywords: [
      productName.toLowerCase(),
      "calculator",
      "financial calculator",
      ...DEFAULT_CONFIG.defaultKeywords,
    ],
    ...config,
  });
}

export function generatePageMetadata(
  pageName: string,
  description: string,
  config?: Partial<SEOConfig>
): Metadata {
  return generateMetadata({
    title: pageName,
    description,
    ...config,
  });
}
