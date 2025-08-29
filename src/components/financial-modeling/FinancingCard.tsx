'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calculator, DollarSign, Percent, HelpCircle, Building } from 'lucide-react'
import type { PropertyAssumptions } from '@/lib/financial-modeling/proforma'
import { LoanCostsInput } from './LoanCostsInput'

interface FinancingCardProps {
  assumptions: PropertyAssumptions
  onAssumptionsChange: (assumptions: PropertyAssumptions) => void
}

export function FinancingCard({ assumptions, onAssumptionsChange }: FinancingCardProps) {
  
  const updateAssumption = <K extends keyof PropertyAssumptions>(
    key: K,
    value: PropertyAssumptions[K]
  ) => {
    onAssumptionsChange({ ...assumptions, [key]: value })
  }

  // Calculate loan amount based on financing type
  const calculateLoanAmount = () => {
    if (assumptions.financingType === 'ltv' && assumptions.targetLTV && assumptions.purchasePrice) {
      return (assumptions.targetLTV / 100) * assumptions.purchasePrice
    } else if (assumptions.financingType === 'dscr' && assumptions.targetDSCR) {
      // Calculate based on NOI and DSCR using loan parameters
      const year1NOI = getYear1NOI()
      
      if (year1NOI > 0 && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && assumptions.targetDSCR > 0) {
        const maxAnnualDebtService = year1NOI / assumptions.targetDSCR
        // Calculate loan amount using present value formula
        const paymentsPerYear = assumptions.paymentsPerYear || 12
        const periodicRate = assumptions.interestRate / paymentsPerYear
        const totalPayments = assumptions.amortizationYears * paymentsPerYear
        const periodicPayment = maxAnnualDebtService / paymentsPerYear
        
        if (periodicRate > 0) {
          // Present Value formula: PV = PMT × [(1 - (1 + r)^-n) / r]
          const loanAmount = periodicPayment * ((1 - Math.pow(1 + periodicRate, -totalPayments)) / periodicRate)
          return loanAmount
        }
      }
    }
    return assumptions.loanAmount
  }

  // Helper function to get Year 1 NOI
  const getYear1NOI = () => {
    if (assumptions.potentialRentalIncome?.[0] && assumptions.potentialRentalIncome[0] > 0) {
      // Use detailed income structure
      const grossIncome = assumptions.potentialRentalIncome[0]
      const vacancyAmount = grossIncome * (assumptions.vacancyRates?.[0] || 0)
      const effectiveGrossIncome = grossIncome - vacancyAmount
      
      let opEx = 0
      if (assumptions.operatingExpenses?.[0] !== undefined) {
        if (assumptions.operatingExpenseType === 'percentage') {
          opEx = effectiveGrossIncome * ((assumptions.operatingExpenses[0] || 0) / 100)
        } else {
          opEx = assumptions.operatingExpenses[0] || 0
        }
      }
      
      return effectiveGrossIncome - opEx
    } else if (assumptions.year1NOI) {
      return assumptions.year1NOI
    }
    return 0
  }

  // Auto-calculate loan amount when parameters change
  const handleAutoCalculation = () => {
    if (assumptions.financingType === 'cash') {
      updateAssumption('loanAmount', 0)
    } else if (assumptions.financingType === 'dscr') {
      // For DSCR, always calculate based on NOI and loan parameters
      const calculatedLoanAmount = calculateLoanAmount()
      updateAssumption('loanAmount', Math.round(calculatedLoanAmount * 100) / 100)
    } else {
      // For LTV, use existing calculation
      const calculatedLoanAmount = calculateLoanAmount()
      updateAssumption('loanAmount', Math.round(calculatedLoanAmount * 100) / 100)
    }
  }

  // Auto-update loan amount for DSCR whenever relevant parameters change
  const autoUpdateLoanAmount = () => {
    if (assumptions.financingType === 'dscr' && assumptions.targetDSCR && assumptions.interestRate > 0 && assumptions.amortizationYears > 0) {
      const calculatedLoanAmount = calculateLoanAmount()
      if (Math.abs(calculatedLoanAmount - assumptions.loanAmount) > 1) { // Only update if significantly different
        updateAssumption('loanAmount', Math.round(calculatedLoanAmount * 100) / 100)
      }
    }
  }

  // Auto-update loan amount for LTV whenever relevant parameters change
  const autoUpdateLTVLoanAmount = () => {
    if (assumptions.financingType === 'ltv' && assumptions.targetLTV && assumptions.purchasePrice > 0) {
      const calculatedLoanAmount = (assumptions.targetLTV / 100) * assumptions.purchasePrice
      if (Math.abs(calculatedLoanAmount - assumptions.loanAmount) > 1) { // Only update if significantly different
        updateAssumption('loanAmount', Math.round(calculatedLoanAmount * 100) / 100)
      }
    }
  }

  // Auto-update loan amounts when dependencies change
  React.useEffect(() => {
    if (assumptions.financingType === 'ltv') {
      autoUpdateLTVLoanAmount()
    } else if (assumptions.financingType === 'dscr') {
      autoUpdateLoanAmount()
    }
  }, [
    assumptions.financingType,
    assumptions.targetLTV, 
    assumptions.purchasePrice,
    assumptions.targetDSCR,
    assumptions.interestRate,
    assumptions.amortizationYears,
    assumptions.potentialRentalIncome?.[0],
    assumptions.operatingExpenses?.[0],
    assumptions.vacancyRates?.[0]
  ])

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Calculate periodic payment for display
  const calculatePeriodicPayment = (loanAmount: number) => {
    if (loanAmount <= 0 || assumptions.interestRate <= 0 || assumptions.amortizationYears <= 0) return 0
    
    const paymentsPerYear = assumptions.paymentsPerYear || 12
    const periodicRate = assumptions.interestRate / paymentsPerYear
    const totalPayments = assumptions.amortizationYears * paymentsPerYear
    
    if (periodicRate === 0) {
      return loanAmount / totalPayments
    }
    
    const numerator = loanAmount * periodicRate * Math.pow(1 + periodicRate, totalPayments)
    const denominator = Math.pow(1 + periodicRate, totalPayments) - 1
    
    return numerator / denominator
  }

  // Calculate current metrics for display
  const currentLTV = assumptions.purchasePrice > 0 ? (assumptions.loanAmount / assumptions.purchasePrice) * 100 : 0
  const year1NOI = getYear1NOI()

  // Calculate annual debt service for DSCR calculation
  const calculateAnnualDebtService = () => {
    if (assumptions.loanAmount <= 0 || assumptions.interestRate <= 0) return 0
    
    const paymentsPerYear = assumptions.paymentsPerYear || 12
    const periodicRate = assumptions.interestRate / paymentsPerYear
    const totalPayments = assumptions.amortizationYears * paymentsPerYear
    
    if (periodicRate === 0) {
      return assumptions.loanAmount / assumptions.amortizationYears
    }
    
    const numerator = assumptions.loanAmount * periodicRate * Math.pow(1 + periodicRate, totalPayments)
    const denominator = Math.pow(1 + periodicRate, totalPayments) - 1
    const periodicPayment = numerator / denominator
    
    return periodicPayment * paymentsPerYear
  }

  const annualDebtService = calculateAnnualDebtService()
  const currentDSCR = annualDebtService > 0 ? year1NOI / annualDebtService : 0

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Financing Assumptions
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your financing approach and configure loan parameters
        </p>
      </div>
      
      {/* Financing Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Financing Method</Label>
        <Tabs 
          value={assumptions.financingType} 
          onValueChange={(value: string) => {
            const typedValue = value as 'dscr' | 'ltv' | 'cash'
            updateAssumption('financingType', typedValue)
            // Auto-calculate loan amount for new type
            setTimeout(() => {
              if (typedValue === 'cash') {
                updateAssumption('loanAmount', 0)
              } else {
                handleAutoCalculation()
              }
            }, 100)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dscr" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              DSCR
            </TabsTrigger>
            <TabsTrigger value="ltv" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              LTV
            </TabsTrigger>
            <TabsTrigger value="cash" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              All Cash
            </TabsTrigger>
          </TabsList>
          
          {/* DSCR Content */}
          <TabsContent value="dscr" className="space-y-6 mt-6">
            <Alert>
              <AlertDescription className="flex items-start gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">
                        <strong>Debt Service Coverage Ratio (DSCR):</strong> Measures the property&apos;s ability to cover debt payments. 
                        Calculated as Net Operating Income ÷ Annual Debt Service. 
                        Lenders typically require DSCR of 1.20x or higher, meaning the property generates 20% more income than needed for debt payments.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <strong>DSCR-Based Financing:</strong> Loan amount calculated based on the property&apos;s income and your target debt coverage ratio.
                  The system will calculate the optimal loan amount based on your NOI and loan parameters.
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Loan Parameters for DSCR - Two Line Layout */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Loan Parameters</h4>
              
              {/* First line: Target DSCR, Interest Rate, Loan Term */}
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="target-dscr" className="text-sm font-medium">Target DSCR</Label>
                  <Input
                    id="target-dscr"
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="3.0"
                    value={assumptions.targetDSCR || ''}
                    onChange={(e) => updateAssumption('targetDSCR', parseFloat(e.target.value) || undefined)}
                    placeholder="1.25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dscr-interest-rate" className="text-sm font-medium">Interest Rate (%)</Label>
                  <Input
                    id="dscr-interest-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={assumptions.interestRate > 0 ? parseFloat((assumptions.interestRate * 100).toFixed(2)).toString() : ''}
                    onChange={(e) => updateAssumption('interestRate', (parseFloat(e.target.value) || 0) / 100)}
                    placeholder="6.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dscr-loan-term" className="text-sm font-medium">Loan Term (Years)</Label>
                  <Input
                    id="dscr-loan-term"
                    type="number"
                    min="1"
                    max="30"
                    value={assumptions.loanTermYears || ''}
                    onChange={(e) => updateAssumption('loanTermYears', parseFloat(e.target.value) || 0)}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Second line: Amortization, Loan Costs, Payment Frequency */}
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dscr-amortization" className="text-sm font-medium">Amortization (Years)</Label>
                  <Input
                    id="dscr-amortization"
                    type="number"
                    min="1"
                    max="50"
                    value={assumptions.amortizationYears || ''}
                    onChange={(e) => updateAssumption('amortizationYears', parseFloat(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <LoanCostsInput
                    label="Loan Costs"
                    value={assumptions.loanCosts}
                    type={assumptions.loanCostType}
                    onValueChange={(value) => updateAssumption('loanCosts', value)}
                    onTypeChange={(type) => updateAssumption('loanCostType', type)}
                    tooltip="Loan origination fees, points, appraisal, legal, and other loan-related costs. Can be entered as a percentage of the loan amount or as a fixed dollar amount."
                    loanAmount={calculateLoanAmount()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dscr-payment-frequency" className="text-sm font-medium">Payment Frequency</Label>
                  <Select
                    value={assumptions.paymentsPerYear.toString()}
                    onValueChange={(value) => updateAssumption('paymentsPerYear', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Monthly (12/year)</SelectItem>
                      <SelectItem value="4">Quarterly (4/year)</SelectItem>
                      <SelectItem value="2">Semi-Annual (2/year)</SelectItem>
                      <SelectItem value="1">Annual (1/year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Calculated Financing Display */}
            {year1NOI > 0 && assumptions.targetDSCR && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && (
              (() => {
                const calculatedLoanAmount = calculateLoanAmount()
                const annualDebtService = calculatePeriodicPayment(calculatedLoanAmount) * (assumptions.paymentsPerYear || 12)
                const periodicPayment = calculatePeriodicPayment(calculatedLoanAmount)
                const paymentFrequency = assumptions.paymentsPerYear === 12 ? 'Monthly' : 
                                       assumptions.paymentsPerYear === 4 ? 'Quarterly' : 
                                       assumptions.paymentsPerYear === 2 ? 'Semi-Annual' : 'Annual'

                return (
                  <div className="pt-4 border-t">
                    <h4 className="text-base font-medium text-muted-foreground mb-4">Calculated Financing</h4>
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">Loan Amount</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(calculatedLoanAmount)}
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">Annual Debt Service</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(annualDebtService)}
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">{paymentFrequency} Payment</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(periodicPayment)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()
            )}
          </TabsContent>
          
          {/* LTV Content */}
          <TabsContent value="ltv" className="space-y-6 mt-6">
            <Alert>
              <AlertDescription className="flex items-start gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">
                        <strong>Loan-to-Value Ratio (LTV):</strong> The loan amount as a percentage of the property&apos;s purchase price. 
                        Calculated as Loan Amount ÷ Purchase Price × 100. 
                        Lower LTV = more equity required but typically better loan terms. Commercial properties often max at 70-80% LTV.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <strong>LTV-Based Financing:</strong> Loan amount calculated as a percentage of the property&apos;s purchase price.
                  The system will calculate the loan amount based on your target LTV and purchase price.
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Loan Parameters for LTV - Two Line Layout */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Loan Parameters</h4>
              
              {/* First line: Target LTV, Interest Rate, Loan Term */}
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="target-ltv" className="text-sm font-medium">Target LTV (%)</Label>
                  <Input
                    id="target-ltv"
                    type="number"
                    step="5"
                    min="0"
                    max="90"
                    value={assumptions.targetLTV || ''}
                    onChange={(e) => {
                      const newLTV = parseFloat(e.target.value) || undefined
                      updateAssumption('targetLTV', newLTV)
                      
                      // Auto-calculate loan amount when LTV changes
                      if (newLTV && assumptions.purchasePrice > 0) {
                        const calculatedLoanAmount = (newLTV / 100) * assumptions.purchasePrice
                        updateAssumption('loanAmount', Math.round(calculatedLoanAmount * 100) / 100)
                      }
                    }}
                    placeholder="75"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ltv-interest-rate" className="text-sm font-medium">Interest Rate (%)</Label>
                  <Input
                    id="ltv-interest-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={assumptions.interestRate > 0 ? parseFloat((assumptions.interestRate * 100).toFixed(2)).toString() : ''}
                    onChange={(e) => updateAssumption('interestRate', (parseFloat(e.target.value) || 0) / 100)}
                    placeholder="6.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ltv-loan-term" className="text-sm font-medium">Loan Term (Years)</Label>
                  <Input
                    id="ltv-loan-term"
                    type="number"
                    min="1"
                    max="30"
                    value={assumptions.loanTermYears || ''}
                    onChange={(e) => updateAssumption('loanTermYears', parseFloat(e.target.value) || 0)}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Second line: Amortization, Loan Costs, Payment Frequency */}
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ltv-amortization" className="text-sm font-medium">Amortization (Years)</Label>
                  <Input
                    id="ltv-amortization"
                    type="number"
                    min="1"
                    max="50"
                    value={assumptions.amortizationYears || ''}
                    onChange={(e) => updateAssumption('amortizationYears', parseFloat(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <LoanCostsInput
                    label="Loan Costs"
                    value={assumptions.loanCosts}
                    type={assumptions.loanCostType}
                    onValueChange={(value) => updateAssumption('loanCosts', value)}
                    onTypeChange={(type) => updateAssumption('loanCostType', type)}
                    tooltip="Loan origination fees, points, appraisal, legal, and other loan-related costs. Can be entered as a percentage of the loan amount or as a fixed dollar amount."
                    loanAmount={calculateLoanAmount()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ltv-payment-frequency" className="text-sm font-medium">Payment Frequency</Label>
                  <Select
                    value={assumptions.paymentsPerYear.toString()}
                    onValueChange={(value) => updateAssumption('paymentsPerYear', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Monthly (12/year)</SelectItem>
                      <SelectItem value="4">Quarterly (4/year)</SelectItem>
                      <SelectItem value="2">Semi-Annual (2/year)</SelectItem>
                      <SelectItem value="1">Annual (1/year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Calculated Financing Display */}
            {assumptions.purchasePrice > 0 && assumptions.targetLTV && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && (
              (() => {
                const calculatedLoanAmount = calculateLoanAmount()
                const annualDebtService = calculatePeriodicPayment(calculatedLoanAmount) * (assumptions.paymentsPerYear || 12)
                const periodicPayment = calculatePeriodicPayment(calculatedLoanAmount)
                const paymentFrequency = assumptions.paymentsPerYear === 12 ? 'Monthly' : 
                                       assumptions.paymentsPerYear === 4 ? 'Quarterly' : 
                                       assumptions.paymentsPerYear === 2 ? 'Semi-Annual' : 'Annual'

                return (
                  <div className="pt-4 border-t">
                    <h4 className="text-base font-medium text-muted-foreground mb-4">Calculated Financing</h4>
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">Loan Amount</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(calculatedLoanAmount)}
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">Annual Debt Service</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(annualDebtService)}
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-sm text-muted-foreground font-medium">{paymentFrequency} Payment</div>
                        <div className="text-2xl font-bold">
                          ${formatCurrency(periodicPayment)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()
            )}
          </TabsContent>
          
          {/* Cash Content */}
          <TabsContent value="cash" className="space-y-4 mt-6">
            <Alert>
              <AlertDescription>
                <strong>All Cash Purchase:</strong> No financing - you&apos;ll purchase the property outright with cash.
                This eliminates debt service and interest expenses but requires more capital upfront.
              </AlertDescription>
            </Alert>
            
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Cash Purchase</h3>
              <p className="text-muted-foreground mb-4">No loan required - financing fields will be disabled</p>
              <Badge variant="secondary" className="text-sm">
                Loan Amount: $0
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}