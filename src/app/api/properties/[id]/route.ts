import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define allowed update fields type
type PropertyUpdateField =
  | 'address'
  | 'city'
  | 'state'
  | 'zip_code'
  | 'owner'
  | 'apn'
  | 'year_built'
  | 'zoning'
  | 'purchase_price'
  | 'purchase_date'
  | 'sale_price'
  | 'sale_date'
  | 'last_sale_price'
  | 'insurance_provider'
  | 'management_company'
  | 'user_notes'
  | 'tags'
  | 'maintenance_history'
  | 'owner_mailing_address'
  | 'owner_mail_city'
  | 'owner_mail_state'
  | 'owner_mail_zip'

// Property values can be various types
type PropertyUpdateValue = string | number | string[] | null

async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

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

    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query property by ID - RLS policies will ensure user has access via portfolio membership
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get property error:', error)
      return NextResponse.json(
        { error: 'Property not found or unauthorized' },
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

    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Allowed fields for update (only fields that exist in properties table)
    const allowedFields = [
      'address',
      'city',
      'state',
      'zip_code',
      'owner',
      'apn',
      'year_built',
      'zoning',
      'purchase_price',
      'purchase_date',
      'sale_price',
      'sale_date',
      'last_sale_price',
      'insurance_provider',
      'management_company',
      'user_notes',
      'tags',
      'maintenance_history',
      'owner_mailing_address',
      'owner_mail_city',
      'owner_mail_state',
      'owner_mail_zip'
    ]

    // Filter body to only include allowed fields
    const updates: Partial<Record<PropertyUpdateField, PropertyUpdateValue>> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field as PropertyUpdateField] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the property - RLS policy 'editors_can_update_properties' will ensure
    // user has 'owner' or 'editor' role in the portfolio via user_accessible_portfolios view
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update property error:', error)
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      )
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
