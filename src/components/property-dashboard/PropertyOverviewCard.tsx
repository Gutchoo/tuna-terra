'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, MapPin, User, Calendar, DollarSign, Building, Home } from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface PropertyOverviewCardProps {
  property: Property
  canEdit?: boolean
  onEdit?: () => void
}

export function PropertyOverviewCard({
  property,
  canEdit = true,
  onEdit,
}: PropertyOverviewCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Property Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            General information and property details
          </p>
        </div>
        {canEdit && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Location
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.state} {property.zip_code}
                  </p>
                </div>
              </div>
              {property.county && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">County</p>
                    <p className="text-sm font-medium">{property.county}</p>
                  </div>
                </div>
              )}
              {property.apn && (
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                    #
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">APN</p>
                    <p className="text-sm font-medium font-mono">{property.apn}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner & Property Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Property Information
            </h3>
            <div className="space-y-3">
              {property.owner && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Owner</p>
                    <p className="text-sm font-medium">{property.owner}</p>
                  </div>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Year Built</p>
                    <p className="text-sm font-medium">{property.year_built}</p>
                  </div>
                </div>
              )}
              {property.use_description && (
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Property Type</p>
                    <p className="text-sm font-medium">{property.use_description}</p>
                  </div>
                </div>
              )}
              {(property.zoning || property.lot_size_acres || property.num_stories) && (
                <div className="flex flex-wrap gap-2">
                  {property.zoning && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Zoning</p>
                      <Badge variant="outline">{property.zoning}</Badge>
                    </div>
                  )}
                  {property.lot_size_acres && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Lot Size</p>
                      <Badge variant="outline">
                        {property.lot_size_acres.toLocaleString()} acres
                      </Badge>
                    </div>
                  )}
                  {property.num_stories && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Stories</p>
                      <Badge variant="outline">{property.num_stories}</Badge>
                    </div>
                  )}
                </div>
              )}
              {property.qoz_status && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">QOZ Status</p>
                  <Badge variant="secondary" className="text-xs">
                    {property.qoz_status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Financial Details
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {property.assessed_value && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assessed Value</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(property.assessed_value)}
                      </p>
                    </div>
                  </div>
                )}
                {property.purchase_price && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Purchase Price</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(property.purchase_price)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {property.land_value && (
                <div>
                  <p className="text-xs text-muted-foreground">Land Value</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(property.land_value)}
                  </p>
                </div>
              )}
              {property.improvement_value && (
                <div>
                  <p className="text-xs text-muted-foreground">Improvement Value</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(property.improvement_value)}
                  </p>
                </div>
              )}
              {property.last_sale_price && property.sale_date && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Last Sale</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(property.last_sale_price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(property.sale_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Property Characteristics */}
          {(property.num_units || property.num_rooms) && (
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Property Characteristics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {property.num_units && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Units</p>
                    <p className="text-sm font-semibold">{property.num_units}</p>
                  </div>
                )}
                {property.num_rooms && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Rooms</p>
                    <p className="text-sm font-semibold">{property.num_rooms}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Designations */}
          {property.subdivision && (
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.subdivision && (
                  <Badge variant="outline" className="text-xs">
                    {property.subdivision}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
