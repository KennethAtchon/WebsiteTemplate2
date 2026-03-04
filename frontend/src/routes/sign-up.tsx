import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

function SignUpPage() {
  const { t } = useTranslation()
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate({ to: '/account' })
    }
  }, [user, navigate])

  return (
    <div className="container mx-auto py-12 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{t('navigation_signUp')}</CardTitle>
          <CardDescription>{t('auth_sign_up_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={signInWithGoogle} 
            className="w-full"
            size="lg"
          >
            {t('auth_sign_up_with_google')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})
