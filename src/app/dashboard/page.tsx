'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PropertyView } from '@/components/properties/PropertyView'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { WelcomeEmptyState } from '@/components/welcome/WelcomeEmptyState'
import { EmptyPropertiesState } from '@/components/welcome/EmptyPropertiesState'
import { useSuccessToast } from '@/components/ui/success-toast'
import { useDefaultPortfolio } from '@/hooks/use-portfolios'
import { useProperties } from '@/hooks/use-properties'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(() => 
    searchParams.get('portfolio_id')
  )
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasNoPortfolios, setHasNoPortfolios] = useState(false)
  const { showToast, ToastContainer } = useSuccessToast()
  
  // Use refs to prevent unnecessary effect re-runs
  const lastPortfolioIdRef = useRef<string | null>(searchParams.get('portfolio_id'))
  const hasShownToastRef = useRef(false)
  const isMountedRef = useRef(true)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Use optimized hooks for data fetching
  const { data: defaultPortfolio, portfolios, isLoading: portfoliosLoading } = useDefaultPortfolio(true)
  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useProperties(currentPortfolioId)

  // Effect 1: Handle URL parameter changes and update current portfolio ID
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Only update if different to prevent unnecessary re-renders
    if (portfolioId !== lastPortfolioIdRef.current && isMountedRef.current) {
      console.log(`[DASHBOARD] URL changed: portfolio_id=${portfolioId}`)
      lastPortfolioIdRef.current = portfolioId
      setCurrentPortfolioId(portfolioId)
    }
  }, [searchParams])

  // Effect 2: Handle portfolio creation success notification
  useEffect(() => {
    const created = searchParams.get('created')
    const portfolioId = searchParams.get('portfolio_id')
    
    if (created === 'true' && portfolioId && portfolios && !hasShownToastRef.current) {
      const portfolio = portfolios.find(p => p.id === portfolioId)
      if (portfolio) {
        console.log('[DASHBOARD] Portfolio created successfully:', portfolio.name)
        hasShownToastRef.current = true
        showToast({
          message: 'Portfolio created successfully!',
          description: `"${portfolio.name}" is ready for your properties`,
          duration: 5000
        })
        // Clean up URL without triggering navigation
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('created')
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
      }
    }
    
    // Reset toast flag when not in creation mode
    if (created !== 'true') {
      hasShownToastRef.current = false
    }
  }, [searchParams, portfolios, showToast])

  // Effect 3: Handle redirect logic when no portfolio is specified or invalid portfolio ID
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Don't run redirect logic if still loading or already redirecting
    if (portfoliosLoading || isRedirecting) {
      return
    }
    
    // Handle missing portfolio ID
    if (!portfolioId) {
      if (!portfolios || portfolios.length === 0) {
        console.log('[DASHBOARD] No portfolios found - showing welcome state')
        if (!hasNoPortfolios) {
          setHasNoPortfolios(true)
        }
        return
      }
      
      // Redirect to default portfolio if available and not already attempted
      if (defaultPortfolio && defaultPortfolio.id && !isRedirecting) {
        console.log('[DASHBOARD] Redirecting to default portfolio:', defaultPortfolio.id)
        setIsRedirecting(true)
        router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
        return
      }
    } else {
      // We have a portfolio ID - validate it exists
      if (portfolios && portfolios.length > 0) {
        const portfolioExists = portfolios.some(p => p.id === portfolioId)
        
        if (!portfolioExists) {
          console.log('[DASHBOARD] Portfolio ID does not exist:', portfolioId, 'redirecting to default')
          
          // Invalid portfolio ID - redirect to default or welcome state
          if (defaultPortfolio && defaultPortfolio.id && !isRedirecting) {
            setIsRedirecting(true)
            router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
            return
          } else if (!isRedirecting) {
            // No default portfolio available - show welcome state
            setHasNoPortfolios(true)
            setIsRedirecting(true)
            router.replace('/dashboard')
            return
          }
        }
      }
      
      // Valid portfolio ID, ensure welcome state is reset if needed
      if (hasNoPortfolios) {
        setHasNoPortfolios(false)
      }
    }
  }, [searchParams, portfoliosLoading, portfolios, defaultPortfolio, router, hasNoPortfolios, isRedirecting])

  // Effect 4: Reset redirecting state after successful navigation
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Only reset if we have a portfolio ID and we're currently redirecting
    if (isRedirecting && portfolioId) {
      setIsRedirecting(false)
    }
  }, [searchParams, isRedirecting])

  const handlePropertiesChange = () => {
    // Properties are now managed by React Query
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
        <WelcomeEmptyState 
          onCreatePortfolio={() => router.push('/dashboard/portfolios/new')}
        />
      )
    }

    if (!currentPortfolioId) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Please select a portfolio to view your properties</p>
        </div>
      )
    }

    // Show empty properties state if user has portfolio but no properties
    if (properties.length === 0 && currentPortfolioId) {
      return (
        <EmptyPropertiesState 
          portfolioId={currentPortfolioId}
        />
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
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      
      {/* Only show header when user has portfolios */}
      {!hasNoPortfolios && (
        <DashboardHeader 
          onPortfolioChange={(portfolioId) => {
            // Only update local state - let useEffect handle fetching based on URL changes
            // This prevents race conditions between URL updates and direct API calls
            setCurrentPortfolioId(portfolioId)
          }}
        />
      )}

      {/* Conditional layout - empty states get full height, content gets card wrapper */}
      {hasNoPortfolios || (properties.length === 0 && currentPortfolioId) ? (
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      ) : (
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        {/* Header Skeleton - always show during loading since we don't know portfolio state yet */}
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
        <div className="flex-1 flex flex-col justify-center">
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