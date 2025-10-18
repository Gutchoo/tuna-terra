import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DatabaseService } from '@/lib/db'

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

// ============================================================================
// GET /api/properties/[propertyId]/units
// List all units for a property
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const is_active = searchParams.get('is_active')
    const is_occupied = searchParams.get('is_occupied')

    const filters: {
      is_active?: boolean
      is_occupied?: boolean
    } = {}

    if (is_active !== null) {
      filters.is_active = is_active === 'true'
    }

    if (is_occupied !== null) {
      filters.is_occupied = is_occupied === 'true'
    }

    // Get units using DatabaseService
    const units = await DatabaseService.getPropertyUnits(propertyId, filters)

    return NextResponse.json({
      data: units,
      count: units.length
    })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch units' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/properties/[propertyId]/units
// Create a new unit
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.portfolio_id) {
      return NextResponse.json(
        { error: 'portfolio_id is required' },
        { status: 400 }
      )
    }

    if (!body.unit_number) {
      return NextResponse.json(
        { error: 'unit_number is required' },
        { status: 400 }
      )
    }

    // Create unit using DatabaseService
    const unit = await DatabaseService.createUnit({
      property_id: propertyId,
      portfolio_id: body.portfolio_id,
      unit_number: body.unit_number,
      unit_name: body.unit_name,
      square_footage: body.square_footage,
      tenant_name: body.tenant_name,
      tenant_email: body.tenant_email,
      tenant_phone: body.tenant_phone,
      lease_start_date: body.lease_start_date,
      lease_end_date: body.lease_end_date,
      monthly_rent: body.monthly_rent,
      security_deposit: body.security_deposit,
      lease_terms: body.lease_terms,
      is_occupied: body.is_occupied,
      notes: body.notes
    })

    return NextResponse.json({ data: unit }, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A unit with this number already exists for this property' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create unit' },
      { status: 500 }
    )
  }
}
