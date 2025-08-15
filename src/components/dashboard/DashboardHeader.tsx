'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  BuildingIcon, 
  PlusIcon, 
  SettingsIcon, 
  InfoIcon,
  MapIcon,
  UserIcon,
  HomeIcon,
  FileTextIcon,
  DollarSignIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { InlineEditablePortfolioName } from '@/components/portfolios/InlineEditablePortfolioName'
import { AddPropertiesModal } from '@/components/modals/AddPropertiesModal'
import { usePortfolios, useUpdatePortfolioName } from '@/hooks/use-portfolios'
import { useUserLimits, useRemainingLookups } from '@/hooks/use-user-limits'
// import type { PortfolioWithMembership } from '@/lib/supabase'

interface DashboardHeaderProps {
  onPortfolioChange?: (portfolioId: string | null) => void
}

export function DashboardHeader({ onPortfolioChange }: DashboardHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showProInfoModal, setShowProInfoModal] = useState(false)
  const [showAddPropertiesModal, setShowAddPropertiesModal] = useState(false)
  
  // Use optimized hooks for data fetching
  const { data: portfolios = [], isLoading: portfoliosLoading } = usePortfolios(true)
  const { data: userLimits } = useUserLimits()
  const remainingLookups = useRemainingLookups()
  const updatePortfolioName = useUpdatePortfolioName()

  const loading = portfoliosLoading
  
  // Get current portfolio from URL params directly (no local state)
  const currentPortfolio = searchParams.get('portfolio_id')

  const handlePortfolioChange = useCallback((portfolioId: string | null) => {
    const url = new URL(window.location.href)
    if (portfolioId) {
      url.searchParams.set('portfolio_id', portfolioId)
    } else {
      url.searchParams.delete('portfolio_id')
    }
    
    router.replace(url.pathname + url.search)
    onPortfolioChange?.(portfolioId)
  }, [router, onPortfolioChange])

  const handlePortfolioNameUpdate = useCallback((portfolioId: string, newName: string) => {
    updatePortfolioName.mutate({ id: portfolioId, name: newName })
  }, [updatePortfolioName])

  const getRoleColor = useCallback((role?: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800'
      case 'editor': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const selectedPortfolio = useMemo(() => 
    portfolios.find(p => p.id === currentPortfolio), 
    [portfolios, currentPortfolio]
  )
  
  // Check if we have a portfolio ID but no matching portfolio data yet (loading state)
  const isWaitingForPortfolioData = currentPortfolio && !selectedPortfolio && !loading

  const ProLookupModal = () => (
    <Dialog open={showProInfoModal} onOpenChange={setShowProInfoModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Pro Lookup Benefits
          </DialogTitle>
          <DialogDescription>
            Unlock comprehensive property data with detailed property information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-3">
              <MapIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Property Mapping</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Exact boundaries & coordinates</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Owner Information</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Names & mailing addresses</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSignIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Financial Data</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Assessed values & sale history</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <HomeIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Property Details</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Lot size, year built, stories & units</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileTextIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Zoning & Use</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Codes & development restrictions</span>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-48 bg-muted rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-32 bg-muted rounded animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Top Row - Portfolio Selector */}
            <div className="flex items-center gap-2">
              <Select value={currentPortfolio || ''} onValueChange={handlePortfolioChange}>
                <SelectTrigger className="flex-1 min-w-0">
                  <SelectValue placeholder="Select portfolio">
                    {selectedPortfolio ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <BuildingIcon className="h-4 w-4 flex-shrink-0" />
                        <InlineEditablePortfolioName
                          portfolioId={selectedPortfolio.id}
                          initialName={selectedPortfolio.name}
                          canEdit={selectedPortfolio.membership_role === 'owner'}
                          onNameChange={(newName) => handlePortfolioNameUpdate(selectedPortfolio.id, newName)}
                          onError={() => {}}
                          className="font-medium truncate"
                        />
                        {selectedPortfolio.is_default && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">Default</Badge>
                        )}
                      </div>
                    ) : isWaitingForPortfolioData ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <BuildingIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">Loading portfolio...</span>
                      </div>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {portfolios?.map((portfolio) => (
                    <SelectItem key={`portfolio-${portfolio.id}`} value={portfolio.id}>
                      <div className="flex items-center gap-2 min-w-0">
                        <BuildingIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{portfolio.name}</span>
                        {portfolio.is_default && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">Default</Badge>
                        )}
                        <Badge className={`text-xs flex-shrink-0 ${getRoleColor(portfolio.membership_role)}`}>
                          {portfolio.membership_role}
                        </Badge>
                      </div>
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            {/* Second Row - Pro Lookups and Actions */}
            <div className="flex items-center justify-between gap-2">
              {/* Pro Lookups Information - Compact */}
              {userLimits && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge 
                    variant={userLimits.tier === 'pro' ? 'default' : 'secondary'}
                    className="font-medium text-xs flex-shrink-0"
                  >
                    {userLimits.tier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {userLimits?.tier === 'pro' 
                      ? 'Unlimited' 
                      : `${remainingLookups} left`
                    }
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
                        onClick={() => setShowProInfoModal(true)}
                      >
                        <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">What are Pro lookups?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>What are Pro lookups?</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Action Buttons - Mobile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" asChild className="text-xs px-2">
                  <Link href="/dashboard/portfolios">
                    <SettingsIcon className="h-3 w-3" />
                    <span className="ml-1 hidden xs:inline">Manage</span>
                  </Link>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowAddPropertiesModal(true)}
                  className="text-xs px-2"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span className="ml-1">Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left side - Portfolio selector and Pro Lookups */}
            <div className="flex items-center gap-8">
              {/* Portfolio Selector */}
              <div className="flex items-center gap-2">
                <Select value={currentPortfolio || ''} onValueChange={handlePortfolioChange}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select portfolio">
                      {selectedPortfolio ? (
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4" />
                          <InlineEditablePortfolioName
                            portfolioId={selectedPortfolio.id}
                            initialName={selectedPortfolio.name}
                            canEdit={selectedPortfolio.membership_role === 'owner'}
                            onNameChange={(newName) => handlePortfolioNameUpdate(selectedPortfolio.id, newName)}
                            onError={() => {}}
                            className="font-medium"
                          />
                          {selectedPortfolio.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <Badge 
                            className={`text-xs ${getRoleColor(selectedPortfolio.membership_role)}`}
                          >
                            {selectedPortfolio.membership_role}
                          </Badge>
                        </div>
                      ) : isWaitingForPortfolioData ? (
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4" />
                          <span className="font-medium">Loading portfolio...</span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios?.map((portfolio) => (
                      <SelectItem key={`desktop-portfolio-${portfolio.id}`} value={portfolio.id}>
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4" />
                          <span>{portfolio.name}</span>
                          {portfolio.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <Badge className={`text-xs ${getRoleColor(portfolio.membership_role)}`}>
                            {portfolio.membership_role}
                          </Badge>
                        </div>
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>

              {/* Pro Lookups Information */}
              {userLimits && (
                <div className="flex items-center gap-3 pl-6 border-l">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={userLimits.tier === 'pro' ? 'default' : 'secondary'}
                      className="font-medium"
                    >
                      {userLimits.tier === 'pro' ? 'Pro' : 'Free'} Tier
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pro Lookups: {userLimits?.tier === 'pro' 
                          ? 'Unlimited' 
                          : `${remainingLookups} remaining`
                        }
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => setShowProInfoModal(true)}
                          >
                            <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            <span className="sr-only">What are Pro lookups?</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>What are Pro lookups?</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/portfolios" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Manage Portfolios
                </Link>
              </Button>
              <Button 
                onClick={() => setShowAddPropertiesModal(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ProLookupModal />
      <AddPropertiesModal
        open={showAddPropertiesModal}
        onOpenChange={setShowAddPropertiesModal}
        portfolioId={currentPortfolio}
      />
    </TooltipProvider>
  )
}