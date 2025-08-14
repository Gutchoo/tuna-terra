import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log incoming parameters for debugging
  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    next,
    error,
    errorDescription,
    fullUrl: request.url
  })

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth provider error:', { error, errorDescription })
    return NextResponse.redirect(new URL(`/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url))
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Supabase auth error:', error)
        return NextResponse.redirect(new URL(`/auth/auth-code-error?supabase_error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (data.user) {
        console.log('User authenticated successfully:', { userId: data.user.id, email: data.user.email })
        
        // Verify user has required records (portfolio and limits)
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('id')
          .eq('owner_id', data.user.id)
          .eq('is_default', true)
          .single()

        const { data: limits } = await supabase
          .from('user_limits')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (!portfolio || !limits) {
          console.warn('User missing required records:', {
            userId: data.user.id,
            hasPortfolio: !!portfolio,
            hasLimits: !!limits
          })
          // Still redirect to dashboard - the app should handle missing records gracefully
        }

        // Portfolio creation is handled by database trigger 'create_user_default_portfolio'
        // User limits creation is handled by database trigger 'create_user_limits'
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error('No user data returned after successful authentication')
        return NextResponse.redirect(new URL('/auth/auth-code-error?error=no_user_data', request.url))
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(new URL(`/auth/auth-code-error?error=unexpected&message=${encodeURIComponent(String(err))}`, request.url))
    }
  }

  // No code parameter provided
  console.error('Auth callback called without code parameter')
  return NextResponse.redirect(new URL('/auth/auth-code-error?error=missing_code', request.url))
}