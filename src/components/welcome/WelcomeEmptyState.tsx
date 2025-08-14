'use client'

import { Button } from '@/components/ui/button'
import { BuildingIcon, PlusIcon } from 'lucide-react'

interface WelcomeEmptyStateProps {
  onCreatePortfolio: () => void
}

export function WelcomeEmptyState({ onCreatePortfolio }: WelcomeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto px-6 text-center">
      {/* Simple Icon */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
          <BuildingIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      
      {/* Clean Typography */}
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Create your first portfolio
        </h1>
        
        <p className="text-muted-foreground leading-relaxed">
          Organize and manage your real estate properties in one place. 
          Get started by creating your first portfolio.
        </p>
      </div>

      {/* Single CTA */}
      <Button 
        onClick={onCreatePortfolio}
        size="lg"
        className="w-full max-w-xs h-12 flex items-center justify-center gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        Create Portfolio
      </Button>
    </div>
  )
}