import { NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  error?: string
}

// Default rate limit configurations
const DEFAULT_CONFIGS = {
  strict: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  normal: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  lenient: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
}


/**
 * Simple in-memory rate limiter for development/testing
 * In production, use Redis or database-backed rate limiting
 */
class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()
  
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    
    // Clean up old entries
    for (const [k, v] of this.store.entries()) {
      if (v.resetTime < now) {
        this.store.delete(k)
      }
    }
    
    const record = this.store.get(key)
    const resetTime = Math.floor((now + config.windowMs) / 1000)
    
    if (!record || record.resetTime < now) {
      // First request in window or window has reset
      this.store.set(key, { count: 1, resetTime: now + config.windowMs })
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime
      }
    }
    
    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: Math.floor(record.resetTime / 1000),
        error: 'Rate limit exceeded'
      }
    }
    
    // Increment count
    record.count++
    this.store.set(key, record)
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.count,
      resetTime
    }
  }
}

const memoryLimiter = new MemoryRateLimiter()

/**
 * Check rate limit for a user/IP combination
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_CONFIGS.normal
): Promise<RateLimitResult> {
  try {
    const key = `${identifier}:${endpoint}`
    return memoryLimiter.check(key, config)
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow the request through
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Math.floor((Date.now() + config.windowMs) / 1000)
    }
  }
}

/**
 * Middleware function to apply rate limiting to API routes
 */
export async function applyRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_CONFIGS.normal
): Promise<NextResponse | null> {
  const result = await checkRateLimit(identifier, endpoint, config)
  
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${Math.ceil((result.resetTime * 1000 - Date.now()) / 1000)} seconds.`,
        details: {
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.resetTime
        }
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime * 1000 - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  return null // No rate limit exceeded, continue
}

/**
 * Get rate limit headers for successful responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString()
  }
}

export { DEFAULT_CONFIGS }