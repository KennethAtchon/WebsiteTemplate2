import { createFileRoute } from '@tanstack/react-router'
import { StripePaymentFallback } from '@/features/payments/components/stripe-payment-fallback'

function PaymentPage() {
  return (
    <div className="container mx-auto py-12">
      <StripePaymentFallback />
    </div>
  )
}

export const Route = createFileRoute('/payment/')({
  component: PaymentPage,
})
