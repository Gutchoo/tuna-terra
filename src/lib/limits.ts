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
 * Server-side: Check if user can perform property lookups (read-only)
 * @param userId - User ID from auth
 * @param count - Number of lookups to check for (default: 1)
 * @returns Promise<LimitCheckResult>
 */
export async function checkUserLimitsServer(userId: string, count: number = 1): Promise<LimitCheckResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Use atomic database function for checking limits
    const { data, error } = await supabase
      .rpc('check_usage_limits', {
        p_user_id: userId,
        p_check_count: count
      })

    if (error) {
      console.error('Error checking user limits:', error)
      return {
        canProceed: false,
        remaining: 0,
        currentUsed: 0,
        limit: 0,
        tier: 'free',
        resetDate: new Date().toISOString(),
        errorMessage: 'Failed to check user limits'
      }
    }

    const result = data[0]
    const remaining = result.tier === 'pro' ? 999999 : Math.max(0, result.usage_limit - result.current_usage)

    return {
      canProceed: result.can_proceed,
      remaining,
      currentUsed: result.current_usage,
      limit: result.tier === 'pro' ? 999999 : result.usage_limit,
      tier: result.tier as 'free' | 'pro',
      resetDate: result.reset_date
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

    // Use atomic database function for incrementing usage
    const { error } = await supabase
      .rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_increment: count
      })

    if (error) {
      console.error('Error incrementing user usage:', error)
    }
  } catch (error) {
    console.error('Error incrementing user usage:', error)
    // Don't throw - this is tracking, shouldn't break the main flow
  }
}

/**
 * Server-side: Check limits and immediately increment usage if allowed
 * This prevents bypass vulnerabilities by consuming credits when API calls are made
 * @param userId - User ID from auth
 * @param count - Number of lookups to check and increment (default: 1)
 * @returns Promise<LimitCheckResult> - with canProceed=false if limits exceeded
 */
export async function checkAndIncrementUsageServer(userId: string, count: number = 1): Promise<LimitCheckResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Use atomic database function that checks and increments in one transaction
    const { data, error } = await supabase
      .rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_increment: count
      })

    if (error) {
      console.error('Error checking and incrementing usage:', error)
      return {
        canProceed: false,
        remaining: 0,
        currentUsed: 0,
        limit: 0,
        tier: 'free',
        resetDate: new Date().toISOString(),
        errorMessage: 'Failed to check and increment usage'
      }
    }

    const result = data[0]
    const remaining = result.tier === 'pro' ? 999999 : Math.max(0, result.usage_limit - result.current_usage)

    return {
      canProceed: result.can_proceed,
      remaining,
      currentUsed: result.current_usage,
      limit: result.tier === 'pro' ? 999999 : result.usage_limit,
      tier: result.tier as 'free' | 'pro',
      resetDate: result.reset_date
    }
  } catch (error) {
    console.error('Error checking and incrementing usage:', error)
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