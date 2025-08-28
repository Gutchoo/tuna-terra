'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { financialTooltips } from '@/components/calculators/shared/FinancialTooltips'
import { type PropertyAssumptions } from '@/lib/financial-modeling/proforma'

interface KeyMetricsPanelProps {
  assumptions: PropertyAssumptions
  isLoading?: boolean
}

interface MetricCardProps {
  title: string
  value: string
  description: string
  tooltip: string
  isLoading?: boolean
}

function MetricCard({ title, value, description, tooltip, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3.5 w-3.5 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardContent className="pt-2">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-80 p-3">
                  <p className="text-sm leading-relaxed">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function KeyMetricsPanel({ assumptions, isLoading }: KeyMetricsPanelProps) {
  // Calculate derived metrics
  const actualAcquisitionCosts = assumptions.acquisitionCostType === 'percentage' 
    ? assumptions.purchasePrice * (assumptions.acquisitionCosts / 100)
    : assumptions.acquisitionCostType === 'dollar' 
      ? assumptions.acquisitionCosts 
      : 0

  const totalInvestment = assumptions.purchasePrice + actualAcquisitionCosts
  const equityRequired = totalInvestment - assumptions.loanAmount
  // Calculate Year 1 NOI from detailed structure or legacy field
  const calculateYear1NOI = () => {
    if (assumptions.potentialRentalIncome?.[0] && assumptions.potentialRentalIncome[0] > 0) {
      // Use detailed income structure
      const grossIncome = assumptions.potentialRentalIncome[0]
      const vacancyAmount = grossIncome * (assumptions.vacancyRates?.[0] || 0)
      const effectiveGrossIncome = grossIncome - vacancyAmount
      
      let opEx = 0
      if (assumptions.operatingExpenses?.[0] !== undefined) {
        if (assumptions.operatingExpenseType === 'percentage') {
          // Operating expenses as percentage of effective gross income (after vacancy)
          opEx = effectiveGrossIncome * ((assumptions.operatingExpenses[0] || 0) / 100)
        } else {
          opEx = assumptions.operatingExpenses[0] || 0
        }
      }
      
      return effectiveGrossIncome - opEx
    } else if (assumptions.year1NOI) {
      // Fallback to legacy field
      return assumptions.year1NOI
    }
    return 0
  }

  const year1NOI = calculateYear1NOI()
  const goingInCapRate = year1NOI > 0 && assumptions.purchasePrice > 0 
    ? (year1NOI / assumptions.purchasePrice) * 100 
    : 0
  const ltvRatio = assumptions.purchasePrice > 0 
    ? (assumptions.loanAmount / assumptions.purchasePrice) * 100 
    : 0

  const formatCurrency = (value: number) => {
    if (value === 0) return '$0'
    return `$${value.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    if (value === 0 || !isFinite(value)) return 'NaN%'
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Investment"
        value={formatCurrency(totalInvestment)}
        description="Purchase + Costs"
        tooltip={financialTooltips.totalInvestment}
        isLoading={isLoading}
      />
      <MetricCard
        title="Equity Required"
        value={formatCurrency(equityRequired)}
        description="Net Down"
        tooltip={financialTooltips.equityRequired}
        isLoading={isLoading}
      />
      <MetricCard
        title="Going-in Cap Rate"
        value={formatPercentage(goingInCapRate)}
        description="NOI / Purchase Price"
        tooltip={financialTooltips.goingInCapRate}
        isLoading={isLoading}
      />
      <MetricCard
        title="LTV Ratio"
        value={formatPercentage(ltvRatio)}
        description="Loan to Value"
        tooltip={financialTooltips.ltvRatio}
        isLoading={isLoading}
      />
    </div>
  )
}