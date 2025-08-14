'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { perf } from '@/lib/performance'
import { useCallback } from 'react'

// Enhanced navigation hook with performance monitoring
export function useOptimizedNavigation() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Track navigation performance
  const navigateWithPerformanceTracking = useCallback((
    url: string, 
    options?: { 
      preload?: string[]
      replace?: boolean 
    }
  ) => {
    const pageName = url.split('?')[0].replace('/', '')
    
    // Start performance tracking
    perf.navigationStart(pageName)
    
    // Preload data if specified
    if (options?.preload) {
      options.preload.forEach(async (queryKey) => {
        if (queryKey === 'portfolios') {
          await queryClient.prefetchQuery({
            queryKey: queryKeys.portfolios(true),
            queryFn: async () => {
              perf.apiCallStart('/api/portfolios')
              const response = await fetch('/api/portfolios?include_stats=true')
              perf.apiCallEnd('/api/portfolios')
              if (!response.ok) throw new Error('Failed to fetch portfolios')
              return response.json()
            },
            staleTime: 5 * 60 * 1000,
          })
        }
        
        if (queryKey === 'userLimits') {
          await queryClient.prefetchQuery({
            queryKey: queryKeys.userLimits(),
            queryFn: async () => {
              perf.apiCallStart('/api/user/limits')
              const response = await fetch('/api/user/limits')
              perf.apiCallEnd('/api/user/limits')
              if (!response.ok) throw new Error('Failed to fetch user limits')
              return response.json()
            },
            staleTime: 2 * 60 * 1000,
          })
        }
      })
    }
    
    // Navigate
    if (options?.replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
    
    // End performance tracking after a short delay to account for initial render
    setTimeout(() => {
      perf.navigationEnd(pageName)
    }, 100)
  }, [router, queryClient])

  // Optimized navigation functions
  const navigateToUpload = useCallback((portfolioId?: string) => {
    const url = portfolioId ? `/upload?portfolio_id=${portfolioId}` : '/upload'
    navigateWithPerformanceTracking(url, {
      preload: ['portfolios', 'userLimits']
    })
  }, [navigateWithPerformanceTracking])

  const navigateToDashboard = useCallback((portfolioId?: string) => {
    const url = portfolioId ? `/dashboard?portfolio_id=${portfolioId}` : '/dashboard'
    navigateWithPerformanceTracking(url, {
      preload: ['portfolios']
    })
  }, [navigateWithPerformanceTracking])

  const navigateToMap = useCallback((portfolioId?: string) => {
    const url = portfolioId ? `/dashboard/map?portfolio_id=${portfolioId}` : '/dashboard/map'
    navigateWithPerformanceTracking(url, {
      preload: ['portfolios']
    })
  }, [navigateWithPerformanceTracking])

  // Preload functions for hover/focus events
  const preloadUpload = useCallback(() => {
    perf.dataLoadStart('preload-upload')
    
    Promise.all([
      // Preload portfolios
      queryClient.prefetchQuery({
        queryKey: queryKeys.portfolios(true),
        queryFn: async () => {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) throw new Error('Failed to fetch portfolios')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      }),
      // Preload user limits
      queryClient.prefetchQuery({
        queryKey: queryKeys.userLimits(),
        queryFn: async () => {
          const response = await fetch('/api/user/limits')
          if (!response.ok) throw new Error('Failed to fetch user limits')
          return response.json()
        },
        staleTime: 2 * 60 * 1000,
      })
    ]).finally(() => {
      perf.dataLoadEnd('preload-upload')
    })
  }, [queryClient])

  const preloadDashboard = useCallback((portfolioId?: string) => {
    perf.dataLoadStart('preload-dashboard')
    
    const promises = [
      // Preload portfolios
      queryClient.prefetchQuery({
        queryKey: queryKeys.portfolios(true),
        queryFn: async () => {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) throw new Error('Failed to fetch portfolios')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    ]

    // Preload properties if portfolio ID is provided
    if (portfolioId) {
      promises.push(
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
      )
    }

    Promise.all(promises).finally(() => {
      perf.dataLoadEnd('preload-dashboard')
    })
  }, [queryClient])

  return {
    // Enhanced navigation functions
    navigateToUpload,
    navigateToDashboard,
    navigateToMap,
    
    // Preload functions
    preloadUpload,
    preloadDashboard,
    
    // Raw navigation with tracking
    navigateWithPerformanceTracking,
  }
}