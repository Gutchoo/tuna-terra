"use client"

import * as React from "react"
import { Calculator, FileSpreadsheet, TrendingUp, DollarSign, ChevronRight } from "lucide-react"
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, dispatch } = useFinancialModeling()
  
  return (
    <Sidebar {...props} className="top-12">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Financial Modeling</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    isActive={state.activeSection === section.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section.id })}
                    tooltip={section.description}
                  >
                    <section.icon className="size-4" />
                    <span>{section.title}</span>
                    {state.activeSection === section.id && (
                      <ChevronRight className="ml-auto size-4" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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