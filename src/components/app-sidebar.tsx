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

export function AppSidebar({ 
  variant = "sidebar",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  variant?: "sidebar" | "floating" | "inset"
}) {
  const { state, dispatch } = useFinancialModeling()
  
  return (
    <Sidebar variant={variant} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Calculator className="h-6 w-6" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold">Financial Model</h2>
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
                tooltip={section.title}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}