'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePortfolios } from '@/hooks/use-portfolios'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { MenuIcon } from 'lucide-react'
import { createPortfolioAwareNavigation } from '@/lib/navigation'
import { TerraLogo } from '@/components/ui/terra-logo'

function NavigationContent() {
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')
  const [isOpen, setIsOpen] = useState(false)
  const { data: portfolios = [] } = usePortfolios()
  
  // Check if current portfolio actually exists
  const portfolioExists = currentPortfolioId 
    ? portfolios.some(p => p.id === currentPortfolioId)
    : true // If no portfolio specified, assume valid state
  
  const navigation = createPortfolioAwareNavigation(currentPortfolioId, portfolioExists)

  const navItems = [
    {
      href: navigation.properties,
      label: 'Properties'
    },
    {
      href: navigation.portfolios,
      label: 'Portfolios'
    },
    {
      href: '/financial-modeling',
      label: 'Financial Modeling'
    },
    {
      href: '/education',
      label: 'Education'
    }
  ]

  const closeSheet = () => setIsOpen(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-fluid-xs">
        {navItems.map((item) => {
          return (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href} className="flex items-center">
                <span className="text-fluid-sm">{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[clamp(280px,80vw,400px)]">
          <SheetHeader>
            <SheetTitle className="text-fluid-lg">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-fluid-sm mt-fluid-md">
            {navItems.map((item) => {
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className="justify-start h-fluid-md text-left"
                  onClick={closeSheet}
                >
                  <Link href={item.href} className="flex items-center">
                    <span className="text-fluid-base">{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function PortfolioAwareNavigation() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1">
        <div className="h-8 w-8 bg-muted rounded animate-pulse md:hidden" />
        <div className="hidden md:flex items-center gap-1">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    }>
      <NavigationContent />
    </Suspense>
  )
}

interface PortfolioAwareHomeButtonProps {
  className?: string
}

function HomeButtonContent({ className }: PortfolioAwareHomeButtonProps) {
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')
  const { data: portfolios = [] } = usePortfolios()
  
  // Check if current portfolio actually exists
  const portfolioExists = currentPortfolioId 
    ? portfolios.some(p => p.id === currentPortfolioId)
    : true // If no portfolio specified, assume valid state
  
  const navigation = createPortfolioAwareNavigation(currentPortfolioId, portfolioExists)

  return (
    <Link href={navigation.home} className={className}>
      <TerraLogo className="flex-shrink-0" />
    </Link>
  )
}

export function PortfolioAwareHomeButton({ className }: PortfolioAwareHomeButtonProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 bg-muted rounded-md animate-pulse flex-shrink-0" />
      </div>
    }>
      <HomeButtonContent className={className} />
    </Suspense>
  )
}