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

// POST /api/users/ensure-default-portfolio - Ensure user has a default portfolio
export async function POST() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Check if user already has a default portfolio
    const { data: existingDefault } = await supabase
      .from('portfolios')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('is_default', true)
      .single()

    if (existingDefault) {
      return NextResponse.json({ 
        message: 'Default portfolio already exists',
        portfolio: existingDefault,
        created: false
      })
    }

    // Get user info for portfolio name
    const { data: { user } } = await supabase.auth.getUser()

    // Extract first name from user metadata, fallback to email or generic name
    let firstName = user?.user_metadata?.first_name || ''

    // If no first_name in metadata, try to extract from full_name (Google OAuth)
    if (!firstName && user?.user_metadata?.full_name) {
      firstName = user.user_metadata.full_name.split(' ')[0]
    }

    // Final fallback
    if (!firstName) {
      firstName = user?.email?.split('@')[0] || `User ${userId.substring(0, 8)}`
    }

    // Create default portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        name: `${firstName}'s Portfolio`,
        description: 'Default portfolio created automatically',
        owner_id: userId,
        is_default: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating default portfolio:', error)
      return NextResponse.json({ 
        error: 'Failed to create default portfolio',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Default portfolio created successfully',
      portfolio,
      created: true
    }, { status: 201 })
  } catch (error) {
    console.error('Ensure default portfolio error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}