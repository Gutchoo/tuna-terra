'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'

interface SupabaseError {
  code?: string
  message?: string
}

export function usePortfolioRole(portfolioId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['portfolio-role', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null

      // First try to get role from user_accessible_portfolios view
      const { data: portfolioData, error } = await supabase
        .from('user_accessible_portfolios')
        .select('user_role')
        .eq('id', portfolioId)
        .single()

      if (error) {
        console.error('Error fetching portfolio role:', error)
        throw error
      }

      return portfolioData?.user_role as 'owner' | 'editor' | 'viewer' | null
    },
    enabled: !!portfolioId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry if it's a permissions error
      const supabaseError = error as SupabaseError
      if (supabaseError?.code === 'PGRST116' || supabaseError?.code === '42501') {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useCanEditPortfolio(portfolioId: string | null) {
  const { data: role, isLoading, error } = usePortfolioRole(portfolioId)

  return {
    canEdit: role === 'owner' || role === 'editor',
    role,
    isLoading,
    error
  }
}