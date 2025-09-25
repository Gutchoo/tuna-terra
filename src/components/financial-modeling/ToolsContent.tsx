'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Calculator, TrendingUp, DollarSign, Clock, CreditCard } from 'lucide-react'

// Import calculators
import { CapRateCalculator } from '@/components/calculators/CapRateCalculator'
import { NOICalculator } from '@/components/calculators/NOICalculator'
import { TVMCalculator } from '@/components/calculators/TVMCalculator'
import { IRRNPVCalculator } from '@/components/calculators/IRRNPVCalculator'
import { DSCRCalculator } from '@/components/calculators/DSCRCalculator'
import { LoanAmortizationCalculator } from '@/components/calculators/LoanAmortizationCalculator'

const calculatorTools = [
  {
    id: 'cap-rate',
    title: 'Cap Rate',
    description: 'Calculate capitalization rates and analyze property values',
    icon: TrendingUp,
    component: CapRateCalculator,
  },
  {
    id: 'noi',
    title: 'NOI',
    description: 'Analyze Net Operating Income with waterfall breakdown',
    icon: DollarSign,
    component: NOICalculator,
  },
  {
    id: 'tvm',
    title: 'TVM',
    description: 'Calculate present value, future value, and compound interest',
    icon: Clock,
    component: TVMCalculator,
  },
  {
    id: 'irr-npv',
    title: 'IRR & NPV',
    description: 'Internal Rate of Return and Net Present Value calculations',
    icon: TrendingUp,
    component: IRRNPVCalculator,
  },
  {
    id: 'dscr',
    title: 'DSCR',
    description: 'Debt Service Coverage Ratio and loan risk analysis',
    icon: CreditCard,
    component: DSCRCalculator,
  },
  {
    id: 'loan-amortization',
    title: 'Loan Amortization',
    description: 'Complete loan payment schedule with extra payment analysis',
    icon: Calculator,
    component: LoanAmortizationCalculator,
  },
]

export function ToolsContent() {
  const [activeCalculator, setActiveCalculator] = useState<string>('cap-rate')
  
  const activeToolData = calculatorTools.find(tool => tool.id === activeCalculator)
  const ActiveComponent = activeToolData?.component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Professional Calculators</h2>
        <p className="text-muted-foreground mt-2">
          Financial analysis tools for commercial real estate investment evaluation
        </p>
      </div>

      {/* Calculator Tabs */}
      <Tabs value={activeCalculator} onValueChange={setActiveCalculator} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 h-auto gap-2">
          {calculatorTools.map((tool) => {
            const Icon = tool.icon
            const isAvailable = tool.component !== null
            
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                disabled={!isAvailable}
                className="flex flex-col gap-1 h-auto py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{tool.title}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Active Calculator Content */}
        <motion.div
          key={activeCalculator}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            {ActiveComponent ? (
              <ActiveComponent embedded={true} />
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This calculator is currently in development. Check back soon for advanced 
                  financial analysis tools.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </Tabs>

      {/* Usage Tips */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">1</span>
            </div>
            <h3 className="font-semibold text-sm">Select Tool</h3>
            <p className="text-xs text-muted-foreground">
              Choose the calculator that matches your analysis needs
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">2</span>
            </div>
            <h3 className="font-semibold text-sm">Input Data</h3>
            <p className="text-xs text-muted-foreground">
              Enter accurate property and financial information
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">3</span>
            </div>
            <h3 className="font-semibold text-sm">Analyze</h3>
            <p className="text-xs text-muted-foreground">
              Review calculations and insights for decision-making
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}