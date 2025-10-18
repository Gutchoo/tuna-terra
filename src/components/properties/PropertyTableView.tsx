'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  TrashIcon
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { AVAILABLE_COLUMNS } from './ColumnSelector'
import { isVirtualSampleProperty } from '@/lib/sample-portfolio'
import type { CensusDataMap } from '@/hooks/useCensusData'

type SortField = keyof Property | string
type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

interface PropertyTableViewProps {
  properties: Property[]
  selectedRows: Set<string>
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onRefresh?: (property: Property) => void
  onDelete?: (property: Property) => void
  onPropertyClick?: (propertyId: string) => void // New: click handler for opening drawer
  refreshingPropertyId: string | null
  visibleColumns: Set<keyof Property | string> // Allow virtual columns
  censusData?: CensusDataMap // Optional census data
  isLoadingCensus?: boolean // Loading state for census data
  canEdit?: boolean
  userRole?: 'owner' | 'editor' | 'viewer' | null
}

export function PropertyTableView({
  properties,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRefresh,
  onDelete,
  onPropertyClick,
  refreshingPropertyId,
  visibleColumns,
  censusData = {},
  isLoadingCensus = false,
  canEdit = true,
  userRole
}: PropertyTableViewProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null })

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const formatNumber = (value: number | null) => {
    if (!value) return '-'
    return value.toLocaleString()
  }

  const renderCellContent = (property: Property, columnKey: keyof Property | string) => {
    // Handle virtual demographics columns
    const virtualColumns = [
      'median_income', 'mean_income', 'households', 'population', 'median_age',
      'total_housing_units', 'median_rent', 'owner_occupied_units', 'renter_occupied_units',
      'avg_household_size_owner', 'avg_household_size_renter',
      'bachelor_rate_25_34', 'bachelor_rate_35_44', 'bachelor_rate_45_64'
    ]
    
    if (typeof columnKey === 'string' && virtualColumns.includes(columnKey)) {
      const demographics = censusData[property.id]
      
      if (isLoadingCensus) {
        return <span className="text-muted-foreground text-xs">Loading...</span>
      }
      
      if (!demographics) {
        return <span className="text-muted-foreground">-</span>
      }
      
      // Handle basic demographics
      if (['median_income', 'mean_income', 'households', 'population', 'median_age'].includes(columnKey)) {
        const demographicValue = demographics[columnKey as keyof typeof demographics]
        
        switch (columnKey) {
          case 'median_income':
          case 'mean_income':
            return <span className="font-mono text-sm">{formatCurrency(demographicValue as number)}</span>
          case 'households':
          case 'population':
            return <span className="font-mono text-sm">{formatNumber(demographicValue as number)}</span>
          case 'median_age':
            return demographicValue ? (
              <span className="font-mono text-sm">{demographicValue as number} years</span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )
          default:
            return <span className="text-muted-foreground">-</span>
        }
      }
      
      // Handle housing demographics
      if (['total_housing_units', 'median_rent', 'owner_occupied_units', 'renter_occupied_units', 'avg_household_size_owner', 'avg_household_size_renter'].includes(columnKey)) {
        const demographicValue = demographics[columnKey as keyof typeof demographics]
        
        switch (columnKey) {
          case 'median_rent':
            return <span className="font-mono text-sm">{formatCurrency(demographicValue as number)}</span>
          case 'total_housing_units':
          case 'owner_occupied_units':
          case 'renter_occupied_units':
            return <span className="font-mono text-sm">{formatNumber(demographicValue as number)}</span>
          case 'avg_household_size_owner':
          case 'avg_household_size_renter':
            return demographicValue ? (
              <span className="font-mono text-sm">{Number(demographicValue).toFixed(1)}</span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )
          default:
            return <span className="text-muted-foreground">-</span>
        }
      }
      
      // Handle education demographics
      if (['bachelor_rate_25_34', 'bachelor_rate_35_44', 'bachelor_rate_45_64'].includes(columnKey)) {
        const educationDetails = demographics.education_details
        if (!educationDetails) {
          return <span className="text-muted-foreground">-</span>
        }
        
        let value: number | null = null
        switch (columnKey) {
          case 'bachelor_rate_25_34':
            value = educationDetails.pct_bachelor_plus_25_34
            break
          case 'bachelor_rate_35_44':
            value = educationDetails.pct_bachelor_plus_35_44
            break
          case 'bachelor_rate_45_64':
            value = educationDetails.pct_bachelor_plus_45_64
            break
        }
        
        return value ? (
          <span className="font-mono text-sm">{value.toFixed(1)}%</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      }
      
      return <span className="text-muted-foreground">-</span>
    }
    
    // Handle regular property columns
    const value = property[columnKey as keyof Property]
    
    switch (columnKey) {
      case 'address':
        return (
          <div className="max-w-[200px] truncate font-medium" title={String(value) || ''}>
            {String(value) || '-'}
          </div>
        )
      case 'apn':
        return value ? (
          <span className="font-mono text-xs">{String(value)}</span>
        ) : '-'
      case 'owner':
        return (
          <div className="max-w-[150px] truncate" title={String(value) || ''}>
            {String(value) || '-'}
          </div>
        )
      case 'assessed_value':
      case 'improvement_value':
      case 'land_value':
      case 'last_sale_price':
        return <span className="font-mono text-sm">{formatCurrency(value as number)}</span>
      case 'sale_date':
      case 'created_at':
        return formatDate(value as string)
      case 'lot_size_acres':
        return value ? `${(value as number).toFixed(2)} ac` : '-'
      case 'lot_size_sqft':
        return formatNumber(value as number)
      case 'qoz_status':
        return value === 'Yes' ? (
          <Badge variant="secondary" className="text-xs">QOZ</Badge>
        ) : '-'
      case 'tags':
        const tags = value as string[] | null
        return tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">+{tags.length - 2}</Badge>
            )}
          </div>
        ) : '-'
      case 'user_notes':
        return value ? (
          <div className="max-w-[100px] truncate" title={String(value)}>
            {String(value)}
          </div>
        ) : '-'
      default:
        return String(value) || '-'
    }
  }

  // Get visible column definitions
  const visibleColumnDefs = AVAILABLE_COLUMNS.filter(col => visibleColumns.has(col.key))

  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'asc'
    
    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc'
      } else if (sortConfig.direction === 'desc') {
        direction = null
      }
    }
    
    setSortConfig({ field: direction ? field : null, direction })
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUpIcon className="h-4 w-4" />
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDownIcon className="h-4 w-4" />
    }
    
    return <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
  }

  const sortedProperties = [...properties].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0
    
    let aVal: unknown
    let bVal: unknown
    
    // Handle virtual demographics columns
    if (typeof sortConfig.field === 'string' && ['median_income', 'mean_income', 'households', 'population', 'median_age'].includes(sortConfig.field)) {
      const aDemographics = censusData[a.id]
      const bDemographics = censusData[b.id]
      aVal = aDemographics?.[sortConfig.field as keyof typeof aDemographics] || null
      bVal = bDemographics?.[sortConfig.field as keyof typeof bDemographics] || null
    } else {
      // Handle regular property fields
      aVal = a[sortConfig.field as keyof Property]
      bVal = b[sortConfig.field as keyof Property]
    }
    
    if ((aVal === null || aVal === undefined) && (bVal === null || bVal === undefined)) return 0
    if (aVal === null || aVal === undefined) return sortConfig.direction === 'asc' ? 1 : -1
    if (bVal === null || bVal === undefined) return sortConfig.direction === 'asc' ? -1 : 1
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Only count selectable (non-sample) properties for "all selected" calculation
  const selectableProperties = properties.filter(p => !isVirtualSampleProperty(p.id))
  const allSelected = selectableProperties.length > 0 && selectedRows.size === selectableProperties.length

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-medium mb-2">No properties yet</h3>
        <p className="text-muted-foreground">
          Get started by uploading your first property or adding one manually
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 w-full">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {sortedProperties.map((property) => (
          <div
            key={property.id}
            className={`border rounded-lg p-4 space-y-3 ${
              selectedRows.has(property.id) ? 'bg-muted/50 border-primary/20' : ''
            }`}
          >
            {/* Mobile Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Checkbox
                  checked={selectedRows.has(property.id)}
                  onCheckedChange={(checked) => onRowSelect(property.id, !!checked)}
                  aria-label={`Select ${property.address}`}
                  className="mt-1 flex-shrink-0"
                  disabled={!canEdit || isVirtualSampleProperty(property.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate" title={property.address || ''}>
                    {property.address || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    APN: {property.apn || '-'}
                  </div>
                </div>
              </div>
              {canEdit && onRefresh && onDelete ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRefresh(property)}
                      disabled={refreshingPropertyId === property.id || !property.apn || isVirtualSampleProperty(property.id)}
                      className="focus:bg-blue-50"
                    >
                      <RefreshCwIcon className={`mr-2 h-4 w-4 ${
                        refreshingPropertyId === property.id ? 'animate-spin' : ''
                      }`} />
                      {refreshingPropertyId === property.id ? 'Refreshing...' : 'Refresh'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(property)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      disabled={isVirtualSampleProperty(property.id)}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            {/* Mobile Card Body - Key Info Only */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs font-medium mb-1">Owner</div>
                <div className="truncate" title={property.owner || ''}>
                  {property.owner || '-'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs font-medium mb-1">City</div>
                <div className="truncate">
                  {property.city || '-'}
                </div>
              </div>
              {property.assessed_value && (
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">Assessed Value</div>
                  <div className="font-mono text-sm">
                    {formatCurrency(property.assessed_value)}
                  </div>
                </div>
              )}
              {property.lot_size_acres && (
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">Lot Size</div>
                  <div className="text-sm">
                    {(property.lot_size_acres as number).toFixed(2)} ac
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full">
        <div className="border rounded-md overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all"
                  disabled={!canEdit}
                />
              </TableHead>
              
              {visibleColumnDefs.map((column) => {
                const isAddress = column.key === 'address'
                const isFinancial = ['assessed_value', 'improvement_value', 'land_value', 'last_sale_price'].includes(column.key)
                
                return (
                  <TableHead 
                    key={column.key}
                    className={`${
                      isAddress ? 'min-w-[200px]' : ''
                    } ${
                      isFinancial ? 'text-right' : ''
                    }`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </Button>
                  </TableHead>
                )
              })}
              
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedProperties.map((property) => (
              <TableRow
                key={property.id}
                className={`${selectedRows.has(property.id) ? 'bg-muted/50' : ''} ${onPropertyClick ? 'cursor-pointer hover:bg-muted/30' : ''}`}
                onClick={(e) => {
                  // Only trigger if not clicking checkbox or action menu
                  const target = e.target as HTMLElement
                  if (!target.closest('button') && !target.closest('[role="checkbox"]') && onPropertyClick) {
                    onPropertyClick(property.id)
                  }
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(property.id)}
                    onCheckedChange={(checked) => onRowSelect(property.id, !!checked)}
                    aria-label={`Select ${property.address}`}
                    disabled={!canEdit || isVirtualSampleProperty(property.id)}
                  />
                </TableCell>
                
                {visibleColumnDefs.map((column) => {
                  const isFinancial = ['assessed_value', 'improvement_value', 'land_value', 'last_sale_price'].includes(column.key)
                  
                  return (
                    <TableCell 
                      key={column.key} 
                      className={isFinancial ? 'text-right' : ''}
                    >
                      {renderCellContent(property, column.key)}
                    </TableCell>
                  )
                })}
                
                <TableCell>
                  {canEdit && onRefresh && onDelete ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onRefresh(property)}
                          disabled={refreshingPropertyId === property.id || !property.apn || isVirtualSampleProperty(property.id)}
                          className="focus:bg-blue-50"
                        >
                          <RefreshCwIcon className={`mr-2 h-4 w-4 ${
                            refreshingPropertyId === property.id ? 'animate-spin' : ''
                          }`} />
                          {refreshingPropertyId === property.id ? 'Refreshing...' : 'Refresh'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(property)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isVirtualSampleProperty(property.id)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}