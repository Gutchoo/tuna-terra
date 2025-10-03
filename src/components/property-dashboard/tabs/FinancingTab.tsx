'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePropertyFinancialModeling } from '@/lib/contexts/PropertyFinancialModelingContext'
import { formatCurrency } from '@/lib/utils'
import { HelpCircle, Calculator, CreditCard, Banknote } from 'lucide-react'
import { LoanCostsInput } from '@/components/financial-modeling/LoanCostsInput'

interface FinancingTabProps {
  canEdit?: boolean
}

export function FinancingTab({ canEdit = true }: FinancingTabProps) {
  const { state, updateAssumption } = usePropertyFinancialModeling()
  const { assumptions, results, isSaving } = state

  const financingType = assumptions.financingType || ''

  // Calculate Year 1 NOI for DSCR calculation
  const getYear1NOI = (): number => {
    if (results?.annualCashflows?.[0]?.noi) {
      return results.annualCashflows[0].noi
    }

    // Fallback calculation
    const rentalIncome = assumptions.potentialRentalIncome[0] || 0
    const otherIncome = assumptions.otherIncome[0] || 0
    const vacancyRate = assumptions.vacancyRates[0] || 0
    const grossIncome = rentalIncome + otherIncome
    const vacancyAmount = rentalIncome * vacancyRate
    const effectiveGrossIncome = grossIncome - vacancyAmount

    let opEx = 0
    if (assumptions.operatingExpenses[0] !== undefined) {
      if (assumptions.operatingExpenseType === 'percentage') {
        opEx = effectiveGrossIncome * (assumptions.operatingExpenses[0] / 100)
      } else {
        opEx = assumptions.operatingExpenses[0]
      }
    }

    return effectiveGrossIncome - opEx
  }

  // Calculate loan amount based on financing type
  const calculateLoanAmount = (): number => {
    if (financingType === 'ltv' && assumptions.targetLTV && assumptions.purchasePrice) {
      return (assumptions.targetLTV / 100) * assumptions.purchasePrice
    } else if (financingType === 'dscr' && assumptions.targetDSCR) {
      const year1NOI = getYear1NOI()

      if (year1NOI > 0 && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && assumptions.targetDSCR > 0) {
        const maxAnnualDebtService = year1NOI / assumptions.targetDSCR
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
    } else if (financingType === 'cash') {
      return 0
    }
    return assumptions.loanAmount || 0
  }

  // Calculate debt service
  const calculateDebtService = (): { annual: number; periodic: number } => {
    const loanAmount = calculateLoanAmount()

    if (loanAmount <= 0 || !assumptions.interestRate || !assumptions.amortizationYears) {
      return { annual: 0, periodic: 0 }
    }

    const paymentsPerYear = assumptions.paymentsPerYear || 12
    const periodicRate = assumptions.interestRate / paymentsPerYear
    const totalPayments = assumptions.amortizationYears * paymentsPerYear

    if (periodicRate > 0) {
      // PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
      const periodicPayment = loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1)
      const annualDebtService = periodicPayment * paymentsPerYear

      return { annual: annualDebtService, periodic: periodicPayment }
    }

    return { annual: 0, periodic: 0 }
  }

  // Calculate DSCR
  const calculateDSCR = (): number => {
    const year1NOI = getYear1NOI()
    const { annual: annualDebtService } = calculateDebtService()

    if (annualDebtService > 0) {
      return year1NOI / annualDebtService
    }

    return 0
  }

  const loanAmount = calculateLoanAmount()
  const { annual: annualDebtService, periodic: periodicPayment } = calculateDebtService()
  const dscr = calculateDSCR()

  return (
    <div className="space-y-6">
      {/* Financing Type Selector */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Financing Structure</h3>

        <div className="space-y-4">
          {/* Financing Type */}
          <div className="space-y-2">
            <Label htmlFor="financing-type">Financing Type</Label>
            <Select
              value={financingType}
              onValueChange={(value) => updateAssumption('financingType', value as 'dscr' | 'ltv' | 'cash' | '')}
              disabled={!canEdit}
            >
              <SelectTrigger id="financing-type">
                <SelectValue placeholder="Select financing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dscr">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    DSCR-Based
                  </div>
                </SelectItem>
                <SelectItem value="ltv">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    LTV-Based
                  </div>
                </SelectItem>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    All Cash
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DSCR Mode */}
          {financingType === 'dscr' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="target-dscr" className="flex items-center gap-2">
                  Target DSCR
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Debt Service Coverage Ratio - Typical range: 1.20 - 1.35
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="target-dscr"
                  type="number"
                  min="0"
                  step="0.05"
                  value={assumptions.targetDSCR || ''}
                  onChange={(e) => updateAssumption('targetDSCR', parseFloat(e.target.value) || undefined)}
                  disabled={!canEdit}
                  placeholder="1.25"
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.25"
                      value={(assumptions.interestRate * 100) || ''}
                      onChange={(e) => updateAssumption('interestRate', (parseFloat(e.target.value) || 0) / 100)}
                      disabled={!canEdit}
                      placeholder="5.0"
                      className="text-right pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amortization-years">Amortization (Years)</Label>
                  <Input
                    id="amortization-years"
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={assumptions.amortizationYears || ''}
                    onChange={(e) => updateAssumption('amortizationYears', parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    placeholder="30"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-term">Loan Term (Years)</Label>
                <Input
                  id="loan-term"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={assumptions.loanTermYears || ''}
                  onChange={(e) => updateAssumption('loanTermYears', parseInt(e.target.value) || 0)}
                  disabled={!canEdit}
                  placeholder="10"
                  className="text-right"
                />
              </div>
            </>
          )}

          {/* LTV Mode */}
          {financingType === 'ltv' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="target-ltv" className="flex items-center gap-2">
                  Target LTV (%)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Loan-to-Value Ratio - Typical range: 60% - 80%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="target-ltv"
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={assumptions.targetLTV || ''}
                    onChange={(e) => updateAssumption('targetLTV', parseFloat(e.target.value) || undefined)}
                    disabled={!canEdit}
                    placeholder="75"
                    className="text-right pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest-rate-ltv">Interest Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="interest-rate-ltv"
                      type="number"
                      min="0"
                      max="100"
                      step="0.25"
                      value={(assumptions.interestRate * 100) || ''}
                      onChange={(e) => updateAssumption('interestRate', (parseFloat(e.target.value) || 0) / 100)}
                      disabled={!canEdit}
                      placeholder="5.0"
                      className="text-right pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amortization-years-ltv">Amortization (Years)</Label>
                  <Input
                    id="amortization-years-ltv"
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={assumptions.amortizationYears || ''}
                    onChange={(e) => updateAssumption('amortizationYears', parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    placeholder="30"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-term-ltv">Loan Term (Years)</Label>
                <Input
                  id="loan-term-ltv"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={assumptions.loanTermYears || ''}
                  onChange={(e) => updateAssumption('loanTermYears', parseInt(e.target.value) || 0)}
                  disabled={!canEdit}
                  placeholder="10"
                  className="text-right"
                />
              </div>
            </>
          )}

          {/* Loan Costs (for both DSCR and LTV) */}
          {(financingType === 'dscr' || financingType === 'ltv') && (
            <div className="pt-4 border-t">
              <LoanCostsInput
                label="Loan Costs"
                value={assumptions.loanCosts || 0}
                type={assumptions.loanCostType || 'percentage'}
                onValueChange={(value: number) => updateAssumption('loanCosts', value)}
                onTypeChange={(type: 'percentage' | 'dollar') => updateAssumption('loanCostType', type)}
                tooltip="Origination fees, points, and other costs associated with obtaining the loan"
                loanAmount={loanAmount}
                className={!canEdit ? 'opacity-50 pointer-events-none' : ''}
              />
            </div>
          )}

          {/* Cash Mode Message */}
          {financingType === 'cash' && (
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              All-cash purchase - no debt financing
            </div>
          )}
        </div>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            Saving...
          </div>
        )}
      </Card>

      {/* Mini Metrics Preview */}
      {(financingType === 'dscr' || financingType === 'ltv') && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
            <p className="text-xl font-bold">
              {loanAmount > 0 ? formatCurrency(loanAmount) : '--'}
            </p>
          </Card>

          <Card className="p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Annual Debt Service</p>
            <p className="text-xl font-bold">
              {annualDebtService > 0 ? formatCurrency(annualDebtService) : '--'}
            </p>
          </Card>

          <Card className="p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">DSCR</p>
            <p className="text-xl font-bold">
              {dscr > 0 ? dscr.toFixed(2) + 'x' : '--'}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
