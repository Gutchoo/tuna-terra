import { NextResponse } from 'next/server'
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

export async function DELETE() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('🚨 RESET API: Authentication failed:', { authError, user })
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('🧹 RESET API: User authenticated, user_id:', user.id)

    // First, let's see what progress exists
    const { data: existingProgress } = await supabase
      .from('user_education_progress')
      .select('lesson_slug, completed_at')
      .eq('user_id', user.id)

    console.log('🧹 RESET API: Current progress before delete:', existingProgress)

    // Delete all education progress for the current user
    const { data: deleteResult, error } = await supabase
      .from('user_education_progress')
      .delete()
      .eq('user_id', user.id)
      .select() // This will return the deleted rows

    if (error) {
      console.error('🚨 RESET API: Error clearing education progress:', error)
      return NextResponse.json({ error: 'Failed to clear progress' }, { status: 500 })
    }

    console.log('🧹 RESET API: Successfully deleted rows:', deleteResult)

    // Verify deletion worked
    const { data: remainingProgress } = await supabase
      .from('user_education_progress')
      .select('lesson_slug')
      .eq('user_id', user.id)

    console.log('🧹 RESET API: Remaining progress after delete:', remainingProgress)

    return NextResponse.json({ 
      success: true, 
      deletedRows: deleteResult?.length || 0,
      remainingRows: remainingProgress?.length || 0
    })
  } catch (error) {
    console.error('🚨 RESET API: Education progress reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}