'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlusIcon, BuildingIcon, UsersIcon, Share2Icon, SettingsIcon, TrashIcon } from 'lucide-react'
import { SharePortfolioDialog } from '@/components/portfolios/SharePortfolioDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { PortfolioWithMembership } from '@/lib/supabase'

export default function PortfoliosPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<PortfolioWithMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPortfolios()
  }, [])

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/portfolios?include_stats=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }

      const data = await response.json()
      setPortfolios(data.portfolios || [])
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      setError('Failed to load portfolios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePortfolio = () => {
    router.push('/dashboard/portfolios/new')
  }

  const handleViewPortfolio = (portfolioId: string) => {
    router.push(`/dashboard?portfolio_id=${portfolioId}`)
  }

  const handleEditPortfolio = (portfolioId: string) => {
    router.push(`/dashboard/portfolios/${portfolioId}/edit`)
  }

  const handleDeletePortfolio = async (portfolioId: string, portfolioName: string) => {
    if (!confirm(`Are you sure you want to delete "${portfolioName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete portfolio')
      }

      // Refresh portfolios list
      await fetchPortfolios()
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete portfolio')
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'editor': return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolios</h1>
            <p className="text-muted-foreground">Manage your property portfolios and sharing settings</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolios</h1>
          <p className="text-muted-foreground">
            Manage your property portfolios and sharing settings
          </p>
        </div>
        <Button onClick={handleCreatePortfolio} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Portfolio
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="relative group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <BuildingIcon className="h-5 w-5" />
                    <span className="truncate">{portfolio.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {portfolio.description || 'No description'}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getRoleColor(portfolio.membership_role)}`}>
                    {portfolio.membership_role}
                  </Badge>

                  {portfolio.membership_role === 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPortfolio(portfolio.id)}>
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Edit Portfolio
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!portfolio.is_default && (
                          <DropdownMenuItem
                            onClick={() => handleDeletePortfolio(portfolio.id, portfolio.name)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Portfolio
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{portfolio.property_count || 0}</span>
                    <span className="text-muted-foreground">properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{portfolio.member_count || 0}</span>
                    <span className="text-muted-foreground">members</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  Created {formatDate(portfolio.created_at)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPortfolio(portfolio.id)}
                    className="flex-1"
                  >
                    View Properties
                  </Button>

                  {portfolio.membership_role === 'owner' && (
                    <SharePortfolioDialog
                      portfolio={portfolio}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Share2Icon className="h-4 w-4" />
                        </Button>
                      }
                      onShareSuccess={fetchPortfolios}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {portfolios.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <BuildingIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first portfolio to start organizing your properties
              </p>
              <Button onClick={handleCreatePortfolio} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Portfolio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}