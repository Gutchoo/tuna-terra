'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Calculator } from 'lucide-react'

import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { ResultsDisplay } from './shared/ResultsDisplay'
import { SensitivityChart } from './shared/SensitivityChart'

import {
  type CashFlow,
  type IRRNPVInputs,
  type IRRNPVResults,
  analyzeIRRNPV,
  validateIRRNPVInputs,
  generateSampleRealEstateCashFlows,
} from '@/lib/calculators/irrNpv'

interface IRRNPVCalculatorProps {
  embedded?: boolean
}

export function IRRNPVCalculator({ }: IRRNPVCalculatorProps) {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(generateSampleRealEstateCashFlows)
  const [discountRate, setDiscountRate] = useState<number>(0.10)
  const [results, setResults] = useState<IRRNPVResults | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const calculateResults = useCallback(() => {
    const inputs: IRRNPVInputs = { cashFlows, discountRate }
    const validationErrors = validateIRRNPVInputs(inputs)
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setResults(null)
      return
    }

    setErrors([])
    const calculatedResults = analyzeIRRNPV(inputs)
    setResults(calculatedResults)
  }, [cashFlows, discountRate])

  const addCashFlow = () => {
    const maxPeriod = Math.max(...cashFlows.map(cf => cf.period), 0)
    setCashFlows([
      ...cashFlows,
      { period: maxPeriod + 1, amount: 0, description: `Year ${maxPeriod + 1}` }
    ])
  }

  const removeCashFlow = (index: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter((_, i) => i !== index))
    }
  }

  const updateCashFlow = (index: number, field: keyof CashFlow, value: string | number) => {
    const updated = [...cashFlows]
    updated[index] = { ...updated[index], [field]: value }
    setCashFlows(updated)
  }

  const loadSampleData = () => {
    setCashFlows(generateSampleRealEstateCashFlows())
    setDiscountRate(0.10)
  }


  // Generate sensitivity data for chart
  const sensitivityData = results ? [
    { rate: '8%', npv: analyzeIRRNPV({ cashFlows, discountRate: 0.08 }).npv },
    { rate: '9%', npv: analyzeIRRNPV({ cashFlows, discountRate: 0.09 }).npv },
    { rate: '10%', npv: analyzeIRRNPV({ cashFlows, discountRate: 0.10 }).npv },
    { rate: '11%', npv: analyzeIRRNPV({ cashFlows, discountRate: 0.11 }).npv },
    { rate: '12%', npv: analyzeIRRNPV({ cashFlows, discountRate: 0.12 }).npv },
  ] : []

  return (
    <CalculatorCard
      title="IRR & NPV Analysis"
      description="Calculate Internal Rate of Return and Net Present Value for investment cash flows"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Investment Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="discountRate"
                label="Discount Rate (%)"
                value={discountRate * 100}
                onChange={(value) => setDiscountRate((parseFloat(value) || 0) / 100)}
                min={0}
                max={50}
                step={0.25}
                suffix="%"
              />

              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Cash Flows</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSampleData}
                  >
                    Load Sample
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCashFlow}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cashFlows
                  .sort((a, b) => a.period - b.period)
                  .map((cashFlow, index) => (
                    <motion.div
                      key={`${cashFlow.period}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-muted/30 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {cashFlow.period === 0 ? 'Initial' : `Year ${cashFlow.period}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCashFlow(index)}
                          disabled={cashFlows.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <InputField
                          id={`period-${index}`}
                          label="Period"
                          value={cashFlow.period}
                          onChange={(value) => updateCashFlow(index, 'period', parseFloat(value) || 0)}
                          min={0}
                          max={50}
                          step={1}
                        />
                        <InputField
                          id={`amount-${index}`}
                          label="Cash Flow"
                          value={cashFlow.amount}
                          onChange={(value) => updateCashFlow(index, 'amount', parseFloat(value) || 0)}
                          prefix="$"
                        />
                      </div>

                      <InputField
                        id={`description-${index}`}
                        label="Description (Optional)"
                        value={cashFlow.description || ''}
                        onChange={(value) => updateCashFlow(index, 'description', value)}
                        type="text"
                      />
                    </motion.div>
                  ))}
              </div>

              <Button onClick={calculateResults} className="w-full">
                Calculate IRR & NPV
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {results && (
            <>
              <ResultsDisplay
                title="Analysis Results"
                results={[
                  {
                    label: 'Net Present Value (NPV)',
                    value: results.npv.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: results.npv > 0 
                      ? 'Investment adds value at this discount rate' 
                      : 'Investment destroys value at this discount rate'
                  },
                  {
                    label: 'Internal Rate of Return (IRR)',
                    value: results.irrPercentage,
                    description: results.irr 
                      ? `Investment returns ${results.irrPercentage} annually`
                      : 'Could not calculate IRR'
                  },
                  {
                    label: 'Total Cash In',
                    value: results.totalCashIn.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Sum of all positive cash flows'
                  },
                  {
                    label: 'Total Cash Out',
                    value: results.totalCashOut.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Sum of all negative cash flows'
                  },
                  {
                    label: 'Net Cash Flow',
                    value: results.netCashFlow.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Total inflows minus total outflows'
                  },
                  {
                    label: 'Payback Period',
                    value: results.paybackPeriod 
                      ? `${results.paybackPeriod} years`
                      : 'Never',
                    description: 'Time to recover initial investment'
                  }
                ]}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment Decision</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.npv > 0 && results.irr && results.irr > discountRate ? (
                    <Alert>
                      <AlertDescription className="text-green-700">
                        <strong>✅ Favorable Investment:</strong> NPV is positive 
                        (${results.npv.toLocaleString()}) and IRR ({results.irrPercentage}) 
                        exceeds the discount rate ({(discountRate * 100).toFixed(1)}%).
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <strong>❌ Unfavorable Investment:</strong> Either NPV is negative 
                        or IRR is below the required discount rate.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {sensitivityData.length > 0 && (
                <SensitivityChart
                  title="NPV Sensitivity to Discount Rate"
                  data={sensitivityData}
                  xKey="rate"
                  yKey="npv"
                  xLabel="Discount Rate"
                  yLabel="NPV ($)"
                />
              )}
            </>
          )}
        </motion.div>
      </div>
    </CalculatorCard>
  )
}