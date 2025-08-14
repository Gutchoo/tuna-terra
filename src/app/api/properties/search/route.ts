import { NextRequest, NextResponse } from 'next/server'
import { RegridService } from '@/lib/regrid'
import { getUserId } from '@/lib/auth'
import { checkAndIncrementUsageServer, createLimitExceededResponse } from '@/lib/limits'
import { applyRateLimit, DEFAULT_CONFIGS } from '@/lib/rateLimiter'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting for search API calls
    const rateLimitResponse = await applyRateLimit(userId, 'property-search', DEFAULT_CONFIGS.normal)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { searchParams } = new URL(request.url)
    const apn = searchParams.get('apn')
    const address = searchParams.get('address')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!apn && !address) {
      return NextResponse.json(
        { error: 'Either APN or address is required' }, 
        { status: 400 }
      )
    }

    // Check limits and immediately increment usage - prevents bypass vulnerabilities
    const limitCheck = await checkAndIncrementUsageServer(userId, 1)
    if (!limitCheck.canProceed) {
      return NextResponse.json(
        createLimitExceededResponse(limitCheck),
        { status: 429 }
      )
    }

    let results

    if (apn) {
      // Search by APN
      const property = await RegridService.searchByAPN(apn, state || undefined)
      results = property ? [property] : []
    } else if (address) {
      // Search by address for autocomplete
      results = await RegridService.searchByAddress(
        address, 
        city || undefined, 
        state || undefined,
        limit
      )
    }

    // Note: Usage has already been incremented above to prevent bypass vulnerabilities
    // This ensures credits are consumed when expensive Regrid API calls are made

    return NextResponse.json({ 
      results,
      usage: limitCheck.canProceed ? {
        used: limitCheck.currentUsed,
        limit: limitCheck.limit,
        remaining: limitCheck.remaining
      } : undefined
    })
  } catch (error) {
    console.error('Property search error:', error)
    return NextResponse.json(
      { error: 'Failed to search properties' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { apns, addresses } = body

    if (!apns && !addresses) {
      return NextResponse.json(
        { error: 'Either apns or addresses array is required' }, 
        { status: 400 }
      )
    }

    const batchSize = apns ? apns.length : addresses ? addresses.length : 0
    
    // Check limits and immediately increment usage for batch operation
    const limitCheck = await checkAndIncrementUsageServer(userId, batchSize)
    if (!limitCheck.canProceed) {
      return NextResponse.json(
        createLimitExceededResponse(limitCheck),
        { status: 429 }
      )
    }

    let results: unknown[] = []

    if (apns && Array.isArray(apns)) {
      // Batch search by APNs
      results = await RegridService.batchSearchByAPNs(apns, body.state)
    } else if (addresses && Array.isArray(addresses)) {
      // Batch search by addresses
      results = await RegridService.batchSearchByAddresses(addresses)
    }

    // Note: Usage has already been incremented above to prevent bypass vulnerabilities
    // This ensures credits are consumed when expensive Regrid API calls are made

    return NextResponse.json({ 
      results,
      usage: {
        used: limitCheck.currentUsed,
        limit: limitCheck.limit,
        remaining: limitCheck.remaining
      }
    })
  } catch (error) {
    console.error('Batch property search error:', error)
    return NextResponse.json(
      { error: 'Failed to search properties' }, 
      { status: 500 }
    )
  }
}