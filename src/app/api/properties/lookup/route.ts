import { NextRequest, NextResponse } from 'next/server'
import { RegridService } from '@/lib/regrid'
import { getUserId } from '@/lib/auth'
import { checkAndIncrementUsageServer, createLimitExceededResponse } from '@/lib/limits'
import { applyRateLimit, DEFAULT_CONFIGS } from '@/lib/rateLimiter'
import { propertyLookupSchema, createErrorResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply strict rate limiting for expensive API calls
    const rateLimitResponse = await applyRateLimit(userId, 'property-lookup', DEFAULT_CONFIGS.strict)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Check limits and immediately increment usage - prevents bypass vulnerabilities
    const limitCheck = await checkAndIncrementUsageServer(userId, 1)
    if (!limitCheck.canProceed) {
      return NextResponse.json(createLimitExceededResponse(limitCheck), { status: 429 })
    }

    const body = await request.json()
    
    // Validate input using comprehensive schema
    const validatedData = propertyLookupSchema.parse(body)

    // Search for property using validated data
    let searchResults
    if (validatedData.apn) {
      // Search by APN
      const property = await RegridService.searchByAPN(validatedData.apn, validatedData.state)
      searchResults = property ? [{ _fullFeature: property }] : []
    } else if (validatedData.address) {
      // Search by address
      searchResults = await RegridService.searchByAddress(
        validatedData.address,
        validatedData.city,
        validatedData.state,
        1 // Only get the best match
      )
    } else {
      return NextResponse.json(
        createErrorResponse(new Error('Either address or APN is required'), 'Validation error'),
        { status: 400 }
      )
    }

    if (searchResults.length === 0) {
      return NextResponse.json(
        createErrorResponse(new Error('Property not found'), 'No property found'),
        { status: 404 }
      )
    }

    // The address endpoint already returns full property data
    const bestMatch = searchResults[0]
    
    // Note: Usage has already been incremented above to prevent bypass vulnerabilities
    // This ensures credits are consumed when expensive Regrid API calls are made

    // Use the full feature data to create a complete property object
    if (bestMatch._fullFeature) {
      const property = RegridService.normalizeProperty(bestMatch._fullFeature)
      const confidence = 'score' in bestMatch ? bestMatch.score : 1.0
      return NextResponse.json({ 
        property,
        confidence 
      })
    }
    
    // Fallback if no full feature data available (only for address search)
    if ('id' in bestMatch && 'apn' in bestMatch) {
      const property = {
        id: bestMatch.id,
        apn: bestMatch.apn,
        address: {
          line1: bestMatch.address,
          line2: '',
          city: bestMatch.city,
          state: bestMatch.state,
          zip: bestMatch.zip
        },
        geometry: {
          type: 'Polygon',
          coordinates: []
        },
        centroid: {
          lat: 0,
          lng: 0
        },
        properties: {
          owner: 'Owner information needs full lookup',
        }
      }

      return NextResponse.json({ 
        property,
        confidence: bestMatch.score || 0.5
      })
    }

    // Should not reach here with proper validation
    return NextResponse.json(
      createErrorResponse(new Error('Invalid search result format'), 'Search failed'),
      { status: 500 }
    )
  } catch (error) {
    console.error('Property lookup error:', error)
    
    const errorResponse = createErrorResponse(error, 'Property lookup failed. Please try again.')
    return NextResponse.json(errorResponse, { 
      status: error instanceof Error && error.message.includes('Validation') ? 400 : 500 
    })
  }
}