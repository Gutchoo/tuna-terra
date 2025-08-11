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

const updateMemberSchema = z.object({
  role: z.enum(['editor', 'viewer'], {
    errorMap: () => ({ message: 'Role must be either editor or viewer' })
  }),
})

// PUT /api/portfolios/[id]/members/[memberId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId, memberId } = await params
    const body = await request.json()
    const { role } = updateMemberSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    // Verify user owns the portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('owner_id')
      .eq('id', portfolioId)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.owner_id !== userId) {
      return NextResponse.json({ error: 'Only portfolio owners can update member roles' }, { status: 403 })
    }

    // Get the membership to check it exists and isn't the owner
    const { data: membership, error: membershipError } = await supabase
      .from('portfolio_memberships')
      .select('id, user_id, role')
      .eq('id', memberId)
      .eq('portfolio_id', portfolioId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot change owner role
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Update the member role
    const { data: updatedMembership, error: updateError } = await supabase
      .from('portfolio_memberships')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      membership: updatedMembership
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Member update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/portfolios/[id]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portfolioId, memberId } = await params
    const supabase = await createServerSupabaseClient()

    // Get the membership details
    const { data: membership, error: membershipError } = await supabase
      .from('portfolio_memberships')
      .select('user_id, role, portfolio_id')
      .eq('id', memberId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (membership.portfolio_id !== portfolioId) {
      return NextResponse.json({ error: 'Member not found in this portfolio' }, { status: 404 })
    }

    // Verify user owns the portfolio OR user is removing themselves
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('owner_id')
      .eq('id', portfolioId)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const isOwner = portfolio.owner_id === userId
    const isSelfRemoval = membership.user_id === userId

    if (!isOwner && !isSelfRemoval) {
      return NextResponse.json({ error: 'Unauthorized to remove this member' }, { status: 403 })
    }

    // Cannot remove owner membership
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove portfolio owner' }, { status: 400 })
    }

    // Remove the membership
    const { error: deleteError } = await supabase
      .from('portfolio_memberships')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Member removal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}