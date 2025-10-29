'use client'

import { CompactPropertyCard } from './CompactPropertyCard'
import type { Property } from '@/lib/supabase'

interface PropertyCardViewProps {
  properties: Property[]
  onRefresh?: (property: Property) => void
  onDelete?: (property: Property) => void
  onPropertyClick: (propertyId: string) => void
  canEdit?: boolean
  userRole?: 'owner' | 'editor' | 'viewer' | null
}

export function PropertyCardView({
  properties,
  onRefresh,
  onDelete,
  onPropertyClick,
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
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
      {properties.map((property) => (
        <CompactPropertyCard
          key={property.id}
          property={property}
          onPropertyClick={onPropertyClick}
          onRefresh={onRefresh}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  )
}