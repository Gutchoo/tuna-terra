import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { z } from 'zod'

const bulkDeleteSchema = z.object({
  propertyIds: z.array(z.string()).min(1, 'At least one property ID is required')
})

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyIds } = bulkDeleteSchema.parse(body)

    // Delete properties in parallel
    const deletePromises = propertyIds.map(async (propertyId) => {
      try {
        // Check if property exists and belongs to user
        const property = await DatabaseService.getProperty(propertyId, userId)
        
        if (!property) {
          return { id: propertyId, success: false, error: 'Property not found' }
        }

        if (property.is_sample) {
          return { 
            id: propertyId, 
            success: false, 
            error: 'Sample properties cannot be deleted' 
          }
        }

        await DatabaseService.deleteProperty(propertyId, userId)
        return { id: propertyId, success: true }
      } catch (error) {
        return { 
          id: propertyId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete property' 
        }
      }
    })

    const results = await Promise.all(deletePromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return NextResponse.json({
      success: true,
      deleted: successful.length,
      failed: failed.length,
      results
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete properties' },
      { status: 500 }
    )
  }
}