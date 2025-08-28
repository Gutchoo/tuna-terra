'use client'

import { useState, useEffect } from 'react'
import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { ResultsDisplay } from './shared/ResultsDisplay'
import { SensitivityChart } from './shared/SensitivityChart'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { TVMGrowthVisual } from '@/components/education/AnimatedExplainer'
import {
  solveTVM,
  generateGrowthTimeline,
  validateTVMInputs,
  type TVMInputs,
  type TVMResults,
} from '@/lib/calculators/tvm'

interface TVMCalculatorProps {
  title?: string
  description?: string
  className?: string
  embedded?: boolean
}

export function TVMCalculator({
  title = 'Time Value of Money Calculator',
  description = 'Calculate present value, future value, and payment relationships',
  className,
  embedded = false,
}: TVMCalculatorProps) {
  const [inputs, setInputs] = useState<TVMInputs>({
    presentValue: 100000,
    futureValue: undefined,
    interestRate: 0.07, // 7%
    periods: 10,
    payment: undefined,
  })

  const [results, setResults] = useState<TVMResults | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'compound' | 'annuity'>('compound')
  const [solveFor, setSolveFor] = useState<'fv' | 'pv' | 'pmt'>('fv')

  const handleInputChange = (field: keyof TVMInputs, value: string) => {
    let numericValue = value === '' ? undefined : parseFloat(value) || undefined
    
    // Convert percentage to decimal for interest rate
    if (field === 'interestRate' && numericValue !== undefined) {
      numericValue = numericValue / 100
    }
    
    setInputs(prev => ({
      ...prev,
      [field]: numericValue,
    }))
  }

  const calculateResults = () => {
    // Clear fields based on what we're solving for
    const adjustedInputs = { ...inputs }
    
    if (activeTab === 'compound') {
      adjustedInputs.payment = undefined
      if (solveFor === 'fv') adjustedInputs.futureValue = undefined
      if (solveFor === 'pv') adjustedInputs.presentValue = undefined
    } else {
      // Annuity calculation
      if (solveFor === 'pmt') {
        adjustedInputs.payment = undefined
        adjustedInputs.futureValue = undefined
      }
    }

    const validationErrors = validateTVMInputs(adjustedInputs)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      try {
        const tvmResult = solveTVM(adjustedInputs)
        setResults(tvmResult)
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Calculation error'])
      }
    } else {
      setResults(null)
    }
  }

  const resetCalculator = () => {
    setInputs({
      presentValue: 100000,
      futureValue: undefined,
      interestRate: 0.07,
      periods: 10,
      payment: undefined,
    })
    setResults(null)
    setErrors([])
    setSolveFor('fv')
  }

  useEffect(() => {
    calculateResults()
  }, [inputs, activeTab, solveFor])

  // Generate growth timeline for visualization
  const growthData = results && results.presentValue && results.futureValue
    ? generateGrowthTimeline(results.presentValue, inputs.interestRate || 0.07, inputs.periods || 10)
        .map(point => ({
          period: point.period,
          value: point.value,
        }))
    : []

  const getResultItems = () => {
    if (!results) return []

    const items = []

    if (results.presentValue !== undefined) {
      items.push({
        label: 'Present Value',
        value: results.presentValue,
        type: 'currency' as const,
        highlight: solveFor === 'pv',
      })
    }

    if (results.futureValue !== undefined) {
      items.push({
        label: 'Future Value',
        value: results.futureValue,
        type: 'currency' as const,
        highlight: solveFor === 'fv',
      })
    }

    if (results.payment !== undefined) {
      items.push({
        label: activeTab === 'annuity' ? 'Annual Payment' : 'Payment',
        value: results.payment,
        type: 'currency' as const,
        highlight: solveFor === 'pmt',
      })
    }

    items.push(
      {
        label: 'Interest Rate',
        value: inputs.interestRate ? inputs.interestRate * 100 : 0,
        type: 'percentage' as const,
      },
      {
        label: 'Time Period',
        value: `${inputs.periods || 0} years`,
        type: 'text' as const,
      }
    )

    if (results.totalInterest > 0) {
      items.push({
        label: 'Total Interest Earned',
        value: results.totalInterest,
        type: 'currency' as const,
      })
    }

    return items
  }

  return (
    <div className={className}>
      <CalculatorCard title={title} description={description}>
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'compound' | 'annuity')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compound">Compound Interest</TabsTrigger>
              <TabsTrigger value="annuity">Annuity Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="compound" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Investment Parameters</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Solve For:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={solveFor === 'fv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSolveFor('fv')}
                      >
                        Future Value
                      </Button>
                      <Button
                        variant={solveFor === 'pv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSolveFor('pv')}
                      >
                        Present Value
                      </Button>
                    </div>
                  </div>

                  {solveFor !== 'pv' && (
                    <InputField
                      id="present-value"
                      label="Present Value (Initial Investment)"
                      value={inputs.presentValue || ''}
                      onChange={(value) => handleInputChange('presentValue', value)}
                      prefix="$"
                      placeholder="100,000"
                      required
                    />
                  )}

                  {solveFor !== 'fv' && (
                    <InputField
                      id="future-value"
                      label="Future Value (Target Amount)"
                      value={inputs.futureValue || ''}
                      onChange={(value) => handleInputChange('futureValue', value)}
                      prefix="$"
                      placeholder="200,000"
                      required
                    />
                  )}

                  <InputField
                    id="interest-rate"
                    label="Annual Interest Rate"
                    value={inputs.interestRate ? (inputs.interestRate * 100).toString() : ''}
                    onChange={(value) => handleInputChange('interestRate', value)}
                    suffix="%"
                    placeholder="7.0"
                    required
                    step={0.1}
                    min={0}
                    max={50}
                  />

                  <InputField
                    id="periods"
                    label="Time Period (Years)"
                    value={inputs.periods || ''}
                    onChange={(value) => handleInputChange('periods', value)}
                    placeholder="10"
                    required
                    min={1}
                    max={100}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button onClick={calculateResults} className="flex-1">
                      Calculate
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
                      title="TVM Analysis"
                      results={getResultItems()}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="annuity" className="space-y-6 mt-6">
              <div className="text-center text-muted-foreground">
                <p>Annuity calculations coming soon!</p>
                <p className="text-sm mt-2">
                  This will calculate payment amounts for loans and investment annuities.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Growth Visualization */}
          {results && results.presentValue && results.futureValue && !embedded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TVMGrowthVisual
                initialValue={results.presentValue}
                finalValue={results.futureValue}
                periods={inputs.periods || 10}
                rate={inputs.interestRate || 0.07}
              />
            </motion.div>
          )}

          {/* Growth Chart */}
          {growthData.length > 0 && !embedded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SensitivityChart
                title="Investment Growth Timeline"
                data={growthData}
                xKey="period"
                yKey="value"
                xLabel="Year"
                yLabel="Value"
                xFormatter={(value) => `Year ${value}`}
                yFormatter={(value) => new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(Number(value))}
              />
            </motion.div>
          )}

          {!embedded && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Time Value of Money Concepts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Money available today is worth more than the same amount in the future</li>
                <li>• Compound interest allows investments to grow exponentially over time</li>
                <li>• Higher interest rates and longer time periods increase future values</li>
                <li>• Present value calculations help compare investment alternatives</li>
                <li>• Rule of 72: Divide 72 by interest rate to estimate doubling time</li>
              </ul>
            </div>
          )}
        </div>
      </CalculatorCard>
    </div>
  )
}