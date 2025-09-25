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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, formatPercentage } from "@/lib/utils"

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
  
  // Helper function to format values following accounting conventions
  const formatValue = (value: number) => {
    // Only use parentheses for actual negative values, not for subtraction line items
    if (value < 0) {
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

      {/* Sheet 1: Adjusted Basis Calculation */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Adjusted Basis Calculation</CardTitle>
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
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.accumulatedDepreciation)}
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
          <CardTitle>Capital Gain Calculation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Breakdown of total gain components on sale
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
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.sellingCosts)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Less: Adjusted Basis</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.adjustedBasis)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 bg-muted/50">
                  <TableCell className="font-semibold">Total Gain (Loss)</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.totalGain)}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Depreciation Recapture (Sec 1250)</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.deprecationRecapture)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="font-bold">Gain from Appreciation</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">
                    {formatValue(sale.capitalGains)}
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
          <CardTitle>Sale Proceeds Calculation</CardTitle>
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
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.sellingCosts)}
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
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.loanBalance)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Before-Tax Equity Proceeds</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.beforeTaxSaleProceeds)}
                  </TableCell>
                </TableRow>
                
                {/* Tax Calculations */}
                <TableRow>
                  <TableCell className="font-medium">
                    Capital Gains Tax ({formatPercentage(sale.capitalGainsTaxRate * 100)})
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.capitalGainsTax)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Depreciation Recapture Tax ({formatPercentage(sale.depreciationRecaptureRate * 100)})
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatValue(sale.depreciationRecaptureTax)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="font-semibold">Total Tax Liability</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatValue(sale.taxesOnSale)}
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
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="font-bold">Total Return</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">
                    {formatValue(sale.afterTaxSaleProceeds - results.totalEquityInvested)}
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