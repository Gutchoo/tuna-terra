'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Minimize2, Maximize2 } from 'lucide-react'
import type { PropertyFinancials } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface IncomePanelProps {
  propertyId: string | null
  financials: PropertyFinancials | null
  isVisible: boolean
  onToggleVisibility: () => void
}

export function IncomePanel({
  propertyId,
  financials,
  isVisible,
  onToggleVisibility,
}: IncomePanelProps) {
  if (!isVisible) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="w-full justify-start"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Show Income
        </Button>
      </div>
    )
  }

  if (!propertyId) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onToggleVisibility}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Select a property to view income
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Extract year 0 values from arrays (current year)
  const rentalIncome = financials?.potential_rental_income?.[0] || 0
  const otherIncome = financials?.other_income?.[0] || 0
  const vacancyRate = financials?.vacancy_rates?.[0] || 0

  // Calculate values
  const grossScheduledIncome = rentalIncome + otherIncome
  const vacancyAmount = rentalIncome * (vacancyRate / 100) // Vacancy applies to rental income only
  const effectiveGrossIncome = grossScheduledIncome - vacancyAmount

  const monthlyRental = rentalIncome / 12
  const monthlyOther = otherIncome / 12
  const monthlyVacancy = vacancyAmount / 12
  const monthlyTotal = effectiveGrossIncome / 12

  const incomeItems = [
    {
      label: 'Rental Income',
      monthly: monthlyRental,
      annual: rentalIncome,
      isDeduction: false
    },
    {
      label: 'Other Income',
      monthly: monthlyOther,
      annual: otherIncome,
      isDeduction: false
    },
    {
      label: 'Vacancy',
      monthly: monthlyVacancy,
      annual: vacancyAmount,
      isDeduction: true
    },
  ]

  const hasFinancials = financials && (rentalIncome > 0 || otherIncome > 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle className="text-sm font-medium">Income</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleVisibility}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {!hasFinancials ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No financial data available
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-2 pb-2 border-b text-xs font-medium text-muted-foreground">
              <div>Category</div>
              <div className="text-right">Monthly</div>
              <div className="text-right">Annual</div>
            </div>

            {/* Income Items */}
            {incomeItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-2 text-xs font-mono"
              >
                <div className={cn(
                  "font-medium",
                  item.isDeduction && "text-muted-foreground"
                )}>
                  {item.label}
                </div>
                <div className={cn(
                  "text-right",
                  item.isDeduction && "text-red-600 dark:text-red-400"
                )}>
                  {item.isDeduction && '('}
                  {formatCurrency(item.monthly)}
                  {item.isDeduction && ')'}
                </div>
                <div className={cn(
                  "text-right",
                  item.isDeduction && "text-red-600 dark:text-red-400"
                )}>
                  {item.isDeduction && '('}
                  {formatCurrency(item.annual)}
                  {item.isDeduction && ')'}
                </div>
              </div>
            ))}

            {/* Total Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs font-bold font-mono">
              <div>Total Income</div>
              <div className="text-right">{formatCurrency(monthlyTotal)}</div>
              <div className="text-right">{formatCurrency(effectiveGrossIncome)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
