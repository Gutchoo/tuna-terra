'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronUpIcon,
  MoreHorizontalIcon,
  TrashIcon
} from 'lucide-react'
import { ColumnSelector, AVAILABLE_COLUMNS } from './ColumnSelector'
import type { Property } from '@/lib/supabase'

interface MapOverlayTableProps {
  properties: Property[]
  selectedPropertyId: string | null
  onPropertySelect: (id: string) => void
  onDeleteProperty: (property: Property) => void
}

// Default minimal columns for map overlay
const DEFAULT_MAP_COLUMNS = ['address', 'apn', 'owner'] as (keyof Property)[]

// Animation variants

const resizeHandleVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      delay: 0.1
    }
  },
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
}

export function MapOverlayTable({
  properties,
  selectedPropertyId,
  onPropertySelect,
  onDeleteProperty
}: MapOverlayTableProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Property | string>>(() => {
    // Initialize with minimal default columns for map view
    return new Set(DEFAULT_MAP_COLUMNS)
  })
  
  // Resize functionality
  const [width, setWidth] = useState(384) // Default width in px (equivalent to w-96)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useRef(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mediaQuery.matches
    
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Enhanced minimize toggle with animation awareness
  const handleToggle = useCallback(() => {
    setIsAnimating(true)
    setIsMinimized(!isMinimized)
    
    // Reset animation state after transition completes
    setTimeout(() => setIsAnimating(false), 300)
  }, [isMinimized])

  // Load saved preferences from localStorage (columns and width)
  useEffect(() => {
    const savedColumns = localStorage.getItem('mapOverlayTableColumns')
    if (savedColumns) {
      try {
        const columns = JSON.parse(savedColumns)
        setVisibleColumns(new Set(columns))
      } catch (error) {
        console.warn('Failed to load saved map overlay column preferences:', error)
      }
    }

    const savedWidth = localStorage.getItem('mapOverlayTableWidth')
    if (savedWidth) {
      try {
        const parsedWidth = parseInt(savedWidth)
        if (parsedWidth >= 280 && parsedWidth <= 800) { // Reasonable bounds
          setWidth(parsedWidth)
        }
      } catch (error) {
        console.warn('Failed to load saved map overlay width:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('mapOverlayTableColumns', JSON.stringify(Array.from(visibleColumns)))
  }, [visibleColumns])

  useEffect(() => {
    localStorage.setItem('mapOverlayTableWidth', width.toString())
  }, [width])

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      const clampedWidth = Math.max(280, Math.min(800, newWidth)) // Min 280px, max 800px
      setWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [width])

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

    // Extract date parts from YYYY-MM-DD format to avoid timezone issues
    const dateOnly = dateString.split('T')[0]
    const [year, month, day] = dateOnly.split('-')

    // Format as MM/DD/YYYY without timezone conversion
    return `${month}/${day}/${year}`
  }

  const formatNumber = (value: number | null) => {
    if (!value) return '-'
    return value.toLocaleString()
  }

  const renderCellContent = (property: Property, columnKey: keyof Property | string) => {
    // DISABLED: Virtual demographics columns rendering removed
    // Census API integration has been removed - demographic columns are disabled

    const value = property[columnKey as keyof Property]
    
    switch (columnKey) {
      case 'address':
        return (
          <div className="max-w-[140px] truncate font-medium" title={String(value) || ''}>
            {String(value) || '-'}
          </div>
        )
      case 'apn':
        return value ? (
          <span className="font-mono text-xs">{String(value)}</span>
        ) : '-'
      case 'owner':
        return (
          <div className="max-w-[100px] truncate" title={String(value) || ''}>
            {String(value) || '-'}
          </div>
        )
      case 'assessed_value':
      case 'improvement_value':
      case 'land_value':
      case 'last_sale_price':
        return <span className="font-mono text-sm">{formatCurrency(value as number)}</span>
      case 'purchase_date':
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
  const visibleColumnDefs = AVAILABLE_COLUMNS.filter(col => visibleColumns.has(col.key as keyof Property | string))

  const handleRowClick = (propertyId: string) => {
    console.log('MapOverlayTable: Row clicked for property:', propertyId)
    onPropertySelect(propertyId)
  }

  if (properties.length === 0) {
    return null // Don't show overlay if no properties
  }

  return (
    <div 
      ref={containerRef}
      className="absolute top-4 left-4 right-4 md:right-auto z-10"
      style={{ 
        width: !isMobile ? `${width}px` : 'auto',
        maxWidth: !isMobile ? `${Math.min(width, (typeof window !== 'undefined' ? window.innerWidth : 1024) * 0.4)}px` : 'calc(100vw - 2rem)'
      }}
    >
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg relative group !py-0">
        {/* Header */}
        <div className={`px-2.5 ${isMinimized ? 'py-1' : 'py-1.5'} ${!isMinimized ? 'border-b' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">
                Properties ({properties.length})
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ 
                      duration: prefersReducedMotion.current ? 0.01 : 0.2 
                    }}
                  >
                    <ColumnSelector 
                      visibleColumns={visibleColumns} 
                      onColumnsChange={setVisibleColumns} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                disabled={isAnimating}
                className="h-8 w-8 p-0"
              >
                <motion.div
                  animate={{ rotate: isMinimized ? 180 : 0 }}
                  transition={{ 
                    duration: prefersReducedMotion.current ? 0.01 : 0.3, 
                    ease: "easeInOut" 
                  }}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              key="table-content"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ 
                duration: prefersReducedMotion.current ? 0.01 : 0.25,
                ease: "easeInOut"
              }}
              style={{ willChange: isAnimating ? 'transform, opacity' : 'auto' }}
            >
              <div className="max-h-48 overflow-auto">
            {properties.length > 0 ? (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {visibleColumnDefs.map((column) => {
                      const isAddress = column.key === 'address'
                      const isFinancial = ['assessed_value', 'improvement_value', 'land_value', 'last_sale_price'].includes(column.key)
                      
                      return (
                        <TableHead 
                          key={column.key}
                          className={`${
                            isAddress ? 'min-w-[140px]' : 'min-w-[80px]'
                          } ${
                            isFinancial ? 'text-right' : ''
                          } text-xs font-medium`}
                        >
                          {column.label}
                        </TableHead>
                      )
                    })}
                    
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {properties.map((property) => (
                    <TableRow 
                      key={property.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedPropertyId === property.id ? 'bg-primary/10 border-primary/20' : ''
                      }`}
                      onClick={() => handleRowClick(property.id)}
                    >
                      {visibleColumnDefs.map((column) => {
                        const isFinancial = ['assessed_value', 'improvement_value', 'land_value', 'last_sale_price'].includes(column.key)
                        
                        return (
                          <TableCell 
                            key={column.key} 
                            className={`${isFinancial ? 'text-right' : ''} text-xs py-1.5 px-2`}
                          >
                            {renderCellContent(property, column.key)}
                          </TableCell>
                        )
                      })}
                      
                      <TableCell className="py-1.5 px-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontalIcon className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* COMMENTED OUT: Refresh button - keeping for potential future use
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onRefreshProperty(property)
                              }}
                              disabled={refreshingPropertyId === property.id || !property.apn}
                              className="focus:bg-blue-50"
                            >
                              <RefreshCwIcon className={`mr-2 h-3 w-3 ${
                                refreshingPropertyId === property.id ? 'animate-spin' : ''
                              }`} />
                              {refreshingPropertyId === property.id ? 'Refreshing..' : 'Refresh'}
                            </DropdownMenuItem>
                            */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteProperty(property)
                              }}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <TrashIcon className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No properties to display</p>
              </div>
            )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with instructions */}
        <AnimatePresence>
          {!isMinimized && properties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: prefersReducedMotion.current ? 0.01 : 0.25,
                ease: "easeInOut"
              }}
              className="border-t bg-muted/30"
            >
              <div className="p-1.5 text-center">
                <p className="text-xs text-muted-foreground">
                  Click to center map
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resize Handle - Only show on desktop when expanded */}
        <AnimatePresence>
          {!isMobile && !isMinimized && (
            <motion.div
              ref={resizeRef}
              onMouseDown={handleMouseDown}
              variants={resizeHandleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-primary/20 transition-colors duration-200 flex items-center justify-center"
              whileHover={{ 
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                transition: { duration: 0.15 }
              }}
              title="Drag to resize"
            >
              <motion.div 
                className="w-0.5 h-8 bg-muted-foreground/40 rounded-full"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.15 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}