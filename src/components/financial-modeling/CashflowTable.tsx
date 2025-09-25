'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { type AnnualCashflow } from '@/lib/financial-modeling/proforma'

interface CashflowTableProps {
  cashflows: AnnualCashflow[]
  onExport?: () => void
}

export function CashflowTable({ cashflows, onExport }: CashflowTableProps) {
  if (cashflows.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground">
            Complete the assumptions form and run the analysis to see annual cashflows.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate totals
  const totals = cashflows.reduce((acc, cf) => ({
    noi: acc.noi + cf.noi,
    debtService: acc.debtService + cf.debtService,
    beforeTaxCashflow: acc.beforeTaxCashflow + cf.beforeTaxCashflow,
    depreciation: acc.depreciation + cf.depreciation,
    taxes: acc.taxes + cf.taxes,
    afterTaxCashflow: acc.afterTaxCashflow + cf.afterTaxCashflow,
  }), {
    noi: 0,
    debtService: 0,
    beforeTaxCashflow: 0,
    depreciation: 0,
    taxes: 0,
    afterTaxCashflow: 0,
  })

  const formatCurrency = (value: number, showSign = false) => {
    const formatted = Math.abs(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    if (value === 0) return formatted
    if (value < 0) return `(${formatted})`
    if (showSign && value > 0) return `+${formatted}`
    return formatted
  }

  const getCellColor = (value: number, isTotal = false) => {
    if (value === 0) return ''
    if (isTotal) {
      return value > 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'
    }
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Annual Cashflow Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {cashflows.length}-year property investment cashflow projection
              </p>
            </div>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Year</TableHead>
                  <TableHead className="text-right">NOI</TableHead>
                  <TableHead className="text-right">Debt Service</TableHead>
                  <TableHead className="text-right">BTCF</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Taxable Income</TableHead>
                  <TableHead className="text-right">Taxes</TableHead>
                  <TableHead className="text-right">ATCF</TableHead>
                  <TableHead className="text-right">Loan Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashflows.map((cf, index) => (
                  <motion.tr
                    key={cf.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="text-sm">
                        Year {cf.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(cf.noi)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      ({formatCurrency(cf.debtService).replace('$', '')})
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getCellColor(cf.beforeTaxCashflow)}`}>
                      {formatCurrency(cf.beforeTaxCashflow)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      ({formatCurrency(cf.depreciation).replace('$', '')})
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getCellColor(cf.taxableIncome)}`}>
                      {formatCurrency(cf.taxableIncome)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getCellColor(-cf.taxes)}`}>
                      {cf.taxes < 0 
                        ? `+${formatCurrency(-cf.taxes)}` 
                        : `(${formatCurrency(cf.taxes)})`
                      }
                    </TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${getCellColor(cf.afterTaxCashflow)}`}>
                      {formatCurrency(cf.afterTaxCashflow)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatCurrency(cf.loanBalance)}
                    </TableCell>
                  </motion.tr>
                ))}
                
                {/* Totals Row */}
                <TableRow className="border-t-2 bg-muted/20 font-semibold">
                  <TableCell className="font-bold">
                    <Badge className="bg-primary text-primary-foreground">
                      TOTALS
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatCurrency(totals.noi)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-red-700">
                    ({formatCurrency(totals.debtService).replace('$', '')})
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${getCellColor(totals.beforeTaxCashflow, true)}`}>
                    {formatCurrency(totals.beforeTaxCashflow)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-blue-700">
                    ({formatCurrency(totals.depreciation).replace('$', '')})
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${getCellColor(totals.beforeTaxCashflow - totals.depreciation, true)}`}>
                    {formatCurrency(totals.beforeTaxCashflow - totals.depreciation)}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${getCellColor(-totals.taxes, true)}`}>
                    {totals.taxes < 0 
                      ? `+${formatCurrency(-totals.taxes)}` 
                      : `(${formatCurrency(totals.taxes)})`
                    }
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${getCellColor(totals.afterTaxCashflow, true)}`}>
                    {formatCurrency(totals.afterTaxCashflow)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    —
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Average Annual ATCF</div>
            <div className={`text-2xl font-bold ${getCellColor(totals.afterTaxCashflow / cashflows.length)}`}>
              {formatCurrency(totals.afterTaxCashflow / cashflows.length)}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Total Tax Benefits</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.max(0, -totals.taxes))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">NOI Growth</div>
            <div className="text-2xl font-bold text-blue-600">
              {cashflows.length > 1 
                ? `${(((cashflows[cashflows.length - 1].noi / cashflows[0].noi) - 1) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="text-sm space-y-2">
          <div className="font-medium mb-3">Legend:</div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 text-xs">
            <div><strong>BTCF:</strong> Before-Tax Cash Flow</div>
            <div><strong>ATCF:</strong> After-Tax Cash Flow</div>
            <div className="text-green-600"><strong>Positive values:</strong> Cash inflows</div>
            <div className="text-red-600"><strong>(Parentheses):</strong> Cash outflows</div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}