'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
// import type { Property } from '@/lib/supabase'
import { FullScreenMapView } from '@/components/properties/FullScreenMapView'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useDefaultPortfolio } from '@/hooks/use-portfolios'
import { useProperties } from '@/hooks/use-properties'

function MapPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(() => 
    searchParams.get('portfolio_id')
  )
  
  // Use React Query hooks for optimized data fetching
  const { data: defaultPortfolio, portfolios, isLoading: portfoliosLoading } = useDefaultPortfolio(true)
  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useProperties(currentPortfolioId)

  // Handle default portfolio redirect when no portfolio_id is specified  
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Only update if different to prevent unnecessary re-renders
    if (portfolioId !== currentPortfolioId) {
      setCurrentPortfolioId(portfolioId)
    }
    
    // If no portfolio specified, redirect to default portfolio
    if (!portfolioId && !isRedirecting && !portfoliosLoading) {
      setIsRedirecting(true)
      
      if (!portfolios || portfolios.length === 0) {
        router.replace('/dashboard/portfolios/new')
        return
      }
      
      // Use default portfolio or first available
      if (defaultPortfolio) {
        console.log('[MAP] Redirecting to default portfolio:', defaultPortfolio.id)
        router.replace(`/dashboard/map?portfolio_id=${defaultPortfolio.id}`)
      } else if (portfolios.length > 0) {
        console.log('[MAP] No default portfolio found, using first portfolio:', portfolios[0].id)
        router.replace(`/dashboard/map?portfolio_id=${portfolios[0].id}`)
      }
    } else if (portfolioId && isRedirecting) {
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting, portfoliosLoading, portfolios, defaultPortfolio, currentPortfolioId])

  // Derived loading and error states
  const loading = portfoliosLoading || propertiesLoading
  const error = propertiesError?.message

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
  }

  const handlePropertiesChange = () => {
    // Properties are now managed by React Query, individual updates should invalidate cache
    console.log('[MAP] Properties updated, React Query will handle cache invalidation')
  }

  const handleError = (errorMessage: string) => {
    console.error('[MAP] Error:', errorMessage)
  }

  if (loading || isRedirecting) {
    return (
      <div className="space-y-0">
        <DashboardHeader 
          onPortfolioChange={() => {}}
        />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {isRedirecting ? 'Setting up your portfolio...' : 'Loading map...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-0">
        <DashboardHeader 
          onPortfolioChange={() => {}}
        />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <DashboardHeader 
        onPortfolioChange={(portfolioId) => {
          setCurrentPortfolioId(portfolioId)
        }}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <div className="h-[75vh]">
              <FullScreenMapView
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
                onPropertiesChange={handlePropertiesChange}
                onError={handleError}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="space-y-0">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="h-10 w-48 bg-muted rounded animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-muted rounded animate-pulse" />
                <div className="h-9 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  )
}