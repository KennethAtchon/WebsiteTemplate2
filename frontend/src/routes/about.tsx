import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('metadata_about_title')}</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-6">
            {t('about_page_intro')}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('about_our_mission')}</h2>
          <p>{t('about_mission_description')}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('about_our_story')}</h2>
          <p>{t('about_story_description')}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('about_our_values')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('about_value_1')}</li>
            <li>{t('about_value_2')}</li>
            <li>{t('about_value_3')}</li>
            <li>{t('about_value_4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/about')({
  component: AboutPage,
})
