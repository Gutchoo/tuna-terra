'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'

interface CreatePropertyData {
  portfolio_id?: string
  apn?: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  regrid_id?: string
  user_notes?: string
  insurance_provider?: string
  use_pro_lookup?: boolean
  selectedPropertyData?: unknown
}

interface CreatePropertyResponse {
  property: {
    id: string
    portfolio_id: string
    address: string
    [key: string]: unknown
  }
}

// Single property creation
export function useCreateProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreatePropertyData): Promise<CreatePropertyResponse | { multipleResults: boolean; properties: unknown[] }> => {
      let response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // If 429 error (limit exceeded) and we were using pro lookup, retry with basic mode
      if (response.status === 429 && data.use_pro_lookup) {
        console.log('Pro lookup limit exceeded, retrying with basic mode...')
        response = await fetch('/api/user-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, use_pro_lookup: false }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create property')
      }

      const result = await response.json()

      // Check if we got multiple results for disambiguation
      if (result.multipleResults) {
        return result
      }

      return result
    },
    onSuccess: (data, variables) => {
      // Skip cache invalidation if this is a disambiguation response
      if ('multipleResults' in data && data.multipleResults) {
        return
      }

      // Invalidate properties cache for the specific portfolio
      if (variables.portfolio_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.properties(variables.portfolio_id)
        })
      }

      // Also invalidate general properties cache
      queryClient.invalidateQueries({
        queryKey: ['properties']
      })

      // Invalidate user limits to update the counter
      queryClient.invalidateQueries({
        queryKey: queryKeys.userLimits()
      })

      // Invalidate portfolio stats to update property counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolios()
      })
    },
  })
}

// Bulk property creation  
interface BulkCreatePropertyData {
  properties: CreatePropertyData[]
  source?: 'csv' | 'manual' | 'api'
  use_pro_lookup?: boolean
}

interface BulkCreateResponse {
  created: Array<{
    id: string
    portfolio_id: string
    address: string
    [key: string]: unknown
  }>
  errors: Array<{
    index: number
    input: CreatePropertyData
    error: string
  }>
  summary: {
    total: number
    successful: number
    failed: number
    source?: string
  }
  usage?: {
    used: number
    limit: number
    remaining: number
  }
}

export function useBulkCreateProperties() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BulkCreatePropertyData): Promise<BulkCreateResponse> => {
      let response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      // If 429 error (limit exceeded) and we were using pro lookup, retry with basic mode
      if (response.status === 429 && data.use_pro_lookup) {
        console.log('Pro lookup limit exceeded for bulk upload, retrying with basic mode...')
        response = await fetch('/api/user-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, use_pro_lookup: false }),
        })
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create properties')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Get all unique portfolio IDs from the created properties
      const portfolioIds = new Set<string>()
      
      // Add portfolio IDs from created properties
      data.created.forEach((property) => {
        if (property.portfolio_id) {
          portfolioIds.add(property.portfolio_id)
        }
      })
      
      // Also add portfolio IDs from the input data
      variables.properties.forEach((property) => {
        if (property.portfolio_id) {
          portfolioIds.add(property.portfolio_id)
        }
      })
      
      // Invalidate cache for each affected portfolio
      portfolioIds.forEach((portfolioId) => {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.properties(portfolioId) 
        })
      })
      
      // Invalidate general properties cache
      queryClient.invalidateQueries({ 
        queryKey: ['properties'] 
      })
      
      // Invalidate user limits to update the counter
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userLimits() 
      })
      
      // Invalidate portfolio stats to update property counts
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.portfolios() 
      })
    },
  })
}