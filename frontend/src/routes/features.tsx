import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Calculator, TrendingUp, Shield, Zap, Globe, Users } from 'lucide-react'

function FeaturesPage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Calculator,
      title: t('features_calculators_title'),
      description: t('features_calculators_description'),
    },
    {
      icon: TrendingUp,
      title: t('features_analytics_title'),
      description: t('features_analytics_description'),
    },
    {
      icon: Shield,
      title: t('features_security_title'),
      description: t('features_security_description'),
    },
    {
      icon: Zap,
      title: t('features_performance_title'),
      description: t('features_performance_description'),
    },
    {
      icon: Globe,
      title: t('features_multilingual_title'),
      description: t('features_multilingual_description'),
    },
    {
      icon: Users,
      title: t('features_support_title'),
      description: t('features_support_description'),
    },
  ]

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('metadata_features_title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('features_page_subtitle')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})
