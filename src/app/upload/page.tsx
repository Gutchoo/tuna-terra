'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { UploadHeader } from '@/components/upload/UploadHeader'
import { GlobalProLookupSettings } from '@/components/upload/GlobalProLookupSettings'
import { LazyUploadTabs } from '@/components/upload/lazy-upload-tabs'
import { useDefaultPortfolio } from '@/hooks/use-portfolios'
import { useUsageData } from '@/hooks/use-user-limits'

function UploadPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [proLookupEnabled, setProLookupEnabled] = useState(true)

  // Use optimized hooks for data fetching
  const { data: defaultPortfolio, portfolios, isLoading: portfoliosLoading } = useDefaultPortfolio(true)
  const { data: usageData } = useUsageData()

  // Get portfolio_id from URL params
  useEffect(() => {
    const portfolioIdFromUrl = searchParams.get('portfolio_id')
    setCurrentPortfolioId(portfolioIdFromUrl)
  }, [searchParams])

  // Handle default portfolio redirect when no portfolio_id is specified
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Only run redirect logic once when we first load without a portfolio
    if (!portfolioId && !isRedirecting && !currentPortfolioId && !portfoliosLoading) {
      setIsRedirecting(true)
      
      if (!portfolios || portfolios.length === 0) {
        // No portfolios - redirect to create one
        router.replace('/dashboard/portfolios/new')
        return
      }
      
      // Use default portfolio or first available
      if (defaultPortfolio) {
        router.replace(`/upload?portfolio_id=${defaultPortfolio.id}`)
      } else {
        setIsRedirecting(false)
      }
    } else if (portfolioId && isRedirecting) {
      // Clear redirecting state if we now have a portfolio ID
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting, currentPortfolioId, portfoliosLoading, portfolios, defaultPortfolio])

  const currentPortfolio = portfolios?.find(p => p.id === currentPortfolioId)

  if (isRedirecting) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your portfolio...</p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Dashboard-style header with portfolio selector and usage info */}
      <UploadHeader 
        onPortfolioChange={(portfolioId) => {
          setCurrentPortfolioId(portfolioId)
        }}
      />

      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="block sm:inline">Add Properties</span>{currentPortfolio ? (
                <>
                  <span className="hidden sm:inline"> to </span>
                  <span className="block sm:inline text-xl md:text-3xl text-primary truncate mt-1 sm:mt-0">
                    {currentPortfolio.name}
                  </span>
                </>
              ) : ''}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Import properties to your portfolio using CSV files, APNs, or addresses
            </p>
          </div>
        </div>

        {/* Compact Pro Lookup Settings without usage info */}
        <GlobalProLookupSettings 
          enabled={proLookupEnabled}
          onToggle={setProLookupEnabled}
          usage={usageData}
        />

        <LazyUploadTabs 
          currentPortfolioId={currentPortfolioId}
          proLookupEnabled={proLookupEnabled}
        />
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading upload page...</p>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  )
}