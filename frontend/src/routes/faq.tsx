import { createFileRoute } from '@tanstack/react-router'
import FaqPageClient from '@/features/faq/components/faq-page-client'
import FaqHero from '@/features/faq/components/faq-hero'

function FaqPage() {
  return (
    <div className="min-h-screen">
      <FaqHero />
      <FaqPageClient />
    </div>
  )
}

export const Route = createFileRoute('/faq')({
  component: FaqPage,
})
