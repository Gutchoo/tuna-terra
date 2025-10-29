"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Calendar,
  DollarSign,
  Hash,
  MapPin,
  User,
  FileText,
} from "lucide-react"
import type { Property } from "@/lib/supabase"
import { useUpdatePropertyDetails, useRevertFieldOverride } from "@/hooks/use-property-details"
import { FieldOverrideBadge } from "@/components/properties/FieldOverrideBadge"
import { usePortfolioRole } from "@/hooks/use-portfolio-role"
import { useDebounce } from "@/hooks/use-debounce"

interface PropertyDetailsTabProps {
  property: Property
  propertyId: string
}

export function PropertyDetailsTab({ property, propertyId }: PropertyDetailsTabProps) {
  const updateMutation = useUpdatePropertyDetails(propertyId)
  const revertMutation = useRevertFieldOverride(propertyId)
  const { data: role, isLoading: roleLoading } = usePortfolioRole(property.portfolio_id || null)

  const isViewer = role === 'viewer'
  const canEdit = !isViewer && !roleLoading

  // Local state for editable fields
  const [purchaseDate, setPurchaseDate] = React.useState(property.purchase_date || '')
  const [purchasePrice, setPurchasePrice] = React.useState(property.purchase_price?.toString() || '')
  const [soldDate, setSoldDate] = React.useState(property.sold_date || '')
  const [soldPrice, setSoldPrice] = React.useState(property.sold_price?.toString() || '')

  // Debounced auto-save for user fields
  const debouncedPurchaseDate = useDebounce(purchaseDate, 300)
  const debouncedPurchasePrice = useDebounce(purchasePrice, 300)
  const debouncedSoldDate = useDebounce(soldDate, 300)
  const debouncedSoldPrice = useDebounce(soldPrice, 300)

  // Auto-save effect
  React.useEffect(() => {
    if (!canEdit) return

    const updates: any = {}
    let hasChanges = false

    if (debouncedPurchaseDate !== (property.purchase_date || '')) {
      updates.purchase_date = debouncedPurchaseDate || null
      hasChanges = true
    }

    if (debouncedPurchasePrice !== (property.purchase_price?.toString() || '')) {
      updates.purchase_price = debouncedPurchasePrice ? parseFloat(debouncedPurchasePrice) : null
      hasChanges = true
    }

    if (debouncedSoldDate !== (property.sold_date || '')) {
      updates.sold_date = debouncedSoldDate || null
      hasChanges = true
    }

    if (debouncedSoldPrice !== (property.sold_price?.toString() || '')) {
      updates.sold_price = debouncedSoldPrice ? parseFloat(debouncedSoldPrice) : null
      hasChanges = true
    }

    if (hasChanges) {
      updateMutation.mutate(updates)
    }
  }, [debouncedPurchaseDate, debouncedPurchasePrice, debouncedSoldDate, debouncedSoldPrice, canEdit])

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleRevertField = (fieldName: string) => {
    const override = property.field_overrides?.[fieldName]
    if (override) {
      revertMutation.mutate({
        fieldName,
        originalValue: override.original,
      })
    }
  }

  const isFieldOverridden = (fieldName: string) => {
    return property.field_overrides && fieldName in property.field_overrides
  }

  const getFieldOverride = (fieldName: string) => {
    return property.field_overrides?.[fieldName]
  }

  return (
    <div className="space-y-6">
      {/* Viewer Mode Banner */}
      {isViewer && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              You have viewer access to this property. Contact the portfolio owner to request editing permissions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Acquisition Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Acquisition Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                disabled={!canEdit}
                className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="purchase_price"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  disabled={!canEdit}
                  className={!canEdit ? 'pl-9 bg-muted cursor-not-allowed' : 'pl-9'}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disposition Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Disposition Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sold_date">Sale Date</Label>
              <Input
                id="sold_date"
                type="date"
                value={soldDate}
                onChange={(e) => setSoldDate(e.target.value)}
                disabled={!canEdit}
                className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sold_price">Sale Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sold_price"
                  type="number"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  disabled={!canEdit}
                  className={!canEdit ? 'pl-9 bg-muted cursor-not-allowed' : 'pl-9'}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="pt-2">
                <Badge variant={soldDate ? 'secondary' : 'default'}>
                  {soldDate ? 'Sold' : 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Data (Regrid) */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Source Data (Regrid)</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Property information from Regrid API. Some fields can be manually overridden if source data is incorrect.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
                {isFieldOverridden('address') && (
                  <FieldOverrideBadge
                    override={getFieldOverride('address')!}
                    onRevert={() => handleRevertField('address')}
                    showRevertButton={canEdit}
                  />
                )}
              </div>
              <div className="text-sm pl-6">
                <p>{property.address || 'N/A'}</p>
                <p>{property.city}, {property.state} {property.zip_code}</p>
                <p className="text-muted-foreground">{property.county} County</p>
              </div>
            </div>

            {/* Owner */}
            {property.owner && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Owner</span>
                  {isFieldOverridden('owner') && (
                    <FieldOverrideBadge
                      override={getFieldOverride('owner')!}
                      onRevert={() => handleRevertField('owner')}
                      showRevertButton={canEdit}
                    />
                  )}
                </div>
                <div className="text-sm pl-6">
                  <p>{property.owner}</p>
                  {property.owner_mailing_address && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {property.owner_mailing_address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* APN */}
            {property.apn && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>APN</span>
                  {isFieldOverridden('apn') && (
                    <FieldOverrideBadge
                      override={getFieldOverride('apn')!}
                      onRevert={() => handleRevertField('apn')}
                      showRevertButton={canEdit}
                    />
                  )}
                </div>
                <div className="text-sm pl-6 font-mono">
                  {property.apn}
                </div>
              </div>
            )}

            {/* Physical Details */}
            {(property.lot_size_acres || property.year_built || property.num_stories) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Physical Details</span>
                </div>
                <div className="text-sm pl-6 space-y-0.5">
                  {property.lot_size_acres && (
                    <div className="flex items-center gap-2">
                      <p>Lot: {Number(property.lot_size_acres).toFixed(2)} acres</p>
                      {isFieldOverridden('lot_size_acres') && (
                        <FieldOverrideBadge
                          override={getFieldOverride('lot_size_acres')!}
                          onRevert={() => handleRevertField('lot_size_acres')}
                          showRevertButton={canEdit}
                        />
                      )}
                    </div>
                  )}
                  {property.year_built && (
                    <div className="flex items-center gap-2">
                      <p>Built: {property.year_built}</p>
                      {isFieldOverridden('year_built') && (
                        <FieldOverrideBadge
                          override={getFieldOverride('year_built')!}
                          onRevert={() => handleRevertField('year_built')}
                          showRevertButton={canEdit}
                        />
                      )}
                    </div>
                  )}
                  {property.num_stories && (
                    <div className="flex items-center gap-2">
                      <p>Stories: {property.num_stories}</p>
                      {isFieldOverridden('num_stories') && (
                        <FieldOverrideBadge
                          override={getFieldOverride('num_stories')!}
                          onRevert={() => handleRevertField('num_stories')}
                          showRevertButton={canEdit}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Valuation */}
            {property.assessed_value && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Assessed Value</span>
                  {isFieldOverridden('assessed_value') && (
                    <FieldOverrideBadge
                      override={getFieldOverride('assessed_value')!}
                      onRevert={() => handleRevertField('assessed_value')}
                      showRevertButton={canEdit}
                    />
                  )}
                </div>
                <div className="text-sm pl-6">
                  <p className="font-semibold">{formatCurrency(property.assessed_value)}</p>
                  {property.improvement_value && property.land_value && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p>Improvements: {formatCurrency(property.improvement_value)}</p>
                        {isFieldOverridden('improvement_value') && (
                          <FieldOverrideBadge
                            override={getFieldOverride('improvement_value')!}
                            onRevert={() => handleRevertField('improvement_value')}
                            showRevertButton={canEdit}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Land: {formatCurrency(property.land_value)}</p>
                        {isFieldOverridden('land_value') && (
                          <FieldOverrideBadge
                            override={getFieldOverride('land_value')!}
                            onRevert={() => handleRevertField('land_value')}
                            showRevertButton={canEdit}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Use & Zoning */}
            {(property.use_description || property.zoning) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Use & Zoning</span>
                </div>
                <div className="text-sm pl-6 space-y-0.5">
                  {property.use_description && (
                    <div className="flex items-center gap-2">
                      <p>{property.use_description}</p>
                      {isFieldOverridden('use_description') && (
                        <FieldOverrideBadge
                          override={getFieldOverride('use_description')!}
                          onRevert={() => handleRevertField('use_description')}
                          showRevertButton={canEdit}
                        />
                      )}
                    </div>
                  )}
                  {property.zoning && (
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground">{property.zoning}</p>
                      {isFieldOverridden('zoning') && (
                        <FieldOverrideBadge
                          override={getFieldOverride('zoning')!}
                          onRevert={() => handleRevertField('zoning')}
                          showRevertButton={canEdit}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
