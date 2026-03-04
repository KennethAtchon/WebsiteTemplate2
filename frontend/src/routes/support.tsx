import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Link } from '@tanstack/react-router'
import { MessageCircle, Mail, Book, HelpCircle } from 'lucide-react'

function SupportPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('metadata_support_title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('support_page_subtitle')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <MessageCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle>{t('support_live_chat')}</CardTitle>
            <CardDescription>{t('support_live_chat_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">{t('support_start_chat')}</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Mail className="h-12 w-12 text-primary mb-4" />
            <CardTitle>{t('support_email')}</CardTitle>
            <CardDescription>{t('support_email_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/contact">{t('support_contact_us')}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Book className="h-12 w-12 text-primary mb-4" />
            <CardTitle>{t('support_documentation')}</CardTitle>
            <CardDescription>{t('support_documentation_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/api-documentation">{t('support_view_docs')}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <HelpCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle>{t('support_faq')}</CardTitle>
            <CardDescription>{t('support_faq_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/faq">{t('support_view_faq')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/support')({
  component: SupportPage,
})
