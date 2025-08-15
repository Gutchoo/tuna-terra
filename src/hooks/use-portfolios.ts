'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { PortfolioWithMembership } from '@/lib/supabase'
import { VIRTUAL_SAMPLE_PORTFOLIO, isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

interface PortfoliosResponse {
  portfolios: PortfolioWithMembership[]
}

// Fetch portfolios with optional stats
async function fetchPortfolios(includeStats = true): Promise<PortfoliosResponse> {
  const url = includeStats 
    ? '/api/portfolios?include_stats=true' 
    : '/api/portfolios'
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch portfolios')
  }
  return response.json()
}

// Hook to get portfolios with intelligent caching (includes virtual sample portfolio)
export function usePortfolios(includeStats = true) {
  return useQuery({
    queryKey: queryKeys.portfolios(includeStats),
    queryFn: () => fetchPortfolios(includeStats),
    select: (data) => {
      // Sort user portfolios by created date (newest first), then by name
      const sortedUserPortfolios = [...data.portfolios].sort((a, b) => {
        // First sort by created date (newest first)
        const dateComparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (dateComparison !== 0) return dateComparison
        
        // If dates are equal, sort by name alphabetically
        return a.name.localeCompare(b.name)
      })
      
      // Always prepend the virtual sample portfolio to the sorted user portfolios
      return [VIRTUAL_SAMPLE_PORTFOLIO, ...sortedUserPortfolios]
    },
    // Cache for 5 minutes since portfolio data doesn't change frequently
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 15 minutes
    gcTime: 15 * 60 * 1000,
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
  })
}

// Hook to get default portfolio (cached and optimized)
export function useDefaultPortfolio(includeStats = true) {
  const { data: portfolios, ...queryResult } = usePortfolios(includeStats)
  
  // Filter out the virtual sample portfolio for default selection
  const userPortfolios = portfolios?.filter(p => !p.is_sample) || []
  
  // Prefer user's default portfolio, then any user portfolio, then fall back to sample
  const defaultPortfolio = userPortfolios.find(p => p.is_default) || userPortfolios[0] || portfolios?.[0] || null
  
  return {
    ...queryResult,
    data: defaultPortfolio,
    portfolios, // Expose all portfolios for fallback logic
  }
}

// Create portfolio mutation
export function useCreatePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        // Try to get detailed error information from the server
        let errorMessage = 'Failed to create portfolio'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
          if (errorData.details) {
            // For validation errors, show the details
            errorMessage += ': ' + JSON.stringify(errorData.details)
          }
        } catch {
          // If we can't parse the error response, use status text
          errorMessage = `Failed to create portfolio (${response.status}: ${response.statusText})`
        }
        throw new Error(errorMessage)
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all portfolio-related queries to ensure fresh data
      // Use micro-task scheduling to prevent immediate re-render conflicts
      queueMicrotask(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.portfolios() })
        queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(true) })
        queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(false) })
      })
    },
  })
}

// Delete portfolio mutation
export function useDeletePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (portfolioId: string) => {
      // Prevent deletion of virtual sample portfolio
      if (isVirtualSamplePortfolio(portfolioId)) {
        throw new Error('Sample portfolios cannot be deleted')
      }
      
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete portfolio')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all portfolio-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios() })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(false) })
      
      // Also invalidate any property queries since they depend on portfolios
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

// Update portfolio name mutation
export function useUpdatePortfolioName() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // Prevent updating virtual sample portfolio
      if (isVirtualSamplePortfolio(id)) {
        throw new Error('Sample portfolios cannot be edited')
      }
      
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        throw new Error('Failed to update portfolio name')
      }
      return response.json()
    },
    onSuccess: (_, { id, name }) => {
      // Update cache optimistically
      queryClient.setQueryData(
        queryKeys.portfolios(true),
        (old: PortfoliosResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            portfolios: old.portfolios.map(p => 
              p.id === id ? { ...p, name } : p
            )
          }
        }
      )
      
      // Also update the version without stats if it exists
      queryClient.setQueryData(
        queryKeys.portfolios(false),
        (old: PortfoliosResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            portfolios: old.portfolios.map(p => 
              p.id === id ? { ...p, name } : p
            )
          }
        }
      )
    },
  })
}