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
import { MapIcon, TableIcon, BuildingIcon, MenuIcon } from 'lucide-react'
import { createPortfolioAwareNavigation } from '@/lib/navigation'

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
      label: 'Properties',
      icon: TableIcon
    },
    {
      href: navigation.map,
      label: 'Map View',
      icon: MapIcon
    },
    {
      href: navigation.portfolios,
      label: 'Portfolios',
      icon: BuildingIcon
    }
  ]

  const closeSheet = () => setIsOpen(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
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
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className="justify-start h-12 text-left"
                  onClick={closeSheet}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-base">{item.label}</span>
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
      <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
        <span className="text-primary-foreground font-bold text-sm">TT</span>
      </div>
      <span className="font-semibold text-lg hidden sm:block truncate">Tuna Terra</span>
    </Link>
  )
}

export function PortfolioAwareHomeButton({ className }: PortfolioAwareHomeButtonProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 bg-muted rounded-md animate-pulse flex-shrink-0" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse hidden sm:block" />
      </div>
    }>
      <HomeButtonContent className={className} />
    </Suspense>
  )
}