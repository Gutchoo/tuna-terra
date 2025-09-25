'use client'

import { useState, useEffect } from 'react'
import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { SensitivityChart } from './shared/SensitivityChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
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

  const [targetCapRate, setTargetCapRate] = useState<string>('8')
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

  // const resetCalculator = () => {
  //   setInputs({ noi: 50000, price: 625000 })
  //   setTargetCapRate('8')
  //   setResults(null)
  //   setErrors([])
  //   setActiveTab('calculate')
  // }

  useEffect(() => {
    calculateResults()
  }, [inputs, calculateResults])

  // Update sensitivity chart when tab changes or target cap rate changes
  useEffect(() => {
    // Force re-render of sensitivity data when activeTab or targetCapRate changes
  }, [activeTab, targetCapRate])

  // Generate sensitivity data based on active tab
  const getSensitivityData = () => {
    if (activeTab === 'calculate' && results) {
      // For calculate tab, use the calculated cap rate
      return generateCapRateSensitivity(inputs.noi, results.capRate).map(point => ({
        capRate: point.capRate,
        value: point.value,
        isHighlighted: Math.abs(point.capRate - (results.capRate * 100)) < 0.01,
      }))
    } else if (activeTab === 'reverse' && inputs.noi && targetCapRate && parseFloat(targetCapRate) > 0) {
      // For reverse tab, use the target cap rate input
      const targetCapRateDecimal = parseFloat(targetCapRate) / 100
      return generateCapRateSensitivity(inputs.noi, targetCapRateDecimal).map(point => ({
        capRate: point.capRate,
        value: point.value,
        isHighlighted: Math.abs(point.capRate - parseFloat(targetCapRate)) < 0.01,
      }))
    }
    return []
  }

  const sensitivityData = getSensitivityData()

  const reverseCalculationValue = inputs.noi && targetCapRate && parseFloat(targetCapRate) > 0
    ? calculateValueFromCapRate(inputs.noi, parseFloat(targetCapRate) / 100)
    : 0

  // const resultItems = results
  //   ? [
  //       {
  //         label: 'Cap Rate',
  //         value: results.capRate,
  //         formatted: results.capRatePercentage,
  //         description: 'Annual return on investment',
  //         highlight: true,
  //         type: 'percentage' as const,
  //       },
  //       {
  //         label: 'Net Operating Income',
  //         value: inputs.noi,
  //         type: 'currency' as const,
  //       },
  //       {
  //         label: 'Property Value',
  //         value: inputs.price,
  //         type: 'currency' as const,
  //       },
  //     ]
  //   : []

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
                    <div className="space-y-4">
                      <div className="border rounded-lg p-6 bg-card">
                        <h3 className="text-lg font-semibold mb-4">Cap Rate Calculation</h3>
                        
                        {/* Calculation Display */}
                        <div className="text-center space-y-4">
                          <div className="text-lg font-mono flex items-center justify-center gap-3">
                            <span>${inputs.noi.toLocaleString()}</span>
                            <span className="text-2xl">÷</span>
                            <span>${inputs.price.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-border pt-4">
                            <div className="text-2xl font-bold text-primary">
                              {results.capRatePercentage}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    placeholder="8"
                    required
                    step={0.1}
                    min={0.1}
                    max={50}
                  />
                </div>

                <div className="space-y-4">
                  {reverseCalculationValue > 0 && (
                    <div className="border rounded-lg p-6 bg-card">
                      <h3 className="text-lg font-semibold mb-4">Property Value Calculation</h3>
                      
                      {/* Calculation Display */}
                      <div className="text-center space-y-4">
                        <div className="text-lg font-mono flex items-center justify-center gap-3">
                          <span>${inputs.noi.toLocaleString()}</span>
                          <span className="text-2xl">÷</span>
                          <span>{targetCapRate}%</span>
                        </div>
                        <div className="border-t border-border pt-4">
                          <div className="text-2xl font-bold text-primary">
                            ${reverseCalculationValue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Sensitivity Chart */}
          {sensitivityData.length > 0 && !embedded && (
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
                highlightColor="hsl(var(--chart-2))"
              />
            </motion.div>
          )}

          {!embedded && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Key Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cap rate connects a property&apos;s NOI to its price, showing how much income you earn relative to what you pay</li>
                <li>• It&apos;s an easy way for investors to understand how much money a property makes compared to its purchase price</li>
                <li>• Beware of sellers using pro forma (projected) rates instead of actual current NOI</li>
                <li>• Cap rates differ significantly across locations and property types - urban vs rural, office vs retail</li>
                <li>• Higher cap rates indicate higher returns but potentially higher risk or lower quality assets</li>
              </ul>
            </div>
          )}
        </div>
      </CalculatorCard>
    </div>
  )
}