import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Property, FieldOverrides } from '@/lib/supabase'
import { toast } from 'sonner'

interface PropertyDetailsUpdate {
  // User-entered acquisition/disposition fields
  purchase_date?: string | null
  purchase_price?: number | null
  sold_date?: string | null
  sold_price?: number | null

  // Regrid field overrides
  fieldOverrides?: Record<string, {
    value: unknown
    original: unknown
    overridden_at: string
    overridden_by: string
  } | null>
}

/**
 * Hook for updating property details with debounced auto-save
 * Handles both user-entered fields and Regrid field overrides
 */
export function useUpdatePropertyDetails(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: PropertyDetailsUpdate) => {
      const response = await fetch(`/api/properties/${propertyId}/details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update property details')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate property queries to reflect updates
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })

      // Update cache optimistically
      queryClient.setQueryData(['property', propertyId], data.property)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update property details')
    },
  })
}

/**
 * Hook for reverting a field override back to original Regrid value
 */
export function useRevertFieldOverride(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fieldName, originalValue }: { fieldName: string; originalValue: unknown }) => {
      const response = await fetch(`/api/properties/${propertyId}/details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldOverrides: {
            [fieldName]: null, // null removes the override
          },
          [fieldName]: originalValue, // restore original value
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revert field')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate property queries
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })

      toast.success('Reverted to original Regrid value')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revert field')
    },
  })
}
