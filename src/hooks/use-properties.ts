'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { Property } from '@/lib/supabase'

interface PropertiesResponse {
  properties: Property[]
}

// Fetch properties for a specific portfolio
async function fetchProperties(portfolioId?: string | null): Promise<PropertiesResponse> {
  const url = new URL('/api/user-properties', window.location.origin)
  if (portfolioId) {
    url.searchParams.set('portfolio_id', portfolioId)
  }
  
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

// Hook to get properties with caching
export function useProperties(portfolioId?: string | null) {
  console.log('[USE_PROPERTIES] Hook called with portfolioId:', portfolioId, 'enabled:', !!portfolioId)
  
  return useQuery({
    queryKey: queryKeys.properties(portfolioId),
    queryFn: () => {
      console.log('[USE_PROPERTIES] Fetching properties for portfolio:', portfolioId)
      return fetchProperties(portfolioId)
    },
    select: (data) => {
      console.log('[USE_PROPERTIES] Properties data received:', data?.properties?.length, 'properties')
      return data.properties
    },
    // Cache for 3 minutes since property data can change
    staleTime: 3 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Only fetch if we have a portfolio ID (avoid unnecessary calls)
    enabled: !!portfolioId,
    // Refetch on window focus to ensure fresh data after navigation
    refetchOnWindowFocus: true,
    // Ensure we get fresh data after mutations
    refetchOnMount: 'always',
  })
}

// Prefetch properties for a portfolio (for preloading)
export function usePrefetchProperties() {
  const queryClient = useQueryClient()
  
  return (portfolioId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.properties(portfolioId),
      queryFn: () => fetchProperties(portfolioId),
      staleTime: 3 * 60 * 1000,
    })
  }
}

// Delete properties mutation
export function useDeleteProperties() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const response = await fetch('/api/user-properties/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete properties')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all properties cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

// Refresh property data mutation
export function useRefreshProperties() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const response = await fetch('/api/user-properties/bulk-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds }),
      })
      if (!response.ok) {
        throw new Error('Failed to refresh properties')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all properties cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}