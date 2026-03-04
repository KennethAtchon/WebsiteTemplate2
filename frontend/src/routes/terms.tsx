import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('metadata_terms_title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">
            {t('terms_last_updated')}: {new Date().toLocaleDateString()}
          </p>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('terms_section_1_title')}</h2>
            <p>{t('terms_section_1_content')}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('terms_section_2_title')}</h2>
            <p>{t('terms_section_2_content')}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('terms_section_3_title')}</h2>
            <p>{t('terms_section_3_content')}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('terms_section_4_title')}</h2>
            <p>{t('terms_section_4_content')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})
