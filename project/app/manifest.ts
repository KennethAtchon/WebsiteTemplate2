import { MetadataRoute } from "next";
import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_TAGLINE,
  CORE_FEATURE_PATH,
} from "@/shared/constants/app.constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} - ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-US",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "102x109",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "326x111",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Start Calculating",
        short_name: "Calculate",
        description: "Use financial calculators",
        url: CORE_FEATURE_PATH,
      },
      {
        name: "View Pricing",
        short_name: "Pricing",
        description: "See subscription plans",
        url: "/pricing",
      },
      {
        name: "Contact Us",
        short_name: "Contact",
        description: "Get in touch with our support team",
        url: "/contact",
      },
    ],
    related_applications: [
      {
        platform: "webapp",
        url: "https://example.com/manifest.json",
      },
    ],
    prefer_related_applications: false,
  };
}
