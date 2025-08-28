'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Target, 
  PieChart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

import { type ProFormaResults, type SaleProceeds } from '@/lib/financial-modeling/proforma'

interface ResultsPanelProps {
  results: ProFormaResults | null
  isLoading?: boolean
}

export function ResultsPanel({ results, isLoading = false }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
          <p className="text-muted-foreground">
            Complete your assumptions and run the analysis to see investment returns.
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`
  }

  const getReturnColor = (irr: number | null) => {
    if (!irr) return 'text-gray-600'
    if (irr >= 0.15) return 'text-green-600' // Excellent return
    if (irr >= 0.10) return 'text-blue-600'  // Good return
    if (irr >= 0.06) return 'text-yellow-600' // Moderate return
    return 'text-red-600' // Poor return
  }

  const getReturnLabel = (irr: number | null) => {
    if (!irr) return 'Unable to calculate'
    if (irr >= 0.15) return 'Excellent'
    if (irr >= 0.10) return 'Good'
    if (irr >= 0.06) return 'Moderate'
    return 'Below Market'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`h-4 w-4 ${getReturnColor(results.irr)}`} />
            <span className="text-sm font-medium">IRR</span>
          </div>
          <div className={`text-2xl font-bold ${getReturnColor(results.irr)}`}>
            {results.irr ? formatPercentage(results.irr) : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            {getReturnLabel(results.irr)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Equity Multiple</span>
          </div>
          <div className="text-2xl font-bold">
            {results.equityMultiple.toFixed(2)}x
          </div>
          <div className="text-sm text-muted-foreground">
            Cash Returned ÷ Invested
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Profit</span>
          </div>
          <div className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(results.netProfit)}
          </div>
          <div className="text-sm text-muted-foreground">
            Net Cash Returned
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Avg Cash-on-Cash</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(results.averageCashOnCash)}
          </div>
          <div className="text-sm text-muted-foreground">
            Annual Cash Return
          </div>
        </Card>
      </div>

      {/* Investment Decision Alert */}
      <Alert className={results.irr && results.irr >= 0.10 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        {results.irr && results.irr >= 0.10 ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        )}
        <AlertDescription>
          <strong>Investment Assessment:</strong>{' '}
          {results.irr && results.irr >= 0.15 ? (
            <span className="text-green-700">
              Excellent investment opportunity with strong returns exceeding 15% IRR.
            </span>
          ) : results.irr && results.irr >= 0.10 ? (
            <span className="text-green-700">
              Solid investment with good returns above 10% IRR threshold.
            </span>
          ) : results.irr && results.irr >= 0.06 ? (
            <span className="text-yellow-700">
              Moderate investment returns. Consider market alternatives.
            </span>
          ) : (
            <span className="text-red-700">
              Below-market returns. Investment may not meet return expectations.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Detailed Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Investment Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Investment Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Equity Invested:</span>
                  <span className="font-medium">{formatCurrency(results.totalEquityInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cash Returned:</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.totalCashReturned)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className={`font-medium ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.netProfit)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total Tax Savings:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(results.totalTaxSavings)}</span>
                </div>
              </div>
            </div>

            {/* Return Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Return Metrics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>IRR:</span>
                  <span className={`font-medium ${getReturnColor(results.irr)}`}>
                    {results.irr ? formatPercentage(results.irr) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Equity Multiple:</span>
                  <span className="font-medium">{results.equityMultiple.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Cash-on-Cash:</span>
                  <span className="font-medium text-blue-600">{formatPercentage(results.averageCashOnCash)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Hold Period:</span>
                  <span className="font-medium">{results.annualCashflows.length} years</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sale Proceeds Breakdown */}
      <SaleProceedsCard saleProceeds={results.saleProceeds} />

      {/* Performance Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <Badge 
                variant={results.irr && results.irr >= 0.12 ? "default" : "secondary"}
                className="text-sm"
              >
                Target IRR: 12%+
              </Badge>
              <div className="text-sm text-muted-foreground">
                {results.irr && results.irr >= 0.12 ? '✅ Achieved' : '❌ Not Met'}
              </div>
            </div>

            <div className="text-center space-y-2">
              <Badge 
                variant={results.equityMultiple >= 2.0 ? "default" : "secondary"}
                className="text-sm"
              >
                Target Multiple: 2.0x+
              </Badge>
              <div className="text-sm text-muted-foreground">
                {results.equityMultiple >= 2.0 ? '✅ Achieved' : '❌ Not Met'}
              </div>
            </div>

            <div className="text-center space-y-2">
              <Badge 
                variant={results.averageCashOnCash >= 0.08 ? "default" : "secondary"}
                className="text-sm"
              >
                Target Cash-on-Cash: 8%+
              </Badge>
              <div className="text-sm text-muted-foreground">
                {results.averageCashOnCash >= 0.08 ? '✅ Achieved' : '❌ Not Met'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SaleProceedsCard({ saleProceeds }: { saleProceeds: SaleProceeds }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sale Proceeds Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Gross Sale Price:</span>
            <span className="font-medium">{formatCurrency(saleProceeds.salePrice)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Less: Selling Costs:</span>
            <span className="font-medium">({formatCurrency(saleProceeds.sellingCosts)})</span>
          </div>
          <div className="flex justify-between">
            <span>Net Sale Proceeds:</span>
            <span className="font-medium">{formatCurrency(saleProceeds.netSaleProceeds)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Less: Loan Payoff:</span>
            <span className="font-medium">({formatCurrency(saleProceeds.loanBalance)})</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Before-Tax Proceeds:</span>
            <span>{formatCurrency(saleProceeds.beforeTaxSaleProceeds)}</span>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg space-y-2 text-sm">
            <div className="font-medium">Tax Calculations:</div>
            <div className="flex justify-between">
              <span>Capital Gains:</span>
              <span>{formatCurrency(saleProceeds.capitalGains)}</span>
            </div>
            <div className="flex justify-between">
              <span>Depreciation Recapture:</span>
              <span>{formatCurrency(saleProceeds.deprecationRecapture)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Total Taxes on Sale:</span>
              <span>({formatCurrency(saleProceeds.taxesOnSale)})</span>
            </div>
          </div>

          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>After-Tax Sale Proceeds:</span>
            <span className="text-green-600">{formatCurrency(saleProceeds.afterTaxSaleProceeds)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}