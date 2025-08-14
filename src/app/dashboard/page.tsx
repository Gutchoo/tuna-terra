'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BuildingIcon, PlusIcon } from 'lucide-react'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Property, PortfolioWithMembership } from '@/lib/supabase'
import { PropertyView } from '@/components/properties/PropertyView'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useDefaultPortfolio } from '@/hooks/use-portfolios'
import { useProperties } from '@/hooks/use-properties'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasNoPortfolios, setHasNoPortfolios] = useState(false)

  // Use optimized hooks for data fetching
  const { data: defaultPortfolio, portfolios, isLoading: portfoliosLoading } = useDefaultPortfolio(true)
  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useProperties(currentPortfolioId)

  // Handle default portfolio redirect when no portfolio_id is specified
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // If no portfolio specified and not loading, redirect to default portfolio
    if (!portfolioId && !isRedirecting && !portfoliosLoading) {
      setIsRedirecting(true)
      
      if (!portfolios || portfolios.length === 0) {
        // No portfolios found
        console.log('[DASHBOARD] No portfolios found - user needs to create a portfolio')
        setHasNoPortfolios(true)
        setIsRedirecting(false)
        return
      }
      
      // Use default portfolio or first available
      if (defaultPortfolio) {
        console.log('[DASHBOARD] Redirecting to default portfolio:', defaultPortfolio.id)
        router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
      } else {
        setIsRedirecting(false)
      }
    } else if (portfolioId) {
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting, portfoliosLoading, portfolios, defaultPortfolio])

  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    console.log(`[DASHBOARD] Portfolio change detected: ${currentPortfolioId} → ${portfolioId}`)
    setCurrentPortfolioId(portfolioId)
  }, [searchParams, currentPortfolioId])

  const handlePropertiesChange = (updatedProperties: Property[]) => {
    // Properties are now managed by React Query, but we can keep this for compatibility
    // Individual property operations should invalidate the cache instead
  }

  const handleError = (errorMessage: string) => {
    // Error handling is now managed by React Query
    console.error('[DASHBOARD] Property error:', errorMessage)
  }

  const renderContent = () => {
    if (portfoliosLoading || propertiesLoading || isRedirecting) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRedirecting ? 'Setting up your portfolio...' : 'Loading your properties...'}
          </p>
        </div>
      )
    }

    if (propertiesError) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Error: {propertiesError.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      )
    }

    if (hasNoPortfolios) {
      return (
        <div className="text-center py-12">
          <BuildingIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Welcome to Your Property Dashboard</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first portfolio to organize and manage your properties.
          </p>
          <Button 
            onClick={() => router.push('/dashboard/portfolios/new')}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Your First Portfolio
          </Button>
        </div>
      )
    }

    if (!currentPortfolioId) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Please select a portfolio to view your properties</p>
        </div>
      )
    }

    return (
      <PropertyView
        properties={properties}
        onPropertiesChange={handlePropertiesChange}
        onError={handleError}
      />
    )
  }

  return (
    <div className="space-y-0">
      <DashboardHeader 
        onPortfolioChange={(portfolioId) => {
          // Only update local state - let useEffect handle fetching based on URL changes
          // This prevents race conditions between URL updates and direct API calls
          setCurrentPortfolioId(portfolioId)
        }}
      />

      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-0">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-48 bg-muted rounded animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-muted rounded animate-pulse" />
                <div className="h-9 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}