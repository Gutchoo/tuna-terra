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
// GET /api/properties/[propertyId]/units/[unitId]
// Get a single unit
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const { unitId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get unit using DatabaseService
    const unit = await DatabaseService.getUnit(unitId)

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: unit })
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unit' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/properties/[propertyId]/units/[unitId]
// Update a unit
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const { unitId } = await params
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

    // Update unit using DatabaseService
    const unit = await DatabaseService.updateUnit(unitId, {
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
      is_active: body.is_active,
      notes: body.notes
    })

    return NextResponse.json({ data: unit })
  } catch (error) {
    console.error('Error updating unit:', error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A unit with this number already exists for this property' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update unit' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/properties/[propertyId]/units/[unitId]
// Delete a unit (soft delete)
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const { unitId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete unit using DatabaseService (soft delete)
    await DatabaseService.deleteUnit(unitId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete unit' },
      { status: 500 }
    )
  }
}
