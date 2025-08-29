'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PublicNavigation } from '@/components/navigation/PublicNavigation'

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

  // Authenticated users get the dashboard without extra navigation (sidebar handles it)
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}