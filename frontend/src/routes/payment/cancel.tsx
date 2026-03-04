import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Link } from '@tanstack/react-router'
import { XCircle } from 'lucide-react'

function PaymentCancelPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t('payment_cancelled_title')}</CardTitle>
          <CardDescription>{t('payment_cancelled_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('payment_cancelled_message')}
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">{t('payment_go_home')}</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/pricing">{t('payment_try_again')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/payment/cancel')({
  component: PaymentCancelPage,
})
