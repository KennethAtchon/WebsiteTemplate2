import { createFileRoute } from '@tanstack/react-router'
import { PricingCard } from '@/shared/components/saas/PricingCard'
import { useTranslation } from 'react-i18next'

function PricingPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('metadata_pricing_title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('pricing_page_subtitle')}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard tier={{ id: 'free', name: 'Free', price: 0, features: { maxCalculationsPerMonth: 10, calculationTypes: ['basic'] } }} />
        <PricingCard tier={{ id: 'premium', name: 'Premium', price: 9.99, features: { maxCalculationsPerMonth: 100, calculationTypes: ['basic', 'advanced'] } }} featured />
        <PricingCard tier={{ id: 'enterprise', name: 'Enterprise', price: 29.99, features: { maxCalculationsPerMonth: -1, calculationTypes: ['basic', 'advanced', 'pro'] } }} />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})
