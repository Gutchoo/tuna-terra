'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Property } from '@/lib/supabase'

export interface CensusDemographics {
  median_income: number | null
  mean_income: number | null
  households: number | null
  population: number | null
  unemployment_rate: number | null
  median_age: number | null
  age_brackets: {
    '20_24': number
    '25_29': number
    '30_34': number
    '35_39': number
    '40_44': number
    '45_49': number
    '50_54': number
    '55_59': number
    '60_64': number
    '65_69': number
    '70_74': number
    '75_79': number
    '80_84': number
    '85_plus': number
  } | null
  // Housing characteristics from DP04
  total_housing_units: number | null
  owner_occupied_units: number | null
  renter_occupied_units: number | null
  median_rent: number | null
  avg_household_size_owner: number | null
  avg_household_size_renter: number | null
  // Education characteristics from S1501
  education_details: {
    pop_25_34: number
    pop_35_44: number
    pop_45_64: number
    pct_bachelor_plus_25_34: number
    pct_bachelor_plus_35_44: number
    pct_bachelor_plus_45_64: number
  } | null
}

export interface CensusDataResult {
  city: string
  state: string
  year: number
  geoid: string
  demographics: CensusDemographics
}

// Map of property ID to census data
export type CensusDataMap = Record<string, CensusDemographics | null>

interface UseCensusDataReturn {
  censusData: CensusDataMap
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * React hook for fetching census data for multiple properties
 * Batches requests by unique city/state combinations to minimize API calls
 */
export function useCensusData(properties: Property[]): UseCensusDataReturn {
  const [censusData, setCensusData] = useState<CensusDataMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCensusData = async () => {
    if (!properties.length) {
      setCensusData({})
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, check for properties that already have demographics data embedded
      const newCensusData: CensusDataMap = {}
      const propertiesNeedingFetch: Property[] = []

      properties.forEach(property => {
        // Check if property has embedded demographics in property_data
        const embeddedDemographics = (property as Property & { property_data?: { demographics?: CensusDemographics } })?.property_data?.demographics

        if (embeddedDemographics) {
          console.log(`✅ Using embedded demographics for property ${property.id} (${property.address})`)
          newCensusData[property.id] = embeddedDemographics
        } else if (property.city && property.state) {
          // Property needs API fetch
          propertiesNeedingFetch.push(property)
          newCensusData[property.id] = null // Initialize as null
        } else {
          // Property has no location data
          newCensusData[property.id] = null
        }
      })

      // If all properties have embedded demographics, we're done
      if (propertiesNeedingFetch.length === 0) {
        setCensusData(newCensusData)
        setIsLoading(false)
        const embeddedCount = Object.values(newCensusData).filter(data => data !== null).length
        console.log(`✅ Using embedded demographics for ${embeddedCount}/${properties.length} properties`)
        return
      }

      // Extract unique city/state combinations for properties that need API fetch
      const locationMap = new Map<string, Property[]>()

      propertiesNeedingFetch.forEach(property => {
        if (property.city && property.state) {
          const key = `${property.city.toUpperCase()}-${property.state.toUpperCase()}`
          if (!locationMap.has(key)) {
            locationMap.set(key, [])
          }
          locationMap.get(key)!.push(property)
        }
      })

      // If no properties need API fetch, return embedded data only
      if (locationMap.size === 0) {
        setCensusData(newCensusData)
        setIsLoading(false)
        return
      }

      // Prepare batch request
      const locations = Array.from(locationMap.keys()).map(key => {
        const [city, state] = key.split('-')
        return { city, state }
      })

      console.log(`🔍 Fetching census data for ${locations.length} unique locations`)

      // Make batch API request
      const response = await fetch('/api/census/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const { results } = await response.json()
      
      // Map API census results back to properties that needed fetching
      Object.entries(results).forEach(([locationKey, censusResult]) => {
        if (censusResult && locationMap.has(locationKey)) {
          const propertiesInLocation = locationMap.get(locationKey)!
          const demographics = (censusResult as CensusDataResult).demographics

          // Assign API census data to properties in this city/state
          propertiesInLocation.forEach(property => {
            newCensusData[property.id] = demographics
          })
        }
      })

      setCensusData(newCensusData)
      
      const foundCount = Object.values(newCensusData).filter(data => data !== null).length
      console.log(`✅ Census data loaded for ${foundCount}/${properties.length} properties`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch census data'
      console.error('Census data fetch error:', errorMessage)
      setError(errorMessage)
      
      // Set all properties to null on error
      const errorCensusData: CensusDataMap = {}
      properties.forEach(property => {
        errorCensusData[property.id] = null
      })
      setCensusData(errorCensusData)
    } finally {
      setIsLoading(false)
    }
  }

  // Create a stable dependency string that only changes when property locations change
  const propertyLocationKey = useMemo(() => {
    return properties
      .map(p => `${p.id}-${p.city || ''}-${p.state || ''}`)
      .sort()
      .join(',')
  }, [properties])

  // Effect to fetch data when properties change
  useEffect(() => {
    fetchCensusData()
  }, [propertyLocationKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    censusData,
    isLoading,
    error,
    refetch: fetchCensusData
  }
}

/**
 * Utility hook for single property census data
 */
export function usePropertyCensusData(property: Property | null): {
  demographics: CensusDemographics | null
  isLoading: boolean
  error: string | null
} {
  const { censusData, isLoading, error } = useCensusData(property ? [property] : [])
  
  return {
    demographics: property ? (censusData[property.id] || null) : null,
    isLoading,
    error
  }
}

/**
 * Helper function to check if a property has census data available
 */
export function hasCensusData(property: Property, censusDataMap: CensusDataMap): boolean {
  const data = censusDataMap[property.id]
  return data !== null && data !== undefined
}

/**
 * Helper function to get census data for a specific property
 */
export function getCensusDataForProperty(property: Property, censusDataMap: CensusDataMap): CensusDemographics | null {
  return censusDataMap[property.id] || null
}