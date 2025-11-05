"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

  // Sync local state with external property updates
  useEffect(() => {
    if (property) {
      setLocalProperty(property)
    }
  }, [property])

  if (!propertyId) {
    return null
  }

  const handlePropertyUpdate = async (id: string, updates: Partial<Property>) => {
    // Optimistically update local state immediately for instant UI feedback
    setLocalProperty(prev => prev ? { ...prev, ...updates } : prev)

    try {
      if (onPropertyUpdate) {
        await onPropertyUpdate(id, updates)
      } else {
        // Fallback to default API call if no handler provided
        const response = await fetch(`/api/properties/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error('Failed to update property')
        }
      }
    } catch (error) {
      // Rollback optimistic update on error
      setLocalProperty(property)
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-[100dvh] sm:w-[90vw] lg:w-[85vw] xl:w-[80vw] 2xl:w-[75vw] sm:max-w-none sm:h-[95vh] overflow-hidden p-0 sm:rounded-lg gap-0 flex flex-col"
      >
        {localProperty ? (
          <>
            {/* Header */}
            <DialogHeader className="border-b pb-4 pt-6 px-6 shrink-0">
              <DialogTitle className="text-xl font-semibold">
                {localProperty.address}
              </DialogTitle>
              <DialogDescription>
                {localProperty.city}, {localProperty.state} {localProperty.zip_code}
              </DialogDescription>
            </DialogHeader>

            {/* Two-column layout for desktop, stacked for mobile */}
            <div className="flex-1 overflow-hidden px-7 pb-6 min-h-0">
              <div className="h-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4 pt-4">
                {/* Left Column: Property Overview (scrollable) */}
                <div className="overflow-y-auto pr-2 min-h-0">
                  <PropertyOverviewSection
                    property={localProperty}
                    canEdit={canEdit}
                    onPropertyUpdate={handlePropertyUpdate}
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
    <div className="space-y-6 px-6 py-6">
      <div className="space-y-2 border-b pb-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
