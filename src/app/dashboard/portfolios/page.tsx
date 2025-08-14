'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlusIcon, BuildingIcon, UsersIcon, Share2Icon, SettingsIcon, TrashIcon } from 'lucide-react'
import { SharePortfolioDialog } from '@/components/portfolios/SharePortfolioDialog'
import { InlineEditablePortfolioName } from '@/components/portfolios/InlineEditablePortfolioName'
import { DeletePortfolioDialog } from '@/components/portfolios/DeletePortfolioDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { PortfolioWithMembership } from '@/lib/supabase'

export default function PortfoliosPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<PortfolioWithMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [portfolioToDelete, setPortfolioToDelete] = useState<PortfolioWithMembership | null>(null)

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

  const handleDeletePortfolio = (portfolio: PortfolioWithMembership) => {
    setPortfolioToDelete(portfolio)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    // Refresh portfolios list
    fetchPortfolios()
  }

  const handleDeleteError = (errorMessage: string) => {
    setError(errorMessage)
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000)
  }

  const handlePortfolioNameUpdate = (portfolioId: string, newName: string) => {
    setPortfolios(prev => prev.map(p => 
      p.id === portfolioId 
        ? { ...p, name: newName }
        : p
    ))
  }

  const handleNameUpdateError = (errorMessage: string) => {
    setError(errorMessage)
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000)
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

  // Show empty state if no portfolios exist
  if (portfolios.length === 0 && !loading) {
    return (
      <div className="flex flex-col min-h-screen">
        {error && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Centered empty state */}
        <div className="flex flex-col items-center justify-start flex-1 max-w-md mx-auto px-6 pt-20 text-center">
          {/* Simple Icon */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
              <BuildingIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          {/* Clean Typography */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Create your first portfolio
            </h1>
            
            <p className="text-muted-foreground leading-relaxed">
              Organize and manage your real estate properties in one place. 
              Get started by creating your first portfolio.
            </p>
          </div>

          {/* Single CTA */}
          <Button 
            onClick={handleCreatePortfolio}
            size="lg"
            className="w-full max-w-xs h-12 flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Portfolio
          </Button>
        </div>
        
        {/* Delete Portfolio Dialog */}
        <DeletePortfolioDialog
          portfolio={portfolioToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleteSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
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
                    <div className="truncate">
                      <InlineEditablePortfolioName
                        portfolioId={portfolio.id}
                        initialName={portfolio.name}
                        canEdit={portfolio.membership_role === 'owner'}
                        onNameChange={(newName) => handlePortfolioNameUpdate(portfolio.id, newName)}
                        onError={handleNameUpdateError}
                        className="truncate"
                      />
                    </div>
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
                        <DropdownMenuItem
                          onClick={() => handleDeletePortfolio(portfolio)}
                          className="text-red-600"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Portfolio
                          </DropdownMenuItem>
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
      </div>

      {/* Delete Portfolio Dialog */}
      <DeletePortfolioDialog
        portfolio={portfolioToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />
    </div>
  )
}