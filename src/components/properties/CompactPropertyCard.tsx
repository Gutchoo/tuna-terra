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
  RefreshCwIcon,
  TrashIcon,
  MapPinIcon,
  DollarSignIcon,
  UserIcon,
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
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const hasAddress = property.address && property.address.trim() !== ''

  const handleCardClick = () => {
    onPropertyClick(property.id)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer max-w-sm py-2"
      onClick={handleCardClick}
    >
      <CardContent className="p-2 space-y-2">
        {/* Header with title and action menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {hasAddress ? (
              <>
                <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                  {property.address}
                </h3>
                {property.apn && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {property.apn}
                  </p>
                )}
              </>
            ) : (
              <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                {property.apn || 'Unknown Property'}
              </h3>
            )}
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
                <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Refresh Data
                </DropdownMenuItem>
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

        {/* Assessed Value */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSignIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">
            {formatCurrency(property.assessed_value)}
          </span>
        </div>

        {/* Badges */}
        {property.qoz_status === 'Yes' && (
          <div className="pt-1">
            <Badge variant="secondary" className="text-xs">QOZ</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
