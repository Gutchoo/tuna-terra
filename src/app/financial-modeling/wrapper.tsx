'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PublicNavigation } from '@/components/navigation/PublicNavigation'
import { PortfolioAwareNavigation, PortfolioAwareHomeButton } from '@/components/navigation/PortfolioAwareNavigation'
import { UserMenu } from '@/components/user-menu'
import { Suspense } from 'react'

interface FinancialModelingWrapperProps {
  children: React.ReactNode
}

export function FinancialModelingWrapper({ children }: FinancialModelingWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Subscribe to auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-pulse" />
        {children}
      </div>
    )
  }

  // Unauthenticated users get the public navigation
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavigation sticky className="border-b" />
        {children}
      </div>
    )
  }

  // Authenticated users get the dashboard-style navigation
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-8 min-w-0 flex-1">
            <Suspense fallback={
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-muted rounded-md animate-pulse flex-shrink-0" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse hidden sm:block" />
              </div>
            }>
              <PortfolioAwareHomeButton className="flex items-center gap-2 min-w-0" />
            </Suspense>
            <Suspense fallback={
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-muted rounded animate-pulse md:hidden" />
                <div className="hidden md:flex items-center gap-1">
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            }>
              <PortfolioAwareNavigation />
            </Suspense>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}