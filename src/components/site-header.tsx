"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"

const sections = [
  {
    id: "input-sheet",
    title: "Input Sheet",
    description: "Property details and assumptions"
  },
  {
    id: "cashflows", 
    title: "Cashflows",
    description: "Annual operating projections"
  },
  {
    id: "sale",
    title: "Sale Analysis",
    description: "Exit strategy and returns"
  }
]

const calculatorTitles: { [key: string]: string } = {
  'cap-rate': 'Cap Rate Calculator',
  'noi': 'NOI Calculator',
  'tvm': 'Time Value of Money',
  'irr-npv': 'IRR & NPV Analysis',
  'dscr': 'DSCR Calculator',
  'loan-amortization': 'Loan Amortization',
}

export function SiteHeader() {
  const { state } = useFinancialModeling()
  
  // Get current sheet title
  const getCurrentSheetTitle = () => {
    // Check if a calculator is active
    if (state.activeSection === 'calculators' && state.activeCalculator) {
      return calculatorTitles[state.activeCalculator] || 'Calculators'
    }
    
    // Otherwise get the section title
    const section = sections.find(s => s.id === state.activeSection)
    return section?.title || "Input Sheet"
  }

  return (
    <header className="flex h-12 shrink-0 items-center px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="mx-2 h-4 w-px bg-border" />
      <h1 className="text-sm font-semibold">{getCurrentSheetTitle()}</h1>
    </header>
  )
}