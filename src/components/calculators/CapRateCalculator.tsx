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
import {
  calculateCapRate,
  calculateValueFromCapRate,
  generateCapRateSensitivity,
  validateCapRateInputs,
  type CapRateInputs,
  type CapRateResults,
} from '@/lib/calculators/capRate'

interface CapRateCalculatorProps {
  title?: string
  description?: string
  className?: string
  embedded?: boolean
}

export function CapRateCalculator({
  title = 'Cap Rate Calculator',
  description = 'Calculate capitalization rates and analyze property values',
  className,
  embedded = false,
}: CapRateCalculatorProps) {
  const [inputs, setInputs] = useState<CapRateInputs>({
    noi: 50000,
    price: 625000,
  })

  const [targetCapRate, setTargetCapRate] = useState<string>('0.08')
  const [results, setResults] = useState<CapRateResults | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'calculate' | 'reverse'>('calculate')

  const handleInputChange = (field: keyof CapRateInputs, value: string) => {
    const numericValue = parseFloat(value) || 0
    setInputs(prev => ({
      ...prev,
      [field]: numericValue,
    }))
  }

  const calculateResults = () => {
    const validationErrors = validateCapRateInputs(inputs)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      try {
        const capRateResult = calculateCapRate(inputs)
        setResults(capRateResult)
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Calculation error'])
      }
    } else {
      setResults(null)
    }
  }

  const resetCalculator = () => {
    setInputs({ noi: 50000, price: 625000 })
    setTargetCapRate('0.08')
    setResults(null)
    setErrors([])
    setActiveTab('calculate')
  }

  useEffect(() => {
    calculateResults()
  }, [inputs])

  const sensitivityData = results
    ? generateCapRateSensitivity(inputs.noi, results.capRate).map(point => ({
        capRate: point.capRate,
        value: point.value,
      }))
    : []

  const reverseCalculationValue = inputs.noi && targetCapRate
    ? calculateValueFromCapRate(inputs.noi, parseFloat(targetCapRate))
    : 0

  const resultItems = results
    ? [
        {
          label: 'Cap Rate',
          value: results.capRate,
          formatted: results.capRatePercentage,
          description: 'Annual return on investment',
          highlight: true,
          type: 'percentage' as const,
        },
        {
          label: 'Net Operating Income',
          value: inputs.noi,
          type: 'currency' as const,
        },
        {
          label: 'Property Value',
          value: inputs.price,
          type: 'currency' as const,
        },
      ]
    : []

  return (
    <div className={className}>
      <CalculatorCard title={title} description={description}>
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'calculate' | 'reverse')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculate">Calculate Cap Rate</TabsTrigger>
              <TabsTrigger value="reverse">Find Property Value</TabsTrigger>
            </TabsList>

            <TabsContent value="calculate" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Information</h3>
                  
                  <InputField
                    id="noi"
                    label="Net Operating Income (NOI)"
                    value={inputs.noi}
                    onChange={(value) => handleInputChange('noi', value)}
                    prefix="$"
                    placeholder="50,000"
                    required
                  />

                  <InputField
                    id="price"
                    label="Property Purchase Price"
                    value={inputs.price}
                    onChange={(value) => handleInputChange('price', value)}
                    prefix="$"
                    placeholder="625,000"
                    required
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
                      title="Cap Rate Analysis"
                      results={resultItems}
                      status={results.capRate > 0.1 ? 'positive' : results.capRate > 0.06 ? 'neutral' : 'warning'}
                      statusText={
                        results.capRate > 0.1
                          ? 'High Return'
                          : results.capRate > 0.06
                          ? 'Moderate Return'
                          : 'Lower Return'
                      }
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reverse" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Reverse Calculation</h3>
                  
                  <InputField
                    id="noi-reverse"
                    label="Net Operating Income (NOI)"
                    value={inputs.noi}
                    onChange={(value) => handleInputChange('noi', value)}
                    prefix="$"
                    placeholder="50,000"
                    required
                  />

                  <InputField
                    id="target-cap-rate"
                    label="Target Cap Rate"
                    value={targetCapRate}
                    onChange={setTargetCapRate}
                    suffix="%"
                    placeholder="8.0"
                    required
                    step={0.1}
                    min={0.1}
                    max={50}
                  />
                </div>

                <div className="space-y-4">
                  <ResultsDisplay
                    title="Property Value Analysis"
                    results={[
                      {
                        label: 'Calculated Property Value',
                        value: reverseCalculationValue,
                        type: 'currency',
                        highlight: true,
                      },
                      {
                        label: 'Target Cap Rate',
                        value: `${targetCapRate}%`,
                        type: 'text',
                      },
                      {
                        label: 'Required NOI',
                        value: inputs.noi,
                        type: 'currency',
                      },
                    ]}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Sensitivity Chart */}
          {results && sensitivityData.length > 0 && !embedded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SensitivityChart
                title="Cap Rate Sensitivity Analysis"
                data={sensitivityData}
                xKey="capRate"
                yKey="value"
                xLabel="Cap Rate"
                yLabel="Property Value"
                xFormatter={(value) => `${Number(value).toFixed(1)}%`}
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
              <h4 className="font-semibold mb-2">Key Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher cap rates indicate higher returns but potentially higher risk</li>
                <li>• Cap rates vary significantly by property type and market conditions</li>
                <li>• Compare to market cap rates for similar properties in the area</li>
                <li>• Consider cap rate trends and future income potential</li>
              </ul>
            </div>
          )}
        </div>
      </CalculatorCard>
    </div>
  )
}