import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getUser() {
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
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail if called during server component rendering
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail if called during server component rendering
          }
        },
      },
    }
  )
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Only log unexpected auth errors, not normal "no session" errors
      if (error.message !== 'Auth session missing!') {
        console.error('Auth error:', error)
      }
      return null
    }
    
    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

export async function requireNoAuth() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }
  
  return null
}

export async function signOut() {
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
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail if called during server component rendering
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail if called during server component rendering
          }
        },
      },
    }
  )
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    redirect('/')
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Utility for checking if user is authenticated (for middleware)
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}

// Get user ID for API routes
export async function getUserId(): Promise<string | null> {
  const user = await getUser()
  return user?.id ?? null
}