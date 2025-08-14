'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BuildingIcon, PlusIcon } from 'lucide-react'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Property, PortfolioWithMembership } from '@/lib/supabase'
import { PropertyView } from '@/components/properties/PropertyView'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasNoPortfolios, setHasNoPortfolios] = useState(false)

  // Handle default portfolio redirect when no portfolio_id is specified
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // If no portfolio specified, redirect to default portfolio
    if (!portfolioId && !isRedirecting) {
      setIsRedirecting(true)
      
      const redirectToDefaultPortfolio = async (retryCount = 0) => {
        const maxRetries = 5
        const baseDelay = 1000 // 1 second
        
        try {
          console.log(`[DASHBOARD] Attempting to fetch portfolios (attempt ${retryCount + 1}/${maxRetries + 1})`)
          
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) {
            throw new Error('Failed to fetch portfolios')
          }
          
          const data = await response.json()
          const portfolios = data.portfolios || []
          
          // Find default portfolio
          const defaultPortfolio = portfolios.find((p: PortfolioWithMembership) => p.is_default)
          
          if (defaultPortfolio) {
            console.log('[DASHBOARD] Redirecting to default portfolio:', defaultPortfolio.id)
            router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
            return
          }
          
          // If no default portfolio, use the first available portfolio
          if (portfolios.length > 0) {
            console.log('[DASHBOARD] No default portfolio found, using first portfolio:', portfolios[0].id)
            router.replace(`/dashboard?portfolio_id=${portfolios[0].id}`)
            return
          }
          
          // If no portfolios at all, try to create a default portfolio
          if (retryCount === 0) {
            console.log('[DASHBOARD] No portfolios found, attempting to create default portfolio')
            try {
              const createResponse = await fetch('/api/users/ensure-default-portfolio', {
                method: 'POST'
              })
              
              if (createResponse.ok) {
                console.log('[DASHBOARD] Default portfolio created, retrying portfolio fetch')
                setTimeout(() => redirectToDefaultPortfolio(retryCount + 1), 1000)
                return
              } else {
                console.error('[DASHBOARD] Failed to create default portfolio:', createResponse.statusText)
              }
            } catch (createError) {
              console.error('[DASHBOARD] Error creating default portfolio:', createError)
            }
          }
          
          // If portfolio creation failed or this is a retry, continue with exponential backoff
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount)
            console.log(`[DASHBOARD] No portfolios found, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`)
            setTimeout(() => redirectToDefaultPortfolio(retryCount + 1), delay)
            return
          }
          
          // Max retries reached, no portfolios found
          console.log('[DASHBOARD] Max retries reached, no portfolios found - user needs to create a portfolio')
          setHasNoPortfolios(true)
          setIsRedirecting(false)
          
        } catch (error) {
          console.error(`[DASHBOARD] Failed to fetch portfolios (attempt ${retryCount + 1}):`, error)
          
          // Retry with exponential backoff if under max retries
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount)
            console.log(`[DASHBOARD] Retrying in ${delay}ms due to error (attempt ${retryCount + 1}/${maxRetries + 1})`)
            setTimeout(() => redirectToDefaultPortfolio(retryCount + 1), delay)
            return
          }
          
          // Max retries reached due to errors
          console.log('[DASHBOARD] Max retries reached due to errors - user may need to create a portfolio')
          setHasNoPortfolios(true)
          setIsRedirecting(false)
        }
      }
      
      // Add timeout protection to prevent infinite redirecting state
      const timeoutId = setTimeout(() => {
        console.log('[DASHBOARD] Timeout reached - stopping redirect attempts')
        setIsRedirecting(false)
      }, 30000) // 30 second timeout
      
      redirectToDefaultPortfolio().finally(() => {
        clearTimeout(timeoutId)
      })
      
      return () => clearTimeout(timeoutId)
    } else if (portfolioId) {
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting])

  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    console.log(`[DASHBOARD] Portfolio change detected: ${currentPortfolioId} → ${portfolioId}`)
    
    // Cancel any in-flight request
    if (abortController) {
      abortController.abort()
    }
    
    // Clear properties immediately when portfolio changes to prevent stale data
    setProperties([])
    setError(null)
    setCurrentPortfolioId(portfolioId)
    
    // Create new abort controller for this request
    const newAbortController = new AbortController()
    setAbortController(newAbortController)
    
    // Fetch properties immediately after setting portfolio ID to avoid race condition
    fetchPropertiesWithPortfolioId(portfolioId, newAbortController.signal)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPropertiesWithPortfolioId = useCallback(async (portfolioId: string | null, signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      const url = new URL('/api/user-properties', window.location.origin)
      if (portfolioId) {
        url.searchParams.set('portfolio_id', portfolioId)
      }
      
      console.log(`[DASHBOARD] Fetching properties for portfolio: ${portfolioId || 'ALL'}`)
      
      const response = await fetch(url.toString(), { signal })
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      const data = await response.json()
      
      console.log(`[DASHBOARD] Received ${data.properties?.length || 0} properties for portfolio ${portfolioId || 'ALL'}`)
      
      setProperties(data.properties || [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`[DASHBOARD] Request cancelled for portfolio ${portfolioId}`)
        return // Don't set error for cancelled requests
      }
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePropertiesChange = (updatedProperties: Property[]) => {
    setProperties(updatedProperties)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const renderContent = () => {
    if (loading || isRedirecting) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRedirecting ? 'Setting up your portfolio...' : 'Loading your properties...'}
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Error: {error}</p>
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