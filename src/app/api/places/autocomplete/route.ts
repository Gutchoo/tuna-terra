import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'

interface GooglePlacesSuggestion {
  placePrediction?: {
    placeId?: string
    text?: {
      text?: string
    }
    structuredFormat?: {
      mainText?: {
        text?: string
      }
      secondaryText?: {
        text?: string
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { input } = body

    if (!input || input.length < 3) {
      return NextResponse.json({ suggestions: [] })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Places API key not configured' }, { status: 500 })
    }

    // Call the new Places API (New) REST endpoint
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ['street_address'],
        includedRegionCodes: ['US'],
        languageCode: 'en',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Places API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to get address suggestions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Transform the response to match our frontend expectations
    const suggestions = (data.suggestions || []).map((suggestion: GooglePlacesSuggestion) => ({
      placeId: suggestion.placePrediction?.placeId || '',
      description: suggestion.placePrediction?.text?.text || '',
      structuredFormat: {
        mainText: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
        secondaryText: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
      },
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Autocomplete API error:', error)
    return NextResponse.json(
      { error: 'Failed to get address suggestions' },
      { status: 500 }
    )
  }
}