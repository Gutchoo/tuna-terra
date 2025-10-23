import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { z } from 'zod'
import { sanitizePropertyForClient } from '@/lib/api/sanitizers'

const updatePropertySchema = z.object({
  user_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  insurance_provider: z.string().optional(),
  maintenance_history: z.string().optional(),
}).partial()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const property = await DatabaseService.getProperty(id, userId)

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ property: sanitizePropertyForClient(property) })
  } catch (error) {
    console.error('Get property error:', error)
    return NextResponse.json(
      { error: 'Failed to get property' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Validate update data
    const validatedData = updatePropertySchema.parse(body)

    // Check if property is a sample property before updating
    const existingProperty = await DatabaseService.getProperty(id, userId)
    
    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (existingProperty.is_sample) {
      return NextResponse.json(
        { 
          error: 'Sample properties cannot be edited',
          message: 'This sample property showcases our platform capabilities and cannot be modified. You can add your own properties to manage and edit.'
        },
        { status: 400 }
      )
    }

    // Update the property
    const property = await DatabaseService.updateProperty(id, userId, {
      ...validatedData,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ property: sanitizePropertyForClient(property) })
  } catch (error) {
    console.error('Update property error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Check if property is a sample property before deletion
    const property = await DatabaseService.getProperty(id, userId)
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.is_sample) {
      return NextResponse.json(
        { 
          error: 'Sample properties cannot be deleted',
          message: 'This sample property showcases our platform capabilities and cannot be removed. You can add your own properties to manage.'
        },
        { status: 400 }
      )
    }

    await DatabaseService.deleteProperty(id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}