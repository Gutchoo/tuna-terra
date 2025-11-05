'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TerraLogo } from '@/components/ui/terra-logo'
import { PortfolioSelector } from '@/components/portfolios/PortfolioSelector'
import { UserMenu } from '@/components/user-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MenuIcon } from 'lucide-react'
import { useState } from 'react'

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Hide portfolio selector on portfolios management page
  const isPortfoliosPage = pathname === '/dashboard/portfolios'

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-none">
        {/* Mobile hamburger - visible only on mobile/tablet */}
        <div className="flex lg:hidden mr-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-6">
                {/* Logo in mobile menu */}
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <TerraLogo size="md" />
                  <span className="text-lg font-semibold">TunaTerra</span>
                </Link>

                {/* Portfolio selector in mobile menu */}
                {!isPortfoliosPage && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Portfolio</h3>
                    <PortfolioSelector
                      compact={true}
                      showCreateButton={true}
                      enableInlineEdit={false}
                    />
                  </div>
                )}

                {/* Placeholder for future navigation */}
                {/* <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard/portfolios" className="text-sm hover:underline">
                      Manage Portfolios
                    </Link>
                  </div>
                </div> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Three-column layout with equal flex basis */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center">
          {/* Left: Logo + Name */}
          <div className="flex-1 flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TerraLogo size="md" />
              <span className="text-lg font-semibold">TunaTerra</span>
            </Link>
          </div>

          {/* Center: Portfolio Selector (conditionally rendered) */}
          {!isPortfoliosPage && (
            <div className="flex-1 flex justify-center items-center px-4">
              <PortfolioSelector
                compact={true}
                showCreateButton={true}
                enableInlineEdit={false}
              />
            </div>
          )}

          {/* Right: User Menu */}
          <div className="flex-1 flex justify-end items-center">
            <UserMenu />
          </div>
        </div>

        {/* Mobile: Just logo (left) */}
        <div className="flex lg:hidden items-center">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <TerraLogo size="sm" />
          </Link>
        </div>

        {/* Mobile: User Menu (right) */}
        <div className="flex lg:hidden ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
