"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Download, 
  AlertCircle,
  Building,
  Percent,
  TrendingDown
} from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, formatPercentage, cn } from "@/lib/utils"

export function SaleContent() {
  const { state } = useFinancialModeling()
  const { assumptions, results } = state
  
  // Early return if no results
  if (!results || !results.saleProceeds) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Run the financial analysis from the Input Sheet to see detailed sale calculations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  const sale = results.saleProceeds
  const holdYears = assumptions.holdPeriodYears
  
  // Helper function to format values (positive/negative styling)
  const formatValue = (value: number, showParentheses = true) => {
    if (value < 0 && showParentheses) {
      return `(${formatCurrency(Math.abs(value))})`
    }
    return formatCurrency(value)
  }
  
  // Export functionality
  const exportSaleAnalysis = () => {
    const data = [
      ['Sale Analysis Summary'],
      [''],
      ['PROJECTED SALE PRICE CALCULATION'],
      [`Year ${holdYears + 1} Proforma NOI`, formatCurrency(sale.yearAfterHoldNOI)],
      ['Exit Cap Rate', formatPercentage(sale.exitCapRate * 100)],
      ['Calculated Sale Price', formatCurrency(sale.salePrice)],
      [''],
      ['ADJUSTED BASIS CALCULATION'],
      ['Purchase Price', formatCurrency(assumptions.purchasePrice)],
      ['Add: Acquisition Costs', formatCurrency(sale.originalBasis - assumptions.purchasePrice)],
      ['Original Basis', formatCurrency(sale.originalBasis)],
      ['Less: Accumulated Depreciation', formatCurrency(-sale.accumulatedDepreciation)],
      ['Adjusted Basis at Sale', formatCurrency(sale.adjustedBasis)],
      [''],
      ['CAPITAL GAIN CALCULATION'],
      ['Sale Price', formatCurrency(sale.salePrice)],
      ['Less: Costs of Sale', formatCurrency(-sale.sellingCosts)],
      ['Net Sale Proceeds', formatCurrency(sale.netSaleProceeds)],
      ['Less: Adjusted Basis', formatCurrency(-sale.adjustedBasis)],
      ['Total Gain (Loss)', formatCurrency(sale.totalGain)],
      ['Depreciation Recapture (Sec 1250)', formatCurrency(sale.deprecationRecapture)],
      ['Capital Gain from Appreciation', formatCurrency(sale.capitalGains)],
      ['Capital Gains Tax', formatCurrency(sale.capitalGainsTax)],
      ['Depreciation Recapture Tax', formatCurrency(sale.depreciationRecaptureTax)],
      ['Total Tax Liability', formatCurrency(sale.taxesOnSale)],
      [''],
      ['SALE PROCEEDS CALCULATION'],
      ['Gross Sale Price', formatCurrency(sale.salePrice)],
      ['Less: Costs of Sale', formatCurrency(-sale.sellingCosts)],
      ['Net Sale Proceeds', formatCurrency(sale.netSaleProceeds)],
      ['Less: Loan Payoff', formatCurrency(-sale.loanBalance)],
      ['Before-Tax Equity Proceeds', formatCurrency(sale.beforeTaxSaleProceeds)],
      ['Less: Tax Liability', formatCurrency(-sale.taxesOnSale)],
      ['After-Tax Sale Proceeds', formatCurrency(sale.afterTaxSaleProceeds)],
      ['Initial Investment', formatCurrency(results.totalEquityInvested)],
      ['Total Return', formatCurrency(sale.afterTaxSaleProceeds - results.totalEquityInvested)],
      ['Return Multiple', `${(sale.afterTaxSaleProceeds / results.totalEquityInvested).toFixed(2)}x`],
    ]

    const csvString = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sale-analysis.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">

      {/* Top Summary Cards - matches InputSheet layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Proforma NOI Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Year {holdYears + 1} Proforma NOI
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(sale.yearAfterHoldNOI)}
              </p>
              <p className="text-xs text-muted-foreground">
                Projected net operating income
              </p>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-muted/5 pointer-events-none" />
          </CardContent>
        </Card>

        {/* Exit Cap Rate Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Exit Cap Rate
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {formatPercentage(sale.exitCapRate * 100)}
              </p>
              <p className="text-xs text-muted-foreground">
                {assumptions.dispositionPriceType === 'dollar' ? 'Implied from price' : 'Applied cap rate'}
              </p>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-muted/5 pointer-events-none" />
          </CardContent>
        </Card>

        {/* Calculated Sale Price Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Sale Price
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(sale.salePrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                {assumptions.dispositionPriceType === 'dollar' 
                  ? 'User-specified price'
                  : 'NOI ÷ Cap Rate'}
              </p>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-muted/5 pointer-events-none" />
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {assumptions.dispositionPriceType === 'dollar' 
            ? `Using custom sale price of ${formatCurrency(sale.salePrice)} (implies ${formatPercentage(sale.exitCapRate * 100)} cap rate)`
            : `Sale price calculated as: ${formatCurrency(sale.yearAfterHoldNOI)} ÷ ${formatPercentage(sale.exitCapRate * 100)} = ${formatCurrency(sale.salePrice)}`}
        </AlertDescription>
      </Alert>

      {/* Sheet 1: Adjusted Basis Calculation */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Adjusted Basis Calculation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculation of adjusted basis for determining taxable gain or loss
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border overflow-hidden">
            <Table className="bg-background">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold text-muted-foreground w-2/3">
                    Line Item
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Purchase Price</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(assumptions.purchasePrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Add: Acquisition Costs</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.originalBasis - assumptions.purchasePrice)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Original Basis</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.originalBasis)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Accumulated Depreciation ({holdYears} years)</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.accumulatedDepreciation)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="font-bold">Adjusted Basis at Sale</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">
                    {formatValue(sale.adjustedBasis)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet 2: Capital Gain Calculation */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Capital Gain Calculation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Breakdown of total gain and tax liability on sale
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border overflow-hidden">
            <Table className="bg-background">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold text-muted-foreground w-2/3">
                    Line Item
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Sale Price</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.salePrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Costs of Sale</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.sellingCosts)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Net Sale Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.netSaleProceeds)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Adjusted Basis</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.adjustedBasis)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Total Gain (Loss)</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono text-sm font-semibold",
                    sale.totalGain > 0 ? "text-green-600" : sale.totalGain < 0 ? "text-red-600" : ""
                  )}>
                    {formatValue(sale.totalGain)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Depreciation Recapture (Sec 1250)</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.deprecationRecapture)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Capital Gain from Appreciation</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.capitalGains)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">
                    Capital Gains Tax ({formatPercentage(sale.capitalGainsTaxRate * 100)})
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(sale.capitalGainsTax)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Depreciation Recapture Tax ({formatPercentage(sale.depreciationRecaptureRate * 100)})
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(sale.depreciationRecaptureTax)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="font-bold">Total Tax Liability</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-red-600">
                    {formatValue(sale.taxesOnSale)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet 3: Sale Proceeds Calculation */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Sale Proceeds Calculation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Final calculation of after-tax proceeds and investment returns
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border overflow-hidden">
            <Table className="bg-background">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold text-muted-foreground w-2/3">
                    Line Item
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Gross Sale Price</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.salePrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Costs of Sale</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.sellingCosts)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Net Sale Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.netSaleProceeds)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Loan Payoff</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.loanBalance)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Before-Tax Equity Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.beforeTaxSaleProceeds)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Tax Liability</TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatValue(-sale.taxesOnSale)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="font-bold">After-Tax Sale Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">
                    {formatValue(sale.afterTaxSaleProceeds)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Initial Investment</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(results.totalEquityInvested)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">After-Tax Sale Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.afterTaxSaleProceeds)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Total Return</TableCell>
                  <TableCell className={cn(
                    "text-right font-mono text-sm font-semibold",
                    sale.afterTaxSaleProceeds > results.totalEquityInvested ? "text-green-600" : "text-red-600"
                  )}>
                    {formatValue(sale.afterTaxSaleProceeds - results.totalEquityInvested)}
                    {sale.afterTaxSaleProceeds > results.totalEquityInvested ? (
                      <TrendingUp className="inline h-3 w-3 ml-1" />
                    ) : (
                      <TrendingDown className="inline h-3 w-3 ml-1" />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Return Multiple</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(sale.afterTaxSaleProceeds / results.totalEquityInvested).toFixed(2)}x
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}