import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Create anonymous client for census data access (respects RLS policies)
function createAnonClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

// POST /api/census/batch
// Accept multiple city-state combinations in request body
// Returns census data for each location, checking database cache first
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locations } = body

    if (!Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'locations must be an array of {city, state} objects' },
        { status: 400 }
      )
    }

    if (locations.length === 0) {
      return NextResponse.json(
        { error: 'locations array cannot be empty' },
        { status: 400 }
      )
    }

    if (locations.length > 50) {
      return NextResponse.json(
        { error: 'Too many locations requested. Maximum 50 locations per batch.' },
        { status: 400 }
      )
    }

    console.log(`📊 Batch census request for ${locations.length} locations`)

    const results: Record<string, unknown> = {}

    // Process each location
    for (const location of locations) {
      const { city, state } = location

      if (!city || !state) {
        continue // Skip invalid entries
      }

      const normalizedCity = city.toUpperCase().trim()
      const normalizedState = state.toUpperCase().trim()
      const key = `${normalizedCity}-${normalizedState}`

      try {
        // Check database cache first
        const supabase = createAnonClient()

        // Find place geoid
        const { data: place } = await supabase
          .from('places')
          .select('geoid, name, state_abbr')
          .eq('basename_normalized', normalizedCity.toLowerCase().trim())
          .eq('state_abbr', normalizedState)
          .limit(1)
          .single()

        if (!place) {
          console.log(`Place not found: ${normalizedCity}, ${normalizedState}`)
          results[key] = null
          continue
        }

        // Check cache for existing census data
        const { data: censusData } = await supabase
          .from('census_data')
          .select('*')
          .eq('geoid', place.geoid)
          .eq('year', 2023)
          .single()

        if (censusData) {
          console.log(`✅ Using cached census data for ${normalizedCity}, ${normalizedState}`)
          results[key] = {
            city: normalizedCity,
            state: normalizedState,
            year: censusData.year,
            geoid: censusData.geoid,
            demographics: {
              median_income: censusData.median_income ? parseFloat(censusData.median_income) : null,
              mean_income: censusData.mean_income ? parseFloat(censusData.mean_income) : null,
              households: censusData.households,
              population: censusData.population,
              unemployment_rate: censusData.unemployment_rate,
              median_age: censusData.median_age ? parseFloat(censusData.median_age) : null,
              age_brackets: censusData.age_brackets,
              // Housing characteristics from DP04
              total_housing_units: censusData.total_housing_units,
              owner_occupied_units: censusData.owner_occupied_units,
              renter_occupied_units: censusData.renter_occupied_units,
              median_rent: censusData.median_rent ? parseFloat(censusData.median_rent) : null,
              avg_household_size_owner: censusData.avg_household_size_owner ? parseFloat(censusData.avg_household_size_owner) : null,
              avg_household_size_renter: censusData.avg_household_size_renter ? parseFloat(censusData.avg_household_size_renter) : null,
              // Education characteristics from S1501
              education_details: censusData.education_details,
            }
          }
        } else {
          console.log(`🔄 No cached data found for ${normalizedCity}, ${normalizedState}`)
          results[key] = null // No data found - could implement Census API fetch here if needed
        }
      } catch {
        console.error(`Error fetching census data for ${normalizedCity}, ${normalizedState}`)
        results[key] = null
      }
    }

    console.log(`✅ Batch census lookup completed: ${Object.keys(results).length} results`)

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Batch census API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch batch census data. Please try again later.'
      },
      { status: 500 }
    )
  }
}