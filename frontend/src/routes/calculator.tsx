import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { MortgageCalculator } from '@/features/calculator/components/mortgage-calculator'
import { LoanCalculator } from '@/features/calculator/components/loan-calculator'
import { InvestmentCalculator } from '@/features/calculator/components/investment-calculator'
import { RetirementCalculator } from '@/features/calculator/components/retirement-calculator'

function CalculatorPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('calculator_page_title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('calculator_page_subtitle')}
        </p>
      </div>
      
      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="mortgage">{t('calculator_mortgage')}</TabsTrigger>
          <TabsTrigger value="loan">{t('calculator_loan')}</TabsTrigger>
          <TabsTrigger value="investment">{t('calculator_investment')}</TabsTrigger>
          <TabsTrigger value="retirement">{t('calculator_retirement')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mortgage">
          <MortgageCalculator />
        </TabsContent>
        
        <TabsContent value="loan">
          <LoanCalculator />
        </TabsContent>
        
        <TabsContent value="investment">
          <InvestmentCalculator />
        </TabsContent>
        
        <TabsContent value="retirement">
          <RetirementCalculator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/calculator')({
  component: CalculatorPage,
})
