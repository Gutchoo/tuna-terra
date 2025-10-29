'use client'

import { Input } from '@/components/ui/input'
import { SearchIcon, MapPinIcon } from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface PropertyListPanelProps {
  properties: Property[]
  selectedPropertyId: string | null
  onPropertySelect: (property: Property) => void
  isLoading?: boolean
}

export function PropertyListPanel({
  properties,
  selectedPropertyId,
  onPropertySelect,
  isLoading = false,
}: PropertyListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter properties by search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties

    const query = searchQuery.toLowerCase()
    return properties.filter(property =>
      property.address?.toLowerCase().includes(query) ||
      property.apn?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query) ||
      property.owner?.toLowerCase().includes(query)
    )
  }, [properties, searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading properties...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search Bar */}
      <div className="p-4 shrink-0">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProperties.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery ? 'No properties match your search' : 'No properties found'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => onPropertySelect(property)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all duration-150',
                  'hover:shadow-sm hover:border-primary/50',
                  selectedPropertyId === property.id
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : 'bg-card border-border'
                )}
              >
                {/* Address or APN Title */}
                <div className="flex items-start gap-2 mb-1.5">
                  <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      'text-sm font-medium truncate',
                      selectedPropertyId === property.id && 'text-primary'
                    )}>
                      {property.address || (property.apn ? `APN: ${property.apn}` : 'Unknown Property')}
                    </h3>
                    {property.city && property.state && (
                      <p className="text-xs text-muted-foreground truncate">
                        {property.city}, {property.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Parcel Number (APN) - only show if address exists */}
                {property.address && property.apn && (
                  <div className="text-xs text-muted-foreground mb-2 pl-[26px]">
                    {property.apn}
                  </div>
                )}

                {/* Owner and Property Type */}
                {(property.owner || property.use_description || property.num_units) && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground pl-[26px]">
                    {property.owner && (
                      <span className="truncate">{property.owner}</span>
                    )}
                    {property.owner && (property.use_description || property.num_units) && (
                      <span className="shrink-0">•</span>
                    )}
                    {(property.use_description || property.num_units) && (
                      <span className="truncate">
                        {property.use_description ||
                          (property.num_units === 1 ? 'Single Family' :
                           property.num_units === 2 ? 'Duplex' :
                           `${property.num_units}-Unit`)}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
