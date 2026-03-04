/**
 * Checkout Interactive Component - Client Component
 *
 * Handles interactive parts of checkout page: URL parameter parsing, routing logic, and checkout components
 */

"use client";

import { useEffect, useState, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/shared/contexts/app-context";
import { useTranslations } from "next-intl";
import {
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/shared/constants/subscription.constants";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useQueryFetcher } from "@/shared/hooks/use-query-fetcher";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  getProductById,
  DEFAULT_PRODUCT,
} from "@/shared/constants/order.constants";
import { SubscriptionCheckout } from "@/features/payments/components/checkout/subscription-checkout";
import { OrderCheckout } from "@/features/payments/components/checkout/order-checkout";

interface OrderItem {
  name: string;
  description: string;
  price: number; // in dollars
  quantity: number;
  productId?: string;
}

export function CheckoutInteractive() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useApp();
  const subscriptionFetcher = useQueryFetcher<{
    tier: string | null;
    billingCycle: "monthly" | "annual" | null;
  }>();
  const trialFetcher = useQueryFetcher<{
    isEligible: boolean;
    hasUsedFreeTrial: boolean;
    isInTrial: boolean;
  }>();
  const [checkoutType, setCheckoutType] = useState<
    "subscription" | "order" | null
  >(null);

  const { data: currentSubscription } = useQuery({
    queryKey: queryKeys.api.currentSubscription(),
    queryFn: () => subscriptionFetcher("/api/subscriptions/current"),
    enabled: !!user,
  });

  const { data: trialEligibilityData } = useQuery({
    queryKey: queryKeys.api.trialEligibility(),
    queryFn: () => trialFetcher("/api/subscriptions/trial-eligibility"),
    enabled: !!user && checkoutType === "subscription",
  });

  const trialEligible = trialEligibilityData?.isEligible ?? false;
  const showTrialBanner = checkoutType === "subscription" && trialEligible;

  // Subscription state
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  // Order state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      name: DEFAULT_PRODUCT.name,
      description: DEFAULT_PRODUCT.description,
      price: DEFAULT_PRODUCT.price,
      quantity: 1,
      productId: DEFAULT_PRODUCT.id,
    },
  ]);

  useEffect(() => {
    if (!user) {
      // Preserve all query parameters when redirecting
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = encodeURIComponent(currentUrl);

      // Check if this is a subscription checkout (Start Free Trial)
      const tierParam = searchParams.get("tier");
      const billingParam = searchParams.get("billing");

      // For subscription checkouts, redirect to sign-up (new users)
      // For order checkouts, redirect to sign-in (existing users more likely)
      if (tierParam || billingParam) {
        router.push(`/sign-up?redirect_url=${redirectUrl}`);
      } else {
        router.push(`/sign-in?redirect_url=${redirectUrl}`);
      }
      return;
    }

    // Check if this is an order checkout (has product param or order type)
    const productIdParam = searchParams.get("product");
    const orderTypeParam = searchParams.get("type");
    const itemParam = searchParams.get("item");
    const priceParam = searchParams.get("price");
    const quantityParam = searchParams.get("quantity");

    // Compute all values first, then update state in a single batch
    if (
      productIdParam ||
      orderTypeParam === "order" ||
      (itemParam && priceParam)
    ) {
      // This is an order checkout - compute order items first
      let computedOrderItems: OrderItem[] = [
        {
          name: DEFAULT_PRODUCT.name,
          description: DEFAULT_PRODUCT.description,
          price: DEFAULT_PRODUCT.price,
          quantity: 1,
          productId: DEFAULT_PRODUCT.id,
        },
      ];

      if (productIdParam) {
        const product = getProductById(productIdParam);
        if (product) {
          const parsedQuantity = quantityParam
            ? parseInt(quantityParam, 10)
            : NaN;
          const quantity =
            !isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
          computedOrderItems = [
            {
              name: product.name,
              description: product.description,
              price: product.price,
              quantity: quantity,
              productId: product.id,
            },
          ];
        }
      } else if (itemParam && priceParam) {
        const price = parseFloat(priceParam);
        const parsedQuantity = quantityParam
          ? parseInt(quantityParam, 10)
          : NaN;
        const quantity =
          !isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
        if (!isNaN(price) && price > 0) {
          computedOrderItems = [
            {
              name: decodeURIComponent(itemParam),
              description: t("checkout_one_time_purchase"),
              price: price,
              quantity: quantity,
            },
          ];
        }
      }

      // Batch state updates using startTransition to avoid synchronous setState warnings
      startTransition(() => {
        setCheckoutType("order");
        setOrderItems(computedOrderItems);
      });
    } else {
      // This is a subscription checkout
      const tierParam = searchParams.get("tier") as SubscriptionTier;
      const billingParam = searchParams.get("billing") as "monthly" | "annual";

      // Check if user already has a subscription
      if (currentSubscription?.tier) {
        // User already has subscription - redirect to account page
        router.push("/account?message=use-portal");
        return;
      }

      if (tierParam && Object.values(SUBSCRIPTION_TIERS).includes(tierParam)) {
        // Batch state updates using startTransition to avoid synchronous setState warnings
        startTransition(() => {
          setCheckoutType("subscription");
          setTier(tierParam);
          if (billingParam === "monthly" || billingParam === "annual") {
            setBillingCycle(billingParam);
          }
        });
      } else {
        startTransition(() => {
          setCheckoutType("subscription");
        });
        router.push("/pricing");
      }
    }
  }, [searchParams, user, router, t, currentSubscription]);

  if (!checkoutType) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (checkoutType === "subscription" && !tier) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={checkoutType === "subscription" ? "/pricing" : "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {checkoutType === "subscription"
              ? t("payment_cancel_back_to_pricing")
              : t("checkout_back_to_home")}
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {checkoutType === "subscription"
              ? t("checkout_complete_subscription")
              : t("checkout_order_checkout")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {checkoutType === "subscription"
              ? t("checkout_subscription_description")
              : t("checkout_order_description")}
          </p>
        </div>
      </div>

      {/* Free Trial Banner for Subscription Checkouts */}
      {showTrialBanner && (
        <Alert className="mb-8 border-2 border-green-500/30 bg-gradient-to-r from-green-500/15 via-emerald-500/15 to-green-500/15 shadow-lg">
          <Sparkles className="h-5 w-5 text-green-600" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-lg text-foreground mb-1">
                🎉 {t("checkout_day_trial", { days: SUBSCRIPTION_TRIAL_DAYS })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  "common_try_calcpro_risk_free_for_14_days_no_credit_card_required_to"
                )}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 text-base font-bold shadow-md">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("checkout_first_days_free", { days: SUBSCRIPTION_TRIAL_DAYS })}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {checkoutType === "subscription" ? (
        <SubscriptionCheckout
          tier={tier!}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
        />
      ) : (
        <OrderCheckout initialItems={orderItems} />
      )}
    </>
  );
}
