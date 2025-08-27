'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SelectItem } from '@/components/ui/select'
import { Building, DollarSign, Calculator, TrendingUp, Home } from 'lucide-react'

import { TooltipInput, TooltipSelect, ComboInput, financialTooltips } from '@/components/calculators/shared'
import { SectionNavigationCards } from './SectionNavigationCards'
import { AnimatedTabContent } from './AnimatedTabContent'
import { IncomeSpreadsheet } from './IncomeSpreadsheet'
import { FinancingCard } from './FinancingCard'
import { HoldPeriodSelector } from './HoldPeriodSelector'
import { 
  type PropertyAssumptions, 
  validateAssumptions 
} from '@/lib/financial-modeling/proforma'

interface AssumptionsFormProps {
  assumptions: PropertyAssumptions
  onAssumptionsChange: (assumptions: PropertyAssumptions) => void
  onCalculate: () => void
  isCalculating?: boolean
}

export function AssumptionsForm({
  assumptions,
  onAssumptionsChange,
  onCalculate,
  isCalculating = false
}: AssumptionsFormProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState('property')

  const handlePropertyTypeChange = (value: string) => {
    const type = value as 'residential' | 'commercial' | 'industrial' | ''
    const depreciationYears = type === 'residential' ? 27.5 : type === 'commercial' ? 39 : 39
    updateAssumption('propertyType', type)
    updateAssumption('depreciationYears', depreciationYears)
  }

  const updateAssumption = <K extends keyof PropertyAssumptions>(
    key: K,
    value: PropertyAssumptions[K]
  ) => {
    const updated = { ...assumptions, [key]: value }
    onAssumptionsChange(updated)
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleCalculate = () => {
    const validationErrors = validateAssumptions(assumptions)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors([])
    onCalculate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-1">
              <strong>Please fix the following errors:</strong>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Section Navigation Cards */}
      <SectionNavigationCards 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const sections = [
                { id: 'property', label: 'Property', icon: Home },
                { id: 'income', label: 'Income', icon: DollarSign },
                { id: 'financing', label: 'Financing', icon: Building },
                { id: 'exit', label: 'Exit & Tax', icon: Calculator }
              ]
              const currentSection = sections.find(section => section.id === activeSection)
              const Icon = currentSection?.icon || Home
              return (
                <>
                  <Icon className="w-5 h-5" />
                  {currentSection?.label} Assumptions
                </>
              )
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatedTabContent activeTab={activeSection}>
            {activeSection === 'property' && <PropertyContent assumptions={assumptions} updateAssumption={updateAssumption} handlePropertyTypeChange={handlePropertyTypeChange} />}
            {activeSection === 'income' && (
              <IncomeSpreadsheet 
                assumptions={assumptions} 
                onAssumptionsChange={onAssumptionsChange}
                maxYears={assumptions.holdPeriodYears || 5}
              />
            )}
            {activeSection === 'financing' && (
              <FinancingCard 
                assumptions={assumptions} 
                onAssumptionsChange={onAssumptionsChange}
              />
            )}
            {activeSection === 'exit' && <ExitContent assumptions={assumptions} updateAssumption={updateAssumption} />}
          </AnimatedTabContent>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? 'Calculating...' : 'Run Analysis'}
        </Button>
      </div>
    </motion.div>
  )
}

function PropertyContent({ assumptions, updateAssumption, handlePropertyTypeChange }: { 
  assumptions: PropertyAssumptions, 
  updateAssumption: <K extends keyof PropertyAssumptions>(key: K, value: PropertyAssumptions[K]) => void,
  handlePropertyTypeChange: (value: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Hold Period Selector - First and Prominent */}
      <HoldPeriodSelector 
        value={assumptions.holdPeriodYears || 5}
        onChange={(value) => updateAssumption('holdPeriodYears', value)}
      />
      
      {/* Property Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TooltipInput
              id="purchase-price"
              label="Purchase Price"
              tooltip={financialTooltips.purchasePrice}
              value={assumptions.purchasePrice}
              onChange={(value) => updateAssumption('purchasePrice', parseFloat(value) || 0)}
              type="number"
              prefix="$"
            />
            <ComboInput
              id="acquisition-costs"
              label="Acquisition Costs"
              tooltip={financialTooltips.acquisitionCosts}
              percentageLabel="% of Purchase Price"
              dollarLabel="Fixed Amount"
              defaultMode={assumptions.acquisitionCostType}
              value={assumptions.acquisitionCosts > 0 ? assumptions.acquisitionCosts.toString() : ''}
              onValueChange={(value, mode) => {
                updateAssumption('acquisitionCosts', parseFloat(value) || 0)
                updateAssumption('acquisitionCostType', mode)
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Type & Depreciation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TooltipSelect
              id="property-type"
              label="Property Type"
              tooltip={financialTooltips.propertyType}
              value={assumptions.propertyType}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectItem value="residential">Residential (27.5 years)</SelectItem>
              <SelectItem value="commercial">Non-Residential Commercial (39 years)</SelectItem>
            </TooltipSelect>
            <div className="grid grid-cols-2 gap-4">
              <TooltipInput
                id="land-value"
                label="Land Value %"
                tooltip={financialTooltips.landValue}
                value={assumptions.landPercentage}
                onChange={(value) => updateAssumption('landPercentage', parseFloat(value) || 0)}
                type="number"
                suffix="%"
              />
              <TooltipInput
                id="improvements-value"
                label="Improvements Value %"
                tooltip={financialTooltips.improvementsValue}
                value={assumptions.improvementsPercentage}
                onChange={(value) => updateAssumption('improvementsPercentage', parseFloat(value) || 0)}
                type="number"
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



function ExitContent({ assumptions, updateAssumption }: { 
  assumptions: PropertyAssumptions, 
  updateAssumption: <K extends keyof PropertyAssumptions>(key: K, value: PropertyAssumptions[K]) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Exit Strategy & Taxes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TooltipInput
            id="exit-cap-rate"
            label="Exit Cap Rate"
            tooltip={financialTooltips.exitCapRate}
            value={assumptions.exitCapRate ? assumptions.exitCapRate * 100 : ''}
            onChange={(value) => updateAssumption('exitCapRate', value ? (parseFloat(value) || 0) / 100 : undefined)}
            type="number"
            suffix="%"
            min={1}
            max={20}
            step="0.25"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TooltipInput
            id="tax-rate"
            label="Tax Rate"
            tooltip={financialTooltips.capitalGainsRate}
            value={assumptions.taxRate * 100}
            onChange={(value) => updateAssumption('taxRate', (parseFloat(value) || 0) / 100)}
            type="number"
            suffix="%"
            min={0}
            max={50}
            step="1"
          />
          <TooltipInput
            id="selling-costs"
            label="Selling Costs"
            tooltip={financialTooltips.sellingCosts}
            value={assumptions.sellingCosts * 100}
            onChange={(value) => updateAssumption('sellingCosts', (parseFloat(value) || 0) / 100)}
            type="number"
            suffix="%"
            min={0}
            max={15}
            step="0.25"
          />
        </div>

        {assumptions.exitCapRate && assumptions.holdPeriodYears > 0 && (
          <Alert>
            <AlertDescription>
              {(() => {
                // Calculate final year NOI using detailed structure if available
                let finalYearNOI = 0
                const year = assumptions.holdPeriodYears - 1
                
                if (assumptions.potentialRentalIncome?.[year] && assumptions.potentialRentalIncome[year] > 0) {
                  // Use detailed income structure
                  const grossIncome = assumptions.potentialRentalIncome[year]
                  const vacancyAmount = grossIncome * (assumptions.vacancyRates?.[year] || 0)
                  const effectiveGrossIncome = grossIncome - vacancyAmount
                  
                  let opEx = 0
                  if (assumptions.operatingExpenses?.[year] !== undefined) {
                    if (assumptions.operatingExpenseType === 'percentage') {
                      // Operating expenses as percentage of effective gross income (after vacancy)
                      opEx = effectiveGrossIncome * ((assumptions.operatingExpenses[year] || 0) / 100)
                    } else {
                      opEx = assumptions.operatingExpenses[year] || 0
                    }
                  }
                  
                  finalYearNOI = effectiveGrossIncome - opEx
                } else if (assumptions.year1NOI && assumptions.noiGrowthRate !== undefined) {
                  // Fallback to legacy calculation
                  finalYearNOI = assumptions.year1NOI * Math.pow(1 + assumptions.noiGrowthRate, assumptions.holdPeriodYears - 1)
                }
                
                return finalYearNOI > 0 ? (
                  <>
                    <strong>Estimated Sale Price:</strong> ${(finalYearNOI / assumptions.exitCapRate).toLocaleString()}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Based on Year {assumptions.holdPeriodYears} NOI ÷ {(assumptions.exitCapRate * 100).toFixed(2)}% exit cap rate
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Complete income assumptions to see estimated sale price</span>
                )
              })()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}