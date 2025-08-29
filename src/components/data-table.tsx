"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'
import { ProFormaCalculator } from '@/lib/financial-modeling/proforma'

interface DataTableProps {
  data?: any[]
}

export function DataTable({ data }: DataTableProps) {
  const { state } = useFinancialModeling()
  const calculator = new ProFormaCalculator(state.assumptions)
  const results = calculator.calculate()
  const cashflows = results?.annualCashflows || []

  if (cashflows.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground">
              Complete the assumptions form and run the analysis to see annual cashflows.
            </p>
          </CardContent>
        </Card>
      </div>
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
    if (showSign) {
      return value > 0 ? `+${formatted}` : `-${formatted}`
    }
    return value < 0 ? `-${formatted}` : formatted
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <div className="px-4 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Annual Cash Flow Analysis
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Year</TableHead>
                    <TableHead className="text-right">NOI</TableHead>
                    <TableHead className="text-right">Debt Service</TableHead>
                    <TableHead className="text-right">Before Tax CF</TableHead>
                    <TableHead className="text-right">Depreciation</TableHead>
                    <TableHead className="text-right">Taxes</TableHead>
                    <TableHead className="text-right">After Tax CF</TableHead>
                    <TableHead className="text-right">Cash-on-Cash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashflows.map((cf, index) => (
                    <TableRow key={cf.year} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Badge variant="outline">Year {cf.year}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cf.noi)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cf.debtService)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={cf.beforeTaxCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(cf.beforeTaxCashflow)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(cf.depreciation)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={cf.taxes <= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(cf.taxes)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        <span className={cf.afterTaxCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(cf.afterTaxCashflow)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={cf.cashOnCashReturn >= 0.05 ? 'default' : 'secondary'}>
                          {formatPercentage(cf.cashOnCashReturn)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals Row */}
                  <TableRow className="border-t-2 bg-muted/30 font-semibold">
                    <TableCell>
                      <Badge>Total</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.noi)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.debtService)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={totals.beforeTaxCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totals.beforeTaxCashflow)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatCurrency(totals.depreciation)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={totals.taxes <= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totals.taxes)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={totals.afterTaxCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totals.afterTaxCashflow)}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}