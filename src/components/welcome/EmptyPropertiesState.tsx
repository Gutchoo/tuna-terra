'use client'

import { Button } from '@/components/ui/button'
import { UploadIcon, ChevronRightIcon } from 'lucide-react'

interface EmptyPropertiesStateProps {
  portfolioId?: string | null
  onAddProperties?: () => void
}

export function EmptyPropertiesState({ portfolioId, onAddProperties }: EmptyPropertiesStateProps) {
  const currentPortfolioParam = portfolioId ? `?portfolio_id=${portfolioId}` : ''

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-6 text-center">
      {/* Simple Icon */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
          <UploadIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      
      {/* Clean Typography */}
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Add your first property
        </h1>
        
        <p className="text-muted-foreground leading-relaxed">
          Start building your portfolio. Upload properties and get comprehensive 
          data including ownership, financials, and zoning information.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="space-y-3 w-full max-w-xs">
        <Button 
          size="lg"
          className="w-full h-12 flex items-center justify-center gap-2"
          onClick={onAddProperties || (() => window.location.href = `/upload${currentPortfolioParam}`)}
        >
          <UploadIcon className="h-4 w-4" />
          Add Properties
        </Button>

        {/* Secondary Action - Subtle */}
        <Button 
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={onAddProperties || (() => window.location.href = `/upload${currentPortfolioParam}`)}
        >
          <div className="flex items-center justify-center gap-1">
            View upload options
            <ChevronRightIcon className="h-3 w-3" />
          </div>
        </Button>
      </div>
    </div>
  )
}