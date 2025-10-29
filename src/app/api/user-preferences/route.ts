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

// GET /api/user-preferences?key=preference_key
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const preferenceKey = searchParams.get('key')

    if (!preferenceKey) {
      return NextResponse.json({ error: 'preference_key is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_key', preferenceKey)
      .maybeSingle()

    if (error) {
      console.error('Preference fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Preference fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user-preferences - Create or update preference
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preference_key, preference_value } = body

    // Validate input
    if (typeof preference_key !== 'string' || !preference_key) {
      return NextResponse.json({ error: 'preference_key is required' }, { status: 400 })
    }

    if (!preference_value || typeof preference_value !== 'object') {
      return NextResponse.json({ error: 'preference_value must be an object' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Upsert the preference
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key,
        preference_value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_key'
      })
      .select()
      .single()

    if (error) {
      console.error('Preference save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Preference save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/user-preferences?key=preference_key
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const preferenceKey = searchParams.get('key')

    if (!preferenceKey) {
      return NextResponse.json({ error: 'preference_key is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_key', preferenceKey)

    if (error) {
      console.error('Preference delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Preference delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
