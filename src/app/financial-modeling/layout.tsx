import { FinancialModelingProvider } from "@/lib/contexts/FinancialModelingContext"
import { FinancialModelingWrapper } from "./wrapper"

export default function FinancialModelingLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <FinancialModelingProvider>
      <FinancialModelingWrapper>
        {children}
      </FinancialModelingWrapper>
    </FinancialModelingProvider>
  )
}