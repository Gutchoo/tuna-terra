"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency } from "@/lib/utils"
import { 
  calculateNPV,
  calculateBeforeTaxNPV,
  calculateBeforeTaxIRR,
  calculateBeforeTaxEquityMultiple, 
  calculateUnleveredIRR,
  calculateUnleveredBeforeTaxIRR, 
  calculateDebtYield,
  calculatePurchaseCapRate,
  calculateYieldOnCost
  // runSensitivityAnalysis - commented out with sensitivity section
} from "@/lib/financial-modeling/metrics"

export function DealSummaryPanel() {
  const { state } = useFinancialModeling()
  const { results, isCalculating, assumptions } = state
  const [showAfterTax, setShowAfterTax] = useState(false)

  // Calculate effective loan amount (handles DSCR dynamic calculation)
  const getEffectiveLoanAmount = () => {
    if (assumptions.financingType === 'dscr' && assumptions.targetDSCR) {
      const getYear1NOI = () => {
        if (assumptions.potentialRentalIncome?.[0] && assumptions.potentialRentalIncome[0] > 0) {
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
        }
        return 0
      }
      
      const year1NOI = getYear1NOI()
      
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

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!results) return null

    const acquisitionPrice = assumptions.purchasePrice || 0
    const acquisitionCosts = assumptions.acquisitionCostType === 'percentage' 
      ? (assumptions.acquisitionCosts / 100) * acquisitionPrice
      : assumptions.acquisitionCosts
    const loanCosts = assumptions.financingType !== 'cash' && assumptions.financingType !== '' 
      ? (assumptions.loanCostType === 'percentage' && effectiveLoanAmount > 0
          ? (assumptions.loanCosts / 100) * effectiveLoanAmount
          : assumptions.loanCosts)
      : 0
    
    const totalProjectCost = acquisitionPrice + acquisitionCosts + loanCosts
    const initialEquity = acquisitionPrice + acquisitionCosts + loanCosts - effectiveLoanAmount
    const ltv = effectiveLoanAmount > 0 && acquisitionPrice > 0 
      ? (effectiveLoanAmount / acquisitionPrice) * 100 
      : 0

    // Year 1 metrics
    const year1NOI = results.annualCashflows[0]?.noi || 0
    const purchaseCapRate = calculatePurchaseCapRate(year1NOI, acquisitionPrice)
    const year1CashOnCash = results.annualCashflows[0] && initialEquity > 0
      ? (results.annualCashflows[0].afterTaxCashflow / initialEquity) * 100
      : 0
    
    // Find stabilized year (typically year 2 or 3)
    const stabilizedNOI = results.annualCashflows[Math.min(2, results.annualCashflows.length - 1)]?.noi || year1NOI
    const yieldOnCost = calculateYieldOnCost(stabilizedNOI, totalProjectCost)

    // Debt metrics
    const annualDebtService = results.annualCashflows[0]?.debtService || 0
    const dscr = annualDebtService > 0 ? year1NOI / annualDebtService : 0
    const debtYield = calculateDebtYield(year1NOI, effectiveLoanAmount)

    // NPV calculation (using 10% discount rate as default)
    const discountRate = 0.10
    const afterTaxNPV = calculateNPV(results, discountRate)
    const beforeTaxNPV = calculateBeforeTaxNPV(results, discountRate)

    // IRR calculations
    const afterTaxIRR = results.irr
    const beforeTaxIRR = calculateBeforeTaxIRR(results)
    
    // Equity Multiple calculations
    const afterTaxEquityMultiple = results.equityMultiple
    const beforeTaxEquityMultiple = calculateBeforeTaxEquityMultiple(results)

    // Unlevered IRR calculations
    const unleveredAfterTaxIRR = calculateUnleveredIRR(assumptions)
    const unleveredBeforeTaxIRR = calculateUnleveredBeforeTaxIRR(assumptions)

    return {
      totalProjectCost,
      initialEquity,
      ltv,
      year1NOI,
      purchaseCapRate,
      year1CashOnCash,
      yieldOnCost,
      annualDebtService,
      dscr,
      debtYield,
      afterTaxNPV,
      beforeTaxNPV,
      afterTaxIRR,
      beforeTaxIRR,
      afterTaxEquityMultiple,
      beforeTaxEquityMultiple,
      unleveredAfterTaxIRR,
      unleveredBeforeTaxIRR,
      discountRate
    }
  }

  const metrics = results ? calculateMetrics() : null

  // Commented out sections - can be re-enabled later
  // const sensitivity = results ? runSensitivityAnalysis(assumptions, results) : null
  // const covenantFlags = checkCovenants()

  if (!results && !isCalculating) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Enter your property details to see the deal summary.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Deal Summary</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="tax-toggle" className="text-sm">
              {showAfterTax ? "After-Tax" : "Before-Tax"}
            </Label>
            <Switch 
              id="tax-toggle"
              checked={showAfterTax}
              onCheckedChange={setShowAfterTax}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Section 0: Investment Snapshot */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Investment Snapshot</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purchase Price</span>
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
                <span className="text-muted-foreground">Loan Costs (Points/Fees)</span>
                <span className="font-mono">{formatCurrency(
                  assumptions.loanCostType === 'percentage' && effectiveLoanAmount > 0
                    ? (assumptions.loanCosts / 100) * effectiveLoanAmount
                    : assumptions.loanCosts
                )}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Project Cost</span>
              <span className="font-mono font-semibold">{formatCurrency(metrics?.totalProjectCost || 0)}</span>
            </div>
            {assumptions.financingType !== 'cash' && assumptions.financingType !== '' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-mono">{formatCurrency(effectiveLoanAmount)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Initial Investment</span>
              <span className="font-mono font-semibold">{formatCurrency(metrics?.initialEquity || 0)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 1: Returns */}
        <div>
          <h3 className="text-sm font-semibold mb-3">
            Returns {showAfterTax && "(After-Tax)"}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Levered IRR</span>
              <span className="font-mono font-semibold">
                {showAfterTax 
                  ? (metrics?.afterTaxIRR ? `${(metrics.afterTaxIRR * 100).toFixed(1)}%` : 'N/A')
                  : (metrics?.beforeTaxIRR ? `${(metrics.beforeTaxIRR * 100).toFixed(1)}%` : 'N/A')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unlevered IRR</span>
              <span className="font-mono">
                {showAfterTax 
                  ? (metrics?.unleveredAfterTaxIRR ? `${(metrics.unleveredAfterTaxIRR * 100).toFixed(1)}%` : 'N/A')
                  : (metrics?.unleveredBeforeTaxIRR ? `${(metrics.unleveredBeforeTaxIRR * 100).toFixed(1)}%` : 'N/A')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equity Multiple</span>
              <span className="font-mono font-semibold">
                {showAfterTax 
                  ? `${metrics?.afterTaxEquityMultiple?.toFixed(2) || '0.00'}×`
                  : `${metrics?.beforeTaxEquityMultiple?.toFixed(2) || '0.00'}×`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                NPV @ {((metrics?.discountRate ?? 0) * 100).toFixed(0)}%
              </span>
              <span className="font-mono">
                {showAfterTax 
                  ? formatCurrency(metrics?.afterTaxNPV || 0)
                  : formatCurrency(metrics?.beforeTaxNPV || 0)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 2: Income & Yield */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Income & Yield</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Year-1 NOI</span>
              <span className="font-mono">{formatCurrency(metrics?.year1NOI || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purchase Cap Rate</span>
              <span className="font-mono">{metrics?.purchaseCapRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cash-on-Cash (Y1)</span>
              <span className="font-mono font-semibold">{metrics?.year1CashOnCash.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stabilized Yield on Cost (Y3)</span>
              <span className="font-mono">{metrics?.yieldOnCost.toFixed(2)}%</span>
            </div>
            {showAfterTax && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After-Tax Cash Flow (Y1)</span>
                  <span className="font-mono">
                    {formatCurrency(results?.annualCashflows[0]?.afterTaxCashflow || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxable Income (Y1)</span>
                  <span className="font-mono">
                    {formatCurrency(results?.annualCashflows[0]?.taxableIncome || 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {assumptions.financingType !== 'cash' && assumptions.financingType !== '' && (
          <>
            <Separator />
            {/* Section 3: Debt Health */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Debt Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate / Amort</span>
                  <span className="font-mono">
                    {(assumptions.interestRate * 100).toFixed(2)}% / {assumptions.amortizationYears} yrs
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Debt Service</span>
                  <span className="font-mono">{formatCurrency(metrics?.annualDebtService || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">DSCR (Y1)</span>
                  <span className={`font-mono font-semibold ${(metrics?.dscr ?? 0) < 1.2 ? 'text-red-600' : ''}`}>
                    {(metrics?.dscr ?? 0).toFixed(2)}×
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Debt Yield (Y1)</span>
                  <span className="font-mono">{metrics?.debtYield.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Section 4: Exit Snapshot */}
        <div>
          <h3 className="text-sm font-semibold mb-3">
            Exit Snapshot ({assumptions.holdPeriodYears}-yr Hold)
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exit Cap Rate</span>
              <span className="font-mono">
                {assumptions.dispositionCapRate ? 
                  `${(assumptions.dispositionCapRate * 100).toFixed(2)}%` : 
                  'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projected Sale Price</span>
              <span className="font-mono">{formatCurrency(results?.saleProceeds.salePrice || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Less: Selling Costs</span>
              <span className="font-mono text-red-600">
                ({formatCurrency(results?.saleProceeds.sellingCosts || 0)})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Less: Loan Balance</span>
              <span className="font-mono text-red-600">
                ({formatCurrency(results?.saleProceeds.loanBalance || 0)})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Proceeds Before-Tax</span>
              <span className="font-mono font-semibold">
                {formatCurrency(results?.saleProceeds.beforeTaxSaleProceeds || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Gain</span>
              <span className="font-mono">{formatCurrency(results?.saleProceeds.totalGain || 0)}</span>
            </div>
            
            {showAfterTax && results?.saleProceeds && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Depreciation Recapture</span>
                  <span className="font-mono">
                    {formatCurrency(results.saleProceeds.deprecationRecapture)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capital Gains</span>
                  <span className="font-mono">
                    {formatCurrency(results.saleProceeds.capitalGains)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Less: Taxes on Sale</span>
                  <span className="font-mono text-red-600">
                    ({formatCurrency(results.saleProceeds.taxesOnSale)})
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-medium">
                  <span>Sale Proceeds After-Tax</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(results.saleProceeds.afterTaxSaleProceeds)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* <Separator />

        {/* Section 5: Sensitivities */}
        {/* {sensitivity && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Sensitivities</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">IRR vs Exit Cap (±50 bps): </span>
                  <span className="font-mono text-xs">
                    -50bps→{(sensitivity.exitCap.minus50bps * 100).toFixed(1)}% | 
                    +50bps→{(sensitivity.exitCap.plus50bps * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">IRR vs Rent Growth (±100 bps): </span>
                  <span className="font-mono text-xs">
                    -100bps→{(sensitivity.rentGrowth.minus100bps * 100).toFixed(1)}% | 
                    +100bps→{(sensitivity.rentGrowth.plus100bps * 100).toFixed(1)}%
                  </span>
                </div>
                {assumptions.financingType !== 'cash' && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">DSCR vs Rate (±50 bps): </span>
                    <span className="font-mono text-xs">
                      -50bps→{sensitivity.interestRate.dscr.minus50bps.toFixed(2)}× | 
                      +50bps→{sensitivity.interestRate.dscr.plus50bps.toFixed(2)}×
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )} */}

        {/* Section 6: Flags & Covenants */}
        {/* <div>
          <h3 className="text-sm font-semibold mb-3">Flags & Covenants</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min DSCR Breach?</span>
              <span className={`font-mono ${covenantFlags.dscr ? 'text-red-600 font-semibold' : ''}`}>
                {covenantFlags.dscr ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max LTV Breach at Exit?</span>
              <span className={`font-mono ${covenantFlags.ltv ? 'text-red-600 font-semibold' : ''}`}>
                {covenantFlags.ltv ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Negative Y1 CoC?</span>
              <span className={`font-mono ${covenantFlags.coc ? 'text-red-600 font-semibold' : ''}`}>
                {covenantFlags.coc ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 7: Notes / Assumptions */}
        {/* <div>
          <h3 className="text-sm font-semibold mb-3">Notes / Assumptions</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="font-medium">Depreciable Basis:</span> {formatCurrency(
                (assumptions.purchasePrice + (assumptions.acquisitionCostType === 'percentage' 
                  ? (assumptions.acquisitionCosts / 100) * assumptions.purchasePrice
                  : assumptions.acquisitionCosts)) * (assumptions.improvementsPercentage / 100)
              )} over {assumptions.depreciationYears} yrs (Mid-Month)
            </p>
            <p>
              <span className="font-medium">Tax Rates:</span> Ordinary {(assumptions.ordinaryIncomeTaxRate * 100).toFixed(0)}% • 
              LTCG {(assumptions.capitalGainsTaxRate * 100).toFixed(0)}% • 
              Recapture {(assumptions.depreciationRecaptureRate * 100).toFixed(0)}%
            </p>
            <p>
              <span className="font-medium">Selling Costs:</span> {
                assumptions.costOfSaleType === 'percentage' 
                  ? `${((assumptions.costOfSalePercentage || 0) * 100).toFixed(1)}% of sale price`
                  : formatCurrency(assumptions.costOfSaleAmount)
              }
            </p>
            <p>
              <span className="font-medium">Discount Rate:</span> {(metrics?.discountRate * 100).toFixed(0)}%
            </p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}