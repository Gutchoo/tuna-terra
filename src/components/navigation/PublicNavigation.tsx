'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatedButton } from '@/components/homepage/ui/AnimatedButton'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthModal } from '@/components/modals/AuthModal'
import { TerraLogo } from '@/components/ui/terra-logo'

interface PublicNavigationProps {
  /** Whether the navigation should stick to the top */
  sticky?: boolean
  /** Additional CSS classes for the header container */
  className?: string
}

export function PublicNavigation({ 
  sticky = false, 
  className = '' 
}: PublicNavigationProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  return (
    <header className={`
      ${sticky ? 'sticky top-0 z-40' : ''} 
      w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
      ${className}
    `.trim()}>
      <div className="fluid-container h-fluid-md grid grid-cols-3 items-center">
        <div className="flex items-center gap-fluid-sm">
          <Link href="/" className="flex items-center gap-fluid-sm">
            <TerraLogo className="flex-shrink-0" />
            <span className="font-semibold text-fluid-lg hidden sm:block">Tuna Terra</span>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <nav className="hidden md:flex items-center gap-fluid-xs">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/financial-modeling">
                <span className="text-fluid-sm">Financial Modeling</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/education">
                <span className="text-fluid-sm">Education</span>
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center justify-end gap-fluid-md">
          {/* Development theme toggle - easy to comment out */}
          <ThemeToggle />

          <div className="flex gap-fluid-xs items-center">
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setAuthMode('sign-in')
                setAuthModalOpen(true)
              }}
            >
              Sign In
            </AnimatedButton>
            <AnimatedButton
              size="sm"
              onClick={() => {
                setAuthMode('sign-up')
                setAuthModalOpen(true)
              }}
            >
              Get Started
            </AnimatedButton>
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </header>
  )
}