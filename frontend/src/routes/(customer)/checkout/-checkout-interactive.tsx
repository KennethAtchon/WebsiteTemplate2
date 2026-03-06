import { useEffect, useState, startTransition } from "react";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/shared/contexts/app-context";
import { useTranslation } from "react-i18next";
import {
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
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
  price: number;
  quantity: number;
  productId?: string;
}

export function CheckoutInteractive() {
  const { t } = useTranslation();
  const search = useSearch({ from: "/(customer)/checkout" }) as Record<
    string,
    string | undefined
  >;
  const navigate = useNavigate();
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

  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

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
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = encodeURIComponent(currentUrl);

      const tierParam = search.tier;
      const billingParam = search.billing;

      if (tierParam || billingParam) {
        navigate({ to: "/sign-up", search: { redirect_url: redirectUrl } });
      } else {
        navigate({ to: "/sign-in", search: { redirect_url: redirectUrl } });
      }
      return;
    }

    const productIdParam = search.product;
    const orderTypeParam = search.type;
    const itemParam = search.item;
    const priceParam = search.price;
    const quantityParam = search.quantity;

    if (
      productIdParam ||
      orderTypeParam === "order" ||
      (itemParam && priceParam)
    ) {
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
            ? Number.parseInt(quantityParam, 10)
            : NaN;
          const quantity =
            !Number.isNaN(parsedQuantity) && parsedQuantity > 0
              ? parsedQuantity
              : 1;
          computedOrderItems = [
            {
              name: product.name,
              description: product.description,
              price: product.price,
              quantity,
              productId: product.id,
            },
          ];
        }
      } else if (itemParam && priceParam) {
        const price = Number.parseFloat(priceParam);
        const parsedQuantity = quantityParam
          ? Number.parseInt(quantityParam, 10)
          : NaN;
        const quantity =
          !Number.isNaN(parsedQuantity) && parsedQuantity > 0
            ? parsedQuantity
            : 1;
        if (!Number.isNaN(price) && price > 0) {
          computedOrderItems = [
            {
              name: decodeURIComponent(itemParam),
              description: t("checkout_one_time_purchase"),
              price,
              quantity,
            },
          ];
        }
      }

      startTransition(() => {
        setCheckoutType("order");
        setOrderItems(computedOrderItems);
      });
    } else {
      const tierParam = search.tier as SubscriptionTier | undefined;
      const billingParam = search.billing as "monthly" | "annual" | undefined;

      if (currentSubscription?.tier) {
        navigate({ to: "/account", search: { message: "use-portal" } });
        return;
      }

      if (tierParam && Object.values(SUBSCRIPTION_TIERS).includes(tierParam)) {
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
        navigate({ to: "/pricing" });
      }
    }
  }, [search, user, navigate, t, currentSubscription]);

  if (!checkoutType || (checkoutType === "subscription" && !tier)) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={checkoutType === "subscription" ? "/pricing" : "/"}>
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

      {showTrialBanner && (
        <Alert className="mb-8 border-2 border-green-500/30 bg-gradient-to-r from-green-500/15 via-emerald-500/15 to-green-500/15 shadow-lg">
          <Sparkles className="h-5 w-5 text-green-600" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-lg text-foreground mb-1">
                {t("checkout_day_trial", { days: SUBSCRIPTION_TRIAL_DAYS })}
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

      {checkoutType === "subscription" && tier ? (
        <SubscriptionCheckout
          tier={tier}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
        />
      ) : checkoutType === "order" ? (
        <OrderCheckout initialItems={orderItems} />
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
