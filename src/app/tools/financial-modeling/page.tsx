'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator, TrendingUp, BarChart3, Download, PieChart, Clipboard, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { financialTooltips } from '@/components/calculators/shared/FinancialTooltips'

import { AssumptionsForm } from '@/components/financial-modeling/AssumptionsForm'
import { ModelingCharts } from '@/components/financial-modeling/ModelingCharts'
import { KeyMetricsPanel } from '@/components/financial-modeling/KeyMetricsPanel'

import { 
  ProFormaCalculator, 
  type PropertyAssumptions, 
  type ProFormaResults 
} from '@/lib/financial-modeling/proforma'

export default function FinancialModelingPage() {
  // Comment out sample data for debugging - initialize with empty/default values
  // const [assumptions, setAssumptions] = useState<PropertyAssumptions>(generateSampleAssumptions())
  const [assumptions, setAssumptions] = useState<PropertyAssumptions>({
    purchasePrice: 0,
    acquisitionCosts: 0,
    acquisitionCostType: '' as const,
    // New detailed income structure
    potentialRentalIncome: Array(30).fill(0),
    otherIncome: Array(30).fill(0),
    vacancyRates: Array(30).fill(0),
    operatingExpenses: Array(30).fill(0),
    operatingExpenseType: '' as const,
    // Detailed expense categories
    propertyTaxes: Array(30).fill(0),
    insurance: Array(30).fill(0),
    maintenance: Array(30).fill(0),
    propertyManagement: Array(30).fill(0),
    utilities: Array(30).fill(0),
    otherExpenses: Array(30).fill(0),
    rentalIncomeGrowthRate: 0,
    defaultVacancyRate: 0,
    defaultOperatingExpenseRate: 0,
    // Legacy fields for compatibility
    year1NOI: 0,
    noiGrowthRate: 0,
    // Enhanced financing structure
    financingType: 'dscr' as const,
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
    amortizationYears: 0,
    paymentsPerYear: 12, // Default to monthly payments
    loanCosts: 0,
    targetDSCR: undefined,
    targetLTV: undefined,
    propertyType: '' as 'residential' | 'commercial' | 'industrial' | '',
    depreciationYears: 0,
    landPercentage: 0,
    improvementsPercentage: 0,
    taxRate: 0,
    holdPeriodYears: 5, // Default to 5 years
    sellingCosts: 0,
  })
  const [results, setResults] = useState<ProFormaResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState('assumptions')

  const mainTabs = [
    { id: 'assumptions', label: 'Assumptions', icon: Clipboard },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'cashflows', label: 'Cash Flows', icon: TrendingUp },
    { id: 'charts', label: 'Charts', icon: PieChart }
  ]

  const handleCalculate = async () => {
    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const calculator = new ProFormaCalculator(assumptions)
        const calculatedResults = calculator.calculate()
        setResults(calculatedResults)
        setActiveTab('results') // Automatically switch to results tab
      } catch (error) {
        console.error('Calculation error:', error)
        // In a real app, you'd show an error message to the user
      } finally {
        setIsCalculating(false)
      }
    }, 1000)
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      ['Financial Modeling Results'],
      [''],
      ['Key Metrics', ''],
      ['Total Equity Invested', `$${results.totalEquityInvested.toLocaleString()}`],
      ['Total Cash Returned', `$${results.totalCashReturned.toLocaleString()}`],
      ['Net Profit', `$${results.netProfit.toLocaleString()}`],
      ['IRR', results.irr ? `${(results.irr * 100).toFixed(2)}%` : 'N/A'],
      ['Equity Multiple', `${results.equityMultiple.toFixed(2)}x`],
      ['Average Cash-on-Cash', `${(results.averageCashOnCash * 100).toFixed(2)}%`],
      ['Total Tax Savings', `$${results.totalTaxSavings.toLocaleString()}`],
      [''],
      ['Annual Cashflows', ''],
      ['Year', 'NOI', 'Debt Service', 'Before-Tax CF', 'Depreciation', 'Taxable Income', 'Taxes', 'After-Tax CF', 'Loan Balance'],
      ...results.annualCashflows.map(cf => [
        cf.year,
        cf.noi.toFixed(0),
        cf.debtService.toFixed(0),
        cf.beforeTaxCashflow.toFixed(0),
        cf.depreciation.toFixed(0),
        cf.taxableIncome.toFixed(0),
        cf.taxes.toFixed(0),
        cf.afterTaxCashflow.toFixed(0),
        cf.loanBalance.toFixed(0),
      ]),
      [''],
      ['Sale Proceeds', ''],
      ['Sale Price', `$${results.saleProceeds.salePrice.toLocaleString()}`],
      ['Selling Costs', `$${results.saleProceeds.sellingCosts.toLocaleString()}`],
      ['Net Sale Proceeds', `$${results.saleProceeds.netSaleProceeds.toLocaleString()}`],
      ['Loan Balance at Sale', `$${results.saleProceeds.loanBalance.toLocaleString()}`],
      ['Before-Tax Sale Proceeds', `$${results.saleProceeds.beforeTaxSaleProceeds.toLocaleString()}`],
      ['Capital Gains', `$${results.saleProceeds.capitalGains.toLocaleString()}`],
      ['Depreciation Recapture', `$${results.saleProceeds.deprecationRecapture.toLocaleString()}`],
      ['Taxes on Sale', `$${results.saleProceeds.taxesOnSale.toLocaleString()}`],
      ['After-Tax Sale Proceeds', `$${results.saleProceeds.afterTaxSaleProceeds.toLocaleString()}`],
    ]

    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial-modeling-results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Financial Modeling Sheet
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive real estate investment analysis with educational tooltips to help you learn. 
          Hover over the <HelpCircle className="w-4 h-4 inline mx-1" /> icons for detailed explanations.
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>IRR & NPV Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Tax-Optimized Returns</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Multi-Year Projections</span>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards - Above Main Container */}
      <div className="mb-6">
        <KeyMetricsPanel assumptions={assumptions} isLoading={isCalculating} />
      </div>

      {/* Main Tab Navigation */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              {/* Quick Actions */}
              {results && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-lg">
              {mainTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Content */}

          <TabsContent value="assumptions" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AssumptionsForm
                assumptions={assumptions}
                onAssumptionsChange={setAssumptions}
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Results</CardTitle>
                    <p className="text-muted-foreground">Key performance metrics and returns analysis</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">Returns Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Total Return</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-80 p-3">
                                    <p className="text-sm leading-relaxed">{financialTooltips.totalReturn}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-medium">
                              {results ? `$${results.netProfit.toLocaleString()}` : '--'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Annualized IRR</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-80 p-3">
                                    <p className="text-sm leading-relaxed">{financialTooltips.annualizedIRR}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-medium">
                              {results && results.irr ? `${(results.irr * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Cash-on-Cash Return</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-80 p-3">
                                    <p className="text-sm leading-relaxed">{financialTooltips.cashOnCashReturn}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-medium">
                              {results ? `${(results.averageCashOnCash * 100).toFixed(1)}%` : '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Cash Flow Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 1 Cash Flow</span>
                            <span className="font-medium">
                              {results && results.annualCashflows.length > 0 ? `$${results.annualCashflows[0].afterTaxCashflow.toLocaleString()}` : '$0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Average Annual CF</span>
                            <span className="font-medium">
                              {results ? `$${(results.annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0) / results.annualCashflows.length).toLocaleString()}` : '$0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Cash Flow</span>
                            <span className="font-medium">
                              {results ? `$${results.annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0).toLocaleString()}` : '$0'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Sale Proceeds</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Sale Price</span>
                            <span className="font-medium">
                              {results ? `$${results.saleProceeds.salePrice.toLocaleString()}` : '$0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Net Sale Proceeds</span>
                            <span className="font-medium">
                              {results ? `$${results.saleProceeds.netSaleProceeds.toLocaleString()}` : '$0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capital Gain</span>
                            <span className="font-medium">
                              {results ? `$${results.saleProceeds.capitalGains.toLocaleString()}` : '$0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
              
          <TabsContent value="cashflows" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Flow Projections</CardTitle>
                    <p className="text-muted-foreground">Year-by-year cash flow analysis over the hold period</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Year</th>
                            <th className="text-right p-2">Rental Income</th>
                            <th className="text-right p-2">Operating Expenses</th>
                            <th className="text-right p-2">
                              <div className="flex items-center justify-end gap-2">
                                Net Operating Income
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-80 p-3">
                                      <p className="text-sm leading-relaxed">{financialTooltips.netOperatingIncome}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </th>
                            <th className="text-right p-2">Debt Service</th>
                            <th className="text-right p-2">Cash Flow</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results ? results.annualCashflows.map((cf) => (
                            <tr key={cf.year} className="border-b">
                              <td className="p-2 font-medium">{cf.year}</td>
                              <td className="text-right p-2 text-muted-foreground">N/A</td>
                              <td className="text-right p-2 text-muted-foreground">N/A</td>
                              <td className="text-right p-2 text-muted-foreground">${cf.noi.toLocaleString()}</td>
                              <td className="text-right p-2 text-muted-foreground">${cf.debtService.toLocaleString()}</td>
                              <td className="text-right p-2 font-medium">${cf.afterTaxCashflow.toLocaleString()}</td>
                            </tr>
                          )) : [1, 2, 3, 4, 5].map((year) => (
                            <tr key={year} className="border-b">
                              <td className="p-2 font-medium">{year}</td>
                              <td className="text-right p-2 text-muted-foreground">$0</td>
                              <td className="text-right p-2 text-muted-foreground">$0</td>
                              <td className="text-right p-2 text-muted-foreground">$0</td>
                              <td className="text-right p-2 text-muted-foreground">$0</td>
                              <td className="text-right p-2 font-medium">$0</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
              
          <TabsContent value="charts" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ModelingCharts results={results} />
          </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bottom Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            <CardTitle>How to Use the Financial Modeling Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <p className="font-medium">Input Assumptions</p>
                <p className="text-muted-foreground">
                  Enter property details, financing terms, and investment parameters.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <p className="font-medium">Run Analysis</p>
                <p className="text-muted-foreground">
                  Generate comprehensive financial projections with tax considerations.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <p className="font-medium">Review Results</p>
                <p className="text-muted-foreground">
                  Analyze IRR, cash flows, and investment returns across multiple views.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  4
                </div>
                <p className="font-medium">Export & Share</p>
                <p className="text-muted-foreground">
                  Download results as CSV for further analysis or presentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Start with conservative assumptions and use the 
            sensitivity analysis to understand how changes in exit cap rates affect your returns. 
            Target IRRs of 12%+ and equity multiples above 2.0x for strong commercial real estate investments.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  )
}