import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Property } from '@/lib/supabase'
import { sanitizePropertyForClient, sanitizePropertiesForClient } from '@/lib/api/sanitizers'

// Utility function to clean APN by removing all dashes
function cleanAPN(apn: string | null | undefined): string | null {
  if (!apn) return null
  return apn.replace(/-/g, '')
}

const createPropertySchema = z.object({
  apn: z.string().optional(),
  address: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  county: z.string().optional(),
  portfolio_id: z.string().uuid().optional(),
  user_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  insurance_provider: z.string().optional(),
  maintenance_history: z.string().optional(),
})

const bulkCreateSchema = z.object({
  properties: z.array(createPropertySchema),
  source: z.enum(['csv', 'manual', 'api']).optional(),
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
    const portfolioId = searchParams.get('portfolio_id')

    const filters = {
      city: city || undefined,
      state: state || undefined,
      tags: tags || undefined,
      search: search || undefined,
      portfolio_id: portfolioId || undefined
    }

    // Get user's accessible portfolios using RLS-enabled view
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

    // Use RLS policies to get properties user can access
    let query = supabase
      .from('properties')
      .select('*')

    // If specific portfolio requested, filter by it
    if (portfolioId) {
      query = query.eq('portfolio_id', portfolioId)
    }

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`)
    }
    if (filters.search) {
      query = query.textSearch('fts', filters.search, {
        type: 'websearch',
        config: 'english'
      })
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

    return NextResponse.json({ properties: sanitizePropertiesForClient(properties || []) })
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

    let errorMessage = 'Failed to create property'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

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

  // Prepare property data for database (manual entry only)
  console.log('handleSingleCreate - preparing property data')
  const propertyData = {
    apn: cleanAPN(validatedData.apn),
    address: validatedData.address,
    city: validatedData.city || null,
    state: validatedData.state || null,
    zip_code: validatedData.zip_code || null,
    lat: validatedData.lat !== undefined ? validatedData.lat : null,
    lng: validatedData.lng !== undefined ? validatedData.lng : null,
    county: validatedData.county || null,
    portfolio_id: targetPortfolioId || null,
    user_notes: validatedData.user_notes || null,
    tags: validatedData.tags || null,
    insurance_provider: validatedData.insurance_provider || null,
    maintenance_history: validatedData.maintenance_history || null,
  }

  console.log('handleSingleCreate - property data prepared:', JSON.stringify(propertyData, null, 2))

  try {
    // Server-side duplicate check - only check within the same portfolio
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

    return NextResponse.json({ property: sanitizePropertyForClient(property) })
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

  // Pre-filter duplicates
  const filteredProperties = []
  const duplicateErrors = []

  if (properties.length > 0 && properties[0].apn) {
    console.log('Bulk create: Pre-filtering duplicates before creation')

    for (const [index, propertyInput] of properties.entries()) {
      if (!propertyInput.apn) {
        filteredProperties.push({ index, propertyInput })
        continue
      }

      try {
        const existingProperties = await DatabaseService.getFilteredProperties(userId, {
          search: propertyInput.apn,
          portfolio_id: propertyInput.portfolio_id
        })

        const exactMatch = existingProperties.find(
          property => property.apn?.toLowerCase() === propertyInput.apn?.toLowerCase()
        )

        if (exactMatch) {
          duplicateErrors.push({
            index,
            input: propertyInput,
            error: `APN ${propertyInput.apn} already exists in this portfolio`,
            type: 'duplicate'
          })
        } else {
          filteredProperties.push({ index, propertyInput })
        }
      } catch (error) {
        console.warn(`Failed duplicate check for APN ${propertyInput.apn}:`, error)
        filteredProperties.push({ index, propertyInput })
      }
    }

    console.log(`Duplicate filtering: ${duplicateErrors.length} duplicates found, ${filteredProperties.length} properties to process`)
  } else {
    filteredProperties.push(...properties.map((propertyInput, index) => ({ index, propertyInput })))
  }

  const results = []
  const errors = [...duplicateErrors]

  for (const { index, propertyInput } of filteredProperties) {
    try {
      const result = await createSinglePropertyFromInput(userId, propertyInput)
      results.push(result.property)
    } catch (error) {
      console.error(`Error creating property at index ${index}:`, error)
      errors.push({
        index,
        input: propertyInput,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'creation_error'
      })
    }
  }

  // Prepare response
  const response = {
    created: sanitizePropertiesForClient(results),
    errors,
    summary: {
      total: properties.length,
      successful: results.length,
      failed: errors.length,
      source
    }
  }

  return NextResponse.json(response)
}

async function createSinglePropertyFromInput(userId: string, input: unknown): Promise<{ property: Property }> {
  const validatedInput = createPropertySchema.parse(input)

  // Determine the target portfolio
  let targetPortfolioId = validatedInput.portfolio_id

  if (!targetPortfolioId) {
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

  const propertyData = {
    portfolio_id: targetPortfolioId,
    apn: cleanAPN(validatedInput.apn),
    address: validatedInput.address,
    city: validatedInput.city || null,
    state: validatedInput.state || null,
    zip_code: validatedInput.zip_code || null,
    user_notes: validatedInput.user_notes || null,
    tags: validatedInput.tags || null,
    insurance_provider: validatedInput.insurance_provider || null,
    maintenance_history: validatedInput.maintenance_history || null,
  }

  const createdProperty = await DatabaseService.createProperty(propertyData as unknown as Omit<Property, "id" | "user_id" | "created_at" | "updated_at">)

  return {
    property: createdProperty
  }
}
