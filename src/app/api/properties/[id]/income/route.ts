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
// GET /api/properties/[propertyId]/income
// List income transactions for a property
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
    const unit_id = searchParams.get('unit_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const category = searchParams.get('category')
    const transaction_type = searchParams.get('transaction_type') as 'actual' | 'projected' | null
    const is_recurring = searchParams.get('is_recurring')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const filters: {
      unit_id?: string
      start_date?: string
      end_date?: string
      category?: string
      transaction_type?: 'actual' | 'projected'
      is_recurring?: boolean
      limit?: number
      offset?: number
    } = {}

    if (unit_id) filters.unit_id = unit_id
    if (start_date) filters.start_date = start_date
    if (end_date) filters.end_date = end_date
    if (category) filters.category = category
    if (transaction_type) filters.transaction_type = transaction_type
    if (is_recurring !== null) filters.is_recurring = is_recurring === 'true'
    if (limit) filters.limit = parseInt(limit)
    if (offset) filters.offset = parseInt(offset)

    // Get transactions using DatabaseService
    const transactions = await DatabaseService.getIncomeTransactions(propertyId, filters)

    return NextResponse.json({
      data: transactions,
      total_count: transactions.length
    })
  } catch (error) {
    console.error('Error fetching income transactions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch income transactions' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/properties/[propertyId]/income
// Create a new income transaction
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

    if (!body.transaction_date) {
      return NextResponse.json(
        { error: 'transaction_date is required' },
        { status: 400 }
      )
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      )
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'category is required' },
        { status: 400 }
      )
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      )
    }

    // Create transaction using DatabaseService
    const transaction = await DatabaseService.createIncomeTransaction({
      property_id: propertyId,
      portfolio_id: body.portfolio_id,
      unit_id: body.unit_id,
      transaction_date: body.transaction_date,
      amount: body.amount,
      category: body.category,
      description: body.description,
      transaction_type: body.transaction_type || 'actual',
      is_recurring: body.is_recurring || false,
      recurrence_frequency: body.recurrence_frequency,
      recurrence_start_date: body.recurrence_start_date,
      recurrence_end_date: body.recurrence_end_date,
      notes: body.notes,
      tags: body.tags
    })

    return NextResponse.json({ data: transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating income transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create income transaction' },
      { status: 500 }
    )
  }
}
