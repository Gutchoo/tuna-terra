'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Calendar, DollarSign, Download, TrendingDown } from 'lucide-react'

import { CalculatorCard } from './shared/CalculatorCard'
import { InputField } from './shared/InputField'
import { ResultsDisplay } from './shared/ResultsDisplay'
import { SensitivityChart } from './shared/SensitivityChart'

import {
  type LoanAmortizationInputs,
  type LoanAmortizationResults,
  generateAmortizationSchedule,
  validateLoanAmortizationInputs,
  generateSampleRealEstateLoan,
} from '@/lib/calculators/loanAmortization'

interface LoanAmortizationCalculatorProps {
  embedded?: boolean
}

export function LoanAmortizationCalculator({ }: LoanAmortizationCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(800000)
  const [interestRate, setInterestRate] = useState<number>(0.065)
  const [loanTermYears, setLoanTermYears] = useState<number>(30)
  const [extraPayment, setExtraPayment] = useState<number>(500)
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'bi-weekly' | 'weekly'>('monthly')
  
  const [results, setResults] = useState<LoanAmortizationResults | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false)

  const calculateResults = useCallback(() => {
    const inputs: LoanAmortizationInputs = {
      loanAmount,
      interestRate,
      loanTermYears,
      extraPayment,
      paymentFrequency,
    }

    const validationErrors = validateLoanAmortizationInputs(inputs)
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setResults(null)
      return
    }

    try {
      setErrors([])
      const calculatedResults = generateAmortizationSchedule(inputs)
      setResults(calculatedResults)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error occurred'])
      setResults(null)
    }
  }, [loanAmount, interestRate, loanTermYears, extraPayment, paymentFrequency])

  const loadSampleData = () => {
    const sample = generateSampleRealEstateLoan()
    setLoanAmount(sample.loanAmount)
    setInterestRate(sample.interestRate)
    setLoanTermYears(sample.loanTermYears)
    setExtraPayment(sample.extraPayment || 0)
    setPaymentFrequency(sample.paymentFrequency || 'monthly')
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      ['Payment #', 'Payment Date', 'Payment Amount', 'Principal', 'Interest', 'Extra Payment', 'Total Payment', 'Balance'],
      ...results.amortizationSchedule.map(entry => [
        entry.paymentNumber,
        entry.paymentDate.toLocaleDateString(),
        entry.paymentAmount.toFixed(2),
        entry.principalPayment.toFixed(2),
        entry.interestPayment.toFixed(2),
        entry.extraPayment.toFixed(2),
        entry.totalPayment.toFixed(2),
        entry.remainingBalance.toFixed(2),
      ]),
      ['', '', '', '', '', '', '', ''],
      ['Summary', '', '', '', '', '', '', ''],
      ['Original Loan Amount', results.summary.originalLoanAmount.toFixed(2), '', '', '', '', '', ''],
      ['Total Amount Paid', results.summary.totalAmountPaid.toFixed(2), '', '', '', '', '', ''],
      ['Total Interest Paid', results.summary.totalInterestPaid.toFixed(2), '', '', '', '', '', ''],
      ['Total Extra Payments', results.summary.totalExtraPayments.toFixed(2), '', '', '', '', '', ''],
      ['Interest Saved', results.summary.interestSaved.toFixed(2), '', '', '', '', '', ''],
      ['Time Saved', results.summary.timeSaved, '', '', '', '', '', ''],
    ]

    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'loan-amortization-schedule.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Generate sensitivity data for different extra payment amounts
  const sensitivityData = results ? [
    { extra: '$0', saved: calculateInterestSaved(0) },
    { extra: '$250', saved: calculateInterestSaved(250) },
    { extra: '$500', saved: calculateInterestSaved(500) },
    { extra: '$750', saved: calculateInterestSaved(750) },
    { extra: '$1,000', saved: calculateInterestSaved(1000) },
  ] : []

  function calculateInterestSaved(testExtraPayment: number): number {
    try {
      const testResults = generateAmortizationSchedule({
        loanAmount,
        interestRate,
        loanTermYears,
        extraPayment: testExtraPayment,
        paymentFrequency,
      })
      return testResults.summary.interestSaved
    } catch {
      return 0
    }
  }

  // Display schedule - show first 12 payments, then every 12th payment
  const getDisplaySchedule = () => {
    if (!results) return []
    
    if (showFullSchedule) {
      return results.amortizationSchedule
    }

    const schedule = results.amortizationSchedule
    const displaySchedule = []
    
    // First 12 payments
    for (let i = 0; i < Math.min(12, schedule.length); i++) {
      displaySchedule.push(schedule[i])
    }
    
    // Then every 12th payment
    for (let i = 12; i < schedule.length; i += 12) {
      if (i < schedule.length) {
        displaySchedule.push(schedule[i])
      }
    }
    
    // Always include the last payment
    if (schedule.length > 0 && displaySchedule[displaySchedule.length - 1] !== schedule[schedule.length - 1]) {
      displaySchedule.push(schedule[schedule.length - 1])
    }
    
    return displaySchedule
  }

  return (
    <CalculatorCard
      title="Loan Amortization Calculator"
      //description="Calculate loan payments and analyze the impact of extra payments"
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
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="loanAmount"
                label="Loan Amount"
                value={loanAmount}
                onChange={(value) => setLoanAmount(parseFloat(value) || 0)}
                min={0}
                prefix="$"
                //description="Total amount being borrowed"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="interestRate"
                  label="Interest Rate"
                  value={interestRate * 100}
                  onChange={(value) => setInterestRate((parseFloat(value) || 0) / 100)}
                  min={0}
                  max={30}
                  step={0.125}
                  suffix="%"
                  //description="Annual interest rate"
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
                  //description="Length of loan"
                />
              </div>

              <InputField
                id="extraPayment"
                label="Extra Monthly Payment"
                value={extraPayment}
                onChange={(value) => setExtraPayment(parseFloat(value) || 0)}
                min={0}
                prefix="$"
                //description="Additional payment towards principal"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['monthly', 'bi-weekly', 'weekly'] as const).map((freq) => (
                    <Button
                      key={freq}
                      variant={paymentFrequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentFrequency(freq)}
                      className="capitalize"
                    >
                      {freq}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={loadSampleData} variant="outline" className="flex-1">
                  Load Sample
                </Button>
                <Button onClick={calculateResults} className="flex-1">
                  Calculate
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
              <ResultsDisplay
                title="Payment Summary"
                results={[
                  {
                    label: 'Monthly Payment',
                    value: results.monthlyPayment.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Principal and interest payment'
                  },
                  {
                    label: 'Total Payments',
                    value: results.totalPayments.toString(),
                    description: `${paymentFrequency} payments`
                  },
                  {
                    label: 'Total Interest',
                    value: results.totalInterest.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }),
                    description: 'Interest paid over life of loan'
                  },
                  {
                    label: 'Payoff Date',
                    value: results.payoffDate.toLocaleDateString(),
                    description: 'When loan will be paid off'
                  }
                ]}
              />

              {extraPayment > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      Extra Payment Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Alert>
                      <AlertDescription className="text-green-700">
                        <strong>Interest Saved:</strong> {' '}
                        ${results.summary.interestSaved.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <AlertDescription className="text-blue-700">
                        <strong>Time Saved:</strong> {results.summary.timeSaved}
                      </AlertDescription>
                    </Alert>

                    <div className="text-sm text-muted-foreground">
                      Total extra payments: ${results.summary.totalExtraPayments.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {sensitivityData.length > 0 && (
                <SensitivityChart
                  title="Interest Saved vs Extra Payment"
                  data={sensitivityData}
                  xKey="extra"
                  yKey="saved"
                  xLabel="Extra Payment"
                  yLabel="Interest Saved ($)"
                />
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Amortization Schedule */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Tabs defaultValue="summary">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="summary">Payment Summary</TabsTrigger>
                <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Loan Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Original Loan</div>
                    <div className="text-lg font-semibold">
                      ${results.summary.originalLoanAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Paid</div>
                    <div className="text-lg font-semibold">
                      ${results.summary.totalAmountPaid.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                    <div className="text-lg font-semibold">
                      ${results.summary.totalInterestPaid.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Extra Payments</div>
                    <div className="text-lg font-semibold">
                      ${results.summary.totalExtraPayments.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Interest Saved</div>
                    <div className="text-lg font-semibold text-green-600">
                      ${results.summary.interestSaved.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Time Saved</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {results.summary.timeSaved}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Payment Schedule
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullSchedule(!showFullSchedule)}
                      >
                        {showFullSchedule ? 'Show Summary' : 'Show All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportResults}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!showFullSchedule && (
                    <p className="text-sm text-muted-foreground">
                      Showing first 12 payments, then every 12th payment
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">#</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Payment</TableHead>
                          <TableHead className="text-right">Principal</TableHead>
                          <TableHead className="text-right">Interest</TableHead>
                          {extraPayment > 0 && (
                            <TableHead className="text-right">Extra</TableHead>
                          )}
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getDisplaySchedule().map((entry) => (
                          <TableRow key={entry.paymentNumber}>
                            <TableCell className="text-right font-medium">
                              {entry.paymentNumber}
                            </TableCell>
                            <TableCell>
                              {entry.paymentDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${entry.paymentAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${entry.principalPayment.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${entry.interestPayment.toLocaleString()}
                            </TableCell>
                            {extraPayment > 0 && (
                              <TableCell className="text-right text-green-600">
                                ${entry.extraPayment.toLocaleString()}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              ${entry.remainingBalance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </CalculatorCard>
  )
}