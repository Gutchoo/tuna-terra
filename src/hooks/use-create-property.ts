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
    mutationFn: async (data: CreatePropertyData): Promise<CreatePropertyResponse> => {
      const response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create property')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
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
      const response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
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