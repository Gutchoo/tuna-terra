import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

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

const updatePortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100).optional(),
  description: z.string().max(500).nullable().optional(),
})

// GET /api/portfolios/[id] - Get portfolio details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId } = await params
    const supabase = await createServerSupabaseClient()

    // Check if user owns the portfolio
    const { data: ownedPortfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('owner_id', userId)
      .single()

    // Check if user is a member of the portfolio
    const { data: membershipPortfolio } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_memberships!inner (
          role,
          accepted_at
        )
      `)
      .eq('id', portfolioId)
      .eq('portfolio_memberships.user_id', userId)
      .not('portfolio_memberships.accepted_at', 'is', null)
      .single()

    const portfolio = ownedPortfolio || membershipPortfolio

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get additional stats
    const [
      { count: memberCount },
      { count: propertyCount },
      { data: members },
      { data: pendingInvitations }
    ] = await Promise.all([
      supabase
        .from('portfolio_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_id', portfolioId)
        .not('accepted_at', 'is', null),
      
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_id', portfolioId),
      
      supabase
        .from('portfolio_memberships')
        .select(`
          id,
          role,
          invited_at,
          accepted_at,
          auth.users!portfolio_memberships_user_id_fkey (
            id,
            email,
            user_metadata
          )
        `)
        .eq('portfolio_id', portfolioId)
        .not('accepted_at', 'is', null),
      
      supabase
        .from('portfolio_invitations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
    ])

    const userRole = ownedPortfolio ? 'owner' : membershipPortfolio?.portfolio_memberships?.[0]?.role

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        membership_role: userRole,
        member_count: memberCount || 0,
        property_count: propertyCount || 0,
      },
      members: (members as unknown as {
        id: string
        role: string
        invited_at: string
        accepted_at: string
        auth?: {
          users?: {
            id: string
            email: string
            user_metadata: Record<string, unknown>
          }
        }
      }[])?.map((member) => ({
        id: member.id,
        role: member.role,
        invited_at: member.invited_at,
        accepted_at: member.accepted_at,
        user: {
          id: member.auth?.users?.id,
          email: member.auth?.users?.email,
          metadata: member.auth?.users?.user_metadata,
        }
      })) || [],
      pending_invitations: pendingInvitations || []
    })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/portfolios/[id] - Update portfolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId } = await params
    const body = await request.json()
    const validatedData = updatePortfolioSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    // Check if user owns the portfolio
    const { data: portfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('owner_id')
      .eq('id', portfolioId)
      .single()

    if (checkError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.owner_id !== userId) {
      return NextResponse.json({ error: 'Only portfolio owners can update portfolio details' }, { status: 403 })
    }

    // Update portfolio
    const { data: updatedPortfolio, error } = await supabase
      .from('portfolios')
      .update(validatedData)
      .eq('id', portfolioId)
      .select()
      .single()

    if (error) {
      console.error('Error updating portfolio:', error)
      return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 })
    }

    return NextResponse.json({ portfolio: updatedPortfolio })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    console.error('Portfolio update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/portfolios/[id] - Delete portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId } = await params
    const supabase = await createServerSupabaseClient()

    // Check if user owns the portfolio and it's not a default portfolio
    const { data: portfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('owner_id, is_default')
      .eq('id', portfolioId)
      .single()

    if (checkError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.owner_id !== userId) {
      return NextResponse.json({ error: 'Only portfolio owners can delete portfolios' }, { status: 403 })
    }

    if (portfolio.is_default) {
      return NextResponse.json({ error: 'Cannot delete default portfolio' }, { status: 400 })
    }

    // Check if portfolio has properties
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('portfolio_id', portfolioId)

    if (propertyCount && propertyCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete portfolio with properties. Please move or delete all properties first.' },
        { status: 400 }
      )
    }

    // Delete portfolio (cascade will handle memberships and invitations)
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)

    if (error) {
      console.error('Error deleting portfolio:', error)
      return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Portfolio deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}