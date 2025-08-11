'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Property, PortfolioWithMembership } from '@/lib/supabase'
import { FullScreenMapView } from '@/components/properties/FullScreenMapView'
import { PortfolioSelector } from '@/components/portfolios/PortfolioSelector'

function MapPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)

  // Handle default portfolio redirect when no portfolio_id is specified
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // If no portfolio specified, redirect to default portfolio
    if (!portfolioId && !isRedirecting) {
      setIsRedirecting(true)
      
      const redirectToDefaultPortfolio = async () => {
        try {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) {
            throw new Error('Failed to fetch portfolios')
          }
          
          const data = await response.json()
          const portfolios = data.portfolios || []
          
          // Find default portfolio
          const defaultPortfolio = portfolios.find((p: PortfolioWithMembership) => p.is_default)
          
          if (defaultPortfolio) {
            console.log('[MAP] Redirecting to default portfolio:', defaultPortfolio.id)
            router.replace(`/dashboard/map?portfolio_id=${defaultPortfolio.id}`)
            return
          }
          
          // If no default portfolio, use the first available portfolio
          if (portfolios.length > 0) {
            console.log('[MAP] No default portfolio found, using first portfolio:', portfolios[0].id)
            router.replace(`/dashboard/map?portfolio_id=${portfolios[0].id}`)
            return
          }
          
          // If no portfolios at all, continue without redirect
          console.log('[MAP] No portfolios found, staying on current page')
          setIsRedirecting(false)
          
        } catch (error) {
          console.error('[MAP] Failed to redirect to default portfolio:', error)
          setIsRedirecting(false)
        }
      }
      
      redirectToDefaultPortfolio()
    } else if (portfolioId) {
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting])

  // Fetch properties with portfolio awareness
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    console.log(`[MAP] Portfolio change detected: ${currentPortfolioId} → ${portfolioId}`)
    
    // Don't fetch if we're redirecting
    if (isRedirecting) {
      return
    }
    
    setCurrentPortfolioId(portfolioId)
    
    async function fetchPropertiesWithPortfolioId(portfolioId: string | null) {
      try {
        setLoading(true)
        setError(null)
        const url = new URL('/api/user-properties', window.location.origin)
        if (portfolioId) {
          url.searchParams.set('portfolio_id', portfolioId)
        }
        
        console.log(`[MAP] Fetching properties for portfolio: ${portfolioId || 'ALL'}`)
        
        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error('Failed to fetch properties')
        }
        const data = await response.json()
        
        console.log(`[MAP] Received ${data.properties?.length || 0} properties for portfolio ${portfolioId || 'ALL'}`)
        
        setProperties(data.properties || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    fetchPropertiesWithPortfolioId(portfolioId)
  }, [searchParams, isRedirecting, currentPortfolioId])

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
  }

  const handlePropertiesChange = (updatedProperties: Property[]) => {
    setProperties(updatedProperties)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading || isRedirecting) {
    return (
      <div className="h-[calc(100vh-6rem)] pt-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRedirecting ? 'Setting up your portfolio...' : 'Loading map...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] pt-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
          <p className="text-muted-foreground">
            Explore your properties on an interactive map ({properties.length} {properties.length === 1 ? 'property' : 'properties'})
          </p>
        </div>
      </div>

      {/* Portfolio Selector */}
      <PortfolioSelector 
        onPortfolioChange={(portfolioId) => {
          setCurrentPortfolioId(portfolioId)
        }}
        compact={true}
      />

      <div className="h-[calc(100vh-12rem)] -mx-4">
        <FullScreenMapView
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={handlePropertySelect}
          onPropertiesChange={handlePropertiesChange}
          onError={handleError}
        />
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-6rem)] pt-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  )
}