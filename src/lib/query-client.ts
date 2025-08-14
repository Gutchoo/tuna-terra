import { QueryClient } from '@tanstack/react-query'

// Create a single query client instance to be shared across the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus for most queries (we'll enable selectively)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
})

// Query keys for consistent caching
export const queryKeys = {
  // Portfolio-related queries
  portfolios: (includeStats?: boolean) => 
    includeStats ? ['portfolios', 'with-stats'] : ['portfolios'],
  portfolio: (id: string) => ['portfolios', id],
  
  // User-related queries
  userLimits: () => ['user', 'limits'],
  userProfile: () => ['user', 'profile'],
  
  // Property-related queries
  properties: (portfolioId?: string | null) => 
    portfolioId ? ['properties', portfolioId] : ['properties'],
  property: (id: string) => ['properties', 'detail', id],
} as const