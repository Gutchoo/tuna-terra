'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatedButton } from '@/components/homepage/ui/AnimatedButton'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthModal } from '@/components/modals/AuthModal'

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
      <div className="fluid-container h-fluid-md flex items-center justify-between">
        <div className="flex items-center gap-fluid-sm min-w-0">
          <Link href="/" className="flex items-center gap-fluid-sm">
            <div className="w-fluid-sm h-fluid-sm bg-primary rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-fluid-xs">TT</span>
            </div>
            <span className="font-semibold text-fluid-lg hidden sm:block">Tuna Terra</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-fluid-md">
          <nav className="hidden md:flex items-center gap-fluid-md">
            {/* Development theme toggle - easy to comment out */}
            <ThemeToggle />
            <Link href="/financial-modeling" className="text-fluid-sm font-medium hover:text-primary transition-colors">
              Financial Modeling
            </Link>
            <Link href="/education" className="text-fluid-sm font-medium hover:text-primary transition-colors">
              Education
            </Link>
            <Link href="/tools" className="text-fluid-sm font-medium hover:text-primary transition-colors">
              Tools
            </Link>
          </nav>
          
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