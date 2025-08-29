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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calculator, TrendingUp } from "lucide-react"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { formatCurrency, cn } from "@/lib/utils"

interface CashflowData {
  potentialRentalIncome: number[]
  vacancyAndCreditLoss: number[]
  effectiveRentalIncome: number[]
  otherIncome: number[]
  grossOperatingIncome: number[]
  totalOperatingExpenses: number[]
  netOperatingIncome: number[]
  interestExpense: number[]
  depreciation: number[]
  loanCostsAmortization: number[]
  realEstateTaxableIncome: number[]
  // Simplified summary
  annualDebtService: number[]
  cashFlowBeforeTaxes: number[]
  taxLiability: number[]
  cashFlowAfterTaxes: number[]
}

export function CashflowsContent() {
  const { state, calculateResults } = useFinancialModeling()
  const { assumptions, results, isCalculating } = state
  const [cashflowData, setCashflowData] = useState<CashflowData | null>(null)

  // Calculate cashflow data from assumptions and results
  useEffect(() => {
    const holdPeriod = assumptions.holdPeriodYears || 5
    const years = Math.min(holdPeriod, 30)
    
    if (results?.annualCashflows && assumptions) {
      // Use real calculation results
      const data: CashflowData = {
        potentialRentalIncome: [],
        vacancyAndCreditLoss: [],
        effectiveRentalIncome: [],
        otherIncome: [],
        grossOperatingIncome: [],
        totalOperatingExpenses: [],
        netOperatingIncome: [],
        interestExpense: [],
        depreciation: [],
        loanCostsAmortization: [],
        realEstateTaxableIncome: [],
        annualDebtService: [],
        cashFlowBeforeTaxes: [],
        taxLiability: [],
        cashFlowAfterTaxes: []
      }
      
      for (let i = 0; i < years; i++) {
        const cf = results.annualCashflows[i]
        const rentalIncome = assumptions.potentialRentalIncome[i] || 0
        const otherIncome = assumptions.otherIncome?.[i] || 0
        const vacancyRate = assumptions.vacancyRates[i] || 0
        const vacancyLoss = -rentalIncome * vacancyRate // Negative value
        const effectiveRental = rentalIncome + vacancyLoss
        const grossIncome = effectiveRental + otherIncome
        
        let operatingExpenses = 0
        if (assumptions.operatingExpenseType === 'percentage') {
          operatingExpenses = grossIncome * ((assumptions.operatingExpenses[i] || 0) / 100)
        } else {
          operatingExpenses = assumptions.operatingExpenses[i] || 0
        }
        
        // Use loan costs amortization from calculation results
        const loanCostsAmortization = cf?.loanCostsAmortization || 0
        
        // Debug logging for UI display (only for year 1)
        if (i === 0) {
          console.log('=== UI DISPLAY DEBUG (Year 1) ===')
          console.log('cf object:', cf)
          console.log('loanCostsAmortization from cf:', cf?.loanCostsAmortization)
          console.log('loanCostsAmortization used in UI:', loanCostsAmortization)
          console.log('Value pushed to array (negated):', -loanCostsAmortization)
          console.log('==================================')
        }
        
        data.potentialRentalIncome.push(rentalIncome)
        data.vacancyAndCreditLoss.push(vacancyLoss)
        data.effectiveRentalIncome.push(effectiveRental)
        data.otherIncome.push(otherIncome)
        data.grossOperatingIncome.push(grossIncome)
        data.totalOperatingExpenses.push(-operatingExpenses) // Negative for expense
        data.netOperatingIncome.push(cf?.noi || 0)
        data.interestExpense.push(-(cf?.interestExpense || 0)) // Negative for expense
        data.depreciation.push(-(cf?.depreciation || 0)) // Negative for tax purposes
        data.loanCostsAmortization.push(-loanCostsAmortization) // Negative for amortization
        data.realEstateTaxableIncome.push(cf?.taxableIncome || 0)
        data.annualDebtService.push(-(cf?.debtService || 0)) // Negative for cash outflow
        data.cashFlowBeforeTaxes.push(cf?.beforeTaxCashflow || 0)
        data.taxLiability.push(-(cf?.taxes || 0)) // Negative if tax owed
        data.cashFlowAfterTaxes.push(cf?.afterTaxCashflow || 0)
      }
      
      setCashflowData(data)
    } else {
      // Create placeholder data showing structure
      const data: CashflowData = {
        potentialRentalIncome: Array(years).fill(0),
        vacancyAndCreditLoss: Array(years).fill(0),
        effectiveRentalIncome: Array(years).fill(0),
        otherIncome: Array(years).fill(0),
        grossOperatingIncome: Array(years).fill(0),
        totalOperatingExpenses: Array(years).fill(0),
        netOperatingIncome: Array(years).fill(0),
        interestExpense: Array(years).fill(0),
        depreciation: Array(years).fill(0),
        loanCostsAmortization: Array(years).fill(0),
        realEstateTaxableIncome: Array(years).fill(0),
        annualDebtService: Array(years).fill(0),
        cashFlowBeforeTaxes: Array(years).fill(0),
        taxLiability: Array(years).fill(0),
        cashFlowAfterTaxes: Array(years).fill(0)
      }
      setCashflowData(data)
    }
  }, [results, assumptions])

  const exportToCsv = () => {
    if (!cashflowData) return
    
    const years = cashflowData.potentialRentalIncome.length
    const headers = ['Line Item', ...Array(years).fill(0).map((_, i) => `Year ${i + 1}`)]
    
    const detailedRows = [
      ['Potential Rental Income', ...cashflowData.potentialRentalIncome],
      ['Vacancy & Credit Loss', ...cashflowData.vacancyAndCreditLoss],
      ['Effective Rental Income', ...cashflowData.effectiveRentalIncome],
      ['Other Income', ...cashflowData.otherIncome],
      ['Gross Operating Income', ...cashflowData.grossOperatingIncome],
      ['Total Operating Expenses', ...cashflowData.totalOperatingExpenses],
      ['Net Operating Income', ...cashflowData.netOperatingIncome],
      ['Interest Expense', ...cashflowData.interestExpense],
      ['Cost Recovery (Depreciation)', ...cashflowData.depreciation],
      ['Loan Costs Amortization', ...cashflowData.loanCostsAmortization],
      ['Real Estate Taxable Income', ...cashflowData.realEstateTaxableIncome]
    ]
    
    const summaryRows = [
      ['', ...Array(years).fill('')], // Empty separator row
      ['CASH FLOW SUMMARY', ...Array(years).fill('')],
      ['Net Operating Income', ...cashflowData.netOperatingIncome],
      ['Annual Debt Service', ...cashflowData.annualDebtService],
      ['Cash Flow Before Taxes', ...cashflowData.cashFlowBeforeTaxes],
      ['Tax Liability', ...cashflowData.taxLiability],
      ['Cash Flow After Taxes', ...cashflowData.cashFlowAfterTaxes]
    ]
    
    const csvContent = [headers, ...detailedRows, ...summaryRows]
    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cashflow-analysis.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatValue = (value: number) => {
    return formatCurrency(Math.round(value * 100) / 100) // Round to 2 decimal places
  }

  const years = cashflowData?.potentialRentalIncome.length || 0

  if (!cashflowData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading cashflow projections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Annual Cashflow Analysis
          </h2>
          <p className="text-muted-foreground">
            Professional-grade cashflow projections following commercial real estate industry standards
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

      {/* Detailed Income Statement */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Operating Income Statement</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of income, expenses, and taxable income by year
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-background">
              <TableHeader className="sticky top-0 bg-muted z-10">
                <TableRow>
                  <TableHead className="sticky left-0 bg-muted text-muted-foreground font-semibold w-48 z-10 border-r">
                    Line Item
                  </TableHead>
                  {Array(years).fill(0).map((_, i) => (
                    <TableHead key={i} className="text-center min-w-32 whitespace-nowrap font-semibold bg-muted text-muted-foreground">
                      Year {i + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Income Section */}
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Potential Rental Income
                  </TableCell>
                  {cashflowData.potentialRentalIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Vacancy & Credit Loss
                  </TableCell>
                  {cashflowData.vacancyAndCreditLoss.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Effective Rental Income
                  </TableCell>
                  {cashflowData.effectiveRentalIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Other Income
                  </TableCell>
                  {cashflowData.otherIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow className="border-t-2">
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Gross Operating Income
                  </TableCell>
                  {cashflowData.grossOperatingIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm font-semibold">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                {/* Expenses Section */}
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Total Operating Expenses
                  </TableCell>
                  {cashflowData.totalOperatingExpenses.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="sticky left-0 bg-muted/50 font-semibold z-10 border-r">
                    Net Operating Income
                  </TableCell>
                  {cashflowData.netOperatingIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm font-bold">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                {/* Tax Calculations */}
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Interest Expense
                  </TableCell>
                  {cashflowData.interestExpense.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Cost Recovery (Depreciation)
                  </TableCell>
                  {cashflowData.depreciation.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">
                    Loan Costs Amortization
                  </TableCell>
                  {cashflowData.loanCostsAmortization.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow className="border-t-2 bg-muted/50">
                  <TableCell className="sticky left-0 bg-muted/50 font-semibold z-10 border-r">
                    Real Estate Taxable Income
                  </TableCell>
                  {cashflowData.realEstateTaxableIncome.map((value, i) => (
                    <TableCell key={i} className={cn("text-center font-mono text-sm font-semibold", 
                      value < 0 ? "text-red-600" : "")}>
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Cashflow Summary */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Cashflow Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simplified view of cash flows to the investor
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-background">
              <TableHeader className="sticky top-0 bg-muted z-10">
                <TableRow>
                  <TableHead className="sticky left-0 bg-muted text-muted-foreground font-semibold w-48 z-10 border-r">Cash Flow Item</TableHead>
                  {Array(years).fill(0).map((_, i) => (
                    <TableHead key={i} className="text-center min-w-32 whitespace-nowrap font-semibold bg-muted text-muted-foreground">
                      Year {i + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">Net Operating Income</TableCell>
                  {cashflowData.netOperatingIncome.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm font-semibold">
                      {formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">Annual Debt Service</TableCell>
                  {cashflowData.annualDebtService.map((value, i) => (
                    <TableCell key={i} className="text-center font-mono text-sm">
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow className="border-t bg-muted/50">
                  <TableCell className="sticky left-0 bg-muted/50 font-semibold z-10 border-r">Cash Flow Before Taxes</TableCell>
                  {cashflowData.cashFlowBeforeTaxes.map((value, i) => (
                    <TableCell key={i} className={cn("text-center font-mono text-sm font-semibold",
                      value < 0 ? "text-red-600" : "")}>
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="sticky left-0 bg-muted font-semibold z-10 border-r">Tax Liability</TableCell>
                  {cashflowData.taxLiability.map((value, i) => (
                    <TableCell key={i} className={cn("text-center font-mono text-sm",
                      value > 0.01 ? "text-red-600" : "")}>
                      {Math.abs(value) > 0.01 ? (value > 0 ? formatValue(value) : `(${formatValue(Math.abs(value))})`) : formatValue(0)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow className="border-t-2 border-b-2 bg-muted/50">
                  <TableCell className="sticky left-0 bg-muted/50 font-bold z-10 border-r">Cash Flow After Taxes</TableCell>
                  {cashflowData.cashFlowAfterTaxes.map((value, i) => (
                    <TableCell key={i} className={cn("text-center font-mono text-sm font-bold",
                      value < 0 ? "text-red-600" : "")}>
                      {value < 0 ? `(${formatValue(Math.abs(value))})` : formatValue(value)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}