'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlusIcon, BuildingIcon, UsersIcon, Share2Icon, SettingsIcon, TrashIcon } from 'lucide-react'
import { SharePortfolioDialog } from '@/components/portfolios/SharePortfolioDialog'
import { InlineEditablePortfolioName } from '@/components/portfolios/InlineEditablePortfolioName'
import { DeletePortfolioDialog } from '@/components/portfolios/DeletePortfolioDialog'
import { BulkActionBar } from '@/components/portfolios/BulkActionBar'
import { SearchBar } from '@/components/properties/SearchBar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CreatePortfolioModal } from '@/components/modals/CreatePortfolioModal'
import { usePortfolios, useUpdatePortfolioName } from '@/hooks/use-portfolios'
import type { PortfolioWithMembership } from '@/lib/supabase'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

export default function PortfoliosPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [portfolioToDelete, setPortfolioToDelete] = useState<PortfolioWithMembership | null>(null)
  const [selectedPortfolios, setSelectedPortfolios] = useState<Set<string>>(new Set())
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isProcessingBulk, setIsProcessingBulk] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [createPortfolioModalOpen, setCreatePortfolioModalOpen] = useState(false)
  
  // Use React Query for consistent data management
  const { data: portfolios = [], isLoading: loading, refetch } = usePortfolios(true)
  const updatePortfolioName = useUpdatePortfolioName()

  const handleCreatePortfolio = () => {
    setCreatePortfolioModalOpen(true)
  }

  const handleViewPortfolio = (portfolioId: string) => {
    router.push(`/dashboard?portfolio_id=${portfolioId}`)
  }

  const handleDeletePortfolio = (portfolio: PortfolioWithMembership) => {
    setPortfolioToDelete(portfolio)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = useCallback(() => {
    // React Query will automatically refresh the list
    // No manual refetch needed due to mutation's onSuccess callback
    setDeleteDialogOpen(false)
    setPortfolioToDelete(null)
  }, [])

  const handleDeleteError = (errorMessage: string) => {
    setError(errorMessage)
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000)
  }

  const handlePortfolioNameUpdate = useCallback((portfolioId: string, newName: string) => {
    // React Query mutation will handle the optimistic update
    updatePortfolioName.mutate({ id: portfolioId, name: newName })
  }, [updatePortfolioName])

  const handleNameUpdateError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000)
  }, [])

  // Selection handlers
  const handlePortfolioSelect = useCallback((portfolioId: string, checked: boolean) => {
    setSelectedPortfolios(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(portfolioId)
      } else {
        newSet.delete(portfolioId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // Filter portfolios based on current search, then only select those user owns
      const currentFilteredPortfolios = portfolios.filter(portfolio => {
        if (!searchQuery.trim()) return true
        
        const searchLower = searchQuery.toLowerCase()
        return (
          portfolio.name.toLowerCase().includes(searchLower) ||
          (portfolio.description?.toLowerCase().includes(searchLower)) ||
          (portfolio.membership_role?.toLowerCase().includes(searchLower) || false)
        )
      })
      
      const ownedPortfolioIds = currentFilteredPortfolios
        .filter(p => p.membership_role === 'owner')
        .map(p => p.id)
      setSelectedPortfolios(new Set(ownedPortfolioIds))
    } else {
      setSelectedPortfolios(new Set())
    }
  }, [portfolios, searchQuery])

  const handleClearSelection = useCallback(() => {
    setSelectedPortfolios(new Set())
  }, [])

  const handleBulkDelete = useCallback(() => {
    setBulkDeleteDialogOpen(true)
  }, [])

  const confirmBulkDelete = useCallback(async () => {
    if (selectedPortfolios.size === 0) return

    setIsProcessingBulk(true)
    try {
      // Call bulk delete API
      const response = await fetch('/api/portfolios/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          portfolioIds: Array.from(selectedPortfolios) 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete portfolios')
      }

      // Clear selection and refresh data
      setSelectedPortfolios(new Set())
      refetch()
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error('Bulk delete error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete portfolios')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsProcessingBulk(false)
    }
  }, [selectedPortfolios, refetch])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    // Clear selection when searching to avoid confusion
    setSelectedPortfolios(new Set())
  }, [])

  // Filter portfolios based on search query
  const filteredPortfolios = portfolios.filter(portfolio => {
    if (!searchQuery.trim()) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      portfolio.name.toLowerCase().includes(searchLower) ||
      (portfolio.description?.toLowerCase().includes(searchLower)) ||
      (portfolio.membership_role?.toLowerCase().includes(searchLower) || false)
    )
  })

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'editor': return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
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

  // Filter portfolios that user owns for selection (use filtered list, exclude sample portfolios)
  const ownedPortfolios = filteredPortfolios.filter(p => p.membership_role === 'owner' && !isVirtualSamplePortfolio(p.id))
  const allOwnedSelected = ownedPortfolios.length > 0 && 
    ownedPortfolios.every(p => selectedPortfolios.has(p.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolios</h1>
            <p className="text-muted-foreground">
              Manage your property portfolios and sharing settings
            </p>
          </div>
          {ownedPortfolios.length > 0 && (
            <div className="flex items-center gap-2 ml-8">
              <Checkbox
                checked={allOwnedSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all portfolios"
              />
              <span className="text-sm text-muted-foreground">
                Select all ({ownedPortfolios.length})
              </span>
            </div>
          )}
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

      {/* Search Bar */}
      <SearchBar
        onSearchChange={handleSearchChange}
        placeholder="Search portfolios by name, description, or role..."
        resultsCount={filteredPortfolios.length}
        totalCount={portfolios.length}
      />

      {/* Empty state for no search results */}
      {filteredPortfolios.length === 0 && searchQuery.trim() && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BuildingIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No portfolios found</h3>
          <p className="text-muted-foreground">
            No portfolios match your search for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Portfolio Grid */}
      {filteredPortfolios.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolios.map((portfolio) => {
          const isSelected = selectedPortfolios.has(portfolio.id)
          return (
          <Card 
            key={portfolio.id} 
            className={`relative group transition-all duration-200 ${
              isSelected
                ? 'bg-muted/30 border-muted-foreground/20'
                : 'hover:shadow-md'
            }`}
          >
            {/* Checkbox overlay for owner portfolios (except sample portfolios) */}
            {portfolio.membership_role === 'owner' && !isVirtualSamplePortfolio(portfolio.id) && (
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedPortfolios.has(portfolio.id)}
                  onCheckedChange={(checked) => 
                    handlePortfolioSelect(portfolio.id, checked as boolean)
                  }
                  aria-label={`Select ${portfolio.name}`}
                />
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    {portfolio.membership_role === 'owner' && !isVirtualSamplePortfolio(portfolio.id) && (
                      <div className="w-5 h-5" />
                    )}
                    <BuildingIcon className="h-5 w-5" />
                    <div className="truncate">
                      {isVirtualSamplePortfolio(portfolio.id) ? (
                        <span className="truncate font-medium">{portfolio.name}</span>
                      ) : (
                        <InlineEditablePortfolioName
                          portfolioId={portfolio.id}
                          initialName={portfolio.name}
                          canEdit={portfolio.membership_role === 'owner'}
                          onNameChange={(newName) => handlePortfolioNameUpdate(portfolio.id, newName)}
                          onError={handleNameUpdateError}
                          className="truncate"
                        />
                      )}
                    </div>
                  </CardTitle>
                  {!isVirtualSamplePortfolio(portfolio.id) && (
                    <CardDescription className="mt-1 h-6 line-clamp-2">
                      {portfolio.description || 'No description'}
                    </CardDescription>
                  )}
                  {isVirtualSamplePortfolio(portfolio.id) && (
                    <div className="h-6" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isVirtualSamplePortfolio(portfolio.id) ? (
                    <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Demo</Badge>
                  ) : (
                    <Badge className={`text-xs ${getRoleColor(portfolio.membership_role)}`}>
                      {portfolio.membership_role}
                    </Badge>
                  )}

                  {portfolio.membership_role === 'owner' && !isVirtualSamplePortfolio(portfolio.id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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

                  {portfolio.membership_role === 'owner' && !isVirtualSamplePortfolio(portfolio.id) && (
                    <SharePortfolioDialog
                      portfolio={portfolio}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Share2Icon className="h-4 w-4" />
                        </Button>
                      }
                      onShareSuccess={() => refetch()}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          )
        })}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedPortfolios.size}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        isProcessing={isProcessingBulk}
      />

      {/* Delete Portfolio Dialog */}
      <DeletePortfolioDialog
        portfolio={portfolioToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Portfolios</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPortfolios.size} portfolio{selectedPortfolios.size === 1 ? '' : 's'}? 
              This action cannot be undone and will permanently delete all properties within these portfolios.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={isProcessingBulk}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? 'Deleting...' : 'Delete All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        open={createPortfolioModalOpen}
        onOpenChange={setCreatePortfolioModalOpen}
      />
    </div>
  )
}