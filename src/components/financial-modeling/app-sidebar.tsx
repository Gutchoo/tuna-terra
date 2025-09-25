"use client"

import * as React from "react"
import { Calculator, FileSpreadsheet, TrendingUp, DollarSign, ChevronRight, Lock, CheckCircle, Clock, CreditCard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { getSectionStatus } from "@/lib/financial-modeling/completion-logic"

const sections = [
  {
    id: "input-sheet",
    title: "Input Sheet",
    icon: FileSpreadsheet,
    description: "Property details and assumptions"
  },
  {
    id: "cashflows", 
    title: "Cashflows",
    icon: TrendingUp,
    description: "Annual operating projections"
  },
  {
    id: "sale",
    title: "Sale Analysis",
    icon: DollarSign,
    description: "Exit strategy and returns"
  }
]

const calculators = [
  {
    id: 'cap-rate',
    title: 'Cap Rate',
    icon: TrendingUp,
    description: 'Capitalization rate and property value analysis'
  },
  {
    id: 'noi',
    title: 'NOI Calculator',
    icon: DollarSign,
    description: 'Net Operating Income waterfall breakdown'
  },
  {
    id: 'tvm',
    title: 'Time Value of Money',
    icon: Clock,
    description: 'Present value and future value calculations'
  },
  {
    id: 'irr-npv',
    title: 'IRR & NPV',
    icon: TrendingUp,
    description: 'Internal Rate of Return and Net Present Value'
  },
  {
    id: 'dscr',
    title: 'DSCR',
    icon: CreditCard,
    description: 'Debt Service Coverage Ratio analysis'
  },
  {
    id: 'loan-amortization',
    title: 'Loan Amortization',
    icon: Calculator,
    description: 'Complete loan payment schedule'
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, dispatch } = useFinancialModeling()
  
  // Get status for each section
  const getStatusBadge = (sectionId: 'input-sheet' | 'cashflows' | 'sale') => {
    const status = getSectionStatus(sectionId, state.assumptions, state.viewedSections)
    
    if (sectionId === 'input-sheet') {
      // Show progress percentage for input sheet
      const progress = state.completionState.inputSheetProgress
      if (progress === 100) {
        return <CheckCircle className="ml-auto size-4 text-green-600" />
      } else if (progress > 0) {
        return <Badge variant="secondary" className="ml-auto text-xs">{progress}%</Badge>
      }
      return null
    }
    
    // For other sections, show status badges
    switch (status) {
      case 'viewed':
        return <CheckCircle className="ml-auto size-4 text-green-600" />
      case 'ready':
        return <Badge variant="default" className="ml-auto text-xs">Ready</Badge>
      case 'locked':
        return <Lock className="ml-auto size-3 text-muted-foreground" />
      default:
        return null
    }
  }
  
  return (
    <Sidebar {...props} className="top-12">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Financial Modeling</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => {
                const sectionId = section.id as 'input-sheet' | 'cashflows' | 'sale'
                const status = getSectionStatus(sectionId, state.assumptions, state.viewedSections)
                const isDisabled = status === 'locked' && sectionId !== 'input-sheet'
                
                return (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      isActive={state.activeSection === section.id}
                      onClick={() => !isDisabled && dispatch({ type: 'SET_ACTIVE_SECTION', payload: section.id })}
                      tooltip={isDisabled ? "Complete required inputs first" : section.description}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <section.icon className="size-4" />
                      <span>{section.title}</span>
                      {state.activeSection === section.id && (
                        <ChevronRight className="ml-auto size-4" />
                      )}
                      {state.activeSection !== section.id && getStatusBadge(sectionId)}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Calculators</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculators.map((calculator) => {
                const Icon = calculator.icon
                const isActive = state.activeCalculator === calculator.id && state.activeSection === 'calculators'
                
                return (
                  <SidebarMenuItem key={calculator.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => dispatch({ type: 'SET_ACTIVE_CALCULATOR', payload: calculator.id })}
                      tooltip={calculator.description}
                    >
                      <Icon className="size-4" />
                      <span>{calculator.title}</span>
                      {isActive && (
                        <ChevronRight className="ml-auto size-4" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => dispatch({ type: 'RESET_MODEL' })}
                  tooltip="Reset all inputs to default values"
                >
                  <Calculator className="size-4" />
                  <span>Reset Model</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}