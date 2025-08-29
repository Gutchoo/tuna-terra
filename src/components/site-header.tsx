"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"
import { UserMenu } from "@/components/user-menu"

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

export function SiteHeader() {
  const { state } = useFinancialModeling()
  
  // Get current sheet title
  const getCurrentSheetTitle = () => {
    const section = sections.find(s => s.id === state.activeSection)
    return section?.title || "Input Sheet"
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-sm font-semibold">{getCurrentSheetTitle()}</h1>
      </div>
      <UserMenu />
    </header>
  )
}