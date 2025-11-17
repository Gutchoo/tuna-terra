'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  ChevronDownIcon,
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon,
  BuildingIcon,
  UserIcon,
  TagIcon,
  HomeIcon,
  LandmarkIcon,
  TreesIcon,
  TrendingUpIcon,
  LayoutDashboardIcon
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { isVirtualSampleProperty } from '@/lib/sample-portfolio'
import type { CensusDemographics } from '@/hooks/useCensusData'

interface PropertyCardProps {
  property: Property
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onRefresh?: (property: Property) => void
  onDelete?: (property: Property) => void
  onPropertyClick?: (propertyId: string) => void
  isRefreshing: boolean
  demographics?: CensusDemographics | null
  isLoadingDemographics?: boolean
  canEdit?: boolean
  userRole?: 'owner' | 'editor' | 'viewer' | null
}

export function PropertyCard({
  property,
  isExpanded,
  onToggleExpand,
  onRefresh,
  onDelete,
  onPropertyClick,
  isRefreshing,
  demographics,
  isLoadingDemographics = false,
  canEdit = true,
  userRole
}: PropertyCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatNumber = (value: number | null) => {
    if (!value) return null
    return value.toLocaleString()
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      {/* Card Header - Always Visible */}
      <div className="px-fluid-md sm:px-fluid-lg py-fluid-md">
        {/* Main Content with Title, Chevron, and Menu on same line */}
        <div 
          className="cursor-pointer"
          onClick={() => onToggleExpand(property.id)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-fluid-sm flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-fluid-lg font-semibold hover:text-primary transition-colors truncate pr-2">
                  {property.address}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                  {canEdit && onRefresh && onDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onPropertyClick && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onPropertyClick(property.id)
                            }}
                            className="focus:bg-blue-50"
                          >
                            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                            View Dashboard
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          disabled={true}
                          className="opacity-50 cursor-not-allowed"
                        >
                          <RefreshCwIcon className="mr-2 h-4 w-4" />
                          Refresh Data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(property)
                          }}
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
              </div>
              
              <div className="flex items-center gap-fluid-xs text-fluid-sm text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                <span>
                  {[property.city, property.state, property.zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
              
              {/* Compact Info Row */}
              <div className="flex flex-wrap items-center gap-fluid-xs sm:gap-fluid-sm text-fluid-xs text-muted-foreground">
                {property.year_built && (
                  <span>Built {property.year_built}</span>
                )}
                {property.county && (
                  <span>{property.county} County</span>
                )}
                {property.zoning && (
                  <span>Zoned {property.zoning}</span>
                )}
                {property.qoz_status === 'Yes' && (
                  <Badge variant="secondary" className="text-fluid-xs">QOZ</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats - Always Visible */}
        <div className="mt-fluid-md grid grid-cols-2 md:grid-cols-4 gap-fluid-sm">
          <div className="text-center">
            <p className="text-fluid-xs text-muted-foreground">Assessed Value</p>
            <p className="text-fluid-sm font-medium">
              {formatCurrency(property.assessed_value) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-fluid-xs text-muted-foreground">Owner</p>
            <p className="text-fluid-sm font-medium truncate" title={property.owner || 'N/A'}>
              {property.owner || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-fluid-xs text-muted-foreground">Last Sale</p>
            <p className="text-fluid-sm font-medium">
              {(property.last_sale_price && property.last_sale_price > 0) 
                ? formatCurrency(property.last_sale_price) 
                : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-fluid-xs text-muted-foreground">APN</p>
            <p className="text-fluid-sm font-medium font-mono">{property.apn || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-fluid-md sm:px-fluid-lg pb-fluid-md">
          <Separator className="mb-fluid-md" />
          
          <div className="space-y-fluid-lg">
            {/* Property Details */}
            <div>
              <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                <BuildingIcon className="h-4 w-4" />
                <h4 className="font-medium text-fluid-base">Property Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                {property.year_built && (
                  <div>
                    <p className="text-muted-foreground">Year Built</p>
                    <p className="font-medium">{property.year_built}</p>
                  </div>
                )}
                {property.use_description && (
                  <div>
                    <p className="text-muted-foreground">Property Use</p>
                    <p className="font-medium">{property.use_description}</p>
                  </div>
                )}
                {property.num_stories && (
                  <div>
                    <p className="text-muted-foreground">Stories</p>
                    <p className="font-medium">{property.num_stories}</p>
                  </div>
                )}
                {property.num_units && (
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{property.num_units}</p>
                  </div>
                )}
                {property.num_rooms && (
                  <div>
                    <p className="text-muted-foreground">Rooms</p>
                    <p className="font-medium">{property.num_rooms}</p>
                  </div>
                )}
                {property.subdivision && (
                  <div>
                    <p className="text-muted-foreground">Subdivision</p>
                    <p className="font-medium">{property.subdivision}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Zoning & Land Use */}
            {(property.zoning || property.zoning_description || property.use_code) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <LandmarkIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Zoning & Land Use</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                  {property.zoning && (
                    <div>
                      <p className="text-muted-foreground">Zoning Code</p>
                      <p className="font-medium">{property.zoning}</p>
                    </div>
                  )}
                  {property.zoning_description && (
                    <div>
                      <p className="text-muted-foreground">Zoning Description</p>
                      <p className="font-medium">{property.zoning_description}</p>
                    </div>
                  )}
                  {property.use_code && (
                    <div>
                      <p className="text-muted-foreground">Use Code</p>
                      <p className="font-medium">{property.use_code}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Land Information */}
            {(property.lot_size_acres || property.lot_size_sqft) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <TreesIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Land Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                  {property.lot_size_acres && (
                    <div>
                      <p className="text-muted-foreground">Lot Size (Acres)</p>
                      <p className="font-medium">{property.lot_size_acres.toFixed(2)}</p>
                    </div>
                  )}
                  {property.lot_size_sqft && (
                    <div>
                      <p className="text-muted-foreground">Lot Size (Sq Ft)</p>
                      <p className="font-medium">{formatNumber(property.lot_size_sqft)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Information */}
            <div>
              <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                <MapPinIcon className="h-4 w-4" />
                <h4 className="font-medium text-fluid-base">Location Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                {property.county && (
                  <div>
                    <p className="text-muted-foreground">County</p>
                    <p className="font-medium">{property.county}</p>
                  </div>
                )}
                {property.census_tract && (
                  <div>
                    <p className="text-muted-foreground">Census Tract</p>
                    <p className="font-medium">{property.census_tract}</p>
                  </div>
                )}
                {property.census_block && (
                  <div>
                    <p className="text-muted-foreground">Census Block</p>
                    <p className="font-medium">{property.census_block}</p>
                  </div>
                )}
                {property.qoz_status && (
                  <div>
                    <p className="text-muted-foreground">QOZ Status</p>
                    <p className="font-medium">{property.qoz_status}</p>
                  </div>
                )}
                {property.qoz_tract && (
                  <div>
                    <p className="text-muted-foreground">QOZ Tract</p>
                    <p className="font-medium">{property.qoz_tract}</p>
                  </div>
                )}
                {property.lat && property.lng && (
                  <div>
                    <p className="text-muted-foreground">Coordinates</p>
                    <p className="font-medium font-mono text-fluid-xs">
                      {property.lat.toFixed(6)}, {property.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            {(property.assessed_value || property.land_value || property.improvement_value || property.last_sale_price) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <DollarSignIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Financial Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                  {property.assessed_value && (
                    <div>
                      <p className="text-muted-foreground">Assessed Value</p>
                      <p className="font-medium">{formatCurrency(property.assessed_value)}</p>
                    </div>
                  )}
                  {property.land_value && (
                    <div>
                      <p className="text-muted-foreground">Land Value</p>
                      <p className="font-medium">{formatCurrency(property.land_value)}</p>
                    </div>
                  )}
                  {property.improvement_value && (
                    <div>
                      <p className="text-muted-foreground">Improvement Value</p>
                      <p className="font-medium">{formatCurrency(property.improvement_value)}</p>
                    </div>
                  )}
                  {property.last_sale_price && property.last_sale_price > 0 && (
                    <div>
                      <p className="text-muted-foreground">Last Sale Price</p>
                      <p className="font-medium">{formatCurrency(property.last_sale_price)}</p>
                    </div>
                  )}
                  {property.sale_date && (
                    <div>
                      <p className="text-muted-foreground">Sale Date</p>
                      <p className="font-medium">{formatDate(property.sale_date)}</p>
                    </div>
                  )}
                  {property.tax_year && (
                    <div>
                      <p className="text-muted-foreground">Tax Year</p>
                      <p className="font-medium">{property.tax_year}</p>
                    </div>
                  )}
                  {property.parcel_value_type && (
                    <div>
                      <p className="text-muted-foreground">Value Type</p>
                      <p className="font-medium">{property.parcel_value_type}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Area Demographics */}
            {(demographics || isLoadingDemographics) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <TrendingUpIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Area Demographics</h4>
                  {isLoadingDemographics && (
                    <span className="text-xs text-muted-foreground ml-2">Loading...</span>
                  )}
                </div>
                {isLoadingDemographics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Median Income</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Mean Income</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Population</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Median Age</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Total Housing Units</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Owner Occupied Units</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Renter Occupied Units</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Avg HH Size (Owner)</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                    <div className="animate-pulse">
                      <p className="text-muted-foreground">Avg HH Size (Renter)</p>
                      <div className="h-4 bg-muted rounded mt-1"></div>
                    </div>
                  </div>
                ) : demographics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                    {demographics.median_income && (
                      <div>
                        <p className="text-muted-foreground">Median Income</p>
                        <p className="font-medium">{formatCurrency(demographics.median_income)}</p>
                      </div>
                    )}
                    {demographics.mean_income && (
                      <div>
                        <p className="text-muted-foreground">Mean Income</p>
                        <p className="font-medium">{formatCurrency(demographics.mean_income)}</p>
                      </div>
                    )}
                    {demographics.households && (
                      <div>
                        <p className="text-muted-foreground">Households</p>
                        <p className="font-medium">{formatNumber(demographics.households)}</p>
                      </div>
                    )}
                    {demographics.population && (
                      <div>
                        <p className="text-muted-foreground">Population</p>
                        <p className="font-medium">{formatNumber(demographics.population)}</p>
                      </div>
                    )}
                    {demographics.median_age && (
                      <div>
                        <p className="text-muted-foreground">Median Age</p>
                        <p className="font-medium">{demographics.median_age} years</p>
                      </div>
                    )}
                    {demographics.total_housing_units && (
                      <div>
                        <p className="text-muted-foreground">Total Housing Units</p>
                        <p className="font-medium">{formatNumber(demographics.total_housing_units)}</p>
                      </div>
                    )}
                    {demographics.owner_occupied_units && (
                      <div>
                        <p className="text-muted-foreground">Owner Occupied Units</p>
                        <p className="font-medium">{formatNumber(demographics.owner_occupied_units)}</p>
                      </div>
                    )}
                    {demographics.renter_occupied_units && (
                      <div>
                        <p className="text-muted-foreground">Renter Occupied Units</p>
                        <p className="font-medium">{formatNumber(demographics.renter_occupied_units)}</p>
                      </div>
                    )}
                    {demographics.avg_household_size_owner && (
                      <div>
                        <p className="text-muted-foreground">Avg HH Size (Owner)</p>
                        <p className="font-medium">{demographics.avg_household_size_owner.toFixed(1)}</p>
                      </div>
                    )}
                    {demographics.avg_household_size_renter && (
                      <div>
                        <p className="text-muted-foreground">Avg HH Size (Renter)</p>
                        <p className="font-medium">{demographics.avg_household_size_renter.toFixed(1)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Data Source</p>
                      <p className="font-medium text-xs">US Census Bureau (2023)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No demographic data available for {property.city}, {property.state}
                  </p>
                )}
              </div>
            )}

            {/* Owner Information */}
            {(property.owner || property.owner_mailing_address) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <HomeIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Owner Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-md text-fluid-sm">
                  {property.owner && (
                    <div>
                      <p className="text-muted-foreground">Owner Name</p>
                      <p className="font-medium">{property.owner}</p>
                    </div>
                  )}
                  {property.owner_mailing_address && (
                    <div>
                      <p className="text-muted-foreground">Mailing Address</p>
                      <p className="font-medium">
                        {[
                          property.owner_mailing_address,
                          property.owner_mail_city,
                          property.owner_mail_state,
                          property.owner_mail_zip
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Information */}
            {(property.user_notes || property.insurance_provider || property.maintenance_history || property.tags?.length) && (
              <div>
                <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                  <UserIcon className="h-4 w-4" />
                  <h4 className="font-medium text-fluid-base">Your Information</h4>
                </div>
                <div className="space-y-fluid-sm text-fluid-sm">
                  {property.user_notes && (
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p className="font-medium">{property.user_notes}</p>
                    </div>
                  )}
                  {property.insurance_provider && (
                    <div>
                      <p className="text-muted-foreground">Insurance Provider</p>
                      <p className="font-medium">{property.insurance_provider}</p>
                    </div>
                  )}
                  {property.maintenance_history && (
                    <div>
                      <p className="text-muted-foreground">Maintenance History</p>
                      <p className="font-medium">{property.maintenance_history}</p>
                    </div>
                  )}
                  {property.tags && property.tags.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-fluid-sm">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {property.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-fluid-xs">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div className="flex items-center gap-fluid-sm mb-fluid-sm">
                <CalendarIcon className="h-4 w-4" />
                <h4 className="font-medium text-fluid-base">Timeline</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-md text-fluid-sm">
                <div>
                  <p className="text-muted-foreground">Added to Portfolio</p>
                  <p className="font-medium">{formatDate(property.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(property.updated_at)}</p>
                </div>
                {property.apn && (
                  <div>
                    <p className="text-muted-foreground">APN</p>
                    <p className="font-medium font-mono">{property.apn}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}