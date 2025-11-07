import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { IncomeTransaction } from '@/lib/supabase'
import { toast } from 'sonner'

interface IncomeTransactionFilters {
  unit_id?: string | null
  start_date?: string
  end_date?: string
  category?: string
  transaction_type?: 'actual' | 'projected'
  is_recurring?: boolean
  limit?: number
  offset?: number
}

interface IncomeTransactionResponse {
  data: IncomeTransaction[]
  total_count: number
}

// Fetch income transactions for a property
export function useIncomeTransactions(
  propertyId: string | null,
  filters?: IncomeTransactionFilters
) {
  return useQuery({
    queryKey: ['income-transactions', propertyId, filters],
    queryFn: async (): Promise<IncomeTransactionResponse> => {
      if (!propertyId) {
        throw new Error('Property ID is required')
      }

      const params = new URLSearchParams()
      if (filters?.unit_id) params.append('unit_id', filters.unit_id)
      if (filters?.start_date) params.append('start_date', filters.start_date)
      if (filters?.end_date) params.append('end_date', filters.end_date)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type)
      if (filters?.is_recurring !== undefined) params.append('is_recurring', String(filters.is_recurring))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.offset) params.append('offset', String(filters.offset))

      const queryString = params.toString()
      const url = `/api/properties/${propertyId}/income${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch income transactions')
      }

      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Create income transaction
export function useCreateIncomeTransaction(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: Partial<IncomeTransaction>) => {
      const response = await fetch(`/api/properties/${propertyId}/income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create income transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate income transactions list
      queryClient.invalidateQueries({ queryKey: ['income-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Income transaction created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create income transaction')
    },
  })
}

// Update income transaction
export function useUpdateIncomeTransaction(propertyId: string, transactionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: Partial<IncomeTransaction>) => {
      const response = await fetch(`/api/properties/${propertyId}/income/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update income transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate income transactions list
      queryClient.invalidateQueries({ queryKey: ['income-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Income transaction updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update income transaction')
    },
  })
}

// Delete income transaction
export function useDeleteIncomeTransaction(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionId,
      deleteRecurring = false,
    }: {
      transactionId: string
      deleteRecurring?: boolean
    }) => {
      const url = deleteRecurring
        ? `/api/properties/${propertyId}/income/${transactionId}?delete_recurring=true`
        : `/api/properties/${propertyId}/income/${transactionId}`

      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete income transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate income transactions list
      queryClient.invalidateQueries({ queryKey: ['income-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Income transaction deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete income transaction')
    },
  })
}
