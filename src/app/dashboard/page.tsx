'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Property, PortfolioWithMembership } from '@/lib/supabase'
import { PropertyView } from '@/components/properties/PropertyView'
import { PortfolioSelector } from '@/components/portfolios/PortfolioSelector'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
          
          // If no portfolios at all, continue without redirect
          console.log('[DASHBOARD] No portfolios found, staying on current page')
          setIsRedirecting(false)
          
        } catch (error) {
          console.error('[DASHBOARD] Failed to redirect to default portfolio:', error)
          setIsRedirecting(false)
        }
      }
      
      redirectToDefaultPortfolio()
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

    return (
      <PropertyView
        properties={properties}
        onPropertiesChange={handlePropertiesChange}
        onError={handleError}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your real estate portfolio ({properties.length} {properties.length === 1 ? 'property' : 'properties'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/portfolios" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Manage Portfolios
            </Link>
          </Button>
          <Button asChild>
            <Link href="/upload" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Properties
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <PortfolioSelector 
        onPortfolioChange={(portfolioId) => {
          // Only update local state - let useEffect handle fetching based on URL changes
          // This prevents race conditions between URL updates and direct API calls
          setCurrentPortfolioId(portfolioId)
        }}
        compact={true}
      />

      <Card>
        <CardHeader>
          <CardTitle>Property Portfolio</CardTitle>
          <CardDescription>
            View and manage all your properties in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

    </div>
  )
}