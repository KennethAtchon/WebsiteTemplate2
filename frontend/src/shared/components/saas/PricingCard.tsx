/**
 * Pricing Card Component - Modern SaaS Design
 *
 * Reusable pricing card component for displaying subscription tiers with modern SaaS styling.
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import {
  SubscriptionTierConfig,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/shared/constants/subscription.constants";
import { cn } from "@/shared/utils/helpers/utils";
import { useSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { usePortalLink } from "@/shared/hooks/use-portal-link";
import { useApp } from "@/shared/contexts/app-context";
import { useQuery } from "@tanstack/react-query";
import { useQueryFetcher } from "@/shared/hooks/use-query-fetcher";
import { queryKeys } from "@/shared/lib/query-keys";
import { useTranslation } from "react-i18next";

interface PricingCardProps {
  tier: SubscriptionTierConfig;
  tierKey: string;
  isPopular?: boolean;
}

export function PricingCard({
  tier,
  tierKey,
  isPopular = false,
}: PricingCardProps) {
  const { t } = useTranslation();
  const { role } = useSubscription();
  const { portalUrl, isLoading: portalLoading } = usePortalLink();
  const { user } = useApp();
  const hasSubscription = !!role;
  const fetcher = useQueryFetcher<{
    isEligible: boolean;
    hasUsedFreeTrial: boolean;
    isInTrial: boolean;
  }>();

  const { data: trialEligibilityData } = useQuery({
    queryKey: queryKeys.api.trialEligibility(),
    queryFn: () => fetcher("/api/subscriptions/trial-eligibility"),
    enabled: !!user && !hasSubscription,
  });

  const trialEligible = trialEligibilityData?.isEligible ?? false;

  const handleButtonClick = () => {
    if (hasSubscription && portalUrl) {
      // User has subscription - redirect to portal
      window.location.href = portalUrl;
    } else if (!hasSubscription) {
      // User doesn't have subscription - go to checkout for new subscription
      window.location.href = `/checkout?tier=${tierKey}&billing=${tier.billingCycle}`;
    }
  };

  const showTrial =
    trialEligible === true && SUBSCRIPTION_TRIAL_DAYS > 0 && !hasSubscription;

  const buttonText = hasSubscription
    ? t("account_subscription_manage_subscription")
    : showTrial
      ? t("home_hero_cta_start_trial")
      : t("common_get_started");
  const isButtonDisabled = hasSubscription && (!portalUrl || portalLoading);

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-300",
        isPopular
          ? "border-2 border-primary shadow-xl scale-105 bg-gradient-to-br from-primary/5 to-purple-500/5"
          : "border-2 hover:border-primary/50 hover:shadow-lg"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1.5 text-sm font-semibold shadow-lg">
            <Sparkles className="h-3 w-3 mr-1.5" />
            {t("common_most_popular")}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold mb-2">{tier.name}</CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-foreground">
              ${tier.price.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-lg">
              {tier.billingCycle === "monthly"
                ? t("checkout_per_month")
                : t("checkout_per_year")}
            </span>
          </div>
          {tier.billingCycle === "annual" && (
            <p className="text-sm text-muted-foreground">
              (${(tier.price / 12).toFixed(2)}/month)
            </p>
          )}
          {showTrial ? (
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-2 border-green-500/30 px-4 py-1.5 text-sm font-semibold shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {t("checkout_day_trial", { days: SUBSCRIPTION_TRIAL_DAYS })}
              </Badge>
              <p className="text-xs text-green-700 font-medium">
                {t("common_no_credit_card_required")}
              </p>
            </div>
          ) : !hasSubscription ? (
            <p className="text-sm text-muted-foreground pt-1">
              {t("common_no_credit_card_required")}
            </p>
          ) : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-6">
        <ul className="space-y-3.5">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm leading-relaxed">
              {tier.features.maxCalculationsPerMonth === -1 ? (
                <span className="font-semibold">
                  {t("calculator_unlimited")}
                </span>
              ) : (
                <span className="font-semibold">
                  {tier.features.maxCalculationsPerMonth.toLocaleString()}
                </span>
              )}{" "}
              {t("account_subscription_calculations_per_month", {
                count: tier.features.maxCalculationsPerMonth === -1
                    ? 0
                    : tier.features.maxCalculationsPerMonth,
              })}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm leading-relaxed">
              {t("account_subscription_calculator_types", {
                count: tier.features.calculationTypes.length,
              })}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm leading-relaxed">
              {t("account_subscription_export_to", {
                formats: tier.features.exportFormats.join(", ").toUpperCase(),
              })}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm leading-relaxed">
              {t("account_subscription_support_level", {
                level:
                  tier.features.supportLevel.charAt(0).toUpperCase() +
                  tier.features.supportLevel.slice(1),
              })}
            </span>
          </li>
          {tier.features.apiAccess && (
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm leading-relaxed">
                {t("checkout_api_access_included")}
              </span>
            </li>
          )}
          {tier.features.customBranding && (
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm leading-relaxed">
                {t("checkout_custom_branding_available")}
              </span>
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className={cn(
            "w-full h-12 text-base font-semibold transition-all hover:scale-105",
            isPopular &&
              !hasSubscription &&
              "bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg"
          )}
          variant="default"
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
        >
          <span className="flex items-center justify-center gap-2">
            {portalLoading && hasSubscription
              ? t("common_loading_subscriptions")
              : buttonText}
            {!portalLoading && <ArrowRight className="h-4 w-4" />}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
