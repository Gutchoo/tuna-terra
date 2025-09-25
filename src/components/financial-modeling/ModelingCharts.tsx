'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react'

import { type ProFormaResults } from '@/lib/financial-modeling/proforma'

interface ModelingChartsProps {
  results: ProFormaResults | null
}

export function ModelingCharts({ results }: ModelingChartsProps) {
  if (!results) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Charts Ready</h3>
          <p className="text-muted-foreground">
            Run your financial analysis to see interactive visualizations.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const cashflowData = results.annualCashflows.map(cf => ({
    year: `Year ${cf.year}`,
    noi: Math.round(cf.noi),
    beforeTaxCashflow: Math.round(cf.beforeTaxCashflow),
    afterTaxCashflow: Math.round(cf.afterTaxCashflow),
    loanBalance: Math.round(cf.loanBalance),
    taxes: Math.round(cf.taxes),
  }))

  // Equity build-up data (principal paydown)
  const initialLoanBalance = results.annualCashflows[0]?.loanBalance || 0
  const equityBuildupData = results.annualCashflows.map(cf => ({
    year: `Year ${cf.year}`,
    loanBalance: Math.round(cf.loanBalance),
    equityBuildup: Math.round(initialLoanBalance - cf.loanBalance),
  }))

  // Investment summary pie chart
  const investmentBreakdown = [
    { name: 'Cash Flows', value: Math.round(results.annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0)), color: '#10b981' },
    { name: 'Sale Proceeds', value: Math.round(results.saleProceeds.afterTaxSaleProceeds), color: '#3b82f6' },
    { name: 'Tax Savings', value: Math.round(results.totalTaxSavings), color: '#8b5cf6' },
  ].filter(item => item.value > 0)

  // Sensitivity analysis data (mock data for demonstration)
  const sensitivityData = [
    { exitCap: '6.0%', irr: 18.2, npv: 450000 },
    { exitCap: '6.5%', irr: 16.1, npv: 380000 },
    { exitCap: '7.0%', irr: results.irr ? (results.irr * 100) : 14.0, npv: 310000 },
    { exitCap: '7.5%', irr: 12.1, npv: 240000 },
    { exitCap: '8.0%', irr: 10.3, npv: 170000 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipCurrency = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs defaultValue="cashflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="equity">Equity Build-up</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        {/* Cash Flow Chart */}
        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Annual Cash Flow Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                NOI, debt service, and after-tax cash flows over the investment period
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis 
                      className="text-xs"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={formatTooltipCurrency}
                      labelClassName="font-medium"
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="noi" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="NOI"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="beforeTaxCashflow" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Before-Tax Cash Flow"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="afterTaxCashflow" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      name="After-Tax Cash Flow"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equity Build-up Chart */}
        <TabsContent value="equity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Equity Build-up Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Loan balance reduction and equity accumulation over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityBuildupData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis 
                      className="text-xs"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={formatTooltipCurrency}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="loanBalance"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Remaining Loan Balance"
                    />
                    <Area
                      type="monotone"
                      dataKey="equityBuildup"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.8}
                      name="Equity Built Through Paydown"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Breakdown */}
        <TabsContent value="returns">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Return Sources
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Breakdown of total investment returns
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {investmentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {investmentBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Return Metrics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key performance indicators
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div>
                      <div className="font-medium">IRR</div>
                      <div className="text-sm text-muted-foreground">Internal Rate of Return</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.irr ? `${(results.irr * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div>
                      <div className="font-medium">Equity Multiple</div>
                      <div className="text-sm text-muted-foreground">Cash Returned ÷ Invested</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.equityMultiple.toFixed(2)}x
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div>
                      <div className="font-medium">Cash-on-Cash</div>
                      <div className="text-sm text-muted-foreground">Average Annual Return</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(results.averageCashOnCash * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div>
                      <div className="font-medium">Total Return</div>
                      <div className="text-sm text-muted-foreground">Profit on Investment</div>
                    </div>
                    <div className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.netProfit)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensitivity Analysis */}
        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sensitivity Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                IRR sensitivity to exit cap rate assumptions
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="exitCap" className="text-xs" />
                    <YAxis 
                      className="text-xs"
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'IRR']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="irr" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="IRR"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-sm">
                  <strong>Analysis:</strong> Exit cap rate has significant impact on returns. 
                  A 1% increase in exit cap rate typically reduces IRR by 2-4 percentage points.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}