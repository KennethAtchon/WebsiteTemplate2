import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

function AccessibilityPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('metadata_accessibility_title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('accessibility_commitment_title')}</h2>
            <p>{t('accessibility_commitment_content')}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('accessibility_features_title')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('accessibility_feature_1')}</li>
              <li>{t('accessibility_feature_2')}</li>
              <li>{t('accessibility_feature_3')}</li>
              <li>{t('accessibility_feature_4')}</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('accessibility_feedback_title')}</h2>
            <p>{t('accessibility_feedback_content')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/accessibility')({
  component: AccessibilityPage,
})
