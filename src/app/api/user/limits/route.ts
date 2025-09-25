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

// Service role client for admin operations (unused in this file but kept for potential future use)
// function createServiceSupabaseClient() {
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     {
//       cookies: {
//         get() { return undefined },
//         set() {},
//         remove() {},
//       },
//     }
//   )
// }

// GET /api/user/limits - Get current user's limits and usage
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Use the enhanced database function for consistent limit checking
    const { data, error } = await supabase
      .rpc('check_usage_limits', {
        p_user_id: userId,
        p_check_count: 0 // Just checking current status
      })

    if (error) {
      console.error('Error checking user limits:', error)
      return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 })
    }

    const result = data[0]
    if (!result) {
      return NextResponse.json({ error: 'No limits data returned' }, { status: 500 })
    }

    // Also get the full user_limits record for additional info
    const { data: fullRecord, error: recordError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (recordError && recordError.code !== 'PGRST116') {
      console.error('Error fetching full user record:', recordError)
      // Continue without full record - we have the essential data from the function
    }

    return NextResponse.json({
      limits: {
        // Essential data from the function
        property_lookups_used: result.current_usage,
        property_lookups_limit: result.usage_limit,
        total_lookups_lifetime: result.total_lifetime,
        tier: result.tier,
        reset_date: result.reset_date,
        can_proceed: result.can_proceed,
        // Additional data from full record if available
        ...(fullRecord ? {
          user_id: fullRecord.user_id,
          created_at: fullRecord.created_at,
          updated_at: fullRecord.updated_at,
          join_date: fullRecord.join_date
        } : {})
      }
    })
  } catch (error) {
    console.error('User limits GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/limits - Increment usage counter
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { increment = 1 } = body

    if (typeof increment !== 'number' || increment < 0) {
      return NextResponse.json({ error: 'Invalid increment value' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Use the enhanced database function for atomic increment with all logic
    const { data, error } = await supabase
      .rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_increment: increment
      })

    if (error) {
      console.error('Error incrementing user usage:', error)
      return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 })
    }

    const result = data[0]
    if (!result) {
      return NextResponse.json({ error: 'No result returned from increment' }, { status: 500 })
    }

    // Check if the increment was successful
    if (!result.can_proceed) {
      return NextResponse.json({
        error: 'Usage limit exceeded',
        limits: {
          property_lookups_used: result.current_usage,
          property_lookups_limit: result.usage_limit,
          total_lookups_lifetime: result.total_lifetime,
          tier: result.tier,
          reset_date: result.reset_date,
          can_proceed: result.can_proceed
        }
      }, { status: 429 }) // Too Many Requests
    }

    return NextResponse.json({
      limits: {
        property_lookups_used: result.current_usage,
        property_lookups_limit: result.usage_limit,
        total_lookups_lifetime: result.total_lifetime,
        tier: result.tier,
        reset_date: result.reset_date,
        can_proceed: result.can_proceed
      },
      incremented: increment
    })
  } catch (error) {
    console.error('User limits POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/limits/check - Check if user can make a lookup (without incrementing)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { count = 1 } = body

    if (typeof count !== 'number' || count < 0) {
      return NextResponse.json({ error: 'Invalid count value' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Use the enhanced database function for consistent checking
    const { data, error } = await supabase
      .rpc('check_usage_limits', {
        p_user_id: userId,
        p_check_count: count
      })

    if (error) {
      console.error('Error checking usage limits:', error)
      return NextResponse.json({ error: 'Failed to check limits' }, { status: 500 })
    }

    const result = data[0]
    if (!result) {
      return NextResponse.json({ error: 'No result returned from check' }, { status: 500 })
    }

    // Calculate remaining lookups
    const effectiveLimit = result.tier === 'pro' ? 999999 : result.usage_limit
    const remaining = Math.max(0, effectiveLimit - result.current_usage)

    return NextResponse.json({
      canProceed: result.can_proceed,
      remaining,
      currentUsed: result.current_usage,
      limit: result.usage_limit,
      totalLifetime: result.total_lifetime,
      tier: result.tier,
      resetDate: result.reset_date
    })
  } catch (error) {
    console.error('User limits check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}