import { createFileRoute, useSearch } from '@tanstack/react-router'
import { OrderSuccess } from '@/features/payments/components/success/order-success'
import { SubscriptionSuccess } from '@/features/payments/components/success/subscription-success'

function PaymentSuccessPage() {
  const search = useSearch({ from: '/payment/success' })
  const type = (search as any)?.type || 'subscription'

  return (
    <div className="container mx-auto py-12">
      {type === 'subscription' ? <SubscriptionSuccess /> : <OrderSuccess />}
    </div>
  )
}

export const Route = createFileRoute('/payment/success')({
  component: PaymentSuccessPage,
})
