'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { PropertyViewToggle } from './PropertyViewToggle'
import { PropertyCardView } from './PropertyCardView'
import { PropertyTableView } from './PropertyTableView'
import { BulkActionBar } from './BulkActionBar'
import { SearchInput } from './SearchBar'
import { ColumnSelector, AVAILABLE_COLUMNS } from './ColumnSelector'
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
import { useCensusData } from '@/hooks/useCensusData'
import { usePortfolioRole } from '@/hooks/use-portfolio-role'
import { FullScreenMapView } from './FullScreenMapView'
import { toast } from 'sonner'
import { exportPropertiesToCSV } from '@/lib/csv-export'
import { PropertyDashboardView } from '../property-dashboard/PropertyDashboardView'

type ViewMode = 'cards' | 'table' | 'map' | 'dashboard'

interface PropertyViewProps {
  properties: Property[]
  onPropertiesChange: (properties: Property[]) => void
  onError: (error: string) => void
  portfolioId?: string | null
  portfolioName?: string
  onAddProperties?: (method?: 'csv' | 'apn' | 'address') => void
  // Demo mode override handlers
  onRefreshOverride?: (property: Property) => void
  onDeleteOverride?: (property: Property) => void
}

export function PropertyView({ properties, onPropertiesChange, onError, portfolioId, portfolioName, onAddProperties, onRefreshOverride, onDeleteOverride }: PropertyViewProps) {
  // React Query mutations for property operations
  const deleteProperty = useDeleteProperty()
  const deleteProperties = useDeleteProperties()
  const refreshProperty = useRefreshProperty()

  // Get user's role in current portfolio for permission checks
  const { data: userRole, isLoading: isLoadingRole } = usePortfolioRole(portfolioId ?? null)
  // In demo mode (no portfolio), allow full editing. Otherwise, check role permissions
  const canEdit = !portfolioId || userRole === 'owner' || userRole === 'editor'

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [dashboardPropertyId, setDashboardPropertyId] = useState<string | null>(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const previousSearchQuery = useRef('')
  
  // Column visibility state (allow virtual columns)
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Property | string>>(() => {
    return new Set(AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.key))
  })
  
  // Action states
  const [refreshingPropertyId, setRefreshingPropertyId] = useState<string | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Census data hook
  const { censusData, isLoading: isLoadingCensus, error: censusError } = useCensusData(properties)

  // Handle census data errors
  useEffect(() => {
    if (censusError) {
      console.warn('Census data error:', censusError)
      // Don't show toast for census errors as it's not critical to property display
    }
  }, [censusError])

  // Load saved view preference
  useEffect(() => {
    const savedView = localStorage.getItem('property-view-mode')
    if (savedView === 'cards' || savedView === 'table' || savedView === 'map') {
      setViewMode(savedView as ViewMode)
    }
  }, [])

  // Load saved column preferences
  useEffect(() => {
    const saved = localStorage.getItem('propertyTableColumns')
    if (saved) {
      try {
        const savedColumns = JSON.parse(saved)
        setVisibleColumns(new Set(savedColumns))
      } catch (error) {
        console.warn('Failed to load saved column preferences:', error)
      }
    }
  }, [])

  // Save column preferences
  useEffect(() => {
    localStorage.setItem('propertyTableColumns', JSON.stringify(Array.from(visibleColumns)))
  }, [visibleColumns])

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
    // Use override handler if provided (for demo mode)
    if (onRefreshOverride) {
      return onRefreshOverride(property)
    }

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
    // Use override handler if provided (for demo mode)
    if (onDeleteOverride) {
      return onDeleteOverride(property)
    }

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

  // CSV Export handler
  const handleExportCSV = () => {
    try {
      const portfolioDisplayName = portfolioName || 'portfolio'
      // Export filtered properties (respects search)
      exportPropertiesToCSV(filteredProperties, portfolioDisplayName)
      toast.success(`Exported ${filteredProperties.length} properties to CSV`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export CSV')
    }
  }

  // Helper to determine which properties to show (all properties if no search matches, filtered otherwise)
  const displayProperties = filteredProperties.length === 0 && searchQuery.trim().length > 0 ? properties : filteredProperties

  // Handle property click to open dashboard
  const handlePropertyClick = (propertyId: string) => {
    setDashboardPropertyId(propertyId)
    setViewMode('dashboard')
  }

  // Handle back from dashboard
  const handleBackFromDashboard = () => {
    setDashboardPropertyId(null)
    setViewMode('cards') // Return to cards view by default
  }

  // If in dashboard mode, render the dashboard view
  if (viewMode === 'dashboard' && dashboardPropertyId) {
    const dashboardProperty = properties.find(p => p.id === dashboardPropertyId)
    if (dashboardProperty) {
      return (
        <PropertyDashboardView
          property={dashboardProperty}
          portfolioId={portfolioId || ''}
          portfolioName={portfolioName}
          onBack={handleBackFromDashboard}
        />
      )
    }
  }

  return (
    <div>
      {/* Perfect Alignment Container - Search Input, View Switcher, Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            onSearchChange={handleSearchChange}
            placeholder="Search properties..."
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />
        </div>

        <div className="flex items-center gap-3">
          <PropertyViewToggle
            currentView={viewMode === 'dashboard' ? 'cards' : viewMode}
            onViewChange={handleViewChange}
          />

          <Button
            onClick={handleExportCSV}
            disabled={!portfolioId || filteredProperties.length === 0}
            variant="outline"
            size="default"
            className={!portfolioId ? "opacity-60 cursor-not-allowed" : ""}
          >
            <Download className="w-4 h-4 mr-2" />
            Export {filteredProperties.length > 0 ? `${filteredProperties.length}` : ''}
            {filteredProperties.length === 1 ? ' Property' : ' Properties'}
          </Button>

          {onAddProperties && (
            <Button
              onClick={canEdit ? () => onAddProperties() : undefined}
              disabled={!canEdit}
              className={!canEdit ? "opacity-60 cursor-not-allowed" : ""}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Counter - Outside alignment container */}
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {filteredProperties.length === 0 && searchQuery.trim() ? (
            <span className="text-amber-600">
              No properties match &quot;{searchQuery}&quot;
            </span>
          ) : searchQuery.trim() ? (
            <span>
              Showing <span className="font-medium text-foreground">{filteredProperties.length}</span> of{' '}
              <span className="font-medium">{properties.length}</span> properties
            </span>
          ) : (
            <span>
              <span className="font-medium text-foreground">{properties.length}</span> properties total
            </span>
          )}
        </div>

      </div>

      {/* Table Controls - Show only when in table mode with selections */}
      {viewMode === 'table' && (
        <div className="mt-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {selectedRows.size > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedRows.size} of {filteredProperties.length} selected
              </div>
            )}
          </div>
          <ColumnSelector
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
        </div>
      )}


      {/* Content */}
      <div className="mt-4">
        {viewMode === 'cards' ? (
        <PropertyCardView
          properties={displayProperties}
          expandedCards={expandedCards}
          onToggleExpand={handleToggleExpand}
          onRefresh={canEdit ? handleRefreshClick : undefined}
          onDelete={canEdit ? handleDeleteClick : undefined}
          onPropertyClick={handlePropertyClick}
          refreshingPropertyId={refreshingPropertyId}
          censusData={censusData}
          isLoadingCensus={isLoadingCensus}
          canEdit={canEdit}
          userRole={userRole}
        />
      ) : viewMode === 'map' ? (
        <div className="h-[75vh]">
          <FullScreenMapView
            properties={displayProperties}
            selectedPropertyId={selectedPropertyId}
            onPropertySelect={setSelectedPropertyId}
            onPropertiesChange={onPropertiesChange}
            onError={onError}
            censusData={censusData}
            isLoadingCensus={isLoadingCensus}
          />
        </div>
      ) : (
        <PropertyTableView
          properties={displayProperties}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onRefresh={canEdit ? handleRefreshClick : undefined}
          onDelete={canEdit ? handleDeleteClick : undefined}
          refreshingPropertyId={refreshingPropertyId}
          visibleColumns={visibleColumns}
          censusData={censusData}
          isLoadingCensus={isLoadingCensus}
          canEdit={canEdit}
          userRole={userRole}
        />
      )}

      {/* Bulk Action Bar - Only show for editors */}
      {viewMode === 'table' && displayProperties.length > 0 && canEdit && (
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
    </div>
  )
}