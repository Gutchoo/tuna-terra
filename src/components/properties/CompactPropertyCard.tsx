'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVerticalIcon,
  TrashIcon,
  MapPinIcon,
  UserIcon,
  HashIcon,
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { isVirtualSampleProperty } from '@/lib/sample-portfolio'

interface CompactPropertyCardProps {
  property: Property
  onPropertyClick: (propertyId: string) => void
  onRefresh?: (property: Property) => void
  onDelete?: (property: Property) => void
  canEdit?: boolean
}

export function CompactPropertyCard({
  property,
  onPropertyClick,
  onRefresh,
  onDelete,
  canEdit = true,
}: CompactPropertyCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value >= 10_000_000 ? 'compact' : 'standard',
      compactDisplay: 'short',
    }).format(value)
  }

  const formatLotSize = () => {
    if (property.lot_size_acres && property.lot_size_acres >= 0.5) {
      return `${property.lot_size_acres.toLocaleString(undefined, { maximumFractionDigits: 1 })} ac`
    }
    if (property.lot_size_sqft) {
      return `${Math.round(property.lot_size_sqft).toLocaleString()} sqft`
    }
    if (property.lot_size_acres) {
      return `${property.lot_size_acres.toLocaleString(undefined, { maximumFractionDigits: 2 })} ac`
    }
    return null
  }

  const hasAddress = property.address && property.address.trim() !== ''
  const assessedValue = formatCurrency(property.assessed_value)
  const lotSize = formatLotSize()

  // Key parcel stats shown in the data grid: label + value pairs, skipped when empty
  const stats: Array<{ label: string; value: string }> = []
  if (assessedValue) stats.push({ label: 'Assessed', value: assessedValue })
  if (property.year_built) stats.push({ label: 'Built', value: String(property.year_built) })
  if (lotSize) stats.push({ label: 'Lot', value: lotSize })
  if (property.zoning) stats.push({ label: 'Zoning', value: property.zoning })

  const handleCardClick = () => {
    onPropertyClick(property.id)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="pt-2 pb-2 pr-2 pl-3 space-y-2">
        {/* Header with title and action menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
              {hasAddress ? property.address : (property.apn || 'Unknown Property')}
            </h3>
          </div>

          {/* Action Menu */}
          {canEdit && onRefresh && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Property actions"
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleMenuClick}>
                <DropdownMenuItem
                  onClick={() => onDelete(property)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  disabled={isVirtualSampleProperty(property.id)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Property
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* APN */}
        {property.apn && (
          <div className="flex items-center gap-2 text-sm">
            <HashIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-mono truncate">
              {property.apn}
            </span>
          </div>
        )}

        {/* Location */}
        {(property.city || property.state || property.zip_code) && (
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">
              {[property.city, property.state, property.zip_code]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}

        {/* Owner */}
        {property.owner && (
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate" title={property.owner}>
              {property.owner}
            </span>
          </div>
        )}

        {/* Key parcel stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-t pt-2">
            {stats.map(stat => (
              <div key={stat.label} className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-medium truncate" title={stat.value}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Use / QOZ badges */}
        {(property.use_description || property.qoz_status === 'Yes') && (
          <div className="flex flex-wrap gap-1">
            {property.use_description && (
              <Badge variant="secondary" className="text-xs max-w-full">
                <span className="truncate">{property.use_description}</span>
              </Badge>
            )}
            {property.qoz_status === 'Yes' && (
              <Badge variant="outline" className="text-xs">
                QOZ
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
