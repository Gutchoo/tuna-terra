"use client"

import { motion } from "framer-motion"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
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
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b px-6 py-4"
      >
        <h1 className="text-2xl font-bold">Financial Modeling Sheet</h1>
        <p className="text-muted-foreground">
          Comprehensive real estate investment analysis with professional-grade calculations
        </p>
      </motion.div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full p-6">
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
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <NewResultsPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}