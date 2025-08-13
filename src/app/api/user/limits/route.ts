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
    
    // Get user limits, create if doesn't exist
    const userLimitsResult = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    let userLimits = userLimitsResult.data
    const error = userLimitsResult.error

    if (error && error.code === 'PGRST116') {
      // No limits found, create default
      const { data: newLimits, error: createError } = await supabase
        .from('user_limits')
        .insert({
          user_id: userId,
          tier: 'free',
          property_lookups_used: 0,
          property_lookups_limit: 25
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user limits:', createError)
        return NextResponse.json({ error: 'Failed to create user limits' }, { status: 500 })
      }
      userLimits = newLimits
    } else if (error) {
      console.error('Error fetching user limits:', error)
      return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 })
    }

    // Check if reset is needed (monthly reset)
    const now = new Date()
    const resetDate = new Date(userLimits!.reset_date)
    
    if (now >= resetDate) {
      // Reset usage and update reset date
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      
      const { data: updatedLimits, error: updateError } = await supabase
        .from('user_limits')
        .update({
          property_lookups_used: 0,
          reset_date: nextMonth.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Error resetting user limits:', updateError)
        return NextResponse.json({ error: 'Failed to reset user limits' }, { status: 500 })
      }
      userLimits = updatedLimits
    }

    return NextResponse.json({
      limits: userLimits
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

    // Get current limits
    const { data: currentLimits, error: fetchError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching current limits:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current limits' }, { status: 500 })
    }

    // Check if reset is needed first
    const now = new Date()
    const resetDate = new Date(currentLimits.reset_date)
    
    let currentUsed = currentLimits.property_lookups_used
    if (now >= resetDate) {
      currentUsed = 0 // Usage resets
    }

    // Calculate new usage
    const newUsage = currentUsed + increment
    const nextMonth = now >= resetDate 
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(currentLimits.reset_date)

    // Update usage
    const { data: updatedLimits, error: updateError } = await supabase
      .from('user_limits')
      .update({
        property_lookups_used: newUsage,
        reset_date: nextMonth.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user limits:', updateError)
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
    }

    return NextResponse.json({
      limits: updatedLimits,
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

    // Get current limits
    const { data: limits, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching limits for check:', error)
      return NextResponse.json({ error: 'Failed to fetch limits' }, { status: 500 })
    }

    // Check if reset is needed
    const now = new Date()
    const resetDate = new Date(limits.reset_date)
    const currentUsed = now >= resetDate ? 0 : limits.property_lookups_used

    // For pro tier, allow unlimited (or very high limit)
    const effectiveLimit = limits.tier === 'pro' ? 999999 : limits.property_lookups_limit

    const canProceed = (currentUsed + count) <= effectiveLimit
    const remaining = Math.max(0, effectiveLimit - currentUsed)

    return NextResponse.json({
      canProceed,
      remaining,
      currentUsed,
      limit: effectiveLimit,
      tier: limits.tier,
      resetDate: limits.reset_date
    })
  } catch (error) {
    console.error('User limits check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}