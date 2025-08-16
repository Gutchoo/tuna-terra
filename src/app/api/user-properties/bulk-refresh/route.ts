import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { z } from 'zod'

const bulkRefreshSchema = z.object({
  propertyIds: z.array(z.string()).min(1, 'At least one property ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyIds } = bulkRefreshSchema.parse(body)

    // Refresh properties in parallel by calling individual refresh endpoints
    const refreshPromises = propertyIds.map(async (propertyId) => {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/user-properties/${propertyId}/refresh`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Authorization': request.headers.get('authorization') || ''
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { 
            id: propertyId, 
            success: false, 
            error: errorData.error || 'Failed to refresh property' 
          }
        }

        const result = await response.json()
        return { id: propertyId, success: true, property: result.property }
      } catch (error) {
        return { 
          id: propertyId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to refresh property' 
        }
      }
    })

    const results = await Promise.all(refreshPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return NextResponse.json({
      success: true,
      refreshed: successful.length,
      failed: failed.length,
      results
    })
  } catch (error) {
    console.error('Bulk refresh error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to refresh properties' },
      { status: 500 }
    )
  }
}