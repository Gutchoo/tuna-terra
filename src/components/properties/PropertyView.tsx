'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { PropertyViewToggle } from './PropertyViewToggle'
import { PropertyCardView } from './PropertyCardView'
import { PropertyTableView } from './PropertyTableView'
import { BulkActionBar } from './BulkActionBar'
import { SearchBar } from './SearchBar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Property } from '@/lib/supabase'
import { isVirtualSampleProperty } from '@/lib/sample-portfolio'
import { useDeleteProperty, useDeleteProperties, useRefreshProperty } from '@/hooks/use-properties'
import { toast } from 'sonner'

type ViewMode = 'cards' | 'table'

interface PropertyViewProps {
  properties: Property[]
  onPropertiesChange: (properties: Property[]) => void
  onError: (error: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PropertyView({ properties, onPropertiesChange, onError }: PropertyViewProps) {
  // React Query mutations for property operations
  const deleteProperty = useDeleteProperty()
  const deleteProperties = useDeleteProperties()
  const refreshProperty = useRefreshProperty()
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const previousSearchQuery = useRef('')
  
  // Action states
  const [refreshingPropertyId, setRefreshingPropertyId] = useState<string | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load saved view preference
  useEffect(() => {
    const savedView = localStorage.getItem('property-view-mode')
    if (savedView === 'cards' || savedView === 'table') {
      setViewMode(savedView)
    }
  }, [])

  // Save view preference
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    localStorage.setItem('property-view-mode', view)
    // Clear selections when switching views
    setSelectedRows(new Set())
  }

  // Clean up invalid selections when properties change
  useEffect(() => {
    if (selectedRows.size > 0) {
      const validPropertyIds = new Set(properties.map(p => p.id))
      const validSelections = Array.from(selectedRows).filter(id => validPropertyIds.has(id))
      
      if (validSelections.length !== selectedRows.size) {
        setSelectedRows(new Set(validSelections))
      }
    }
  }, [properties, selectedRows])

  // Multi-field search algorithm
  const searchInProperty = (property: Property, query: string): boolean => {
    if (!query.trim()) return true
    
    const lowerQuery = query.toLowerCase().trim()
    const searchableFields = [
      property.address,
      property.city,
      property.state, 
      property.zip_code,
      property.owner,
      property.apn,
      property.county,
      property.zoning,
      property.use_description,
      property.subdivision,
      property.use_code,
      property.zoning_description
    ]
    
    return searchableFields.some(field => 
      field?.toLowerCase().includes(lowerQuery)
    )
  }

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    return properties.filter(property => searchInProperty(property, searchQuery))
  }, [properties, searchQuery])

  // Handle search query change
  const handleSearchChange = (query: string) => {
    // Only clear selections when the search query actually changes
    if (query !== previousSearchQuery.current) {
      setSelectedRows(new Set())
      previousSearchQuery.current = query
    }
    setSearchQuery(query)
  }

  // Card expansion
  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  // Row selection
  const handleRowSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedRows)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // Only select non-sample properties
      const selectableProperties = filteredProperties.filter(p => !isVirtualSampleProperty(p.id))
      setSelectedRows(new Set(selectableProperties.map(p => p.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  // Single property refresh
  const handleRefreshClick = async (property: Property) => {
    if (!property.apn) {
      toast.error('Cannot refresh property: No APN available')
      return
    }

    setRefreshingPropertyId(property.id)
    
    try {
      await refreshProperty.mutateAsync(property.id)
      toast.success('Property data refreshed successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh property data')
    } finally {
      setRefreshingPropertyId(null)
    }
  }

  // Single property delete
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return

    setIsDeleting(true)
    try {
      await deleteProperty.mutateAsync(propertyToDelete.id)
      
      // Remove from selections
      const newSelected = new Set(selectedRows)
      newSelected.delete(propertyToDelete.id)
      setSelectedRows(newSelected)
      
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
      toast.success('Property deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete property')
    } finally {
      setIsDeleting(false)
    }
  }

  // Bulk operations
  const handleBulkRefresh = async () => {
    setBulkProcessing(true)
    // Filter out sample properties from bulk operations
    const selectedProperties = filteredProperties.filter(p => 
      selectedRows.has(p.id) && !isVirtualSampleProperty(p.id)
    )
    let successCount = 0
    let errorCount = 0

    try {
      for (const property of selectedProperties) {
        try {
          await handleRefreshClick(property)
          successCount++
        } catch (err) {
          console.error(`Failed to refresh ${property.address}:`, err)
          errorCount++
        }
      }

      if (errorCount > 0) {
        onError(`Refreshed ${successCount} properties, ${errorCount} failed`)
      }
    } finally {
      setBulkProcessing(false)
      setSelectedRows(new Set()) // Clear selection after bulk operation
    }
  }

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    setBulkProcessing(true)
    // Filter out sample properties from bulk delete
    const selectedIds = Array.from(selectedRows).filter(id => !isVirtualSampleProperty(id))

    try {
      await deleteProperties.mutateAsync(selectedIds)
      
      setSelectedRows(new Set())
      setBulkDeleteDialogOpen(false)
      toast.success(`Successfully deleted ${selectedIds.length} properties`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete properties')
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedRows(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        onSearchChange={handleSearchChange}
        resultsCount={filteredProperties.length}
        totalCount={properties.length}
      />

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <PropertyViewToggle currentView={viewMode} onViewChange={handleViewChange} />
        {viewMode === 'table' && selectedRows.size > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedRows.size} of {filteredProperties.length} selected
          </div>
        )}
      </div>

      {/* Content */}
      {filteredProperties.length === 0 && searchQuery.trim().length > 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or{' '}
            <button 
              onClick={() => handleSearchChange('')}
              className="text-primary hover:underline"
            >
              clear the search
            </button>{' '}
            to see all properties.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <PropertyCardView
          properties={filteredProperties}
          expandedCards={expandedCards}
          onToggleExpand={handleToggleExpand}
          onRefresh={handleRefreshClick}
          onDelete={handleDeleteClick}
          refreshingPropertyId={refreshingPropertyId}
        />
      ) : (
        <PropertyTableView
          properties={filteredProperties}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onRefresh={handleRefreshClick}
          onDelete={handleDeleteClick}
          refreshingPropertyId={refreshingPropertyId}
        />
      )}

      {/* Bulk Action Bar */}
      {viewMode === 'table' && filteredProperties.length > 0 && (
        <BulkActionBar
          selectedCount={selectedRows.size}
          onBulkRefresh={handleBulkRefresh}
          onBulkDelete={handleBulkDeleteClick}
          onClearSelection={handleClearSelection}
          isProcessing={bulkProcessing}
        />
      )}

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{propertyToDelete?.address}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Property'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Properties</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.size} properties? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={bulkProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkProcessing ? 'Deleting...' : `Delete ${selectedRows.size} Properties`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}