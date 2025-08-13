'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapIcon, TableIcon, BuildingIcon } from 'lucide-react'
import { createPortfolioAwareNavigation } from '@/lib/navigation'

export function PortfolioAwareNavigation() {
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')
  
  const navigation = createPortfolioAwareNavigation(currentPortfolioId)

  return (
    <nav className="hidden md:flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={navigation.properties} className="flex items-center gap-2">
          <TableIcon className="h-4 w-4" />
          Properties
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={navigation.map} className="flex items-center gap-2">
          <MapIcon className="h-4 w-4" />
          Map View
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={navigation.portfolios} className="flex items-center gap-2">
          <BuildingIcon className="h-4 w-4" />
          Portfolios
        </Link>
      </Button>
    </nav>
  )
}

interface PortfolioAwareHomeButtonProps {
  className?: string
}

export function PortfolioAwareHomeButton({ className }: PortfolioAwareHomeButtonProps) {
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')
  
  const navigation = createPortfolioAwareNavigation(currentPortfolioId)

  return (
    <Link href={navigation.home} className={className}>
      <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">TT</span>
      </div>
      <span className="font-semibold text-lg">Tuna Terra</span>
    </Link>
  )
}