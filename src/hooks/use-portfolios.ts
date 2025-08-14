'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { PortfolioWithMembership } from '@/lib/supabase'

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

// Hook to get portfolios with intelligent caching
export function usePortfolios(includeStats = true) {
  return useQuery({
    queryKey: queryKeys.portfolios(includeStats),
    queryFn: () => fetchPortfolios(includeStats),
    select: (data) => data.portfolios,
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
  
  const defaultPortfolio = portfolios?.find(p => p.is_default) || portfolios?.[0] || null
  
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
        throw new Error('Failed to create portfolio')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all portfolio-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios() })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(false) })
    },
  })
}

// Delete portfolio mutation
export function useDeletePortfolio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (portfolioId: string) => {
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