"use client"

import * as React from "react"
import { Calculator, FileSpreadsheet, TrendingUp, DollarSign, Building2, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, dispatch } = useFinancialModeling()
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/financial-modeling">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Financial Modeling</span>
                  <span className="text-xs text-muted-foreground">Real Estate Analysis</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
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
                <SidebarMenuButton>
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