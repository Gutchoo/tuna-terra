"use client"

import { motion } from "framer-motion"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FinancialModelingSidebar } from "@/components/financial-modeling/FinancialModelingSidebar"
import { InputSheetContent } from "@/components/financial-modeling/InputSheetContent"
import { CashflowsContent } from "@/components/financial-modeling/CashflowsContent" 
import { SaleContent } from "@/components/financial-modeling/SaleContent"
import { NewResultsPanel } from "@/components/financial-modeling/NewResultsPanel"
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
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <FinancialModelingSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            {/* Main Content */}
            <div className="flex flex-1 mt-2 w-full">
              {/* Main Content Panel - flexible width */}
              <div className="flex-1 p-4 lg:p-6 min-w-0">
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
              
              {/* Results Panel - responsive width */}
              <div className="hidden xl:block xl:w-96 flex-shrink-0">
                <NewResultsPanel />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}