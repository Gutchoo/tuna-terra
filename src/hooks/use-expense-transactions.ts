import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ExpenseTransaction } from '@/lib/supabase'
import { toast } from 'sonner'

interface ExpenseTransactionFilters {
  unit_id?: string | null
  start_date?: string
  end_date?: string
  category?: string
  transaction_type?: 'actual' | 'projected'
  is_recurring?: boolean
  limit?: number
  offset?: number
}

interface ExpenseTransactionResponse {
  data: ExpenseTransaction[]
  total_count: number
}

// Fetch expense transactions for a property
export function useExpenseTransactions(
  propertyId: string | null,
  filters?: ExpenseTransactionFilters
) {
  return useQuery({
    queryKey: ['expense-transactions', propertyId, filters],
    queryFn: async (): Promise<ExpenseTransactionResponse> => {
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
      const url = `/api/properties/${propertyId}/expenses${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch expense transactions')
      }

      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Create expense transaction
export function useCreateExpenseTransaction(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: Partial<ExpenseTransaction>) => {
      const response = await fetch(`/api/properties/${propertyId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create expense transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate expense transactions list
      queryClient.invalidateQueries({ queryKey: ['expense-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Expense transaction created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create expense transaction')
    },
  })
}

// Update expense transaction
export function useUpdateExpenseTransaction(propertyId: string, transactionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: Partial<ExpenseTransaction>) => {
      const response = await fetch(`/api/properties/${propertyId}/expenses/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update expense transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate expense transactions list
      queryClient.invalidateQueries({ queryKey: ['expense-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Expense transaction updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense transaction')
    },
  })
}

// Delete expense transaction
export function useDeleteExpenseTransaction(propertyId: string) {
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
        ? `/api/properties/${propertyId}/expenses/${transactionId}?delete_recurring=true`
        : `/api/properties/${propertyId}/expenses/${transactionId}`

      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete expense transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate expense transactions list
      queryClient.invalidateQueries({ queryKey: ['expense-transactions', propertyId] })
      // Invalidate property overview to update metrics
      queryClient.invalidateQueries({ queryKey: ['property-overview', propertyId] })
      toast.success('Expense transaction deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense transaction')
    },
  })
}
