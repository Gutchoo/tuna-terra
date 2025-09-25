'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { PublicNavigation } from './PublicNavigation'
import { PortfolioAwareNavigation, PortfolioAwareHomeButton } from './PortfolioAwareNavigation'
import { UserMenu } from '@/components/user-menu'

interface User {
  id: string
  email?: string
}

function NavigationContent() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser ? {
        id: currentUser.id,
        email: currentUser.email
      } : null)
      setIsLoading(false)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="fluid-container h-fluid-md flex items-center justify-between">
          <div className="flex items-center gap-fluid-sm">
            <div className="w-fluid-sm h-fluid-sm bg-muted rounded-md animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1">
              <div className="w-fluid-sm h-fluid-sm bg-muted rounded animate-pulse md:hidden" />
              <div className="hidden md:flex items-center gap-1">
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-fluid-sm md:gap-fluid-md flex-shrink-0">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  if (user) {
    // Authenticated user - show portfolio-aware navigation like dashboard
    return (
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="fluid-container h-fluid-md flex items-center justify-between">
          <div className="flex items-center gap-fluid-sm">
            <Suspense fallback={
              <div className="flex items-center gap-fluid-sm min-w-0">
                <div className="w-fluid-sm h-fluid-sm bg-muted rounded-md animate-pulse flex-shrink-0" />
              </div>
            }>
              <PortfolioAwareHomeButton className="flex items-center gap-fluid-sm min-w-0" />
            </Suspense>
            
            <Suspense fallback={
              <div className="flex items-center gap-1">
                <div className="w-fluid-sm h-fluid-sm bg-muted rounded animate-pulse md:hidden" />
                <div className="hidden md:flex items-center gap-1">
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            }>
              <PortfolioAwareNavigation />
            </Suspense>
          </div>

          <div className="flex items-center gap-fluid-sm md:gap-fluid-md flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>
    )
  }

  // Anonymous user - show public navigation
  return <PublicNavigation sticky />
}

export function SmartNavigation() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="fluid-container h-fluid-md flex items-center justify-between">
          <div className="flex items-center gap-fluid-sm">
            <div className="w-fluid-sm h-fluid-sm bg-muted rounded-md animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1">
              <div className="w-fluid-sm h-fluid-sm bg-muted rounded animate-pulse md:hidden" />
              <div className="hidden md:flex items-center gap-1">
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-fluid-sm md:gap-fluid-md flex-shrink-0">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    }>
      <NavigationContent />
    </Suspense>
  )
}