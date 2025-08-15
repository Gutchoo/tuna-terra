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

const bulkDeleteSchema = z.object({
  portfolioIds: z.array(z.string().uuid()).min(1, 'At least one portfolio ID is required'),
})

// DELETE /api/portfolios/bulk-delete - Delete multiple portfolios
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bulkDeleteSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    // First, verify that all portfolios belong to the user and get their details
    const { data: portfoliosToDelete, error: fetchError } = await supabase
      .from('portfolios')
      .select('id, name, owner_id, is_default')
      .in('id', validatedData.portfolioIds)
      .eq('owner_id', userId)

    if (fetchError) {
      console.error('Error fetching portfolios to delete:', fetchError)
      return NextResponse.json({ error: 'Failed to verify portfolios' }, { status: 500 })
    }

    if (!portfoliosToDelete || portfoliosToDelete.length === 0) {
      return NextResponse.json({ error: 'No portfolios found or access denied' }, { status: 404 })
    }

    // Check if user is trying to delete default portfolios
    const defaultPortfolios = portfoliosToDelete.filter(p => p.is_default)
    if (defaultPortfolios.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete default portfolios',
        details: 'Default portfolios cannot be deleted'
      }, { status: 400 })
    }

    // If we found fewer portfolios than requested, some don't exist or user doesn't own them
    if (portfoliosToDelete.length !== validatedData.portfolioIds.length) {
      const foundIds = portfoliosToDelete.map(p => p.id)
      const notFoundIds = validatedData.portfolioIds.filter(id => !foundIds.includes(id))
      console.warn('Some portfolios not found or not owned:', notFoundIds)
    }

    // Use service role client for cascading deletes since RLS may block cross-table operations
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

    // Delete in this order to respect foreign key constraints:
    // 1. Portfolio memberships
    // 2. Portfolio invitations  
    // 3. Properties
    // 4. Portfolios

    const portfolioIds = portfoliosToDelete.map(p => p.id)

    // Delete portfolio memberships
    const { error: membershipError } = await serviceSupabase
      .from('portfolio_memberships')
      .delete()
      .in('portfolio_id', portfolioIds)

    if (membershipError) {
      console.error('Error deleting portfolio memberships:', membershipError)
      return NextResponse.json({ 
        error: 'Failed to delete portfolio memberships',
        details: membershipError.message 
      }, { status: 500 })
    }

    // Delete portfolio invitations
    const { error: invitationError } = await serviceSupabase
      .from('portfolio_invitations')
      .delete()
      .in('portfolio_id', portfolioIds)

    if (invitationError) {
      console.error('Error deleting portfolio invitations:', invitationError)
      return NextResponse.json({ 
        error: 'Failed to delete portfolio invitations',
        details: invitationError.message 
      }, { status: 500 })
    }

    // Delete properties associated with these portfolios
    const { error: propertiesError } = await serviceSupabase
      .from('properties')
      .delete()
      .in('portfolio_id', portfolioIds)

    if (propertiesError) {
      console.error('Error deleting properties:', propertiesError)
      return NextResponse.json({ 
        error: 'Failed to delete portfolio properties',
        details: propertiesError.message 
      }, { status: 500 })
    }

    // Finally, delete the portfolios themselves
    const { error: portfolioError } = await serviceSupabase
      .from('portfolios')
      .delete()
      .in('id', portfolioIds)

    if (portfolioError) {
      console.error('Error deleting portfolios:', portfolioError)
      return NextResponse.json({ 
        error: 'Failed to delete portfolios',
        details: portfolioError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${portfoliosToDelete.length} portfolio${portfoliosToDelete.length === 1 ? '' : 's'}`,
      deletedPortfolios: portfoliosToDelete.map(p => ({ id: p.id, name: p.name }))
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bulk portfolio deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}