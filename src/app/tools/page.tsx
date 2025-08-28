'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    title: 'Cap Rate Calculator',
    description: 'Calculate capitalization rates and analyze property values with sensitivity analysis',
    icon: TrendingUp,
    category: 'valuation',
    difficulty: 'Intermediate',
    component: CapRateCalculator,
  },
  {
    id: 'noi',
    title: 'NOI Calculator',
    description: 'Analyze Net Operating Income with waterfall breakdown and expense ratios',
    icon: DollarSign,
    category: 'cash-flow',
    difficulty: 'Beginner',
    component: NOICalculator,
  },
  {
    id: 'tvm',
    title: 'Time Value of Money',
    description: 'Calculate present value, future value, and compound interest relationships',
    icon: Clock,
    category: 'finance',
    difficulty: 'Intermediate',
    component: TVMCalculator,
  },
  {
    id: 'irr-npv',
    title: 'IRR & NPV Analysis',
    description: 'Internal Rate of Return and Net Present Value calculations with cash flow analysis',
    icon: TrendingUp,
    category: 'finance',
    difficulty: 'Advanced',
    component: IRRNPVCalculator,
  },
  {
    id: 'dscr',
    title: 'DSCR Calculator',
    description: 'Debt Service Coverage Ratio and loan risk analysis',
    icon: CreditCard,
    category: 'financing',
    difficulty: 'Advanced',
    component: DSCRCalculator,
  },
  {
    id: 'loan-amortization',
    title: 'Loan Amortization',
    description: 'Complete loan payment schedule with extra payment analysis',
    icon: Calculator,
    category: 'financing',
    difficulty: 'Intermediate',
    component: LoanAmortizationCalculator,
  },
]

export default function ToolsPage() {
  const [activeCalculator, setActiveCalculator] = useState<string>('cap-rate')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800'
      case 'Advanced':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
    }
  }

  const activeToolData = calculatorTools.find(tool => tool.id === activeCalculator)
  const ActiveComponent = activeToolData?.component

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Real Estate Calculators
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            Professional-grade financial calculators for commercial real estate analysis. 
            Use these tools for investment evaluation, due diligence, and educational purposes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center gap-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>{calculatorTools.length} Professional Tools</span>
          </div>
        </motion.div>
      </div>

      {/* Calculator Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs value={activeCalculator} onValueChange={setActiveCalculator}>
          {/* Calculator Tabs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
            {calculatorTools.map((tool, index) => {
              const Icon = tool.icon
              const isActive = activeCalculator === tool.id
              const isAvailable = tool.component !== null
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={`w-full h-auto min-h-[140px] p-4 flex flex-col gap-3 text-left justify-start ${
                      !isAvailable ? 'opacity-60' : ''
                    }`}
                    onClick={() => isAvailable && setActiveCalculator(tool.id)}
                    disabled={!isAvailable}
                  >
                    <div className="flex items-start justify-between w-full">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(tool.difficulty)}`}
                      >
                        {tool.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 w-full flex-1 min-h-0">
                      <div className="font-semibold text-sm leading-tight">
                        {tool.title}
                      </div>
                      <div className="text-xs opacity-80 leading-relaxed overflow-hidden">
                        <div className="line-clamp-2">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                    
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-xs mt-auto">
                        Coming Soon
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Active Calculator */}
          <motion.div
            key={activeCalculator}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This calculator is currently in development. Check back soon for advanced 
                  financial analysis tools including IRR, NPV, and DSCR calculations.
                </p>
              </div>
            )}
          </motion.div>
        </Tabs>
      </motion.div>

      {/* Financial Modeling CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">Professional Financial Modeling</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ready for advanced analysis? Use our comprehensive Financial Modeling Sheet 
            for complete real estate investment analysis with multi-year cashflow projections, 
            tax optimization, and IRR calculations.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/financial-modeling">
                Launch Financial Model
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/education">
                Learn the Concepts
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Usage Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-semibold">1</span>
            </div>
            <h3 className="font-semibold">Select Your Tool</h3>
            <p className="text-sm text-muted-foreground">
              Choose from cap rate, NOI, TVM, IRR/NPV, or DSCR calculators based on your analysis needs.
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-semibold">2</span>
            </div>
            <h3 className="font-semibold">Input Property Data</h3>
            <p className="text-sm text-muted-foreground">
              Enter accurate property information including income, expenses, and market values.
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-semibold">3</span>
            </div>
            <h3 className="font-semibold">Analyze Results</h3>
            <p className="text-sm text-muted-foreground">
              Review calculations, charts, and insights to make informed investment decisions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}