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
// GET /api/properties/[propertyId]/reports
// Generate financial reports for a property
// Query params: report_type (noi|profit_loss|cashflow), start_date, end_date, unit_id (optional)
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
    const report_type = searchParams.get('report_type')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const unit_id = searchParams.get('unit_id')

    // Validate required parameters
    if (!report_type) {
      return NextResponse.json(
        { error: 'report_type is required (noi|profit_loss|cashflow)' },
        { status: 400 }
      )
    }

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      )
    }

    // Validate report_type
    if (!['noi', 'profit_loss', 'cashflow'].includes(report_type)) {
      return NextResponse.json(
        { error: 'Invalid report_type. Must be: noi, profit_loss, or cashflow' },
        { status: 400 }
      )
    }

    let reportData: any

    // Generate report based on type
    switch (report_type) {
      case 'noi':
        if (unit_id) {
          // Unit-level NOI calculation
          reportData = await DatabaseService.calculateUnitFinancials(unit_id, start_date, end_date)
        } else {
          // Property-level NOI calculation
          reportData = await DatabaseService.calculatePropertyNOI(propertyId, start_date, end_date)
        }
        break

      case 'profit_loss':
        // Generate comprehensive P&L report
        reportData = await generateProfitLossReport(propertyId, start_date, end_date, unit_id)
        break

      case 'cashflow':
        // Generate cash flow report (similar to P&L but focuses on cash basis)
        reportData = await generateCashflowReport(propertyId, start_date, end_date, unit_id)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report_type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      data: {
        report_type,
        period: {
          start_date,
          end_date
        },
        property_id: propertyId,
        unit_id: unit_id || null,
        generated_at: new Date().toISOString(),
        ...reportData
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Helper: Generate Profit & Loss Report
// ============================================================================
async function generateProfitLossReport(
  id: string,
  startDate: string,
  endDate: string,
  unitId?: string | null
) {
  const supabase = await createServerSupabaseClient()

  // Base query for income transactions
  let incomeQuery = supabase
    .from('income_transactions')
    .select('*')
    .eq('property_id', id)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .eq('transaction_type', 'actual')

  if (unitId) {
    incomeQuery = incomeQuery.eq('unit_id', unitId)
  }

  const { data: incomeTransactions, error: incomeError } = await incomeQuery

  if (incomeError) throw incomeError

  // Base query for expense transactions
  let expenseQuery = supabase
    .from('expense_transactions')
    .select('*')
    .eq('property_id', id)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .eq('transaction_type', 'actual')

  if (unitId) {
    expenseQuery = expenseQuery.eq('unit_id', unitId)
  }

  const { data: expenseTransactions, error: expenseError } = await expenseQuery

  if (expenseError) throw expenseError

  // Aggregate income by category
  const incomeByCategory: Record<string, number> = {}
  let totalIncome = 0

  incomeTransactions?.forEach(transaction => {
    const category = transaction.category
    incomeByCategory[category] = (incomeByCategory[category] || 0) + transaction.amount
    totalIncome += transaction.amount
  })

  // Aggregate expenses by category
  const expensesByCategory: Record<string, number> = {}
  let totalExpenses = 0

  expenseTransactions?.forEach(transaction => {
    const category = transaction.category
    expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount
    totalExpenses += transaction.amount
  })

  // Calculate NOI
  const noi = totalIncome - totalExpenses

  return {
    income: {
      by_category: incomeByCategory,
      total: totalIncome,
      transaction_count: incomeTransactions?.length || 0
    },
    expenses: {
      by_category: expensesByCategory,
      total: totalExpenses,
      transaction_count: expenseTransactions?.length || 0
    },
    noi,
    noi_margin: totalIncome > 0 ? (noi / totalIncome) * 100 : 0
  }
}

// ============================================================================
// Helper: Generate Cash Flow Report
// ============================================================================
async function generateCashflowReport(
  id: string,
  startDate: string,
  endDate: string,
  unitId?: string | null
) {
  // Cash flow report is similar to P&L but includes only actual cash transactions
  const plReport = await generateProfitLossReport(id, startDate, endDate, unitId)

  // For now, cashflow is identical to P&L since we're only pulling actual transactions
  // In future, you could add additional sections like:
  // - Capital expenditures
  // - Debt service
  // - Owner distributions

  return {
    ...plReport,
    net_operating_cashflow: plReport.noi,
    // Future fields:
    // capital_expenditures: 0,
    // debt_service: 0,
    // net_cashflow: plReport.noi - capex - debt_service
  }
}
