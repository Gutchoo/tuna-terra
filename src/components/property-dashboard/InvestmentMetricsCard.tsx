'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Percent, Calculator, Target } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { usePropertyFinancialModeling } from '@/lib/contexts/PropertyFinancialModelingContext'

interface InvestmentMetricsCardProps {
  metrics?: {
    irr: number | null
    cashOnCash: number | null
    year1NOI: number | null
    dscr: number | null
    equityMultiple: number | null
    capRate?: number | null
  }
  isCalculating?: boolean
  useContext?: boolean // If true, get metrics from context instead of props
}

export function InvestmentMetricsCard({
  metrics: propMetrics,
  isCalculating: propIsCalculating = false,
  useContext = false,
}: InvestmentMetricsCardProps) {
  // If useContext is true, get metrics from PropertyFinancialModelingContext
  const contextData = useContext ? usePropertyFinancialModeling() : null
  const contextResults = contextData?.state.results
  const contextIsCalculating = contextData?.state.isLoading || false

  // Determine which metrics to use
  const metrics = useContext && contextResults ? {
    irr: contextResults.irr || null,
    cashOnCash: contextResults.averageCashOnCash || null,
    year1NOI: contextResults.annualCashflows[0]?.noi || null,
    dscr: contextResults.annualCashflows[0]?.noi && contextResults.annualCashflows[0]?.debtService
      ? contextResults.annualCashflows[0].noi / contextResults.annualCashflows[0].debtService
      : null,
    equityMultiple: contextResults.equityMultiple || null,
  } : propMetrics

  const isCalculating = useContext ? contextIsCalculating : propIsCalculating
  const metricCards = [
    {
      label: 'IRR',
      value: metrics?.irr,
      icon: TrendingUp,
      format: 'percentage',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Cash-on-Cash',
      value: metrics?.cashOnCash,
      icon: Percent,
      format: 'percentage',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Year 1 NOI',
      value: metrics?.year1NOI,
      icon: DollarSign,
      format: 'currency',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'DSCR',
      value: metrics?.dscr,
      icon: Calculator,
      format: 'decimal',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Equity Multiple',
      value: metrics?.equityMultiple,
      icon: Target,
      format: 'decimal',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  const formatValue = (value: number | null | undefined, format: string) => {
    if (value === null || value === undefined) return '--'

    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      case 'decimal':
        return value.toFixed(2) + 'x'
      default:
        return value.toFixed(2)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Investment Metrics</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isCalculating
            ? 'Calculating metrics...'
            : metrics
            ? 'Real-time financial performance indicators'
            : 'Enter property financials to see metrics'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {metric.label}
                    </span>
                    <div className={`p-1.5 rounded ${metric.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${metric.color}`} />
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        metric.value !== null && metric.value !== undefined
                          ? metric.color
                          : 'text-muted-foreground'
                      }`}
                    >
                      {isCalculating ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        formatValue(metric.value, metric.format)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!metrics && !isCalculating && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              Complete the financial analysis sections above to calculate investment metrics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
