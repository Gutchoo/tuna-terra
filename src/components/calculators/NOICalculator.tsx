'use client'

import { useState, useEffect } from 'react'
import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { ResultsDisplay } from './shared/ResultsDisplay'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { NOIWaterfall } from '@/components/education/AnimatedExplainer'
import {
  calculateNOI,
  generateNOIWaterfall,
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
  description = 'Calculate Net Operating Income with waterfall breakdown',
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

  const calculateResults = () => {
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
  }

  const resetCalculator = () => {
    setInputs({
      grossRentalIncome: 120000,
      vacancyRate: 0.05,
      otherIncome: 5000,
      operatingExpenses: 35000,
    })
    setResults(null)
    setErrors([])
  }

  useEffect(() => {
    calculateResults()
  }, [inputs])

  const waterfallSteps = generateNOIWaterfall(inputs)

  const resultItems = results
    ? [
        {
          label: 'Net Operating Income (NOI)',
          value: results.netOperatingIncome,
          type: 'currency' as const,
          highlight: true,
        },
        {
          label: 'Gross Rental Income',
          value: results.grossRentalIncome,
          type: 'currency' as const,
        },
        {
          label: 'Vacancy Loss',
          value: results.vacancyLoss,
          type: 'currency' as const,
        },
        {
          label: 'Effective Gross Income',
          value: results.effectiveGrossIncome,
          type: 'currency' as const,
        },
        {
          label: 'Operating Expense Ratio',
          value: results.operatingExpenseRatio,
          formatted: results.operatingExpenseRatioPercentage,
          type: 'percentage' as const,
        },
      ]
    : []

  return (
    <div className={className}>
      <CalculatorCard title={title} description={description}>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
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

              <div className="flex gap-2 pt-4">
                <Button onClick={calculateResults} className="flex-1">
                  Calculate NOI
                </Button>
                <Button variant="outline" size="icon" onClick={resetCalculator}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
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
                <ResultsDisplay
                  title="NOI Analysis"
                  results={resultItems}
                  status={results.netOperatingIncome > 0 ? 'positive' : 'negative'}
                  statusText={
                    results.netOperatingIncome > 0
                      ? 'Positive Cash Flow'
                      : 'Negative Cash Flow'
                  }
                />
              )}
            </div>
          </div>

          {/* Waterfall Visualization */}
          {results && !embedded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">NOI Waterfall Breakdown</h3>
                <NOIWaterfall steps={waterfallSteps} />
                
                <div className="text-center pt-4 border-t">
                  <div className="text-2xl font-bold text-primary">
                    Net Operating Income: ${results.netOperatingIncome.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Operating Expense Ratio: {results.operatingExpenseRatioPercentage}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!embedded && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">NOI Analysis Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NOI excludes debt service, depreciation, and taxes</li>
                <li>• Operating expense ratios typically range from 25-45%</li>
                <li>• Include property taxes, insurance, maintenance, and management</li>
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