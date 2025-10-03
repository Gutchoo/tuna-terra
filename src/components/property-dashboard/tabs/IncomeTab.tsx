'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePropertyFinancialModeling } from '@/lib/contexts/PropertyFinancialModelingContext'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { DollarSign, Percent } from 'lucide-react'

interface IncomeTabProps {
  canEdit?: boolean
}

export function IncomeTab({ canEdit = true }: IncomeTabProps) {
  const { state, updateAssumption } = usePropertyFinancialModeling()
  const { assumptions, results, isSaving } = state

  // Get current year values (first array position)
  const rentalIncome = assumptions.potentialRentalIncome[0] || 0
  const otherIncome = assumptions.otherIncome[0] || 0
  const vacancyRate = (assumptions.vacancyRates[0] || 0) * 100 // Convert to percentage

  // Update handlers - convert single value to 30-year array
  const handleRentalIncomeChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    updateAssumption('potentialRentalIncome', Array(30).fill(numValue))
  }

  const handleOtherIncomeChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    updateAssumption('otherIncome', Array(30).fill(numValue))
  }

  const handleVacancyRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    updateAssumption('vacancyRates', Array(30).fill(numValue / 100)) // Convert to decimal
  }

  // Calculate metrics
  const grossIncome = rentalIncome + otherIncome
  const vacancyAmount = rentalIncome * (vacancyRate / 100)
  const effectiveGrossIncome = grossIncome - vacancyAmount

  // Get NOI from results if available
  const year1NOI = results?.annualCashflows?.[0]?.noi || 0

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Income Sources</h3>
        <div className="space-y-4">
          {/* Rental Income */}
          <div className="space-y-2">
            <Label htmlFor="rental-income" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Potential Rental Income (Annual)
            </Label>
            <Input
              id="rental-income"
              type="number"
              min="0"
              step="1000"
              value={rentalIncome || ''}
              onChange={(e) => handleRentalIncomeChange(e.target.value)}
              disabled={!canEdit}
              placeholder="0"
              className="text-right"
            />
          </div>

          {/* Other Income */}
          <div className="space-y-2">
            <Label htmlFor="other-income" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Other Income (Annual)
            </Label>
            <Input
              id="other-income"
              type="number"
              min="0"
              step="1000"
              value={otherIncome || ''}
              onChange={(e) => handleOtherIncomeChange(e.target.value)}
              disabled={!canEdit}
              placeholder="0"
              className="text-right"
            />
            <p className="text-xs text-muted-foreground">
              Parking, laundry, vending, etc.
            </p>
          </div>

          {/* Vacancy Rate */}
          <div className="space-y-2">
            <Label htmlFor="vacancy-rate" className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              Vacancy Rate
            </Label>
            <div className="relative">
              <Input
                id="vacancy-rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={vacancyRate || ''}
                onChange={(e) => handleVacancyRateChange(e.target.value)}
                disabled={!canEdit}
                placeholder="0"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Expected percentage of rental income lost to vacancy
            </p>
          </div>
        </div>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            Saving...
          </div>
        )}
      </Card>

      {/* Mini Metrics Preview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">Effective Gross Income</p>
          <p className="text-xl font-bold">
            {formatCurrency(effectiveGrossIncome)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gross Income - Vacancy
          </p>
        </Card>

        <Card className="p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">Year 1 NOI</p>
          <p className="text-xl font-bold">
            {year1NOI > 0 ? formatCurrency(year1NOI) : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            EGI - Operating Expenses
          </p>
        </Card>
      </div>
    </div>
  )
}
