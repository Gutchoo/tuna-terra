"use client"

import { motion } from "framer-motion"
import { AppSidebar } from "@/components/financial-modeling/app-sidebar"
import { InputSheetContent } from "@/components/financial-modeling/InputSheetContent"
import { CashflowsContent } from "@/components/financial-modeling/CashflowsContent" 
import { SaleContent } from "@/components/financial-modeling/SaleContent"
import { DealSummaryPanel } from "@/components/financial-modeling/DealSummaryPanel"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useFinancialModeling } from "@/lib/contexts/FinancialModelingContext"

export default function FinancialModelingPage() {
  const { state } = useFinancialModeling()
  
  const renderContent = () => {
    switch (state.activeSection) {
      case "input-sheet":
        return <InputSheetContent />
      case "cashflows":
        return <CashflowsContent />
      case "sale":
        return <SaleContent />
      default:
        return <InputSheetContent />
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Main Content Area */}
              <div className="flex flex-1 w-full">
                {/* Content Section */}
                <div className="flex-1 px-4 lg:px-6 min-w-0">
                  <motion.div
                    key={state.activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {renderContent()}
                  </motion.div>
                </div>
                
                {/* Deal Summary Panel */}
                <div className="hidden xl:block xl:w-96 flex-shrink-0 px-4 lg:px-6">
                  <DealSummaryPanel />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}