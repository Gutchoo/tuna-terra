import { useQuery } from '@tanstack/react-query'
import type { Property } from '@/lib/supabase'

interface PropertyMetrics {
  totalIncomeYTD: number
  totalExpensesYTD: number
  noiYTD: number
  documentCount: number
  unitCount: number
}

interface RecentTransaction {
  id: string
  transaction_date: string
  description: string
  category: string
  amount: number
  transaction_type: 'actual' | 'projected'
  type: 'income' | 'expense'
  vendor_name?: string
}

interface PropertyOverviewData {
  property: Property
  metrics: PropertyMetrics
  recentTransactions: RecentTransaction[]
}

export function usePropertyOverview(propertyId: string | null) {
  return useQuery({
    queryKey: ['property-overview', propertyId],
    queryFn: async (): Promise<PropertyOverviewData> => {
      if (!propertyId) {
        throw new Error('Property ID is required')
      }

      const response = await fetch(`/api/properties/${propertyId}/overview`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch property overview')
      }

      return response.json()
    },
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
