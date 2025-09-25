'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'

import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { ResultsDisplay } from './shared/ResultsDisplay'
import { SensitivityChart } from './shared/SensitivityChart'

import {
  type DSCRInputs,
  type DSCRResults,
  type LoanSummary,
  analyzeDSCRInputs,
  validateDSCRInputs,
  generateLoanSummary,
  calculateMaxLoanAmount,
} from '@/lib/calculators/dscr'

interface DSCRCalculatorProps {
  embedded?: boolean
}

export function DSCRCalculator({ }: DSCRCalculatorProps) {
  // Input method toggle
  const [inputMethod, setInputMethod] = useState<'direct' | 'loan'>('loan')
  
  // Common inputs
  const [noi, setNoi] = useState<number>(240000)
  
  // Direct debt service input
  const [annualDebtService, setAnnualDebtService] = useState<number>(180000)
  
  // Loan calculation inputs
  const [loanAmount, setLoanAmount] = useState<number>(2000000)
  const [interestRate, setInterestRate] = useState<number>(0.065)
  const [loanTermYears, setLoanTermYears] = useState<number>(10)
  const [amortizationYears, setAmortizationYears] = useState<number>(30)
  
  const [results, setResults] = useState<DSCRResults | null>(null)
  const [loanSummary, setLoanSummary] = useState<LoanSummary | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const calculateResults = useCallback(() => {
    const inputs: DSCRInputs = {
      noi,
      ...(inputMethod === 'direct' 
        ? { annualDebtService }
        : { loanAmount, interestRate, loanTermYears, amortizationYears }
      ),
    }

    const validationErrors = validateDSCRInputs(inputs)
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setResults(null)
      setLoanSummary(null)
      return
    }

    try {
      setErrors([])
      const calculatedResults = analyzeDSCRInputs(inputs)
      setResults(calculatedResults)

      // Generate loan summary for loan method
      if (inputMethod === 'loan') {
        const summary = generateLoanSummary(
          loanAmount,
          interestRate,
          loanTermYears,
          amortizationYears
        )
        setLoanSummary(summary)
      } else {
        setLoanSummary(null)
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error occurred'])
      setResults(null)
      setLoanSummary(null)
    }
  }, [noi, annualDebtService, loanAmount, interestRate, loanTermYears, amortizationYears, inputMethod])

  const loadSampleData = () => {
    setNoi(240000)
    if (inputMethod === 'direct') {
      setAnnualDebtService(180000)
    } else {
      setLoanAmount(2000000)
      setInterestRate(0.065)
      setLoanTermYears(10)
      setAmortizationYears(30)
    }
  }


  // Generate sensitivity data for different NOI levels
  const sensitivityData = results ? [
    { noi: '$200K', dscr: calculateDSCRValue(200000) },
    { noi: '$220K', dscr: calculateDSCRValue(220000) },
    { noi: '$240K', dscr: calculateDSCRValue(240000) },
    { noi: '$260K', dscr: calculateDSCRValue(260000) },
    { noi: '$280K', dscr: calculateDSCRValue(280000) },
  ] : []

  function calculateDSCRValue(testNoi: number): number {
    try {
      const testInputs: DSCRInputs = {
        noi: testNoi,
        ...(inputMethod === 'direct' 
          ? { annualDebtService }
          : { loanAmount, interestRate, loanTermYears, amortizationYears }
        ),
      }
      return analyzeDSCRInputs(testInputs).dscr
    } catch {
      return 0
    }
  }

  // Calculate maximum loan amount for healthy DSCR
  const maxLoanForHealthyDSCR = inputMethod === 'loan' && noi > 0 
    ? calculateMaxLoanAmount(noi, 1.25, interestRate, amortizationYears)
    : null

  return (
    <CalculatorCard
      title="DSCR Calculator"
      description="Calculate Debt Service Coverage Ratio and analyze loan risk"
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
                Property & Financing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="noi"
                label="Net Operating Income (NOI)"
                value={noi}
                onChange={(value) => setNoi(parseFloat(value) || 0)}
                min={0}
                prefix="$"
              />

              <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'direct' | 'loan')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">Direct Input</TabsTrigger>
                  <TabsTrigger value="loan">Loan Calculation</TabsTrigger>
                </TabsList>

                <TabsContent value="direct" className="space-y-4 mt-4">
                  <InputField
                    id="annualDebtService"
                    label="Annual Debt Service"
                    value={annualDebtService}
                    onChange={(value) => setAnnualDebtService(parseFloat(value) || 0)}
                    min={0}
                    prefix="$"
                  />
                </TabsContent>

                <TabsContent value="loan" className="space-y-4 mt-4">
                  <InputField
                    id="loanAmount"
                    label="Loan Amount"
                    value={loanAmount}
                    onChange={(value) => setLoanAmount(parseFloat(value) || 0)}
                    min={0}
                    prefix="$"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      id="interestRate"
                      label="Interest Rate"
                      value={interestRate * 100}
                      onChange={(value) => setInterestRate(parseFloat(value) / 100 || 0)}
                      min={0}
                      max={30}
                      step={0.125}
                      suffix="%"
                    />

                    <InputField
                      id="loanTerm"
                      label="Loan Term"
                      value={loanTermYears}
                      onChange={(value) => setLoanTermYears(parseFloat(value) || 0)}
                      min={1}
                      max={50}
                      step={1}
                      suffix="years"
                    />
                  </div>

                  <InputField
                    id="amortization"
                    label="Amortization Period"
                    value={amortizationYears}
                    onChange={(value) => setAmortizationYears(parseFloat(value) || 0)}
                    min={1}
                    max={50}
                    step={1}
                    suffix="years"
                  />

                  {maxLoanForHealthyDSCR && (
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Max loan for healthy DSCR (1.25x):</strong> {' '}
                        ${maxLoanForHealthyDSCR.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={loadSampleData} variant="outline" className="flex-1">
                  Load Sample
                </Button>
                <Button onClick={calculateResults} className="flex-1">
                  Calculate DSCR
                </Button>
              </div>
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      DSCR Analysis
                    </CardTitle>
                    <Badge 
                      variant={results.isHealthy ? "default" : "destructive"}
                      className="text-sm"
                    >
                      {results.riskLevel} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2 mb-4">
                    <div className="text-4xl font-bold text-primary">
                      {results.dscrFormatted}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Debt Service Coverage Ratio
                    </p>
                  </div>

                  <Alert className={results.isHealthy ? '' : 'border-destructive'}>
                    <AlertDescription className={results.isHealthy ? 'text-green-700' : 'text-destructive'}>
                      {results.interpretation}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <ResultsDisplay
                title="Financial Summary"
                results={[
                  {
                    label: 'Net Operating Income',
                    value: noi.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Annual property income after expenses'
                  },
                  {
                    label: 'Annual Debt Service',
                    value: results.annualDebtService.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Total annual loan payments'
                  },
                  {
                    label: 'Monthly Payment',
                    value: results.monthlyPayment.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Monthly principal and interest payment'
                  },
                  {
                    label: 'Annual Cash Flow',
                    value: (noi - results.annualDebtService).toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'NOI minus debt service (before taxes)'
                  }
                ]}
              />

              {loanSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Loan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">Loan Amount:</span>{' '}
                        <span className="font-medium">
                          ${loanSummary.loanAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest Rate:</span>{' '}
                        <span className="font-medium">
                          {(loanSummary.interestRate * 100).toFixed(3)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Interest:</span>{' '}
                        <span className="font-medium">
                          ${loanSummary.totalInterestPaid.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Payments:</span>{' '}
                        <span className="font-medium">
                          ${loanSummary.totalPayments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sensitivityData.length > 0 && (
                <SensitivityChart
                  title="DSCR Sensitivity to NOI"
                  data={sensitivityData}
                  xKey="noi"
                  yKey="dscr"
                  xLabel="NOI"
                  yLabel="DSCR"
                />
              )}
            </>
          )}
        </motion.div>
      </div>
    </CalculatorCard>
  )
}