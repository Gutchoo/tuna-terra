'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

interface UserPreference {
  id: string
  user_id: string
  preference_key: string
  preference_value: Record<string, any>
  created_at: string
  updated_at: string
}

interface PreferenceResponse {
  data: UserPreference | null
}

// Query keys
const preferenceKeys = {
  preference: (key: string) => ['user-preferences', key] as const,
}

// Fetch a preference by key
async function fetchPreference(key: string): Promise<UserPreference | null> {
  const url = new URL('/api/user-preferences', window.location.origin)
  url.searchParams.set('key', key)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch preference')
  }
  const result: PreferenceResponse = await response.json()
  return result.data
}

// Save or update a preference
async function savePreference(key: string, value: Record<string, any>): Promise<UserPreference> {
  const response = await fetch('/api/user-preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preference_key: key,
      preference_value: value,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to save preference')
  }
  const result = await response.json()
  return result.data
}

// Delete a preference
async function deletePreference(key: string): Promise<void> {
  const url = new URL('/api/user-preferences', window.location.origin)
  url.searchParams.set('key', key)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete preference')
  }
}

/**
 * Hook to get and manage a user preference
 * @param key - The preference key (e.g., 'dashboard-layout', 'column-visibility')
 * @param defaultValue - Default value if preference doesn't exist
 */
export function useUserPreference<T extends Record<string, any>>(
  key: string,
  defaultValue?: T
) {
  const queryClient = useQueryClient()

  // Fetch preference
  const query = useQuery({
    queryKey: preferenceKeys.preference(key),
    queryFn: () => fetchPreference(key),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (value: T) => savePreference(key, value),
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(preferenceKeys.preference(key), data)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePreference(key),
    onSuccess: () => {
      // Clear cache
      queryClient.setQueryData(preferenceKeys.preference(key), null)
    },
  })

  // Get the preference value or default
  const value = (query.data?.preference_value as T) ?? defaultValue

  // Helper to update the preference
  const updatePreference = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToSave = typeof newValue === 'function'
        ? newValue(value as T)
        : newValue

      return saveMutation.mutateAsync(valueToSave)
    },
    [saveMutation, value]
  )

  // Helper to delete the preference
  const removePreference = useCallback(() => {
    return deleteMutation.mutateAsync()
  }, [deleteMutation])

  return {
    value,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updatePreference,
    removePreference,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook to get multiple preferences at once
 * Useful when you need to load several preferences together
 */
export function useUserPreferences(keys: string[]) {
  const queries = keys.map(key => ({
    key,
    ...useUserPreference(key),
  }))

  return {
    preferences: queries,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
  }
}
