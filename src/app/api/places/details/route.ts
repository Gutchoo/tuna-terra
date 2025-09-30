import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    const { placeId, demoMode } = body

    // Allow demo users to use Places API for authentic experience
    if (!userId && !demoMode) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Places API key not configured' }, { status: 500 })
    }

    // Call the new Places API (New) REST endpoint for place details
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,formattedAddress,addressComponents',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Places details API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to get place details' },
        { status: response.status }
      )
    }

    const place = await response.json()
    
    return NextResponse.json({ place })
  } catch (error) {
    console.error('Place details API error:', error)
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    )
  }
}