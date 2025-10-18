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
// GET /api/properties/[propertyId]/expenses/[transactionId]
// Get a single expense transaction with documents
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  try {
    const { transactionId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get transaction using DatabaseService
    const transaction = await DatabaseService.getExpenseTransaction(transactionId)

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: transaction })
  } catch (error) {
    console.error('Error fetching expense transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch expense transaction' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/properties/[propertyId]/expenses/[transactionId]
// Update an expense transaction
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  try {
    const { transactionId } = await params
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

    // Validate amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      )
    }

    // Update transaction using DatabaseService
    const transaction = await DatabaseService.updateExpenseTransaction(transactionId, {
      transaction_date: body.transaction_date,
      amount: body.amount,
      category: body.category,
      description: body.description,
      transaction_type: body.transaction_type,
      vendor_name: body.vendor_name,
      vendor_contact: body.vendor_contact,
      notes: body.notes,
      tags: body.tags
    })

    return NextResponse.json({ data: transaction })
  } catch (error) {
    console.error('Error updating expense transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update expense transaction' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/properties/[propertyId]/expenses/[transactionId]
// Delete an expense transaction
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  try {
    const { transactionId } = await params
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
    const delete_recurring = searchParams.get('delete_recurring') === 'true'

    // Delete transaction using DatabaseService
    await DatabaseService.deleteExpenseTransaction(transactionId, delete_recurring)

    return NextResponse.json({
      success: true,
      deleted_count: delete_recurring ? 'multiple' : 1
    })
  } catch (error) {
    console.error('Error deleting expense transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete expense transaction' },
      { status: 500 }
    )
  }
}
