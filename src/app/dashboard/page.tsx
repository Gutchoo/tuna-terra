'use client'

import { Button } from '@/components/ui/button'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PropertyView } from '@/components/properties/PropertyView'
import { EmptyPropertiesState } from '@/components/welcome/EmptyPropertiesState'
import { VirtualSamplePortfolioState } from '@/components/welcome/VirtualSamplePortfolioState'
import { AddPropertiesModal } from '@/components/modals/AddPropertiesModal'
import { CreatePortfolioModal } from '@/components/modals/CreatePortfolioModal'
import { PropertyFlowDebugPanel } from '@/components/debug/PropertyFlowDebugPanel'
import { PortfolioStatusDebugPanel } from '@/components/debug/PortfolioStatusDebugPanel'
import { toast } from 'sonner'
import { useDefaultPortfolio, useUpdateLastUsedPortfolio } from '@/hooks/use-portfolios'
import { useProperties } from '@/hooks/use-properties'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'
import { useQueryClient } from '@tanstack/react-query'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Get current portfolio ID directly from URL params to avoid state sync issues
  const currentPortfolioId = searchParams.get('portfolio_id')
  
  // Debug log immediately to see what we're getting
  console.log('[DASHBOARD] Component render - currentPortfolioId:', currentPortfolioId, 'searchParams:', searchParams.toString())
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showAddPropertiesModal, setShowAddPropertiesModal] = useState(false)
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false)
  
  // Use refs to prevent unnecessary effect re-runs and track state
  const lastPortfolioIdRef = useRef<string | null>(currentPortfolioId)
  const hasShownToastRef = useRef(false)
  const isMountedRef = useRef(true)
  
  // Debug event listeners for modal control
  useEffect(() => {
    const handleDebugOpenModal = () => {
      setShowAddPropertiesModal(true)
    }

    const handleDebugCloseModal = () => {
      setShowAddPropertiesModal(false)
      setShowCreatePortfolioModal(false)
    }

    // Only add listeners in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_TEST_DATA !== 'false') {
      window.addEventListener('debug-open-csv-modal', handleDebugOpenModal as EventListener)
      window.addEventListener('debug-close-modal', handleDebugCloseModal)
    }

    return () => {
      isMountedRef.current = false
      window.removeEventListener('debug-open-csv-modal', handleDebugOpenModal as EventListener)
      window.removeEventListener('debug-close-modal', handleDebugCloseModal)
    }
  }, [])

  // Use optimized hooks for data fetching
  const { data: defaultPortfolio, portfolios, isLoading: portfoliosLoading } = useDefaultPortfolio(true)
  const updateLastUsedPortfolio = useUpdateLastUsedPortfolio()
  const queryClient = useQueryClient()

  // Debug: Log what we're passing to useProperties
  console.log('[DASHBOARD] Calling useProperties with:', currentPortfolioId, 'enabled:', !!currentPortfolioId)
  
  // Fetch properties for all portfolios (virtual sample portfolio will return sample data)
  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useProperties(
    currentPortfolioId
  )

  // Simplified effect: Handle portfolio validation and creation success
  useEffect(() => {
    const portfolioId = currentPortfolioId // Already from searchParams
    const created = searchParams.get('created')
    
    // Track portfolio ID changes for logging
    if (portfolioId !== lastPortfolioIdRef.current && isMountedRef.current) {
      console.log(`[DASHBOARD] URL changed: portfolio_id=${portfolioId}`)
      lastPortfolioIdRef.current = portfolioId
    }

    // Handle portfolio creation success notification
    if (created === 'true' && portfolioId && portfolios && !hasShownToastRef.current) {
      const portfolio = portfolios.find(p => p.id === portfolioId)
      if (portfolio) {
        console.log('[DASHBOARD] Portfolio created successfully:', portfolio.name)
        hasShownToastRef.current = true

        // Clean up URL without triggering navigation
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('created')
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search)

        // Reset states for valid portfolio
        setIsRedirecting(false)
        return
      }
    }
    
    // Reset creation flag when not in creation mode
    if (created !== 'true') {
      hasShownToastRef.current = false
    }
    
    // Skip redirect logic if still loading or during creation flow
    if (portfoliosLoading || created === 'true') {
      return
    }
    
    // Handle missing portfolio ID
    if (!portfolioId) {
      // Since every user always has the virtual sample portfolio, portfolios.length is never 0
      // Skip the dead code path and proceed directly to default portfolio logic
      
      // Redirect to default portfolio if available
      if (defaultPortfolio?.id) {
        console.log('[DASHBOARD] Redirecting to default portfolio:', defaultPortfolio.id)
        setIsRedirecting(true)
        router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
        return
      }
    }
    
    // Validate portfolio ID exists
    if (portfolioId && portfolios && portfolios.length > 0) {
      const portfolioExists = portfolios.some(p => p.id === portfolioId)
      
      if (!portfolioExists) {
        console.log('[DASHBOARD] Portfolio ID does not exist:', portfolioId)
        // Redirect to default or welcome state
        if (defaultPortfolio?.id) {
          setIsRedirecting(true)
          router.replace(`/dashboard?portfolio_id=${defaultPortfolio.id}`)
        } else {
          // This should never happen since virtual sample portfolio always exists
          console.error('[DASHBOARD] No default portfolio found - this should not happen')
          router.replace('/dashboard')
        }
        return
      }
      
      // Valid portfolio - ensure clean state
      setIsRedirecting(false)
    }
  }, [currentPortfolioId, searchParams, portfoliosLoading, portfolios, defaultPortfolio, router])

  // Safety effect: Reset stuck isRedirecting state
  useEffect(() => {
    // If we have valid portfolio data but are still redirecting, reset the state
    if (isRedirecting && !portfoliosLoading && portfolios && currentPortfolioId) {
      const portfolioExists = portfolios.some(p => p.id === currentPortfolioId)
      if (portfolioExists) {
        console.log('[DASHBOARD] Safety reset: clearing stuck isRedirecting for valid portfolio')
        setIsRedirecting(false)
      }
    }
  }, [isRedirecting, portfoliosLoading, portfolios, currentPortfolioId])

  // Track portfolio usage when user visits with a specific portfolio_id
  useEffect(() => {
    // Only track usage if:
    // 1. We have a portfolio ID from URL
    // 2. Portfolios are loaded (not loading)
    // 3. The portfolio exists in user's portfolios
    // 4. It's not the virtual sample portfolio
    // 5. The portfolio is not already marked as default/last-used (prevent redundant calls)
    // 6. The mutation is not already in progress (prevent duplicate API calls)
    if (currentPortfolioId && !portfoliosLoading && portfolios && portfolios.length > 0 && !updateLastUsedPortfolio.isPending) {
      const currentPortfolioData = portfolios.find(p => p.id === currentPortfolioId)

      if (currentPortfolioData &&
          !isVirtualSamplePortfolio(currentPortfolioId) &&
          !currentPortfolioData.is_default) { // Only update if not already default
        // Set this portfolio as the user's last used portfolio
        updateLastUsedPortfolio.mutate(currentPortfolioId)
        console.log('[DASHBOARD] Setting new last-used portfolio:', currentPortfolioId)
      }
    }
  }, [currentPortfolioId, portfoliosLoading, portfolios, updateLastUsedPortfolio.isPending])

  const handlePropertiesChange = () => {
    console.log('[DASHBOARD] handlePropertiesChange called - invalidating properties cache')
    // Invalidate React Query cache to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ['properties'] })
  }

  const handleError = (errorMessage: string) => {
    // Error handling is now managed by React Query
    console.error('[DASHBOARD] Property error:', errorMessage)
  }

  const renderContent = () => {
    // Debug: Log current state for troubleshooting
    console.log('[DASHBOARD] renderContent called:', {
      currentPortfolioId,
      portfoliosLoading,
      propertiesLoading,
      isRedirecting,
      portfoliosCount: portfolios?.length,
      propertiesCount: properties?.length
    })

    // CRITICAL FIX: Force reset isRedirecting if we have valid data
    // This prevents infinite loading when navigating from portfolios page with valid portfolio_id
    if (isRedirecting && !portfoliosLoading && portfolios && portfolios.length > 0 && currentPortfolioId) {
      const portfolioExists = portfolios.some(p => p.id === currentPortfolioId)
      if (portfolioExists) {
        console.log('[DASHBOARD] Force resetting isRedirecting - we have valid data')
        // Use setTimeout to prevent React state update during render
        setTimeout(() => setIsRedirecting(false), 0)
        // Don't return loading state if we have valid data
      }
    }

    // Only show loading if we're actually loading data, not if we're stuck in redirecting state with valid data
    const shouldShowLoading = portfoliosLoading || propertiesLoading || 
      (isRedirecting && (!portfolios || !currentPortfolioId || !portfolios.some(p => p.id === currentPortfolioId)))

    if (shouldShowLoading) {
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


    if (!currentPortfolioId) {
      console.log('[DASHBOARD] No portfolio ID detected:', { currentPortfolioId, searchParamsValue: searchParams.get('portfolio_id') })
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Please select a portfolio to view your properties</p>
        </div>
      )
    }

    // Show virtual sample portfolio state for sample portfolio ONLY if it has no properties
    if (currentPortfolioId && isVirtualSamplePortfolio(currentPortfolioId) && properties.length === 0) {
      return (
        <VirtualSamplePortfolioState 
          onCreatePortfolio={() => setShowCreatePortfolioModal(true)}
        />
      )
    }

    // Show empty properties state if user has portfolio but no properties (excluding virtual sample portfolio)
    if (properties.length === 0 && currentPortfolioId && !isVirtualSamplePortfolio(currentPortfolioId)) {
      const currentPortfolio = portfolios?.find(p => p.id === currentPortfolioId)
      return (
        <EmptyPropertiesState
          portfolioId={currentPortfolioId}
          portfolioName={currentPortfolio?.name}
          onAddProperties={() => {
            setShowAddPropertiesModal(true)
          }}
        />
      )
    }

    const currentPortfolio = portfolios?.find(p => p.id === currentPortfolioId)

    return (
      <PropertyView
        properties={properties}
        onPropertiesChange={handlePropertiesChange}
        onError={handleError}
        portfolioId={currentPortfolioId}
        portfolioName={currentPortfolio?.name}
        onAddProperties={() => {
          setShowAddPropertiesModal(true)
        }}
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
      {/* Main Content Area */}
      {(properties.length === 0 && currentPortfolioId && !isVirtualSamplePortfolio(currentPortfolioId)) || (currentPortfolioId && isVirtualSamplePortfolio(currentPortfolioId) && properties.length === 0) ? (
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      ) : (
        <div className="flex-1">
          {renderContent()}
        </div>
      )}

      <AddPropertiesModal
        open={showAddPropertiesModal}
        onOpenChange={setShowAddPropertiesModal}
        portfolioId={currentPortfolioId}
        onCreatePortfolio={() => setShowCreatePortfolioModal(true)}
      />
      <CreatePortfolioModal
        open={showCreatePortfolioModal}
        onOpenChange={setShowCreatePortfolioModal}
      />

      {/* Floating Debug Panels */}
      <PortfolioStatusDebugPanel />
      <PropertyFlowDebugPanel />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}