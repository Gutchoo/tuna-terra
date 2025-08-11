import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// Service role client for admin operations
function createServiceSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

// GET /api/portfolios/[id]/members - Get portfolio members
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

    // Use service role to check user access since portfolio_memberships has no RLS
    const serviceSupabase = createServiceSupabaseClient()
    
    // Check if user owns the portfolio
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('owner_id')
      .eq('id', portfolioId)
      .single()

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Check if user has access (owner or member)
    let hasAccess = portfolio.owner_id === userId
    
    if (!hasAccess) {
      const { data: membership } = await serviceSupabase
        .from('portfolio_memberships')
        .select('id')
        .eq('portfolio_id', portfolioId)
        .eq('user_id', userId)
        .not('accepted_at', 'is', null)
        .single()
      
      hasAccess = !!membership
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get all members using service role since portfolio_memberships has no RLS
    const { data: members, error } = await serviceSupabase
      .from('portfolio_memberships')
      .select(`
        id,
        user_id,
        role,
        invited_by,
        invited_at,
        accepted_at
      `)
      .eq('portfolio_id', portfolioId)
      .not('accepted_at', 'is', null)

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Fetch user details for each member using service role to avoid RLS issues
    const formattedMembers = []
    
    if (members) {
      for (const member of members) {
        try {
          // Use auth admin with service role to get user details (bypasses RLS)
          const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(member.user_id)
          
          if (userError) {
            console.error(`Auth admin error for user ${member.user_id}:`, userError)
            throw userError
          }
          
          formattedMembers.push({
            id: member.id,
            role: member.role,
            invited_by: member.invited_by,
            invited_at: member.invited_at,
            accepted_at: member.accepted_at,
            user: {
              id: userData.user?.id || member.user_id,
              email: userData.user?.email || 'Unknown',
              name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || 'User',
              avatar_url: userData.user?.user_metadata?.avatar_url,
            }
          })
        } catch (err) {
          console.error(`Failed to fetch user details for ${member.user_id}:`, err)
          // Include member with fallback user data
          formattedMembers.push({
            id: member.id,
            role: member.role,
            invited_by: member.invited_by,
            invited_at: member.invited_at,
            accepted_at: member.accepted_at,
            user: {
              id: member.user_id,
              email: 'Unknown User',
              name: 'Unknown User',
              avatar_url: null,
            }
          })
        }
      }
    }

    // Get pending invitations (only for portfolio owners) using service role
    let pendingInvitations = []
    if (portfolio.owner_id === userId) {
      const { data: invitations } = await serviceSupabase
        .from('portfolio_invitations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())

      pendingInvitations = invitations || []
    }

    return NextResponse.json({
      members: formattedMembers,
      pending_invitations: pendingInvitations
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}