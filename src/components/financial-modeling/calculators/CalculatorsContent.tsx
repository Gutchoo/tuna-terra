'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'

// Import calculators
import { CapRateCalculator } from '@/components/calculators/CapRateCalculator'
import { NOICalculator } from '@/components/calculators/NOICalculator'
import { TVMCalculator } from '@/components/calculators/TVMCalculator'
import { IRRNPVCalculator } from '@/components/calculators/IRRNPVCalculator'
import { DSCRCalculator } from '@/components/calculators/DSCRCalculator'
import { LoanAmortizationCalculator } from '@/components/calculators/LoanAmortizationCalculator'

const calculatorComponents = {
  'cap-rate': CapRateCalculator,
  'noi': NOICalculator,
  'tvm': TVMCalculator,
  'irr-npv': IRRNPVCalculator,
  'dscr': DSCRCalculator,
  'loan-amortization': LoanAmortizationCalculator,
}

const calculatorInfo = {
  'cap-rate': {
    title: 'Cap Rate Calculator',
    description: 'Calculate capitalization rates and analyze property values with sensitivity analysis'
  },
  'noi': {
    title: 'NOI Calculator',
    description: 'Analyze Net Operating Income with waterfall breakdown and expense ratios'
  },
  'tvm': {
    title: 'Time Value of Money',
    description: 'Calculate present value, future value, and compound interest relationships'
  },
  'irr-npv': {
    title: 'IRR & NPV Analysis',
    description: 'Internal Rate of Return and Net Present Value calculations with cash flow analysis'
  },
  'dscr': {
    title: 'DSCR Calculator',
    description: 'Debt Service Coverage Ratio and loan risk analysis'
  },
  'loan-amortization': {
    title: 'Loan Amortization',
    description: 'Complete loan payment schedule with extra payment analysis'
  },
}

export function CalculatorsContent() {
  const { state } = useFinancialModeling()
  const activeCalculator = state.activeCalculator
  
  if (!activeCalculator) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Real Estate Calculators</CardTitle>
            <CardDescription>
              Select a calculator from the sidebar to begin your analysis. Each tool provides professional-grade 
              calculations for commercial real estate investment analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(calculatorInfo).map(([id, info]) => (
                <div key={id} className="space-y-1">
                  <h3 className="font-medium text-sm">{info.title}</h3>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const CalculatorComponent = calculatorComponents[activeCalculator as keyof typeof calculatorComponents]
  const info = calculatorInfo[activeCalculator as keyof typeof calculatorInfo]
  
  if (!CalculatorComponent) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Calculator Not Found</CardTitle>
            <CardDescription>
              The selected calculator is not available. Please select another calculator from the sidebar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{info.title}</h1>
        <p className="text-muted-foreground mt-2">{info.description}</p>
      </div>
      
      <CalculatorComponent />
    </div>
  )
}