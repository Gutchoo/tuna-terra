'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usePropertyFinancialModeling } from '@/lib/contexts/PropertyFinancialModelingContext'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { DollarSign, Percent, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ExpensesTabProps {
  canEdit?: boolean
}

export function ExpensesTab({ canEdit = true }: ExpensesTabProps) {
  const { state, updateAssumption } = usePropertyFinancialModeling()
  const { assumptions, results, isSaving } = state

  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false)

  // Get current operating expense type
  const expenseType = assumptions.operatingExpenseType || 'percentage'

  // Get current year values (first array position)
  const operatingExpenses = assumptions.operatingExpenses[0] || 0
  const propertyTaxes = assumptions.propertyTaxes[0] || 0
  const insurance = assumptions.insurance[0] || 0
  const maintenance = assumptions.maintenance[0] || 0
  const propertyManagement = assumptions.propertyManagement[0] || 0
  const utilities = assumptions.utilities[0] || 0
  const otherExpenses = assumptions.otherExpenses[0] || 0

  // Calculate Effective Gross Income for percentage-based expenses
  const rentalIncome = assumptions.potentialRentalIncome[0] || 0
  const otherIncome = assumptions.otherIncome[0] || 0
  const vacancyRate = assumptions.vacancyRates[0] || 0
  const grossIncome = rentalIncome + otherIncome
  const vacancyAmount = rentalIncome * vacancyRate
  const effectiveGrossIncome = grossIncome - vacancyAmount

  // Update handlers
  const handleExpenseTypeToggle = () => {
    const newType = expenseType === 'percentage' ? 'dollar' : 'percentage'
    updateAssumption('operatingExpenseType', newType)
  }

  const handleOperatingExpensesChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    updateAssumption('operatingExpenses', Array(30).fill(numValue))
  }

  const handleCategoryChange = (category: 'propertyTaxes' | 'insurance' | 'maintenance' | 'propertyManagement' | 'utilities' | 'otherExpenses', value: string) => {
    const numValue = parseFloat(value) || 0
    updateAssumption(category, Array(30).fill(numValue))
  }

  // Calculate total operating expenses
  let totalOpEx = 0
  if (expenseType === 'percentage') {
    totalOpEx = effectiveGrossIncome * (operatingExpenses / 100)
  } else if (expenseType === 'dollar') {
    if (showCategoryBreakdown) {
      totalOpEx = propertyTaxes + insurance + maintenance + propertyManagement + utilities + otherExpenses
    } else {
      totalOpEx = operatingExpenses
    }
  }

  // Get OpEx ratio from results
  const opExRatio = effectiveGrossIncome > 0 ? (totalOpEx / effectiveGrossIncome) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Operating Expenses</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpenseTypeToggle}
            disabled={!canEdit}
            className="gap-2"
          >
            {expenseType === 'percentage' ? (
              <>
                <Percent className="h-4 w-4" />
                Percentage
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Dollar Amount
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Main Operating Expenses Input */}
          {!showCategoryBreakdown && (
            <div className="space-y-2">
              <Label htmlFor="operating-expenses" className="flex items-center gap-2">
                {expenseType === 'percentage' ? (
                  <Percent className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
                Total Operating Expenses (Annual)
              </Label>
              <div className="relative">
                <Input
                  id="operating-expenses"
                  type="number"
                  min="0"
                  step={expenseType === 'percentage' ? '1' : '1000'}
                  value={operatingExpenses || ''}
                  onChange={(e) => handleOperatingExpensesChange(e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className={expenseType === 'percentage' ? 'text-right pr-8' : 'text-right'}
                />
                {expenseType === 'percentage' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenseType === 'percentage'
                  ? 'Percentage of Effective Gross Income'
                  : 'Total annual operating expenses'}
              </p>
            </div>
          )}

          {/* Category Breakdown Toggle */}
          {expenseType === 'dollar' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
              disabled={!canEdit}
              className="w-full gap-2"
            >
              {showCategoryBreakdown ? 'Hide' : 'Show'} Category Breakdown
              <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryBreakdown ? 'rotate-180' : ''}`} />
            </Button>
          )}

          {/* Category Breakdown Inputs */}
          {showCategoryBreakdown && expenseType === 'dollar' && (
            <div className="space-y-4 pt-4 border-t">
              {/* Property Taxes */}
              <div className="space-y-2">
                <Label htmlFor="property-taxes" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Property Taxes
                </Label>
                <Input
                  id="property-taxes"
                  type="number"
                  min="0"
                  step="100"
                  value={propertyTaxes || ''}
                  onChange={(e) => handleCategoryChange('propertyTaxes', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>

              {/* Insurance */}
              <div className="space-y-2">
                <Label htmlFor="insurance" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Insurance
                </Label>
                <Input
                  id="insurance"
                  type="number"
                  min="0"
                  step="100"
                  value={insurance || ''}
                  onChange={(e) => handleCategoryChange('insurance', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>

              {/* Maintenance */}
              <div className="space-y-2">
                <Label htmlFor="maintenance" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Maintenance & Repairs
                </Label>
                <Input
                  id="maintenance"
                  type="number"
                  min="0"
                  step="100"
                  value={maintenance || ''}
                  onChange={(e) => handleCategoryChange('maintenance', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>

              {/* Property Management */}
              <div className="space-y-2">
                <Label htmlFor="property-management" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Property Management
                </Label>
                <Input
                  id="property-management"
                  type="number"
                  min="0"
                  step="100"
                  value={propertyManagement || ''}
                  onChange={(e) => handleCategoryChange('propertyManagement', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>

              {/* Utilities */}
              <div className="space-y-2">
                <Label htmlFor="utilities" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Utilities
                </Label>
                <Input
                  id="utilities"
                  type="number"
                  min="0"
                  step="100"
                  value={utilities || ''}
                  onChange={(e) => handleCategoryChange('utilities', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>

              {/* Other Expenses */}
              <div className="space-y-2">
                <Label htmlFor="other-expenses" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Other Expenses
                </Label>
                <Input
                  id="other-expenses"
                  type="number"
                  min="0"
                  step="100"
                  value={otherExpenses || ''}
                  onChange={(e) => handleCategoryChange('otherExpenses', e.target.value)}
                  disabled={!canEdit}
                  placeholder="0"
                  className="text-right"
                />
              </div>
            </div>
          )}
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
          <p className="text-xs text-muted-foreground mb-1">Total Operating Expenses</p>
          <p className="text-xl font-bold">
            {formatCurrency(totalOpEx)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Annual OpEx
          </p>
        </Card>

        <Card className="p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">OpEx Ratio</p>
          <p className="text-xl font-bold">
            {formatPercentage(opExRatio / 100)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            OpEx / EGI
          </p>
        </Card>
      </div>
    </div>
  )
}
