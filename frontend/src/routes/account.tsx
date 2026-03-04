import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { ProfileEditor } from '@/features/account/components/profile-editor'
import { SubscriptionManagement } from '@/features/account/components/subscription-management'
import { UsageDashboard } from '@/features/account/components/usage-dashboard'
import { useTranslation } from 'react-i18next'

function AccountPage() {
  const { t } = useTranslation()

  return (
    <AuthGuard>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">{t('metadata_account_title')}</h1>
        <div className="grid gap-8">
          <ProfileEditor />
          <SubscriptionManagement />
          <UsageDashboard />
        </div>
      </div>
    </AuthGuard>
  )
}

export const Route = createFileRoute('/account')({
  component: AccountPage,
})
