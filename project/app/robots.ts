import { MetadataRoute } from "next";
import { BASE_URL } from "@/shared/utils/config/envUtil";

// Common paths that should be disallowed for all crawlers
const COMMON_DISALLOW_PATHS = ["/admin/", "/api/", "/account/", "/payment/"];

// Additional paths for general crawlers
const GENERAL_DISALLOW_PATHS = [
  ...COMMON_DISALLOW_PATHS,
  "/_next/",
  "/private/",
  "/temp/",
  "/*.json",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: GENERAL_DISALLOW_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: COMMON_DISALLOW_PATHS,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: COMMON_DISALLOW_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
