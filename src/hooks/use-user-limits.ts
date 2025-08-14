'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { UserLimits } from '@/lib/supabase'

interface UserLimitsResponse {
  limits: UserLimits
}

interface UsageData {
  used: number
  limit: number
  tier: 'free' | 'pro'
  resetDate?: string
}

// Fetch user limits
async function fetchUserLimits(): Promise<UserLimitsResponse> {
  const response = await fetch('/api/user/limits')
  if (!response.ok) {
    throw new Error('Failed to fetch user limits')
  }
  return response.json()
}

// Hook to get user limits with caching
export function useUserLimits() {
  return useQuery({
    queryKey: queryKeys.userLimits(),
    queryFn: fetchUserLimits,
    select: (data) => data.limits,
    // Cache for 2 minutes since usage data should be relatively fresh
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refetch on window focus to keep usage data current
    refetchOnWindowFocus: true,
  })
}

// Hook to get formatted usage data for components
export function useUsageData(): { 
  data: UsageData | null
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const { data: limits, isLoading, isError, error } = useUserLimits()
  
  const usageData: UsageData | null = limits ? {
    used: limits.property_lookups_used,
    limit: limits.property_lookups_limit,
    tier: limits.tier,
    resetDate: limits.reset_date
  } : null
  
  return { data: usageData, isLoading, isError, error }
}

// Increment usage mutation
export function useIncrementUsage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (increment: number = 1) => {
      const response = await fetch('/api/user/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment }),
      })
      if (!response.ok) {
        throw new Error('Failed to update usage')
      }
      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.userLimits(), data)
    },
  })
}

// Check if user can make a lookup
export function useCheckUsage() {
  return useMutation({
    mutationFn: async (count: number = 1) => {
      const response = await fetch('/api/user/limits/check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      if (!response.ok) {
        throw new Error('Failed to check usage limits')
      }
      return response.json()
    },
  })
}

// Get remaining lookups with caching
export function useRemainingLookups() {
  const { data: limits } = useUserLimits()
  
  if (!limits) return 0
  
  const remaining = Math.max(0, limits.property_lookups_limit - limits.property_lookups_used)
  return limits.tier === 'pro' ? 999999 : remaining
}