"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle, Building2 } from "lucide-react"
import type { Property } from "@/lib/supabase"
import { usePropertyUnits } from "@/hooks/use-property-units"
import { useCanEditPortfolio } from "@/hooks/use-portfolio-role"
import { UnitCard } from "../units/UnitCard"
import { AddUnitDialog } from "../units/AddUnitDialog"

interface UnitsTabProps {
  property: Property
  propertyId: string
}

export function UnitsTab({ property, propertyId }: UnitsTabProps) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const { canEdit } = useCanEditPortfolio(property.portfolio_id)

  const { data: unitsResponse, isLoading, error } = usePropertyUnits(propertyId, {
    is_active: true,
  })

  const units = unitsResponse?.data || []

  if (isLoading) {
    return <UnitsTabSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load units. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Property Units</h3>
          <p className="text-sm text-muted-foreground">
            {units.length} {units.length === 1 ? 'unit' : 'units'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        )}
      </div>

      {/* Helpful Info Banner */}
      {units.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Units are automatically marked as occupied when rental income is assigned to them in the Income tab.
          </p>
        </div>
      )}

      {/* Units List */}
      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No units yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Track individual units for this property. Occupancy is automatically tracked when you assign rental income to units.
          </p>
          {canEdit && (
            <Button onClick={() => setAddDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Unit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              portfolioId={property.portfolio_id!}
            />
          ))}
        </div>
      )}

      {/* Add Unit Dialog */}
      {canEdit && property.portfolio_id && (
        <AddUnitDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          property={property}
          portfolioId={property.portfolio_id}
        />
      )}
    </div>
  )
}

function UnitsTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}
