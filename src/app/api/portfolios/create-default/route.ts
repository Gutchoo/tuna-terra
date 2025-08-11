import { NextRequest, NextResponse } from 'next/server'
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

// POST /api/portfolios/create-default - Manually create default portfolio
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Check if user already has a default portfolio
    const { data: existingDefault } = await supabase
      .from('portfolios')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_default', true)
      .single()

    if (existingDefault) {
      return NextResponse.json({ 
        message: 'Default portfolio already exists',
        portfolio: existingDefault 
      })
    }

    // Get user email for portfolio name
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'User'

    // Create default portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        name: `${userEmail}'s Portfolio`,
        description: 'Default portfolio created automatically',
        owner_id: userId,
        is_default: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating default portfolio:', error)
      return NextResponse.json({ error: 'Failed to create default portfolio' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Default portfolio created successfully',
      portfolio 
    }, { status: 201 })
  } catch (error) {
    console.error('Create default portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}