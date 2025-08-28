"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Calculator, Download } from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, formatPercentage } from "@/lib/utils"

export function NewResultsPanel() {
  const { state } = useFinancialModeling()
  const { results, isCalculating, activeSection, assumptions } = state

  // Calculate effective loan amount (handles DSCR dynamic calculation)
  const getEffectiveLoanAmount = () => {
    if (assumptions.financingType === 'dscr' && assumptions.targetDSCR) {
      // Get Year 1 NOI
      const year1NOI = assumptions.potentialRentalIncome[0] - assumptions.operatingExpenses[0] - 
                      (assumptions.potentialRentalIncome[0] * (assumptions.vacancyRates[0] || 0))
      
      if (year1NOI > 0 && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && assumptions.targetDSCR > 0) {
        const maxAnnualDebtService = year1NOI / assumptions.targetDSCR
        const paymentsPerYear = assumptions.paymentsPerYear || 12
        const periodicRate = assumptions.interestRate / paymentsPerYear
        const totalPayments = assumptions.amortizationYears * paymentsPerYear
        
        if (periodicRate > 0) {
          const periodicPayment = maxAnnualDebtService / paymentsPerYear
          return periodicPayment * ((1 - Math.pow(1 + periodicRate, -totalPayments)) / periodicRate)
        }
      }
    }
    return assumptions.loanAmount || 0
  }

  const effectiveLoanAmount = getEffectiveLoanAmount()

  // Calculate manual initial investment based on the displayed line items
  const calculateInitialInvestment = () => {
    const acquisitionPrice = assumptions.purchasePrice || 0
    const acquisitionCosts = assumptions.acquisitionCostType === 'percentage' 
      ? (assumptions.acquisitionCosts / 100) * acquisitionPrice
      : assumptions.acquisitionCosts
    const loanCosts = assumptions.financingType !== 'cash' && assumptions.financingType !== '' 
      ? (assumptions.loanCostType === 'percentage' && effectiveLoanAmount > 0
          ? (assumptions.loanCosts / 100) * effectiveLoanAmount
          : assumptions.loanCosts)
      : 0
    
    return acquisitionPrice + acquisitionCosts + loanCosts - effectiveLoanAmount
  }

  const manualInitialInvestment = calculateInitialInvestment()

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      ['Financial Modeling Results'],
      [''],
      ['Key Metrics', ''],
      ['Total Equity Invested', formatCurrency(results.totalEquityInvested)],
      ['Total Cash Returned', formatCurrency(results.totalCashReturned)],
      ['Net Profit', formatCurrency(results.netProfit)],
      ['IRR', results.irr ? `${(results.irr * 100).toFixed(2)}%` : 'N/A'],
      ['Equity Multiple', `${results.equityMultiple.toFixed(2)}x`],
      ['Average Cash-on-Cash', `${(results.averageCashOnCash * 100).toFixed(2)}%`],
      ['Total Tax Savings', formatCurrency(results.totalTaxSavings)],
    ]

    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial-results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'input-sheet': return 'Live Analysis'
      case 'cashflows': return 'Cashflow Analysis'
      case 'sale': return 'Sale Analysis'
      default: return 'Analysis Results'
    }
  }

  const hasBasicInputs = () => {
    return assumptions.purchasePrice > 0 || 
           assumptions.potentialRentalIncome.some(income => income > 0)
  }


  return (
    <div className="h-full border-l bg-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{getSectionTitle()}</h3>
            {results && (
              <Button size="sm" variant="outline" onClick={exportResults}>
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
          {isCalculating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="h-3 w-3 animate-spin" />
              <span>Updating analysis...</span>
            </div>
          )}
        </div>

        {/* Results Content */}
        {isCalculating && (
          <div className="space-y-3">
            <div className="text-center">
              <Calculator className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Running analysis...</p>
            </div>
            <Progress value={66} className="w-full" />
          </div>
        )}

        {!results && !isCalculating && (
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {hasBasicInputs() ? 
                  "Analysis will appear here as you configure your property." :
                  "Enter your property details to see live analysis results."
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Updates automatically as you type
              </p>
            </CardContent>
          </Card>
        )}

        {results && !isCalculating && (
          <div className="space-y-4">
            {/* Investment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Acquisition Price</span>
                  <span className="font-mono">{formatCurrency(assumptions.purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Acquisition Costs</span>
                  <span className="font-mono">{formatCurrency(
                    assumptions.acquisitionCostType === 'percentage' 
                      ? (assumptions.acquisitionCosts / 100) * assumptions.purchasePrice
                      : assumptions.acquisitionCosts
                  )}</span>
                </div>
{assumptions.financingType !== 'cash' && assumptions.financingType !== '' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan Costs</span>
                    <span className="font-mono">{formatCurrency(
                      assumptions.loanCostType === 'percentage' && effectiveLoanAmount > 0
                        ? (assumptions.loanCosts / 100) * effectiveLoanAmount
                        : assumptions.loanCosts
                    )}</span>
                  </div>
                )}
                {assumptions.financingType !== 'cash' && assumptions.financingType !== '' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minus: Mortgages</span>
                    <span className="font-mono text-red-600">({formatCurrency(effectiveLoanAmount)})</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Initial Investment</span>
                  <span className="font-mono font-semibold">{formatCurrency(manualInitialInvestment)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Key Metrics
              </h4>
              
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Return</span>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {formatCurrency(results.netProfit)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">IRR</span>
                      <div className="flex items-center gap-1">
                        {results.irr && results.irr > 0.12 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className="font-mono font-semibold">
                          {results.irr ? `${(results.irr * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cash-on-Cash</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-blue-600" />
                        <span className="font-mono font-semibold">
                          {formatPercentage(results.averageCashOnCash * 100)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Equity Multiple</span>
                      <span className="font-mono font-semibold">
                        {results.equityMultiple.toFixed(2)}x
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cash Flow Summary */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Cash Flow
              </h4>
              
              <div className="space-y-2">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Year 1</span>
                      <span className="font-mono text-sm">
                        {results.annualCashflows.length > 0 
                          ? formatCurrency(results.annualCashflows[0].afterTaxCashflow)
                          : '$0'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Average Annual</span>
                      <span className="font-mono text-sm">
                        {formatCurrency(results.annualCashflows.length > 0 
                          ? results.annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0) / results.annualCashflows.length
                          : 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Total Operating</span>
                      <span className="font-mono text-sm font-semibold text-green-600">
                        {formatCurrency(results.annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}