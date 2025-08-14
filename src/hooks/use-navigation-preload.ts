'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '@/lib/query-client'
import { useCallback } from 'react'

// Hook for intelligent navigation with preloading
export function useNavigationPreload() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Preload data for upload page
  const preloadUploadPageData = useCallback(async () => {
    // Preload portfolios if not already cached
    if (!queryClient.getQueryData(queryKeys.portfolios(true))) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.portfolios(true),
        queryFn: async () => {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) throw new Error('Failed to fetch portfolios')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
    
    // Preload user limits if not already cached
    if (!queryClient.getQueryData(queryKeys.userLimits())) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.userLimits(),
        queryFn: async () => {
          const response = await fetch('/api/user/limits')
          if (!response.ok) throw new Error('Failed to fetch user limits')
          return response.json()
        },
        staleTime: 2 * 60 * 1000,
      })
    }
  }, [queryClient])
  
  // Preload data for dashboard page
  const preloadDashboardPageData = useCallback(async (portfolioId?: string) => {
    // Preload portfolios
    if (!queryClient.getQueryData(queryKeys.portfolios(true))) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.portfolios(true),
        queryFn: async () => {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) throw new Error('Failed to fetch portfolios')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
    
    // Preload properties for specific portfolio
    if (portfolioId && !queryClient.getQueryData(queryKeys.properties(portfolioId))) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.properties(portfolioId),
        queryFn: async () => {
          const url = new URL('/api/user-properties', window.location.origin)
          url.searchParams.set('portfolio_id', portfolioId)
          const response = await fetch(url.toString())
          if (!response.ok) throw new Error('Failed to fetch properties')
          return response.json()
        },
        staleTime: 3 * 60 * 1000,
      })
    }
  }, [queryClient])
  
  // Navigate to upload page with preloading
  const navigateToUpload = useCallback(async (portfolioId?: string) => {
    // Start preloading immediately
    preloadUploadPageData()
    
    // Navigate with portfolio ID if provided
    const url = portfolioId ? `/upload?portfolio_id=${portfolioId}` : '/upload'
    router.push(url)
  }, [router, preloadUploadPageData])
  
  // Navigate to dashboard with preloading
  const navigateToDashboard = useCallback(async (portfolioId?: string) => {
    // Start preloading immediately
    preloadDashboardPageData(portfolioId)
    
    // Navigate with portfolio ID if provided
    const url = portfolioId ? `/dashboard?portfolio_id=${portfolioId}` : '/dashboard'
    router.push(url)
  }, [router, preloadDashboardPageData])
  
  // Preload on hover/focus for add properties button
  const handlePreloadUpload = useCallback(() => {
    preloadUploadPageData()
  }, [preloadUploadPageData])
  
  return {
    navigateToUpload,
    navigateToDashboard,
    preloadUploadPageData,
    preloadDashboardPageData,
    handlePreloadUpload,
  }
}