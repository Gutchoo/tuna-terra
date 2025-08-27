'use client'

import { Button } from '@/components/ui/button'
import { BuildingIcon, PlusIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

interface WelcomeEmptyStateProps {
  onCreatePortfolio: () => void
}

export function WelcomeEmptyState({ onCreatePortfolio }: WelcomeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen max-w-md mx-auto px-6 pt-20 text-center">
      {/* Simple Icon */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
          <BuildingIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      
      {/* Clean Typography */}
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to Tuna Terra
        </h1>
        
        <p className="text-muted-foreground leading-relaxed">
          Organize and manage your real estate properties in one place. 
          Get started by creating your first portfolio or explore our financial modeling tools.
        </p>
      </div>

      {/* Primary CTAs */}
      <div className="space-y-3 w-full max-w-xs">
        <Button 
          onClick={onCreatePortfolio}
          size="lg"
          className="w-full h-12 flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create Portfolio
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          asChild
          className="w-full h-12 flex items-center justify-center gap-2"
        >
          <Link href="/modeling">
            <TrendingUpIcon className="h-4 w-4" />
            Financial Modeling
          </Link>
        </Button>
      </div>
    </div>
  )
}