'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { buildPortfolioUrl } from '@/lib/navigation'
import type { User } from '@supabase/supabase-js'

function UserMenuContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Get current portfolio context
  const currentPortfolioId = searchParams.get('portfolio_id')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full p-0">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={buildPortfolioUrl('/dashboard/account', currentPortfolioId)} className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserMenu() {
  return (
    <Suspense fallback={
      <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled>
        <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-16 bg-muted rounded animate-pulse hidden md:block" />
      </Button>
    }>
      <UserMenuContent />
    </Suspense>
  )
}