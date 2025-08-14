'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PortfolioSelector } from '@/components/portfolios/PortfolioSelector'
import { GlobalProLookupSettings } from '@/components/upload/GlobalProLookupSettings'
import { LazyUploadTabs } from '@/components/upload/lazy-upload-tabs'
import { useDefaultPortfolio } from '@/hooks/use-portfolios'
import { useUsageData } from '@/hooks/use-user-limits'
import type { PortfolioWithMembership } from '@/lib/supabase'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Properties{currentPortfolio ? ` to ${currentPortfolio.name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Import properties to your portfolio using CSV files, APNs, or addresses
          </p>
        </div>
      </div>

      {/* Portfolio Selector */}
      <PortfolioSelector 
        onPortfolioChange={(portfolioId) => {
          setCurrentPortfolioId(portfolioId)
        }}
        compact={true}
        enableInlineEdit={true}
      />

      {/* Global Pro Lookup Settings with integrated usage display */}
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