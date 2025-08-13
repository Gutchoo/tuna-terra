import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface LimitCheckResult {
  canProceed: boolean
  remaining: number
  currentUsed: number
  limit: number
  tier: 'free' | 'pro'
  resetDate: string
  errorMessage?: string
}

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
      },
    }
  )
}

/**
 * Server-side: Check if user can perform property lookups
 * @param userId - User ID from auth
 * @param count - Number of lookups to check for (default: 1)
 * @returns Promise<LimitCheckResult>
 */
export async function checkUserLimitsServer(userId: string, count: number = 1): Promise<LimitCheckResult> {
  try {
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
        return {
          canProceed: false,
          remaining: 0,
          currentUsed: 0,
          limit: 0,
          tier: 'free',
          resetDate: new Date().toISOString(),
          errorMessage: 'Failed to create user limits'
        }
      }
      userLimits = newLimits
    } else if (error) {
      console.error('Error fetching user limits:', error)
      return {
        canProceed: false,
        remaining: 0,
        currentUsed: 0,
        limit: 0,
        tier: 'free',
        resetDate: new Date().toISOString(),
        errorMessage: 'Failed to fetch user limits'
      }
    }

    // Check if reset is needed (monthly reset)
    const now = new Date()
    const resetDate = new Date(userLimits!.reset_date)
    
    let currentUsed = userLimits!.property_lookups_used
    if (now >= resetDate) {
      currentUsed = 0 // Usage resets
    }

    // For pro tier, allow unlimited (or very high limit)
    const effectiveLimit = userLimits!.tier === 'pro' ? 999999 : userLimits!.property_lookups_limit

    const canProceed = (currentUsed + count) <= effectiveLimit
    const remaining = Math.max(0, effectiveLimit - currentUsed)

    return {
      canProceed,
      remaining,
      currentUsed,
      limit: effectiveLimit,
      tier: userLimits!.tier,
      resetDate: userLimits!.reset_date
    }
  } catch (error) {
    console.error('Error checking user limits:', error)
    return {
      canProceed: false,
      remaining: 0,
      currentUsed: 0,
      limit: 0,
      tier: 'free',
      resetDate: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Server-side: Increment user's property lookup usage
 * @param userId - User ID from auth
 * @param count - Number of lookups to increment (default: 1)
 */
export async function incrementUserUsageServer(userId: string, count: number = 1): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current limits
    const { data: currentLimits, error: fetchError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching current limits for increment:', fetchError)
      return
    }

    // Check if reset is needed first
    const now = new Date()
    const resetDate = new Date(currentLimits.reset_date)
    
    let currentUsed = currentLimits.property_lookups_used
    if (now >= resetDate) {
      currentUsed = 0 // Usage resets
    }

    // Calculate new usage
    const newUsage = currentUsed + count
    const nextMonth = now >= resetDate 
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(currentLimits.reset_date)

    // Update usage
    const { error: updateError } = await supabase
      .from('user_limits')
      .update({
        property_lookups_used: newUsage,
        reset_date: nextMonth.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating user usage:', updateError)
    }
  } catch (error) {
    console.error('Error incrementing user usage:', error)
    // Don't throw - this is tracking, shouldn't break the main flow
  }
}

/**
 * Create a standardized limit exceeded error response
 */
export function createLimitExceededResponse(limitCheck: LimitCheckResult) {
  const resetDate = new Date(limitCheck.resetDate).toLocaleDateString()
  
  return {
    error: 'Property lookup limit exceeded',
    message: `You've reached your monthly limit of ${limitCheck.limit} property lookups. Your usage resets on ${resetDate}. Upgrade to Pro for unlimited lookups.`,
    details: {
      tier: limitCheck.tier,
      used: limitCheck.currentUsed,
      limit: limitCheck.limit,
      resetDate: limitCheck.resetDate
    }
  }
}