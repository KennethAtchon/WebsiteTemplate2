import { createFileRoute } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("home.title", "Home")} | WebsiteTemplate2</title>
        <meta
          name="description"
          content={t("home.description", "Welcome to WebsiteTemplate2")}
        />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t("home.welcome", "Welcome to WebsiteTemplate2")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("home.subtitle", "Vite + React + TanStack Router + Hono Backend")}
          </p>
        </div>
      </div>
    </>
  );
}
