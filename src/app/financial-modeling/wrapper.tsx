'use client'

import { SmartNavigation } from '@/components/navigation/SmartNavigation'

interface FinancialModelingWrapperProps {
  children: React.ReactNode
}

export function FinancialModelingWrapper({ children }: FinancialModelingWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />
      {children}
    </div>
  )
}
