import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { RegridService, type RegridProperty } from '@/lib/regrid'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Property } from '@/lib/supabase'
import { checkUserLimitsServer, incrementUserUsageServer, createLimitExceededResponse } from '@/lib/limits'

// Utility function to clean APN by removing all dashes
function cleanAPN(apn: string | null | undefined): string | null {
  if (!apn) return null
  return apn.replace(/-/g, '')
}

const createPropertySchema = z.object({
  regrid_id: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : undefined),
  apn: z.string().optional(),
  address: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  portfolio_id: z.string().uuid().optional(), // Add portfolio_id support
  user_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  insurance_provider: z.string().optional(),
  maintenance_history: z.string().optional(),
})

const bulkCreateSchema = z.object({
  properties: z.array(createPropertySchema),
  source: z.enum(['csv', 'manual', 'api']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const portfolioId = searchParams.get('portfolio_id') // Add portfolio filtering

    const filters = {
      city: city || undefined,
      state: state || undefined,
      tags: tags || undefined,
      search: search || undefined,
      portfolio_id: portfolioId || undefined
    }

    // Get user's accessible portfolios first
    const cookieStore = await cookies()
    const supabase = await createServerClient(
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

    // Get portfolios user owns (RLS works for portfolios)
    const { data: ownedPortfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('owner_id', userId)

    // Get portfolios user is a member of using service role (portfolio_memberships has no RLS)
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    )
    
    const { data: memberships } = await serviceSupabase
      .from('portfolio_memberships')
      .select('portfolio_id')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)

    // Combine and deduplicate accessible portfolio IDs
    const ownedIds = (ownedPortfolios || []).map(p => p.id)
    const memberIds = (memberships || []).map(m => m.portfolio_id)
    const accessiblePortfolioIds = [...new Set([...ownedIds, ...memberIds])]

    // If user has no accessible portfolios, return empty result
    if (accessiblePortfolioIds.length === 0) {
      return NextResponse.json({ properties: [] })
    }

    // If portfolio filter is specified, verify user has access
    if (portfolioId && !accessiblePortfolioIds.includes(portfolioId)) {
      return NextResponse.json({ error: 'Portfolio not found or access denied' }, { status: 403 })
    }

    // Use service role to get properties from accessible portfolios
    let query = serviceSupabase
      .from('properties')
      .select('*')
      .in('portfolio_id', accessiblePortfolioIds)

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`)
    }
    if (filters.search) {
      query = query.or(`address.ilike.%${filters.search}%,owner.ilike.%${filters.search}%,apn.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
    }
    if (filters.portfolio_id) {
      query = query.eq('portfolio_id', filters.portfolio_id)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    query = query.order('created_at', { ascending: false })

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    // Debug logging to track what properties are returned
    console.log(`[DEBUG] API Response for user ${userId}:`)
    console.log(`[DEBUG] Requested portfolio: ${portfolioId || 'ALL'}`)
    console.log(`[DEBUG] Accessible portfolios: [${accessiblePortfolioIds.join(', ')}]`)
    console.log(`[DEBUG] Properties returned: ${properties?.length || 0}`)
    if (properties && properties.length > 0) {
      const portfolioBreakdown = properties.reduce((acc: Record<string, number>, prop: { portfolio_id: string }) => {
        acc[prop.portfolio_id] = (acc[prop.portfolio_id] || 0) + 1
        return acc
      }, {})
      console.log(`[DEBUG] Properties by portfolio:`, portfolioBreakdown)
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error) {
    console.error('Get user properties error:', error)
    return NextResponse.json(
      { error: 'Failed to get properties' },
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

    // Check if this is a bulk create or single property create
    if (body.properties && Array.isArray(body.properties)) {
      return handleBulkCreate(userId, body)
    } else {
      return handleSingleCreate(userId, body)
    }
  } catch (error) {
    console.error('Create property error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create property'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific error types
      if (error.message.includes('validation')) {
        statusCode = 400
      } else if (error.message.includes('Unauthorized')) {
        statusCode = 401
      } else if (error.message.includes('RLS policy')) {
        statusCode = 403
        errorMessage = 'Authentication issue - please sign out and back in'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

async function handleSingleCreate(userId: string, body: unknown) {
  console.log('handleSingleCreate - received body:', JSON.stringify(body, null, 2))
  
  const validatedData = createPropertySchema.parse(body)
  console.log('handleSingleCreate - validated data:', JSON.stringify(validatedData, null, 2))

  // Determine the target portfolio
  let targetPortfolioId = validatedData.portfolio_id
  
  if (!targetPortfolioId) {
    // If no portfolio specified, get user's default portfolio
    console.log('handleSingleCreate - no portfolio specified, finding default portfolio')
    const cookieStore = await cookies()
    const supabase = await createServerClient(
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
    
    const { data: defaultPortfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_default', true)
      .single()
    
    if (defaultPortfolio) {
      targetPortfolioId = defaultPortfolio.id
      console.log('handleSingleCreate - using default portfolio:', targetPortfolioId)
    } else {
      // Create default portfolio automatically
      console.log('handleSingleCreate - no default portfolio found, creating one')
      
      // Get user email for portfolio name
      const { data: { user } } = await supabase.auth.getUser()
      const userEmail = user?.email || 'User'

      const { data: newPortfolio, error: createError } = await supabase
        .from('portfolios')
        .insert({
          name: `${userEmail}'s Portfolio`,
          description: 'Default portfolio created automatically',
          owner_id: userId,
          is_default: true,
        })
        .select()
        .single()

      if (createError || !newPortfolio) {
        console.error('handleSingleCreate - failed to create default portfolio:', createError)
        throw new Error('Failed to create default portfolio. Please try again.')
      }

      targetPortfolioId = newPortfolio.id
      console.log('handleSingleCreate - created default portfolio:', targetPortfolioId)
    }
  } else {
    // Verify user has editor access to the specified portfolio
    console.log('handleSingleCreate - verifying portfolio access:', targetPortfolioId)
    const cookieStore = await cookies()
    const supabase = await createServerClient(
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
    
    // Check if user owns the portfolio
    const { data: ownedPortfolio } = await supabase
      .from('portfolios')
      .select('owner_id')
      .eq('id', targetPortfolioId)
      .eq('owner_id', userId)
      .single()

    // Check if user is a member of the portfolio  
    const { data: membershipData } = await supabase
      .from('portfolio_memberships')
      .select('role, accepted_at')
      .eq('portfolio_id', targetPortfolioId)
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)
      .single()
    
    if (!ownedPortfolio && !membershipData) {
      throw new Error('Portfolio not found or access denied')
    }
    
    const userRole = ownedPortfolio ? 'owner' : membershipData?.role
    
    if (!userRole || !['owner', 'editor'].includes(userRole)) {
      throw new Error('Insufficient permissions to add properties to this portfolio')
    }
  }

  // Check user limits before making Regrid API calls
  const limitCheck = await checkUserLimitsServer(userId, 1)
  if (!limitCheck.canProceed) {
    throw new Error(`Property lookup limit exceeded. You've used ${limitCheck.currentUsed}/${limitCheck.limit} lookups this month.`)
  }

  let regridData: RegridProperty | null = null
  let apiCallMade = false

  // Always fetch Regrid data to get rich property information
  if (validatedData.apn) {
    console.log('handleSingleCreate - fetching by APN:', validatedData.apn)
    regridData = await RegridService.searchByAPN(validatedData.apn, validatedData.state)
    apiCallMade = true
  } else if (validatedData.address) {
    console.log('handleSingleCreate - searching by address')
    // Search by address
    const searchResults = await RegridService.searchByAddress(
      validatedData.address,
      validatedData.city,
      validatedData.state,
      1
    )
    if (searchResults.length > 0 && searchResults[0]._fullFeature) {
      console.log('handleSingleCreate - found address results, using full feature data')
      regridData = RegridService.normalizeProperty(searchResults[0]._fullFeature)
    }
    apiCallMade = true
  }

  // Prepare property data for database
  // Note: user_id will be automatically set by database DEFAULT auth.uid() 
  console.log('handleSingleCreate - preparing property data')
  const propertyData = {
    regrid_id: regridData?.id || null,
    apn: cleanAPN(regridData?.apn || validatedData.apn),
    address: regridData?.address?.line1 || validatedData.address,
    city: regridData?.address?.city || validatedData.city || null,
    state: regridData?.address?.state || validatedData.state || null,
    zip_code: regridData?.address?.zip || validatedData.zip_code || null,
    geometry: regridData?.geometry || null,
    lat: regridData?.centroid?.lat || null,
    lng: regridData?.centroid?.lng || null,
    
    // Enhanced property data from Regrid API
    year_built: regridData?.properties?.year_built || null,
    owner: regridData?.properties?.owner || null,
    last_sale_price: regridData?.properties?.last_sale_price || null,
    sale_date: regridData?.properties?.sale_date || null,
    county: regridData?.properties?.county || null,
    qoz_status: regridData?.properties?.qoz_status || null,
    improvement_value: regridData?.properties?.improvement_value || null,
    land_value: regridData?.properties?.land_value || null,
    assessed_value: regridData?.properties?.assessed_value || null,
    
    // Extended property details from Regrid API
    use_code: regridData?.properties?.use_code || null,
    use_description: regridData?.properties?.use_description || null,
    zoning: regridData?.properties?.zoning || null,
    zoning_description: regridData?.properties?.zoning_description || null,
    num_stories: regridData?.properties?.num_stories || null,
    num_units: regridData?.properties?.num_units || null,
    num_rooms: regridData?.properties?.num_rooms || null,
    subdivision: regridData?.properties?.subdivision || null,
    lot_size_acres: regridData?.properties?.lot_acres || null,
    lot_size_sqft: regridData?.properties?.lot_size_sqft || null,
    
    // Financial & tax data
    tax_year: regridData?.properties?.tax_year || null,
    parcel_value_type: regridData?.properties?.parcel_value_type || null,
    
    // Location data
    census_tract: regridData?.properties?.census_tract || null,
    census_block: regridData?.properties?.census_block || null,
    qoz_tract: regridData?.properties?.qoz_tract || null,
    
    // Data freshness tracking
    last_refresh_date: regridData?.properties?.last_refresh_date || null,
    regrid_updated_at: regridData?.properties?.regrid_updated_at || null,
    
    // Owner mailing address
    owner_mailing_address: regridData?.properties?.owner_mailing_address || null,
    owner_mail_city: regridData?.properties?.owner_mail_city || null,
    owner_mail_state: regridData?.properties?.owner_mail_state || null,
    owner_mail_zip: regridData?.properties?.owner_mail_zip || null,
    
    property_data: regridData || null,
    portfolio_id: targetPortfolioId || null, // Assign property to portfolio
    user_notes: validatedData.user_notes || null,
    tags: validatedData.tags || null,
    insurance_provider: validatedData.insurance_provider || null,
    maintenance_history: validatedData.maintenance_history || null,
  }
  
  console.log('handleSingleCreate - property data prepared:', JSON.stringify(propertyData, null, 2))

  try {
    // Server-side duplicate check as additional safeguard - only check within the same portfolio
    if (propertyData.apn) {
      console.log('handleSingleCreate - checking for duplicate APN within portfolio:', propertyData.apn, 'in portfolio:', targetPortfolioId)
      const existingProperties = await DatabaseService.getFilteredProperties(userId, {
        search: propertyData.apn,
        portfolio_id: targetPortfolioId
      })
      
      const exactMatch = existingProperties.find(
        property => property.apn?.toLowerCase() === propertyData.apn?.toLowerCase()
      )
      
      if (exactMatch) {
        console.log('handleSingleCreate - duplicate APN found within same portfolio, rejecting creation')
        throw new Error('A property with this APN already exists in this portfolio')
      }
    }
    
    console.log('handleSingleCreate - creating property in database')
    const property = await DatabaseService.createProperty(propertyData as unknown as Omit<Property, "id" | "user_id" | "created_at" | "updated_at">)
    console.log('handleSingleCreate - property created successfully:', property.id)
    
    if (!property) {
      throw new Error('Property creation returned null - possible RLS policy issue')
    }
    
    // Increment usage counter if we made an API call and property was created successfully
    if (apiCallMade) {
      await incrementUserUsageServer(userId, 1)
    }
    
    return NextResponse.json({ property })
  } catch (dbError) {
    console.error('handleSingleCreate - database error:', dbError)
    console.error('handleSingleCreate - failed property data:', JSON.stringify(propertyData, null, 2))
    
    const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'
    throw new Error(`Database error: ${errorMessage}`)
  }
}

async function handleBulkCreate(userId: string, body: unknown) {
  const validatedData = bulkCreateSchema.parse(body)
  const { properties, source } = validatedData

  // Check user limits for the entire batch
  const limitCheck = await checkUserLimitsServer(userId, properties.length)
  if (!limitCheck.canProceed) {
    return NextResponse.json(
      createLimitExceededResponse(limitCheck),
      { status: 429 }
    )
  }

  const results = []
  const errors = []
  let apiCallsUsed = 0

  for (const [index, propertyInput] of properties.entries()) {
    try {
      const property = await createSinglePropertyFromInput(userId, propertyInput)
      results.push(property)
      apiCallsUsed++ // Count each successful property creation
    } catch (error) {
      console.error(`Error creating property at index ${index}:`, error)
      errors.push({
        index,
        input: propertyInput,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Increment usage by number of successful API calls
  if (apiCallsUsed > 0) {
    await incrementUserUsageServer(userId, apiCallsUsed)
  }

  return NextResponse.json({
    created: results,
    errors,
    summary: {
      total: properties.length,
      successful: results.length,
      failed: errors.length,
      source
    },
    usage: {
      used: limitCheck.currentUsed + apiCallsUsed,
      limit: limitCheck.limit,
      remaining: limitCheck.remaining - apiCallsUsed
    }
  })
}

async function createSinglePropertyFromInput(userId: string, input: unknown) {
  const validatedInput = createPropertySchema.parse(input)

  // Determine the target portfolio
  let targetPortfolioId = validatedInput.portfolio_id
  
  if (!targetPortfolioId) {
    // If no portfolio specified, get user's default portfolio
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
    
    const { data: defaultPortfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_default', true)
      .single()
    
    if (!defaultPortfolio) {
      throw new Error('No default portfolio found. Please create a portfolio first.')
    }
    
    targetPortfolioId = defaultPortfolio.id
  }

  let regridData: RegridProperty | null = null

  // Try to get Regrid data
  try {
    if (validatedInput.apn) {
      regridData = await RegridService.searchByAPN(validatedInput.apn, validatedInput.state)
    } else {
      const searchResults = await RegridService.searchByAddress(
        validatedInput.address,
        validatedInput.city,
        validatedInput.state,
        1
      )
      if (searchResults.length > 0 && searchResults[0]._fullFeature) {
        regridData = RegridService.normalizeProperty(searchResults[0]._fullFeature)
      }
    }
  } catch (error) {
    // Log but don't fail - we can still create the property without Regrid data
    console.warn('Failed to fetch Regrid data:', error)
  }

  const propertyData = {
    portfolio_id: targetPortfolioId,
    regrid_id: regridData?.id || null,
    apn: cleanAPN(regridData?.apn || validatedInput.apn),
    address: regridData?.address?.line1 || validatedInput.address,
    city: regridData?.address?.city || validatedInput.city || null,
    state: regridData?.address?.state || validatedInput.state || null,
    zip_code: regridData?.address?.zip || validatedInput.zip_code || null,
    geometry: regridData?.geometry || null,
    lat: regridData?.centroid?.lat || null,
    lng: regridData?.centroid?.lng || null,
    
    // Enhanced property data from Regrid API
    year_built: regridData?.properties?.year_built || null,
    owner: regridData?.properties?.owner || null,
    last_sale_price: regridData?.properties?.last_sale_price || null,
    sale_date: regridData?.properties?.sale_date || null,
    county: regridData?.properties?.county || null,
    qoz_status: regridData?.properties?.qoz_status || null,
    improvement_value: regridData?.properties?.improvement_value || null,
    land_value: regridData?.properties?.land_value || null,
    assessed_value: regridData?.properties?.assessed_value || null,
    
    // Extended property details from Regrid API
    use_code: regridData?.properties?.use_code || null,
    use_description: regridData?.properties?.use_description || null,
    zoning: regridData?.properties?.zoning || null,
    zoning_description: regridData?.properties?.zoning_description || null,
    num_stories: regridData?.properties?.num_stories || null,
    num_units: regridData?.properties?.num_units || null,
    num_rooms: regridData?.properties?.num_rooms || null,
    subdivision: regridData?.properties?.subdivision || null,
    lot_size_acres: regridData?.properties?.lot_acres || null,
    lot_size_sqft: regridData?.properties?.lot_size_sqft || null,
    
    // Financial & tax data
    tax_year: regridData?.properties?.tax_year || null,
    parcel_value_type: regridData?.properties?.parcel_value_type || null,
    
    // Location data
    census_tract: regridData?.properties?.census_tract || null,
    census_block: regridData?.properties?.census_block || null,
    qoz_tract: regridData?.properties?.qoz_tract || null,
    
    // Data freshness tracking
    last_refresh_date: regridData?.properties?.last_refresh_date || null,
    regrid_updated_at: regridData?.properties?.regrid_updated_at || null,
    
    // Owner mailing address
    owner_mailing_address: regridData?.properties?.owner_mailing_address || null,
    owner_mail_city: regridData?.properties?.owner_mail_city || null,
    owner_mail_state: regridData?.properties?.owner_mail_state || null,
    owner_mail_zip: regridData?.properties?.owner_mail_zip || null,
    
    property_data: regridData || null,
    user_notes: validatedInput.user_notes || null,
    tags: validatedInput.tags || null,
    insurance_provider: validatedInput.insurance_provider || null,
    maintenance_history: validatedInput.maintenance_history || null,
  }

  return await DatabaseService.createProperty(propertyData as unknown as Omit<Property, "id" | "user_id" | "created_at" | "updated_at">)
}