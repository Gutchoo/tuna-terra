"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, TrendingUp, Download, AlertCircle } from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, formatPercentage, cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SaleAnalysis {
  salePrice: number
  grossSaleProceeds: number
  sellingCosts: number
  netSaleProceeds: number
  loanBalance: number
  equityProceeds: number
  totalBasis: number
  accumulatedDepreciation: number
  adjustedBasis: number
  capitalGain: number
  deprecationRecapture: number
  capitalGainsTax: number
  deprecationRecaptureTax: number
  totalTaxes: number
  afterTaxSaleProceeds: number
}

export function SaleContent() {
  const { state, updateAssumption, calculateResults } = useFinancialModeling()
  const { assumptions, results, isCalculating } = state
  const [saleAnalysis, setSaleAnalysis] = useState<SaleAnalysis | null>(null)
  const [exitCapRate, setExitCapRate] = useState(6.5)
  const [customSalePrice, setCustomSalePrice] = useState<number | null>(null)
  const [useCustomPrice, setUseCustomPrice] = useState(false)

  // Calculate sale analysis whenever results change
  useEffect(() => {
    if (results) {
      const finalYear = results.annualCashflows[results.annualCashflows.length - 1]
      const salePrice = useCustomPrice && customSalePrice 
        ? customSalePrice 
        : finalYear ? finalYear.noi / (exitCapRate / 100) : 0
      
      const sellingCosts = salePrice * (assumptions.sellingCosts / 100)
      const netSaleProceeds = salePrice - sellingCosts
      const loanBalance = finalYear ? finalYear.loanBalance : 0
      const equityProceeds = netSaleProceeds - loanBalance
      
      const totalBasis = assumptions.purchasePrice + (assumptions.acquisitionCostType === 'dollar' 
        ? assumptions.acquisitionCosts 
        : assumptions.purchasePrice * (assumptions.acquisitionCosts / 100))
      
      const depreciableBasis = totalBasis * (assumptions.improvementsPercentage / 100)
      const accumulatedDepreciation = results.annualCashflows.reduce((sum, cf) => sum + cf.depreciation, 0)
      const adjustedBasis = totalBasis - accumulatedDepreciation
      
      const capitalGain = Math.max(0, salePrice - totalBasis)
      const deprecationRecapture = Math.min(accumulatedDepreciation, Math.max(0, salePrice - adjustedBasis))
      
      const capitalGainsTaxRate = 0.20 // 20% for long-term capital gains
      const deprecationRecaptureTaxRate = 0.25 // 25% for depreciation recapture
      
      const capitalGainsTax = capitalGain * capitalGainsTaxRate
      const deprecationRecaptureTax = deprecationRecapture * deprecationRecaptureTaxRate
      const totalTaxes = capitalGainsTax + deprecationRecaptureTax
      
      const afterTaxSaleProceeds = equityProceeds - totalTaxes
      
      setSaleAnalysis({
        salePrice,
        grossSaleProceeds: salePrice,
        sellingCosts,
        netSaleProceeds,
        loanBalance,
        equityProceeds,
        totalBasis,
        accumulatedDepreciation,
        adjustedBasis,
        capitalGain,
        deprecationRecapture,
        capitalGainsTax,
        deprecationRecaptureTax,
        totalTaxes,
        afterTaxSaleProceeds
      })
    }
  }, [results, exitCapRate, customSalePrice, useCustomPrice, assumptions])

  const exportSaleAnalysis = () => {
    if (!saleAnalysis) return
    
    const data = [
      ['Sale Analysis Summary'],
      [''],
      ['Sale Details', ''],
      ['Gross Sale Price', formatCurrency(saleAnalysis.salePrice)],
      ['Selling Costs', formatCurrency(saleAnalysis.sellingCosts)],
      ['Net Sale Proceeds', formatCurrency(saleAnalysis.netSaleProceeds)],
      ['Loan Balance', formatCurrency(saleAnalysis.loanBalance)],
      ['Gross Equity Proceeds', formatCurrency(saleAnalysis.equityProceeds)],
      [''],
      ['Tax Calculations', ''],
      ['Original Basis', formatCurrency(saleAnalysis.totalBasis)],
      ['Accumulated Depreciation', formatCurrency(saleAnalysis.accumulatedDepreciation)],
      ['Adjusted Basis', formatCurrency(saleAnalysis.adjustedBasis)],
      ['Capital Gain', formatCurrency(saleAnalysis.capitalGain)],
      ['Depreciation Recapture', formatCurrency(saleAnalysis.deprecationRecapture)],
      ['Capital Gains Tax (20%)', formatCurrency(saleAnalysis.capitalGainsTax)],
      ['Depreciation Recapture Tax (25%)', formatCurrency(saleAnalysis.deprecationRecaptureTax)],
      ['Total Taxes on Sale', formatCurrency(saleAnalysis.totalTaxes)],
      ['After-Tax Sale Proceeds', formatCurrency(saleAnalysis.afterTaxSaleProceeds)],
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Sale Analysis & Exit Strategy
          </h2>
          <p className="text-muted-foreground">
            Calculate sale proceeds, tax implications, and after-tax returns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={calculateResults} disabled={isCalculating}>
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
          <Button variant="outline" onClick={exportSaleAnalysis} disabled={!saleAnalysis}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sale Price Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Exit Strategy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exit-cap-rate">Exit Cap Rate (%)</Label>
              <Input
                id="exit-cap-rate"
                type="number"
                step="0.1"
                value={exitCapRate}
                onChange={(e) => setExitCapRate(parseFloat(e.target.value) || 0)}
                className="font-mono"
                disabled={useCustomPrice}
              />
              <p className="text-xs text-muted-foreground">
                Cap rate for determining sale price
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-sale-price">Custom Sale Price (Optional)</Label>
              <Input
                id="custom-sale-price"
                type="number"
                value={customSalePrice || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setCustomSalePrice(isNaN(value) ? null : value)
                  setUseCustomPrice(!!e.target.value)
                }}
                className="font-mono"
                placeholder="Enter custom price"
              />
              <p className="text-xs text-muted-foreground">
                Override calculated sale price
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hold Period</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-lg py-2 px-4">
                  {assumptions.holdPeriodYears} Years
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Investment hold period
              </p>
            </div>
          </div>

          {!results && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Run the financial analysis from the Input Sheet to see detailed sale calculations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sale Proceeds Analysis */}
      {saleAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sale Proceeds */}
          <Card>
            <CardHeader>
              <CardTitle>Sale Proceeds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Gross Sale Price</span>
                  <span className="font-mono text-lg font-bold">
                    {formatCurrency(saleAnalysis.salePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-sm">Selling Costs ({formatPercentage(assumptions.sellingCosts)})</span>
                  <span className="font-mono">
                    -{formatCurrency(saleAnalysis.sellingCosts)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Sale Proceeds</span>
                  <span className="font-mono text-lg font-semibold">
                    {formatCurrency(saleAnalysis.netSaleProceeds)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-orange-600">
                  <span className="text-sm">Less: Loan Balance</span>
                  <span className="font-mono">
                    -{formatCurrency(saleAnalysis.loanBalance)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gross Equity Proceeds</span>
                  <span className="font-mono text-xl font-bold text-blue-600">
                    {formatCurrency(saleAnalysis.equityProceeds)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Implications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original Basis</span>
                    <div className="font-mono">{formatCurrency(saleAnalysis.totalBasis)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accumulated Depreciation</span>
                    <div className="font-mono text-orange-600">
                      {formatCurrency(saleAnalysis.accumulatedDepreciation)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adjusted Basis</span>
                    <div className="font-mono">{formatCurrency(saleAnalysis.adjustedBasis)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capital Gain</span>
                    <div className="font-mono text-green-600">
                      {formatCurrency(saleAnalysis.capitalGain)}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capital Gains Tax (20%)</span>
                    <span className="font-mono text-red-600">
                      {formatCurrency(saleAnalysis.capitalGainsTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Depreciation Recapture Tax (25%)</span>
                    <span className="font-mono text-red-600">
                      {formatCurrency(saleAnalysis.deprecationRecaptureTax)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Taxes on Sale</span>
                    <span className="font-mono text-lg font-bold text-red-600">
                      {formatCurrency(saleAnalysis.totalTaxes)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Result */}
      {saleAnalysis && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-800">Net After-Tax Sale Proceeds</h3>
              <div className="text-4xl font-bold text-green-700">
                {formatCurrency(saleAnalysis.afterTaxSaleProceeds)}
              </div>
              <p className="text-sm text-green-600">
                Amount you receive after paying off loan and taxes
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}