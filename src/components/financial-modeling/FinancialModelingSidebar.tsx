"use client"

import { Calculator, FileSpreadsheet, TrendingUp, DollarSign } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"

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

export function FinancialModelingSidebar() {
  const { state, dispatch } = useFinancialModeling()
  
  return (
    <Sidebar>
      <SidebarHeader className="p-6 pt-20">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">Financial Model</h2>
            <p className="text-sm text-muted-foreground">Real Estate Analysis</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {sections.map((section) => (
            <SidebarMenuItem key={section.id}>
              <SidebarMenuButton
                isActive={state.activeSection === section.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section.id })}
                className="flex-col items-start gap-1 p-4 h-auto"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4" />
                  <span className="font-medium">{section.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {section.description}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}