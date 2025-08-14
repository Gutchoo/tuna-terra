import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AtomicLimitResult {
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
 * Atomic check and increment - prevents race conditions
 * This is the ONLY function that should be used for actual property lookups
 * @param userId - User ID from auth
 * @param count - Number of lookups to check and increment (default: 1)
 * @returns Promise<AtomicLimitResult>
 */
export async function atomicCheckAndIncrement(userId: string, count: number = 1): Promise<AtomicLimitResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Use atomic database function that checks and increments in one transaction
    const { data, error } = await supabase
      .rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_increment: count
      })

    if (error) {
      console.error('Error in atomic check and increment:', error)
      return {
        canProceed: false,
        remaining: 0,
        currentUsed: 0,
        limit: 0,
        tier: 'free',
        resetDate: new Date().toISOString(),
        errorMessage: 'Failed to process request'
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
    console.error('Error in atomic check and increment:', error)
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
export function createAtomicLimitExceededResponse(limitResult: AtomicLimitResult) {
  const resetDate = new Date(limitResult.resetDate).toLocaleDateString()
  
  return {
    error: 'Property lookup limit exceeded',
    message: `You've reached your monthly limit of ${limitResult.limit} property lookups. Your usage resets on ${resetDate}. Upgrade to Pro for unlimited lookups.`,
    details: {
      tier: limitResult.tier,
      used: limitResult.currentUsed,
      limit: limitResult.limit,
      resetDate: limitResult.resetDate
    }
  }
}