import { createFileRoute, useSearch } from '@tanstack/react-router'
import { SubscriptionCheckout } from '@/features/payments/components/checkout/subscription-checkout'
import { OrderCheckout } from '@/features/payments/components/checkout/order-checkout'

function CheckoutPage() {
  const search = useSearch({ from: '/checkout' })
  const type = (search as any)?.type || 'subscription'

  return (
    <div className="container mx-auto py-12">
      {type === 'subscription' ? <SubscriptionCheckout /> : <OrderCheckout />}
    </div>
  )
}

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})
