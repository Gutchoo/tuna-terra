import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { FieldOverrides } from '@/lib/supabase'

/**
 * PATCH /api/properties/[id]/details
 * Update property details including user-entered fields and Regrid field overrides
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('[DEBUG] User ID:', userId)

    const { id: propertyId } = await params
    console.log('[DEBUG] Property ID:', propertyId)

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // First, verify user has access to this property via portfolio membership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('portfolio_id, field_overrides')
      .eq('id', propertyId)
      .single()

    console.log('[DEBUG] Property query result:', { property, propertyError })

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    console.log('[DEBUG] Portfolio ID:', property.portfolio_id)

    // Check user's role in the portfolio (must be editor or owner)
    const { data: membership, error: membershipError } = await supabase
      .from('user_accessible_portfolios')
      .select('user_role')
      .eq('id', property.portfolio_id)
      .single()

    console.log('[DEBUG] Membership query result:', { membership, membershipError })
    console.log('[DEBUG] User role:', membership?.user_role)

    if (!membership || membership.user_role === 'viewer') {
      console.log('[DEBUG] Permission denied - no membership or viewer role')
      return NextResponse.json(
        { error: 'Insufficient permissions. Only editors and owners can update property details.' },
        { status: 403 }
      )
    }

    console.log('[DEBUG] Permission granted - proceeding with update')

    // Separate user-entered fields from Regrid field overrides
    const userFields = ['purchase_date', 'purchase_price', 'sold_date', 'sold_price']
    const regridOverridableFields = [
      'address',
      'city',
      'state',
      'zip_code',
      'year_built',
      'apn',
      'owner',
      'lot_size_acres',
      'num_stories',
      'use_description',
      'zoning',
      'assessed_value',
      'improvement_value',
      'land_value'
    ]

    const updates: Record<string, any> = {}
    const newOverrides: FieldOverrides = { ...(property.field_overrides || {}) }

    // Process user-entered fields (no override tracking needed)
    for (const field of userFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    // Process Regrid field overrides
    if (body.fieldOverrides) {
      for (const [fieldName, override] of Object.entries(body.fieldOverrides)) {
        if (regridOverridableFields.includes(fieldName)) {
          // If override is null, user wants to revert to original
          if (override === null) {
            delete newOverrides[fieldName]
          } else {
            newOverrides[fieldName] = override as any
            updates[fieldName] = (override as any).value
          }
        }
      }
      updates.field_overrides = newOverrides
    }

    // Validation
    if (updates.purchase_date && updates.sold_date) {
      const purchaseDate = new Date(updates.purchase_date)
      const soldDate = new Date(updates.sold_date)
      if (soldDate < purchaseDate) {
        return NextResponse.json(
          { error: 'Sale date must be after purchase date' },
          { status: 400 }
        )
      }
    }

    if (updates.sold_price !== undefined && updates.sold_price !== null && updates.sold_price <= 0) {
      return NextResponse.json(
        { error: 'Sale price must be positive' },
        { status: 400 }
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the property
    updates.updated_at = new Date().toISOString()

    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      console.error('Update property details error:', updateError)
      throw updateError
    }

    if (!updatedProperty) {
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      )
    }

    return NextResponse.json({ property: updatedProperty })
  } catch (error) {
    console.error('Update property details error:', error)
    return NextResponse.json(
      { error: 'Failed to update property details' },
      { status: 500 }
    )
  }
}
