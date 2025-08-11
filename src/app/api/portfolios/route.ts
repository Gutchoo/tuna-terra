import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { PortfolioWithMembership } from '@/lib/supabase'

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

const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100),
  description: z.string().max(500).optional(),
})


// GET /api/portfolios - List user's accessible portfolios
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('include_stats') === 'true'

    // Get portfolios user owns (RLS allows this)
    const { data: ownedPortfolios, error: ownedError } = await supabase
      .from('portfolios')
      .select(`
        id,
        name,
        description,
        owner_id,
        is_default,
        created_at,
        updated_at
      `)
      .eq('owner_id', userId)

    if (ownedError) {
      console.error('Error fetching owned portfolios:', ownedError)
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }

    // Get user's memberships using service role since portfolio_memberships has no RLS
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
    
    const { data: memberships, error: memberError } = await serviceSupabase
      .from('portfolio_memberships')
      .select(`
        portfolio_id,
        role,
        accepted_at
      `)
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)

    if (memberError) {
      console.error('Error fetching memberships:', memberError)
      return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 })
    }

    // For member portfolios, we need to manually fetch the portfolio details
    // using service role or admin bypass since RLS blocks cross-user portfolio access
    const memberPortfolioIds = memberships?.map(m => m.portfolio_id) || []
    let memberPortfolios: {
      id: string
      name: string
      description: string | null
      owner_id: string
      is_default: boolean
      created_at: string
      updated_at: string
    }[] = []
    
    if (memberPortfolioIds.length > 0) {
      // Use service role client to bypass RLS for portfolio details
      const { data: portfolioDetails, error: portfolioError } = await serviceSupabase
        .from('portfolios')
        .select(`
          id,
          name,
          description,
          owner_id,
          is_default,
          created_at,
          updated_at
        `)
        .in('id', memberPortfolioIds)

      if (portfolioError) {
        console.error('Error fetching member portfolio details:', portfolioError)
      } else {
        memberPortfolios = portfolioDetails || []
      }
    }

    // Combine and deduplicate portfolios
    const allPortfolios = [
      ...(ownedPortfolios || []).map(p => ({ ...p, membership_role: 'owner' as const })),
      ...memberPortfolios.map(p => {
        const membership = memberships?.find(m => m.portfolio_id === p.id)
        return { 
          ...p, 
          membership_role: membership?.role as 'owner' | 'editor' | 'viewer'
        }
      })
    ]

    // Remove duplicates (in case user owns a portfolio and is also a member)
    const portfolioMap = new Map()
    allPortfolios.forEach(portfolio => {
      const existing = portfolioMap.get(portfolio.id)
      if (!existing || existing.membership_role !== 'owner') {
        portfolioMap.set(portfolio.id, portfolio)
      }
    })

    const portfoliosWithMembership: PortfolioWithMembership[] = Array.from(portfolioMap.values())
      .sort((a, b) => {
        // Sort by default first, then by creation date
        if (a.is_default !== b.is_default) {
          return a.is_default ? -1 : 1
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

    // Include stats if requested
    if (includeStats) {
      for (const portfolio of portfoliosWithMembership) {
        // Get member count using service role
        const { count: memberCount } = await serviceSupabase
          .from('portfolio_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('portfolio_id', portfolio.id)
          .not('accepted_at', 'is', null)

        // Get property count using service role to count all portfolio properties
        const { count: propertyCount } = await serviceSupabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('portfolio_id', portfolio.id)

        portfolio.member_count = memberCount || 0
        portfolio.property_count = propertyCount || 0
      }
    }

    return NextResponse.json({ portfolios: portfoliosWithMembership })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/portfolios - Create a new portfolio
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPortfolioSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        owner_id: userId,
        is_default: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating portfolio:', error)
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    // The trigger will automatically create the owner membership
    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    console.error('Portfolio creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}