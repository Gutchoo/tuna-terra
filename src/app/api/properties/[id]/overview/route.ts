import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get property data (RLS policies handle access control)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get current year for YTD calculations
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const today = new Date().toISOString().split('T')[0]

    // Aggregate income YTD
    const { data: incomeData, error: incomeError } = await supabase
      .from('income_transactions')
      .select('amount')
      .eq('property_id', propertyId)
      .eq('transaction_type', 'actual')
      .gte('transaction_date', startOfYear)
      .lte('transaction_date', today)

    const totalIncomeYTD = incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Aggregate expenses YTD
    const { data: expenseData, error: expenseError } = await supabase
      .from('expense_transactions')
      .select('amount')
      .eq('property_id', propertyId)
      .eq('transaction_type', 'actual')
      .gte('transaction_date', startOfYear)
      .lte('transaction_date', today)

    const totalExpensesYTD = expenseData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Count documents
    const { count: documentCount, error: documentError } = await supabase
      .from('property_documents')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)

    // Count units
    const { count: unitCount, error: unitError } = await supabase
      .from('property_units')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('is_active', true)

    // Get recent transactions (last 5, combined income and expenses)
    const { data: recentIncome } = await supabase
      .from('income_transactions')
      .select('id, transaction_date, description, category, amount, transaction_type')
      .eq('property_id', propertyId)
      .order('transaction_date', { ascending: false })
      .limit(5)

    const { data: recentExpenses } = await supabase
      .from('expense_transactions')
      .select('id, transaction_date, description, category, amount, transaction_type, vendor_name')
      .eq('property_id', propertyId)
      .order('transaction_date', { ascending: false })
      .limit(5)

    // Combine and sort transactions
    const recentTransactions = [
      ...(recentIncome || []).map(t => ({ ...t, type: 'income' as const })),
      ...(recentExpenses || []).map(t => ({ ...t, type: 'expense' as const }))
    ]
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, 5)

    return NextResponse.json({
      property,
      metrics: {
        totalIncomeYTD,
        totalExpensesYTD,
        noiYTD: totalIncomeYTD - totalExpensesYTD,
        documentCount: documentCount || 0,
        unitCount: unitCount || 0
      },
      recentTransactions
    })
  } catch (error) {
    console.error('Overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property overview' },
      { status: 500 }
    )
  }
}
