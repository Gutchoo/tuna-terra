'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PropertyFinancials } from '@/lib/supabase'

interface ExpensesPanelProps {
  propertyId: string | null
  financials: PropertyFinancials | null
  isVisible: boolean
  onToggleVisibility: () => void
}

export function ExpensesPanel({
  propertyId,
  financials,
  isVisible,
  onToggleVisibility,
}: ExpensesPanelProps) {
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
          Show Expenses
        </Button>
      </div>
    )
  }

  if (!propertyId) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
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
            Select a property to view expenses
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
  const propertyTaxes = financials?.property_taxes?.[0] || 0
  const insurance = financials?.insurance?.[0] || 0
  const maintenance = financials?.maintenance?.[0] || 0
  const propertyManagement = financials?.property_management?.[0] || 0
  const utilities = financials?.utilities?.[0] || 0
  const otherExpenses = financials?.other_expenses?.[0] || 0

  // Calculate totals
  const totalAnnualExpenses = propertyTaxes + insurance + maintenance + propertyManagement + utilities + otherExpenses
  const totalMonthlyExpenses = totalAnnualExpenses / 12

  // Calculate effective gross income for operating ratio
  const rentalIncome = financials?.potential_rental_income?.[0] || 0
  const otherIncome = financials?.other_income?.[0] || 0
  const vacancyRate = financials?.vacancy_rates?.[0] || 0
  const grossScheduledIncome = rentalIncome + otherIncome
  const vacancyAmount = rentalIncome * (vacancyRate / 100)
  const effectiveGrossIncome = grossScheduledIncome - vacancyAmount

  const operatingRatio = effectiveGrossIncome > 0
    ? (totalAnnualExpenses / effectiveGrossIncome) * 100
    : 0

  const expenseItems = [
    { label: 'Property Taxes', annual: propertyTaxes },
    { label: 'Insurance', annual: insurance },
    { label: 'Maintenance', annual: maintenance },
    { label: 'Property Management', annual: propertyManagement },
    { label: 'Utilities', annual: utilities },
    { label: 'Other', annual: otherExpenses },
  ].filter(item => item.annual > 0) // Only show categories with values

  const hasFinancials = financials && totalAnnualExpenses > 0

  return (
    <Card className="h-full flex flex-col py-3 gap-3">
      <CardHeader className="shrink-0">
        <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {!hasFinancials ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No expense data available
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b text-xs font-medium text-muted-foreground">
              <div className="col-span-2">Category</div>
              <div className="text-right">Monthly</div>
              <div className="text-right">Annual</div>
            </div>

            {/* Expense Items */}
            {expenseItems.map((item, index) => {
              const monthly = item.annual / 12
              const percentage = effectiveGrossIncome > 0
                ? (item.annual / effectiveGrossIncome) * 100
                : 0

              return (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 text-xs font-mono"
                >
                  <div className="col-span-2 font-medium truncate">
                    {item.label}
                  </div>
                  <div className="text-right">
                    {formatCurrency(monthly)}
                  </div>
                  <div className="text-right">
                    {formatCurrency(item.annual)}
                  </div>
                </div>
              )
            })}

            {/* Total Row */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t text-xs font-bold font-mono">
              <div className="col-span-2">Total Expenses</div>
              <div className="text-right">{formatCurrency(totalMonthlyExpenses)}</div>
              <div className="text-right">{formatCurrency(totalAnnualExpenses)}</div>
            </div>

            {/* Operating Ratio */}
            {operatingRatio > 0 && (
              <div className="pt-2 mt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Operating Ratio</span>
                  <span className="font-mono font-medium">
                    {operatingRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
