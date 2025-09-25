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

// Service role client for admin operations
function createServiceSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

// GET /api/user/profile - Get current user profile with stats
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user portfolio and property stats
    const serviceSupabase = createServiceSupabaseClient()
    
    // Get portfolio counts
    const { data: portfolios } = await serviceSupabase
      .from('portfolios')
      .select('id, owner_id')
      .eq('owner_id', userId)

    const { data: memberships } = await serviceSupabase
      .from('portfolio_memberships')
      .select('id, portfolio_id')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)

    // Get property count
    const { data: properties } = await serviceSupabase
      .from('properties')
      .select('id')
      .eq('user_id', userId)

    const stats = {
      portfolios_owned: portfolios?.length || 0,
      portfolios_shared: memberships?.length || 0,
      total_properties: properties?.length || 0
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: (() => {
          const firstName = user.user_metadata?.first_name || ''
          const lastName = user.user_metadata?.last_name || ''

          if (firstName && lastName) {
            return `${firstName} ${lastName}`
          } else if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name
          } else if (firstName) {
            return firstName
          } else {
            return user.user_metadata?.name || ''
          }
        })(),
        avatar_url: user.user_metadata?.avatar_url || null,
        provider: user.app_metadata?.provider || 'email',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      stats
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name } = body

    // Validate input
    if (typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Invalid full_name' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: full_name.trim()
      }
    })

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
        avatar_url: data.user.user_metadata?.avatar_url || null,
        provider: data.user.app_metadata?.provider || 'email',
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}