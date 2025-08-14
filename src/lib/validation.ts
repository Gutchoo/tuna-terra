import { z } from 'zod'

/**
 * Enhanced validation schemas with security considerations
 */

// Address validation
export const addressSchema = z.string()
  .min(5, 'Address must be at least 5 characters')
  .max(500, 'Address must be less than 500 characters')
  .regex(/^[a-zA-Z0-9\s\-\#\.,&'()]+$/, 'Address contains invalid characters')
  .transform(s => s.trim())

// APN validation
export const apnSchema = z.string()
  .min(3, 'APN must be at least 3 characters')
  .max(50, 'APN must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\-]+$/, 'APN can only contain letters, numbers, and hyphens')
  .transform(s => s.trim().toUpperCase())

// City validation
export const citySchema = z.string()
  .min(1, 'City must be at least 1 character')
  .max(100, 'City must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'City contains invalid characters')
  .transform(s => s.trim())
  .optional()

// State validation (2-letter US state codes)
export const stateSchema = z.string()
  .length(2, 'State must be exactly 2 characters')
  .regex(/^[A-Z]{2}$/, 'State must be a valid 2-letter code')
  .transform(s => s.trim().toUpperCase())
  .optional()

// ZIP code validation
export const zipSchema = z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
  .transform(s => s.trim())
  .optional()

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Search query validation
export const searchQuerySchema = z.string()
  .min(2, 'Search query must be at least 2 characters')
  .max(200, 'Search query must be less than 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\#\.,&'()]+$/, 'Search query contains invalid characters')
  .transform(s => s.trim())

// Notes validation
export const notesSchema = z.string()
  .max(2000, 'Notes must be less than 2000 characters')
  .transform(s => s.trim())
  .optional()

// Tags validation
export const tagsSchema = z.array(
  z.string()
    .min(1, 'Tag cannot be empty')
    .max(50, 'Tag must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag contains invalid characters')
    .transform(s => s.trim())
).max(20, 'Maximum 20 tags allowed').optional()

/**
 * Comprehensive property lookup validation
 */
export const propertyLookupSchema = z.object({
  address: addressSchema.optional(),
  apn: apnSchema.optional(),
  city: citySchema,
  state: stateSchema,
  zip_code: zipSchema,
}).refine(
  data => data.address || data.apn,
  {
    message: "Either address or APN must be provided",
    path: ["address"]
  }
)

/**
 * Property search validation
 */
export const propertySearchSchema = z.object({
  query: searchQuerySchema.optional(),
  apn: apnSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema,
  state: stateSchema,
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).refine(
  data => data.query || data.apn || data.address,
  {
    message: "At least one search parameter must be provided",
    path: ["query"]
  }
)

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Generic error response creator
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
) {
  let message = defaultMessage
  
  if (error instanceof z.ZodError) {
    message = error.issues[0]?.message || 'Validation error'
  } else if (error instanceof Error) {
    // Don't expose internal error messages in production
    if (process.env.NODE_ENV === 'development') {
      message = error.message
    } else {
      // Only expose certain safe error messages
      const safeMessages = [
        'Unauthorized',
        'Rate limit exceeded',
        'Property lookup limit exceeded',
        'Portfolio not found',
        'Access denied',
        'Validation error'
      ]
      
      if (safeMessages.some(safe => error.message.includes(safe))) {
        message = error.message
      }
    }
  }
  
  return {
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      debug: error instanceof Error ? error.stack : String(error) 
    })
  }
}

/**
 * Rate limit validation
 */
export function validateRateLimitConfig(config: {
  windowMs?: number
  maxRequests?: number
}): { windowMs: number; maxRequests: number } {
  return {
    windowMs: Math.max(1000, Math.min(config.windowMs || 60000, 3600000)), // 1 second to 1 hour
    maxRequests: Math.max(1, Math.min(config.maxRequests || 30, 1000)) // 1 to 1000 requests
  }
}