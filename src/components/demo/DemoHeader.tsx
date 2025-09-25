'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye } from 'lucide-react'
import { AuthModal } from '@/components/modals/AuthModal'
import { TerraLogo } from '@/components/ui/terra-logo'
import { useDemo } from '@/contexts/DemoContext'

export function DemoHeader() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()
  const { exitDemoMode } = useDemo()

  const handleExitDemo = () => {
    exitDemoMode()
    router.push('/')
  }

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="fluid-container h-fluid-md flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-fluid-sm">
              {/* Logo/Brand */}
              <Link href="/" className="flex items-center gap-fluid-sm">
                <TerraLogo />
                <span className="font-semibold text-fluid-lg">Tuna Terra</span>
              </Link>

              {/* Demo indicator */}
              <div className="flex items-center gap-fluid-xs">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Demo Mode
                </Badge>
                <span className="text-fluid-sm text-muted-foreground hidden sm:inline">
                  Explore Sample Data
                </span>
              </div>
            </div>

            <div className="flex items-center gap-fluid-sm">
              {/* Exit Demo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitDemo}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Demo</span>
              </Button>

              {/* Sign Up CTA */}
              <Button
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode="sign-up"
      />
    </>
  )
}