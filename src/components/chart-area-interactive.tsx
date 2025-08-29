"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'
import { ProFormaCalculator } from '@/lib/financial-modeling/proforma'

export function ChartAreaInteractive() {
  const { state } = useFinancialModeling()
  const calculator = new ProFormaCalculator(state.assumptions)
  const results = calculator.calculate()

  if (!results || results.annualCashflows.length === 0) {
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
  }))

  // Equity build-up data (principal paydown)
  const initialLoanBalance = results.annualCashflows[0]?.loanBalance || 0
  const equityBuildupData = results.annualCashflows.map(cf => ({
    year: `Year ${cf.year}`,
    loanBalance: Math.round(cf.loanBalance),
    equityBuildup: Math.round(initialLoanBalance - cf.loanBalance),
  }))

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cashflow" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
              <TabsTrigger value="noi">NOI Trend</TabsTrigger>
              <TabsTrigger value="equity">Equity Buildup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cashflow" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => label}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="afterTaxCashflow"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="After-Tax Cash Flow"
                    />
                    <Area
                      type="monotone"
                      dataKey="beforeTaxCashflow"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      name="Before-Tax Cash Flow"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="noi" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'NOI']}
                      labelFormatter={(label) => label}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="noi"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="Net Operating Income"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="equity" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={equityBuildupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => label}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar
                      dataKey="equityBuildup"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Equity Buildup"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}