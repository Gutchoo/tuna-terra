import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PropertyUnit } from '@/lib/supabase'
import { toast } from 'sonner'

interface PropertyUnitFilters {
  is_active?: boolean
  is_occupied?: boolean
}

interface PropertyUnitResponse {
  data: PropertyUnit[]
  total_count: number
}

// Fetch units for a property
export function usePropertyUnits(
  propertyId: string | null,
  filters?: PropertyUnitFilters
) {
  return useQuery({
    queryKey: ['property-units', propertyId, filters],
    queryFn: async (): Promise<PropertyUnitResponse> => {
      if (!propertyId) {
        throw new Error('Property ID is required')
      }

      const params = new URLSearchParams()
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active))
      if (filters?.is_occupied !== undefined) params.append('is_occupied', String(filters.is_occupied))

      const queryString = params.toString()
      const url = `/api/properties/${propertyId}/units${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch property units')
      }

      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes - units don't change often
  })
}

// Create property unit
export function useCreatePropertyUnit(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (unitData: Partial<PropertyUnit>) => {
      const response = await fetch(`/api/properties/${propertyId}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create property unit')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate units list
      queryClient.invalidateQueries({ queryKey: ['property-units', propertyId] })
      // Invalidate property overview (shows unit count)
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      // Invalidate transactions (they need to re-fetch unit selector options)
      queryClient.invalidateQueries({ queryKey: ['income-transactions', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['expense-transactions', propertyId] })
      toast.success('Unit created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create unit')
    },
  })
}

// Update property unit
export function useUpdatePropertyUnit(propertyId: string, unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (unitData: Partial<PropertyUnit>) => {
      const response = await fetch(`/api/properties/${propertyId}/units/${unitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update property unit')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate units list
      queryClient.invalidateQueries({ queryKey: ['property-units', propertyId] })
      // Invalidate property overview
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Unit updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update unit')
    },
  })
}

// Delete property unit (soft delete)
export function useDeletePropertyUnit(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (unitId: string) => {
      const response = await fetch(`/api/properties/${propertyId}/units/${unitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete property unit')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate units list
      queryClient.invalidateQueries({ queryKey: ['property-units', propertyId] })
      // Invalidate property overview
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Unit deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete unit')
    },
  })
}
