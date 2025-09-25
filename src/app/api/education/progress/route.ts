import { NextRequest, NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('🚨 GET API: Authentication failed:', { authError, user })
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('📖 GET API: Fetching progress for user_id:', user.id)

    // Fetch user's education progress
    const { data, error } = await supabase
      .from('user_education_progress')
      .select('lesson_slug, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('🚨 GET API: Error fetching education progress:', error)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    console.log('📖 GET API: Raw database data:', data)

    // Transform to format expected by frontend
    const progress: Record<string, boolean> = {}
    data?.forEach(item => {
      progress[item.lesson_slug] = true
    })

    console.log('📖 GET API: Transformed progress object:', progress)

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('🚨 GET API: Education progress GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonSlug } = body

    if (!lessonSlug || typeof lessonSlug !== 'string') {
      return NextResponse.json({ error: 'Invalid lesson slug' }, { status: 400 })
    }

    // Insert or update progress (upsert)
    const { error } = await supabase
      .from('user_education_progress')
      .upsert(
        {
          user_id: user.id,
          lesson_slug: lessonSlug,
          completed_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,lesson_slug'
        }
      )

    if (error) {
      console.error('Error saving education progress:', error)
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Education progress POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}