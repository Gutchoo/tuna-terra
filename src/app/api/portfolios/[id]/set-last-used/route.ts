import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

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

// PUT /api/portfolios/[id]/set-last-used - Set portfolio as user's last used (default)
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

    // Prevent setting virtual sample portfolio as last used
    if (isVirtualSamplePortfolio(portfolioId)) {
      return NextResponse.json({
        error: 'Cannot set virtual portfolio as last used',
        message: 'The virtual sample portfolio cannot be set as your default portfolio.'
      }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Verify user has access to this portfolio (either owner or member)
    const { data: portfolioAccess } = await supabase
      .from('portfolios')
      .select(`
        id,
        name,
        owner_id,
        is_sample,
        portfolio_memberships (
          user_id,
          role,
          accepted_at
        )
      `)
      .eq('id', portfolioId)
      .single()

    if (!portfolioAccess) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Check if user owns portfolio or has accepted membership
    const hasAccess = portfolioAccess.owner_id === userId ||
      portfolioAccess.portfolio_memberships?.some(
        (membership) =>
          membership.user_id === userId &&
          membership.accepted_at !== null
      )

    if (!hasAccess) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'You do not have access to this portfolio.'
      }, { status: 403 })
    }

    // Prevent setting sample portfolios as last used (they're for demo only)
    if (portfolioAccess.is_sample) {
      return NextResponse.json({
        error: 'Cannot set sample portfolio as last used',
        message: 'Sample portfolios are for demonstration only and cannot be set as your default.'
      }, { status: 400 })
    }

    // Update the portfolio to be the user's last used (is_default = true)
    // The database trigger will automatically unset other portfolios
    // Retry logic for potential constraint violations during concurrent updates
    let updatedPortfolio = null
    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolioId)
        .eq('owner_id', userId) // Only allow setting own portfolios as default
        .select('id, name, is_default')
        .single()

      if (!error) {
        updatedPortfolio = data
        break
      }

      // Check if it's a constraint violation that might resolve with retry
      if (error.code === '23505' && retries < maxRetries - 1) {
        console.log(`Retrying set last used portfolio due to constraint violation (attempt ${retries + 1})`)
        retries++
        // Brief delay before retry
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      }

      // Non-retryable error or max retries reached
      console.error('Error setting last used portfolio:', error)
      return NextResponse.json({
        error: 'Failed to set portfolio as last used',
        message: error.message
      }, { status: 500 })
    }

    if (!updatedPortfolio) {
      return NextResponse.json({
        error: 'Cannot set portfolio as last used',
        message: 'Only portfolio owners can set their portfolios as default.'
      }, { status: 403 })
    }

    // Create response object
    const successResponse = {
      success: true,
      portfolio: updatedPortfolio,
      message: `Portfolio "${updatedPortfolio.name}" set as default`
    }

    // Return JSON response
    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Set last used portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}