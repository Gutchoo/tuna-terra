import { NextRequest, NextResponse } from 'next/server'
import { RegridService } from '@/lib/regrid'
import { getUserId } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const property = await RegridService.getPropertyById(id)

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Get property error:', error)
    return NextResponse.json(
      { error: 'Failed to get property details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()

    // Allowed fields for update
    const allowedFields = [
      'address',
      'city',
      'state',
      'zip_code',
      'owner',
      'apn',
      'year_built',
      'zoning',
      'purchase_price'
    ]

    // Filter body to only include allowed fields
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the property
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Property not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}