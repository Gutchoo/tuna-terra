import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const apn = searchParams.get('apn')
    const portfolioId = searchParams.get('portfolio_id')

    if (!apn) {
      return NextResponse.json(
        { error: 'APN parameter is required' }, 
        { status: 400 }
      )
    }

    // Check if property with this APN already exists for the user in the specified portfolio
    const filters: { search: string; portfolio_id?: string } = {
      search: apn // This will search in APN field among others
    }
    
    // If portfolio_id is provided, only check within that portfolio
    if (portfolioId) {
      filters.portfolio_id = portfolioId
    }
    
    const existingProperties = await DatabaseService.getFilteredProperties(userId, filters)

    // Filter to exact APN match (since search is fuzzy)
    const exactMatch = existingProperties.find(
      property => property.apn?.toLowerCase() === apn.toLowerCase()
    )

    if (exactMatch) {
      return NextResponse.json({ 
        exists: true, 
        property: {
          id: exactMatch.id,
          address: exactMatch.address,
          city: exactMatch.city,
          state: exactMatch.state,
          apn: exactMatch.apn,
          created_at: exactMatch.created_at
        }
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Check APN error:', error)
    return NextResponse.json(
      { error: 'Failed to check APN' }, 
      { status: 500 }
    )
  }
}