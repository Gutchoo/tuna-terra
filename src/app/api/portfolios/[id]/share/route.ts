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

const sharePortfolioSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['editor', 'viewer'], { 
    message: 'Role must be either editor or viewer' 
  }),
})

// POST /api/portfolios/[id]/share - Share portfolio with user
export async function POST(
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
    const { email, role } = sharePortfolioSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    // Verify user owns the portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('owner_id, name')
      .eq('id', portfolioId)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.owner_id !== userId) {
      return NextResponse.json({ error: 'Only portfolio owners can share portfolios' }, { status: 403 })
    }

    // Check if user is trying to share with themselves
    const { data: inviterUser } = await supabase.auth.getUser()
    if (inviterUser.user?.email === email) {
      return NextResponse.json({ error: 'Cannot share portfolio with yourself' }, { status: 400 })
    }

    // Use service role to look up specific user by email using custom RPC function
    // This queries auth.users securely without exposing all users
    const serviceSupabase = createServiceSupabaseClient()

    // Call our custom function to get user ID by email
    const { data: lookupUserId, error: userLookupError } = await serviceSupabase
      .rpc('get_user_id_by_email', { user_email: email })

    if (userLookupError) {
      console.error('Error looking up user:', userLookupError)
      return NextResponse.json(
        { error: 'Failed to verify user status', details: userLookupError.message },
        { status: 500 }
      )
    }

    // If we got a user ID, fetch the full user details
    let existingUser = null
    if (lookupUserId) {
      const { data: userData, error: userFetchError } = await serviceSupabase.auth.admin.getUserById(lookupUserId)

      if (userFetchError) {
        console.error('Error fetching user details:', userFetchError)
        return NextResponse.json(
          { error: 'Failed to fetch user details', details: userFetchError.message },
          { status: 500 }
        )
      }

      existingUser = userData.user
    }

    if (existingUser) {
      // User exists, check if already a member using service role
      const { data: existingMembership } = await serviceSupabase
        .from('portfolio_memberships')
        .select('id, role')
        .eq('portfolio_id', portfolioId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this portfolio' },
          { status: 400 }
        )
      }

      // Add user directly to membership using service role
      const { data: membership, error: membershipError } = await serviceSupabase
        .from('portfolio_memberships')
        .insert({
          portfolio_id: portfolioId,
          user_id: existingUser.id,
          role,
          invited_by: userId,
          accepted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        return NextResponse.json({ error: 'Failed to share portfolio' }, { status: 500 })
      }

      // Send notification email to existing user
      try {
        const { data: inviterData } = await supabase.auth.getUser()
        const inviterName = inviterData.user?.user_metadata?.name ||
                          inviterData.user?.email?.split('@')[0] ||
                          'Someone'

        await supabase.functions.invoke('send-portfolio-invitation', {
          body: {
            email,
            portfolioName: portfolio.name,
            inviterName,
            role,
            acceptUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?portfolio_id=${portfolioId}`,
            isExistingUser: true,
          }
        })
      } catch (emailError) {
        console.error('Error sending notification email:', emailError)
        // Don't fail the request if email fails - membership is already created
      }

      return NextResponse.json({
        success: true,
        message: 'Portfolio shared successfully',
        membership
      })
    } else {
      // User doesn't exist, create invitation
      // Check for existing pending invitation using service role
      const { data: existingInvitation } = await serviceSupabase
        .from('portfolio_invitations')
        .select('id')
        .eq('portfolio_id', portfolioId)
        .eq('email', email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (existingInvitation) {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email' },
          { status: 400 }
        )
      }

      // Create invitation using service role
      const { data: invitation, error: invitationError } = await serviceSupabase
        .from('portfolio_invitations')
        .insert({
          portfolio_id: portfolioId,
          email,
          role,
          invited_by: userId,
        })
        .select()
        .single()

      if (invitationError) {
        console.error('Error creating invitation:', invitationError)
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
      }

      // Send invitation email to new user
      try {
        const { data: inviterData } = await supabase.auth.getUser()
        const inviterName = inviterData.user?.user_metadata?.name ||
                          inviterData.user?.email?.split('@')[0] ||
                          'Someone'

        await supabase.functions.invoke('send-portfolio-invitation', {
          body: {
            email,
            portfolioName: portfolio.name,
            inviterName,
            role,
            acceptUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invitations/accept/${invitation.invitation_token}`,
            isExistingUser: false,
          }
        })
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Don't fail the request if email fails - invitation is already created
      }

      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
        invitation
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    console.error('Portfolio sharing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}