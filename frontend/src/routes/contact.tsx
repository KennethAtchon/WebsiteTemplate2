import { createFileRoute } from '@tanstack/react-router'
import ContactForm from '@/features/contact/components/contact-form'
import ContactInfo from '@/features/contact/components/contact-info'
import { useTranslation } from 'react-i18next'

function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('metadata_contact_title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('contact_page_subtitle')}
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})
