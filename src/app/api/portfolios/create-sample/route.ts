import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// POST /api/portfolios/create-sample - Create sample portfolio for existing user (testing)
export async function POST() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Check if user already has a sample portfolio
    const { data: existingSample } = await supabase
      .from('portfolios')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('is_sample', true)
      .single()

    if (existingSample) {
      return NextResponse.json({ 
        message: 'Sample portfolio already exists',
        portfolio: existingSample,
        created: false
      })
    }

    // Get user info for portfolio creation
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || `User ${userId.substring(0, 8)}`

    // Call the database function to create sample portfolio
    const { data: result, error } = await supabase
      .rpc('create_sample_portfolio_for_user', {
        p_user_id: userId,
        p_user_email: userEmail
      })

    if (error) {
      console.error('Error creating sample portfolio:', error)
      return NextResponse.json({ 
        error: 'Failed to create sample portfolio',
        details: error.message 
      }, { status: 500 })
    }

    // Get the created portfolio details
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', result)
      .single()

    return NextResponse.json({ 
      message: 'Sample portfolio created successfully',
      portfolio,
      created: true
    }, { status: 201 })
  } catch (error) {
    console.error('Create sample portfolio error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}