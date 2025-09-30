'use client'

import { PropertyCard } from './PropertyCard'
import type { Property } from '@/lib/supabase'
import type { CensusDataMap } from '@/hooks/useCensusData'

interface PropertyCardViewProps {
  properties: Property[]
  expandedCards: Set<string>
  onToggleExpand: (id: string) => void
  onRefresh?: (property: Property) => void
  onDelete?: (property: Property) => void
  refreshingPropertyId: string | null
  censusData?: CensusDataMap
  isLoadingCensus?: boolean
  canEdit?: boolean
  userRole?: 'owner' | 'editor' | 'viewer' | null
}

export function PropertyCardView({
  properties,
  expandedCards,
  onToggleExpand,
  onRefresh,
  onDelete,
  refreshingPropertyId,
  censusData = {},
  isLoadingCensus = false,
  canEdit = true,
  userRole
}: PropertyCardViewProps) {

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🏢</span>
        </div>
        <h3 className="text-lg font-medium mb-2">No properties yet</h3>
        <p className="text-sm text-muted-foreground">
          Get started by uploading your first property or adding one manually
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isExpanded={expandedCards.has(property.id)}
          onToggleExpand={onToggleExpand}
          onRefresh={onRefresh}
          onDelete={onDelete}
          isRefreshing={refreshingPropertyId === property.id}
          demographics={censusData[property.id]}
          isLoadingDemographics={isLoadingCensus}
          canEdit={canEdit}
          userRole={userRole}
        />
      ))}
    </div>
  )
}