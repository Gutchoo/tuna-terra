'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingDown, CreditCard, TrendingUp } from 'lucide-react'
import { IncomeTab } from './tabs/IncomeTab'
import { ExpensesTab } from './tabs/ExpensesTab'
import { FinancingTab } from './tabs/FinancingTab'
import { ExitTab } from './tabs/ExitTab'

interface FinancialAnalysisTabsProps {
  propertyId: string
  canEdit?: boolean
}

export function FinancialAnalysisTabs({
  propertyId,
  canEdit = true,
}: FinancialAnalysisTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter current-year financial data for investment analysis
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="income" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="financing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Financing</span>
            </TabsTrigger>
            <TabsTrigger value="exit" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="mt-6">
            <IncomeTab canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpensesTab canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="financing" className="mt-6">
            <FinancingTab canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="exit" className="mt-6">
            <ExitTab canEdit={canEdit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
