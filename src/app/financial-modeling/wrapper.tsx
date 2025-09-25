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

  // Authenticated users get the navigation bar above the financial modeling dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header with authenticated navigation */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="fluid-container h-fluid-md flex items-center justify-between">
          <div className="flex items-center gap-fluid-sm md:gap-fluid-md min-w-0 flex-1">
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

      {/* Financial modeling dashboard */}
      {children}
    </div>
  )
}