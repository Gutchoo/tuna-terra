import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Ensure user has a default portfolio after successful authentication
      try {
        // Check if user already has a default portfolio
        const { data: existingDefault } = await supabase
          .from('portfolios')
          .select('id')
          .eq('owner_id', data.user.id)
          .eq('is_default', true)
          .single()

        if (!existingDefault) {
          // Create default portfolio
          const userEmail = data.user.email || `User ${data.user.id.substring(0, 8)}`
          await supabase
            .from('portfolios')
            .insert({
              name: `${userEmail}'s Portfolio`,
              description: 'Default portfolio created automatically',
              owner_id: data.user.id,
              is_default: true,
            })
        }
      } catch (portfolioError) {
        // Log error but don't block the redirect
        console.error('Error creating default portfolio:', portfolioError)
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}