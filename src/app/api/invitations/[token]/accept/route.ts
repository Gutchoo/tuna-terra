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

// POST /api/invitations/[token]/accept - Accept portfolio invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await params
    const supabase = await createServerSupabaseClient()

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('portfolio_invitations')
      .select(`
        id,
        portfolio_id,
        email,
        role,
        invited_by,
        expires_at,
        portfolios (
          id,
          name,
          owner_id
        )
      `)
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Type the invitation properly
    const typedInvitation = invitation as unknown as {
      id: string
      email: string
      role: string
      invited_at: string
      expires_at: string
      portfolio_id: string
      invited_by: string
      portfolios: { id: string; name: string; description: string; owner_id: string }[]
      auth?: {
        users?: {
          email?: string
          user_metadata?: {
            name?: string
          }
        }
      }
    }

    // Check if invitation is expired
    if (new Date(typedInvitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Get current user's email
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    // Verify the invitation is for the current user's email
    if (user.email !== typedInvitation.email) {
      return NextResponse.json({ error: 'Invitation is not for your email address' }, { status: 403 })
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('portfolio_memberships')
      .select('id')
      .eq('portfolio_id', typedInvitation.portfolio_id)
      .eq('user_id', userId)
      .single()

    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of this portfolio' }, { status: 400 })
    }

    // Create membership
    const { data: membership, error: membershipError } = await supabase
      .from('portfolio_memberships')
      .insert({
        portfolio_id: typedInvitation.portfolio_id,
        user_id: userId,
        role: typedInvitation.role,
        invited_by: typedInvitation.invited_by,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('portfolio_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', typedInvitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      // Don't fail here as membership is already created
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      portfolio: {
        id: (typedInvitation.portfolios[0] as unknown as { id: string; name: string }[])[0]?.id,
        name: (typedInvitation.portfolios[0] as unknown as { id: string; name: string }[])[0]?.name,
      },
      membership
    })
  } catch (error) {
    console.error('Invitation acceptance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/invitations/[token]/accept - Get invitation details (for preview)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createServerSupabaseClient()

    // Get the invitation details
    const { data: invitation, error } = await supabase
      .from('portfolio_invitations')
      .select(`
        id,
        email,
        role,
        invited_at,
        expires_at,
        portfolios (
          id,
          name,
          description
        ),
        auth.users!portfolio_invitations_invited_by_fkey (
          email,
          user_metadata
        )
      `)
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Type the invitation properly
    const typedInvitation = invitation as unknown as {
      id: string
      email: string
      role: string
      invited_at: string
      expires_at: string
      portfolio_id: string
      invited_by: string
      portfolios: { id: string; name: string; description: string; owner_id: string }[]
      auth?: {
        users?: {
          email?: string
          user_metadata?: {
            name?: string
          }
        }
      }
    }

    // Check if invitation is expired
    if (new Date(typedInvitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    return NextResponse.json({
      invitation: {
        email: typedInvitation.email,
        role: typedInvitation.role,
        invited_at: typedInvitation.invited_at,
        expires_at: typedInvitation.expires_at,
        portfolio: {
          id: typedInvitation.portfolios[0].id,
          name: typedInvitation.portfolios[0].name,
          description: typedInvitation.portfolios[0].description,
        },
        invited_by: {
          email: typedInvitation.auth?.users?.email,
          name: typedInvitation.auth?.users?.user_metadata?.name,
        }
      }
    })
  } catch (error) {
    console.error('Invitation details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}