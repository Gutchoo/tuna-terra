'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { WaterfallLineItems, type WaterfallLineItem } from './shared/WaterfallLineItems'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import {
  calculateNOI,
  validateNOIInputs,
  type NOIInputs,
  type NOIResults,
} from '@/lib/calculators/noi'

interface NOICalculatorProps {
  title?: string
  description?: string
  className?: string
  embedded?: boolean
}

export function NOICalculator({
  title = 'NOI Calculator',
  description = 'Try inputting your own numbers to calculate NOI',
  className,
  embedded = false,
}: NOICalculatorProps) {
  const [inputs, setInputs] = useState<NOIInputs>({
    grossRentalIncome: 120000,
    vacancyRate: 0.05, // 5%
    otherIncome: 5000,
    operatingExpenses: 35000,
  })

  const [results, setResults] = useState<NOIResults | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof NOIInputs, value: string) => {
    let numericValue = parseFloat(value) || 0
    
    // Convert percentage fields
    if (field === 'vacancyRate') {
      numericValue = numericValue / 100
    }
    
    setInputs(prev => ({
      ...prev,
      [field]: numericValue,
    }))
  }

  const calculateResults = useCallback(() => {
    const validationErrors = validateNOIInputs(inputs)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      try {
        const noiResult = calculateNOI(inputs)
        setResults(noiResult)
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Calculation error'])
      }
    } else {
      setResults(null)
    }
  }, [inputs])

  // const resetCalculator = () => {
  //   setInputs({
  //     grossRentalIncome: 120000,
  //     vacancyRate: 0.05,
  //     otherIncome: 5000,
  //     operatingExpenses: 35000,
  //   })
  //   setResults(null)
  //   setErrors([])
  // }

  useEffect(() => {
    calculateResults()
  }, [inputs, calculateResults])

  // const waterfallSteps = generateNOIWaterfall(inputs)

  const waterfallItems: WaterfallLineItem[] = useMemo(() => results
    ? [
        {
          label: 'Gross Rental Income',
          amount: results.grossRentalIncome,
        },
        {
          label: 'Vacancy Loss',
          amount: results.vacancyLoss,
          isSubtraction: true,
          percentage: inputs.vacancyRate * 100,
          showPercentage: true,
        },
        {
          label: 'Other Income',
          amount: inputs.otherIncome,
        },
        {
          label: 'Effective Gross Income',
          amount: results.effectiveGrossIncome,
          isSubtotal: true,
        },
        {
          label: 'Operating Expenses',
          amount: inputs.operatingExpenses,
          isSubtraction: true,
          percentage: results.operatingExpenseRatio * 100,
          showPercentage: true,
        },
        {
          label: 'Net Operating Income (NOI)',
          amount: results.netOperatingIncome,
          isTotal: true,
        },
      ]
    : [], [results, inputs.vacancyRate, inputs.otherIncome, inputs.operatingExpenses])

  return (
    <div className={className}>
      <CalculatorCard title={title} description={description}>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Income & Expenses</h3>
              
              <InputField
                id="gross-rental-income"
                label="Gross Rental Income"
                value={inputs.grossRentalIncome}
                onChange={(value) => handleInputChange('grossRentalIncome', value)}
                prefix="$"
                placeholder="120,000"
                required
              />

              <InputField
                id="vacancy-rate"
                label="Vacancy Rate"
                value={(inputs.vacancyRate * 100).toString()}
                onChange={(value) => handleInputChange('vacancyRate', value)}
                suffix="%"
                placeholder="5.0"
                required
                min={0}
                max={100}
                step={0.1}
              />

              <InputField
                id="other-income"
                label="Other Income"
                value={inputs.otherIncome}
                onChange={(value) => handleInputChange('otherIncome', value)}
                prefix="$"
                placeholder="5,000"
              />

              <InputField
                id="operating-expenses"
                label="Operating Expenses"
                value={inputs.operatingExpenses}
                onChange={(value) => handleInputChange('operatingExpenses', value)}
                prefix="$"
                placeholder="35,000"
                required
              />

            </div>

            {/* Results */}
            <div className="space-y-4">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {results && (
                <div className="border rounded-lg p-6 bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">NOI Calculation</h3>
                  <WaterfallLineItems items={waterfallItems} />
                </div>
              )}
            </div>
          </div>


          {!embedded && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">NOI Analysis Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NOI excludes debt service, depreciation, and income taxes</li>
                <li>• Operating expense ratios typically range from 25-45%</li>
                <li>• Operating expenses include property taxes, insurance, maintenance, and management</li>
                <li>• Exclude capital improvements and one-time expenses</li>
                <li>• Use actual or market-based vacancy rates for accuracy</li>
              </ul>
            </div>
          )}
        </div>
      </CalculatorCard>
    </div>
  )
}