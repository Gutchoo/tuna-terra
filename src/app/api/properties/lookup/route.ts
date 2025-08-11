import { NextRequest, NextResponse } from 'next/server'
import { RegridService } from '@/lib/regrid'
import { getUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' }, 
        { status: 400 }
      )
    }

    // First search for the address to get potential matches
    const searchResults = await RegridService.searchByAddress(
      address,
      undefined,
      undefined,
      1 // Only get the best match
    )

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: 'No property found for this address' },
        { status: 404 }
      )
    }

    // The address endpoint already returns full property data
    const bestMatch = searchResults[0]
    
    // Use the full feature data to create a complete property object
    if (bestMatch._fullFeature) {
      const property = RegridService.normalizeProperty(bestMatch._fullFeature)
      return NextResponse.json({ 
        property,
        confidence: bestMatch.score 
      })
    }
    
    // Fallback if no full feature data available
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
      confidence: bestMatch.score 
    })
  } catch (error) {
    console.error('Property lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup property' }, 
      { status: 500 }
    )
  }
}