import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

function ApiDocumentationPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('metadata_api_documentation_title')}</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('api_getting_started_title')}</CardTitle>
              <CardDescription>{t('api_getting_started_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`curl -X GET https://api.example.com/v1/calculator \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('api_authentication_title')}</CardTitle>
              <CardDescription>{t('api_authentication_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('api_authentication_content')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('api_endpoints_title')}</CardTitle>
              <CardDescription>{t('api_endpoints_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="font-mono text-sm">GET /api/calculator</li>
                <li className="font-mono text-sm">POST /api/calculator/calculate</li>
                <li className="font-mono text-sm">GET /api/user/profile</li>
                <li className="font-mono text-sm">GET /api/subscriptions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/api-documentation')({
  component: ApiDocumentationPage,
})
