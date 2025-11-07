"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Skeleton } from "@/components/ui/skeleton"
import type { Property } from "@/lib/supabase"
import { PropertyOverviewSection } from "./PropertyOverviewSection"
import { PropertyDocumentsSection } from "./PropertyDocumentsSection"
import { useCanEditPortfolio } from "@/hooks/use-portfolio-role"

interface PropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string | null
  portfolioId?: string | null
  property?: Property // Pass property data directly to avoid loading states
  onPropertyUpdate?: (propertyId: string, updates: Partial<Property>) => Promise<void>
}

export function PropertyModal({
  open,
  onOpenChange,
  propertyId,
  portfolioId,
  property,
  onPropertyUpdate
}: PropertyModalProps) {
  const { canEdit } = useCanEditPortfolio(portfolioId || property?.portfolio_id || null)

  // Local state for optimistic updates
  const [localProperty, setLocalProperty] = useState<Property | undefined>(property)

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedValues, setEditedValues] = useState<Partial<Property>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state with external property updates
  useEffect(() => {
    if (property) {
      setLocalProperty(property)
    }
  }, [property])

  // Reset edit mode when modal closes
  useEffect(() => {
    if (!open) {
      setIsEditMode(false)
      setEditedValues({})
    }
  }, [open])

  if (!propertyId) {
    return null
  }

  const handleFieldChange = (field: string, value: string | number | null) => {
    setEditedValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveAll = async () => {
    if (!propertyId || Object.keys(editedValues).length === 0) {
      setIsEditMode(false)
      return
    }

    setIsSaving(true)
    try {
      // Optimistically update local state immediately for instant UI feedback
      setLocalProperty(prev => prev ? { ...prev, ...editedValues } : prev)

      if (onPropertyUpdate) {
        await onPropertyUpdate(propertyId, editedValues)
      } else {
        // Fallback to default API call if no handler provided
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedValues),
        })

        if (!response.ok) {
          throw new Error('Failed to update property')
        }
      }

      setEditedValues({})
      setIsEditMode(false)
    } catch (error) {
      // Rollback optimistic update on error
      setLocalProperty(property)
      console.error('Failed to save changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedValues({})
    setIsEditMode(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-[100dvh] sm:w-[90vw] lg:w-[85vw] xl:w-[80vw] 2xl:w-[75vw] sm:max-w-none sm:h-[95vh] overflow-hidden p-0 sm:rounded-lg gap-0 flex flex-col"
      >
        <VisuallyHidden>
          <DialogTitle>
            {localProperty?.address || 'Property Details'}
          </DialogTitle>
        </VisuallyHidden>
        {localProperty ? (
          <>
            {/* Two-column layout for desktop, stacked for mobile */}
            <div className="flex-1 overflow-hidden px-7 py-6 min-h-0">
              <div className="h-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
                {/* Left Column: Property Overview (scrollable) */}
                <div className="overflow-y-auto pr-2 min-h-0">
                  <PropertyOverviewSection
                    property={localProperty}
                    canEdit={canEdit}
                    isEditMode={isEditMode}
                    editedValues={editedValues}
                    onFieldChange={handleFieldChange}
                    onEditModeChange={setIsEditMode}
                    onSaveAll={handleSaveAll}
                    onCancelEdit={handleCancelEdit}
                    isSaving={isSaving}
                  />
                </div>

                {/* Right Column: Documents (scrollable) */}
                <div className="overflow-y-auto border-l pl-4 pr-2 hidden lg:block min-h-0">
                  <PropertyDocumentsSection
                    propertyId={propertyId}
                    portfolioId={portfolioId || localProperty.portfolio_id || ''}
                    canEdit={canEdit}
                  />
                </div>

                {/* Mobile: Documents section below overview */}
                <div className="lg:hidden border-t pt-4 overflow-y-auto min-h-0">
                  <PropertyDocumentsSection
                    propertyId={propertyId}
                    portfolioId={portfolioId || localProperty.portfolio_id || ''}
                    canEdit={canEdit}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <PropertyModalSkeleton />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PropertyModalSkeleton() {
  return (
    <div className="px-7 py-6 h-full">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}
