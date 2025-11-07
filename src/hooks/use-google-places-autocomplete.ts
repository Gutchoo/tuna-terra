import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'

interface AddressSuggestion {
  placeId: string
  description: string
  structuredFormat?: {
    mainText: string
    secondaryText: string
  }
}

export function useGooglePlacesAutocomplete(
  input: string,
  enabled: boolean = true,
  demoMode: boolean = false
) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchPlaces = useCallback(
    async (searchInput: string) => {
      if (!enabled || searchInput.length < 3) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: searchInput, demoMode }),
        })

        if (!response.ok) {
          throw new Error('Failed to search addresses')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Places search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [enabled, demoMode]
  )

  // Debounced search effect
  useEffect(() => {
    if (!enabled) {
      setSuggestions([])
      return
    }

    const debouncedSearch = debounce((searchInput: string) => {
      searchPlaces(searchInput)
    }, 500)

    debouncedSearch(input)

    return () => {
      debouncedSearch.cancel()
    }
  }, [input, enabled, searchPlaces])

  return {
    suggestions,
    isLoading,
  }
}
