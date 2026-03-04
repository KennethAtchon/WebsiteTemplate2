/**
 * Payment Success Interactive Component - Client Component
 *
 * Handles interactive parts of payment success page: URL parameter parsing and conditional rendering
 */

"use client";

import { useSearchParams } from "next/navigation";
import { OrderCreator } from "@/features/payments/components/success/order-creator";
import { SubscriptionSuccess } from "@/features/payments/components/success/subscription-success";
import { OrderSuccess } from "@/features/payments/components/success/order-success";

export function PaymentSuccessInteractive() {
  const searchParams = useSearchParams();

  // Read directly from searchParams instead of storing in state
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const orderId = searchParams.get("order_id");
  const paymentType = type === "subscription" ? "subscription" : "order";

  // Show OrderCreator for one-time orders if we don't have an order_id yet
  const needsOrderCreation =
    paymentType === "order" && sessionId !== null && orderId === null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Order Creator for one-time purchases */}
      {needsOrderCreation && <OrderCreator sessionId={sessionId} />}

      {/* Render appropriate success component only when not creating order */}
      {!needsOrderCreation && (
        <>
          {paymentType === "subscription" ? (
            <SubscriptionSuccess sessionId={sessionId} />
          ) : (
            <OrderSuccess sessionId={sessionId} orderId={orderId} />
          )}
        </>
      )}
    </div>
  );
}
