import { NextRequest, NextResponse } from 'next/server'
// import { DatabaseService } from '@/lib/db' // Not used directly, CensusService handles DB operations
import { CensusService } from '@/lib/census'

// GET /api/census/[cityState]
// Example: /api/census/colton-ca
// Returns census demographic data for the specified city and state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cityState: string }> }
) {
  try {
    const { cityState } = await params
    
    if (!cityState) {
      return NextResponse.json(
        { error: 'City and state parameter is required' },
        { status: 400 }
      )
    }

    // Parse city-state from URL parameter
    // Expected format: "city-state" (e.g., "colton-ca", "san-francisco-ca")
    const parts = cityState.toLowerCase().split('-')
    if (parts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid city-state format. Use format: city-state (e.g., colton-ca)' },
        { status: 400 }
      )
    }

    // Last part is state, everything else is city
    const state = parts[parts.length - 1].toUpperCase()
    const city = parts.slice(0, -1).join(' ').toUpperCase()

    if (!city || !state) {
      return NextResponse.json(
        { error: 'City and state must be provided' },
        { status: 400 }
      )
    }

    // Validate state format (should be 2 characters)
    if (state.length !== 2) {
      return NextResponse.json(
        { error: 'State must be 2 characters (e.g., CA, NY, TX)' },
        { status: 400 }
      )
    }

    console.log(`📊 Census API request for: ${city}, ${state}`)

    // Try to get census data using our existing service
    const censusData = await CensusService.getCachedOrFetchCensusData(city, state, 2023)

    if (!censusData) {
      console.log(`❌ No census data found for ${city}, ${state}`)
      return NextResponse.json(
        { 
          error: 'Census data not found',
          message: `No demographic data available for ${city}, ${state}`,
          city,
          state
        },
        { status: 404 }
      )
    }

    console.log(`✅ Census data found for ${city}, ${state}`)

    // Return the demographic data
    const response = {
      city,
      state,
      year: censusData.year,
      geoid: censusData.geoid,
      demographics: {
        median_income: censusData.median_income,
        mean_income: censusData.mean_income,
        households: censusData.households,
        population: censusData.population,
        unemployment_rate: censusData.unemployment_rate,
        median_age: censusData.median_age,
        age_brackets: censusData.age_brackets,
        // Housing characteristics from DP04
        total_housing_units: censusData.total_housing_units,
        owner_occupied_units: censusData.owner_occupied_units,
        renter_occupied_units: censusData.renter_occupied_units,
        median_rent: censusData.median_rent,
        avg_household_size_owner: censusData.avg_household_size_owner,
        avg_household_size_renter: censusData.avg_household_size_renter,
        // Education characteristics from S1501
        education_details: censusData.education_details,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Census API error:', error)
    
    // Return a user-friendly error message
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch census data. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// POST /api/census/[cityState] - Batch lookup
// Accept multiple city-state combinations in request body
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cityState: string }> }
) {
  try {
    // Handle batch requests
    const { cityState } = await params
    if (cityState !== 'batch') {
      return NextResponse.json(
        { error: 'Use POST /api/census/batch for batch requests' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { locations } = body

    if (!Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'locations must be an array of {city, state} objects' },
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
        const censusData = await CensusService.getCachedOrFetchCensusData(
          normalizedCity, 
          normalizedState, 
          2023
        )

        if (censusData) {
          results[key] = {
            city: normalizedCity,
            state: normalizedState,
            year: censusData.year,
            geoid: censusData.geoid,
            demographics: {
              median_income: censusData.median_income,
              mean_income: censusData.mean_income,
              households: censusData.households,
              population: censusData.population,
              unemployment_rate: censusData.unemployment_rate,
              median_age: censusData.median_age,
              age_brackets: censusData.age_brackets,
              // Housing characteristics from DP04
              total_housing_units: censusData.total_housing_units,
              owner_occupied_units: censusData.owner_occupied_units,
              renter_occupied_units: censusData.renter_occupied_units,
              median_rent: censusData.median_rent,
              avg_household_size_owner: censusData.avg_household_size_owner,
              avg_household_size_renter: censusData.avg_household_size_renter,
              // Education characteristics from S1501
              education_details: censusData.education_details,
            }
          }
        } else {
          results[key] = null // No data found
        }
      } catch (error) {
        console.error(`Error fetching census data for ${normalizedCity}, ${normalizedState}:`, error)
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