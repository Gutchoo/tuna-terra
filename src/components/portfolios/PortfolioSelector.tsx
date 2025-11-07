'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, UsersIcon, BuildingIcon } from 'lucide-react'
import { InlineEditablePortfolioName } from './InlineEditablePortfolioName'
import { usePortfolios, useUpdatePortfolioName } from '@/hooks/use-portfolios'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'
// Types imported but may be used in future interface definitions

interface PortfolioSelectorProps {
  onPortfolioChange?: (portfolioId: string | null) => void
  showCreateButton?: boolean
  compact?: boolean
  enableInlineEdit?: boolean
}

export function PortfolioSelector({ 
  onPortfolioChange, 
  showCreateButton = true,
  compact = false,
  enableInlineEdit = false
}: PortfolioSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPortfolio, setCurrentPortfolio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use optimized hooks for data fetching
  const { data: portfolios = [], isLoading: loading } = usePortfolios(true)
  const updatePortfolioName = useUpdatePortfolioName()

  // Get portfolio_id from URL params
  useEffect(() => {
    const portfolioIdFromUrl = searchParams.get('portfolio_id')
    setCurrentPortfolio(portfolioIdFromUrl)
  }, [searchParams])

  const handlePortfolioChange = (portfolioId: string | null) => {
    setCurrentPortfolio(portfolioId)
    
    // Update URL with portfolio_id
    const url = new URL(window.location.href)
    if (portfolioId) {
      url.searchParams.set('portfolio_id', portfolioId)
    } else {
      url.searchParams.delete('portfolio_id')
    }
    
    // Use replace to avoid adding to history
    router.replace(url.pathname + url.search)
    
    // Notify parent component
    onPortfolioChange?.(portfolioId)
  }

  const handleCreatePortfolio = () => {
    router.push('/dashboard/portfolios/new')
  }

  const handlePortfolioNameUpdate = (portfolioId: string, newName: string) => {
    updatePortfolioName.mutate({ id: portfolioId, name: newName })
  }

  const handleNameUpdateError = (errorMessage: string) => {
    setError(errorMessage)
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000)
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800'
      case 'editor': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    )
  }

  const selectedPortfolio = portfolios.find(p => p.id === currentPortfolio)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={currentPortfolio || ''} onValueChange={handlePortfolioChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select portfolio">
              {selectedPortfolio && (
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  {enableInlineEdit ? (
                    <InlineEditablePortfolioName
                      portfolioId={selectedPortfolio.id}
                      initialName={selectedPortfolio.name}
                      canEdit={selectedPortfolio.membership_role === 'owner'}
                      onNameChange={(newName) => handlePortfolioNameUpdate(selectedPortfolio.id, newName)}
                      onError={handleNameUpdateError}
                    />
                  ) : (
                    <span>{selectedPortfolio.name}</span>
                  )}
                  {isVirtualSamplePortfolio(selectedPortfolio.id) && (
                    <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Demo</Badge>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id}>
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  <span>{portfolio.name}</span>
                  {isVirtualSamplePortfolio(portfolio.id) ? (
                    <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Demo</Badge>
                  ) : (
                    <Badge className={`text-xs ${getRoleColor(portfolio.membership_role)}`}>
                      {portfolio.membership_role}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCreateButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/portfolios')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Portfolio</h3>
          {showCreateButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/portfolios')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          )}
        </div>

        <Select value={currentPortfolio || ''} onValueChange={handlePortfolioChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a portfolio">
              {selectedPortfolio && (
                <div className="flex items-center gap-3">
                  <BuildingIcon className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      {enableInlineEdit ? (
                        <InlineEditablePortfolioName
                          portfolioId={selectedPortfolio.id}
                          initialName={selectedPortfolio.name}
                          canEdit={selectedPortfolio.membership_role === 'owner'}
                          onNameChange={(newName) => handlePortfolioNameUpdate(selectedPortfolio.id, newName)}
                          onError={handleNameUpdateError}
                          className="font-medium"
                        />
                      ) : (
                        <span className="font-medium">{selectedPortfolio.name}</span>
                      )}
                      {isVirtualSamplePortfolio(selectedPortfolio.id) && (
                        <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Demo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={`text-xs ${getRoleColor(selectedPortfolio.membership_role)}`}>
                        {selectedPortfolio.membership_role}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <BuildingIcon className="h-3 w-3" />
                        {selectedPortfolio.property_count || 0} properties
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        {selectedPortfolio.member_count || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id}>
                <div className="flex items-center gap-3 py-2">
                  <BuildingIcon className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{portfolio.name}</span>
                      {isVirtualSamplePortfolio(portfolio.id) && (
                        <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Demo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={`text-xs ${getRoleColor(portfolio.membership_role)}`}>
                        {portfolio.membership_role}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <BuildingIcon className="h-3 w-3" />
                        {portfolio.property_count || 0} properties
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        {portfolio.member_count || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPortfolio?.description && (
          <p className="text-sm text-muted-foreground mt-3">
            {selectedPortfolio.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}