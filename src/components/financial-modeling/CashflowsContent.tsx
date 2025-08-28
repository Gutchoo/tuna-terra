"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Calculator, TrendingUp } from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, cn } from "@/lib/utils"

interface YearlyData {
  year: number
  grossRent: number
  vacancy: number
  effectiveRent: number
  operatingExpenses: number
  noi: number
  debtService: number
  beforeTaxCashflow: number
  depreciation: number
  taxableIncome: number
  taxes: number
  afterTaxCashflow: number
  loanBalance: number
}

export function CashflowsContent() {
  const { state, updateAssumption, calculateResults } = useFinancialModeling()
  const { assumptions, results, isCalculating } = state
  const [localData, setLocalData] = useState<YearlyData[]>([])

  // Initialize cashflow data from results or create sample data
  useEffect(() => {
    if (results?.annualCashflows) {
      const data = results.annualCashflows.map(cf => ({
        year: cf.year,
        grossRent: assumptions.potentialRentalIncome[cf.year - 1] || 0,
        vacancy: (assumptions.potentialRentalIncome[cf.year - 1] || 0) * (assumptions.vacancyRates[cf.year - 1] || 0),
        effectiveRent: (assumptions.potentialRentalIncome[cf.year - 1] || 0) * (1 - (assumptions.vacancyRates[cf.year - 1] || 0)),
        operatingExpenses: assumptions.operatingExpenses[cf.year - 1] || 0,
        noi: cf.noi,
        debtService: cf.debtService,
        beforeTaxCashflow: cf.beforeTaxCashflow,
        depreciation: cf.depreciation,
        taxableIncome: cf.taxableIncome,
        taxes: cf.taxes,
        afterTaxCashflow: cf.afterTaxCashflow,
        loanBalance: cf.loanBalance
      }))
      setLocalData(data)
    } else {
      // Create sample data for the hold period
      const years = assumptions.holdPeriodYears || 5
      const sampleData = Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        grossRent: 120000 * Math.pow(1.03, i),
        vacancy: 6000 * Math.pow(1.03, i),
        effectiveRent: 114000 * Math.pow(1.03, i),
        operatingExpenses: 45000 * Math.pow(1.025, i),
        noi: 69000 * Math.pow(1.04, i),
        debtService: 55000,
        beforeTaxCashflow: 14000 * Math.pow(1.06, i),
        depreciation: 20000,
        taxableIncome: -6000 * Math.pow(1.1, i),
        taxes: -1500 * Math.pow(1.1, i),
        afterTaxCashflow: 15500 * Math.pow(1.08, i),
        loanBalance: 750000 * Math.pow(0.985, i)
      }))
      setLocalData(sampleData)
    }
  }, [results, assumptions])

  const updateField = (index: number, field: keyof YearlyData, value: number) => {
    setLocalData(prev => {
      const newData = [...prev]
      newData[index] = { ...newData[index], [field]: value }
      
      // Recalculate dependent fields
      const row = newData[index]
      if (field === 'grossRent' || field === 'vacancy') {
        row.effectiveRent = row.grossRent - row.vacancy
        row.noi = row.effectiveRent - row.operatingExpenses
        row.beforeTaxCashflow = row.noi - row.debtService
        row.taxableIncome = row.beforeTaxCashflow - row.depreciation
        row.taxes = row.taxableIncome * (assumptions.taxRate / 100)
        row.afterTaxCashflow = row.beforeTaxCashflow - row.taxes
      } else if (field === 'operatingExpenses') {
        row.noi = row.effectiveRent - row.operatingExpenses
        row.beforeTaxCashflow = row.noi - row.debtService
        row.taxableIncome = row.beforeTaxCashflow - row.depreciation
        row.taxes = row.taxableIncome * (assumptions.taxRate / 100)
        row.afterTaxCashflow = row.beforeTaxCashflow - row.taxes
      }
      
      return newData
    })
  }

  const exportToCsv = () => {
    const headers = [
      'Year', 'Gross Rent', 'Vacancy', 'Effective Rent', 'Operating Expenses', 
      'NOI', 'Debt Service', 'Before-Tax Cash Flow', 'Depreciation', 
      'Taxable Income', 'Taxes', 'After-Tax Cash Flow', 'Loan Balance'
    ]
    
    const csvContent = [
      headers,
      ...localData.map(row => [
        row.year, row.grossRent, row.vacancy, row.effectiveRent, 
        row.operatingExpenses, row.noi, row.debtService, row.beforeTaxCashflow,
        row.depreciation, row.taxableIncome, row.taxes, row.afterTaxCashflow, 
        row.loanBalance
      ])
    ]
    
    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cashflow-analysis.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totals = localData.reduce((acc, row) => ({
    noi: acc.noi + row.noi,
    beforeTaxCashflow: acc.beforeTaxCashflow + row.beforeTaxCashflow,
    taxes: acc.taxes + row.taxes,
    afterTaxCashflow: acc.afterTaxCashflow + row.afterTaxCashflow
  }), { noi: 0, beforeTaxCashflow: 0, taxes: 0, afterTaxCashflow: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Annual Cashflow Projections
          </h2>
          <p className="text-muted-foreground">
            Edit the input fields to see real-time calculations across all years
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={calculateResults} disabled={isCalculating}>
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total NOI</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.noi)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Before-Tax Cash Flow</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.beforeTaxCashflow)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Tax Impact</div>
            <div className={cn("text-2xl font-bold", totals.taxes < 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(totals.taxes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">After-Tax Cash Flow</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.afterTaxCashflow)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cashflow Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Detailed Annual Cashflows</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="sticky left-0 bg-background font-semibold min-w-[60px]">Year</TableHead>
                  <TableHead className="text-center min-w-[120px]">Gross Rent</TableHead>
                  <TableHead className="text-center min-w-[100px]">Vacancy</TableHead>
                  <TableHead className="text-center min-w-[120px] bg-blue-50 font-semibold">Effective Rent</TableHead>
                  <TableHead className="text-center min-w-[140px]">Operating Expenses</TableHead>
                  <TableHead className="text-center min-w-[100px] bg-blue-50 font-semibold">NOI</TableHead>
                  <TableHead className="text-center min-w-[120px]">Debt Service</TableHead>
                  <TableHead className="text-center min-w-[140px] bg-green-50 font-semibold">Before-Tax CF</TableHead>
                  <TableHead className="text-center min-w-[120px]">Depreciation</TableHead>
                  <TableHead className="text-center min-w-[130px]">Taxable Income</TableHead>
                  <TableHead className="text-center min-w-[100px]">Taxes</TableHead>
                  <TableHead className="text-center min-w-[140px] bg-green-50 font-semibold">After-Tax CF</TableHead>
                  <TableHead className="text-center min-w-[120px]">Loan Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((yearData, index) => (
                  <TableRow key={yearData.year} className="hover:bg-muted/50">
                    <TableCell className="sticky left-0 bg-background font-medium border-r">
                      <Badge variant="outline">Year {yearData.year}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={yearData.grossRent}
                        onChange={(e) => updateField(index, 'grossRent', parseFloat(e.target.value) || 0)}
                        className="w-full font-mono text-sm border-none bg-transparent focus:bg-muted text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={yearData.vacancy}
                        onChange={(e) => updateField(index, 'vacancy', parseFloat(e.target.value) || 0)}
                        className="w-full font-mono text-sm border-none bg-transparent focus:bg-muted text-center"
                      />
                    </TableCell>
                    <TableCell className="bg-blue-50/50">
                      <div className="font-mono text-sm text-center font-medium text-blue-700">
                        {formatCurrency(yearData.effectiveRent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={yearData.operatingExpenses}
                        onChange={(e) => updateField(index, 'operatingExpenses', parseFloat(e.target.value) || 0)}
                        className="w-full font-mono text-sm border-none bg-transparent focus:bg-muted text-center"
                      />
                    </TableCell>
                    <TableCell className="bg-blue-50/50">
                      <div className="font-mono text-sm text-center font-semibold text-blue-700">
                        {formatCurrency(yearData.noi)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-center">
                        {formatCurrency(yearData.debtService)}
                      </div>
                    </TableCell>
                    <TableCell className="bg-green-50/50">
                      <div className="font-mono text-sm text-center font-semibold text-green-700">
                        {formatCurrency(yearData.beforeTaxCashflow)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-center">
                        {formatCurrency(yearData.depreciation)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn("font-mono text-sm text-center", 
                        yearData.taxableIncome < 0 ? "text-red-600" : "text-foreground")}>
                        {formatCurrency(yearData.taxableIncome)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn("font-mono text-sm text-center",
                        yearData.taxes < 0 ? "text-green-600" : "text-red-600")}>
                        {formatCurrency(yearData.taxes)}
                      </div>
                    </TableCell>
                    <TableCell className="bg-green-50/50">
                      <div className="font-mono text-sm text-center font-bold text-green-700">
                        {formatCurrency(yearData.afterTaxCashflow)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-center text-muted-foreground">
                        {formatCurrency(yearData.loanBalance)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}