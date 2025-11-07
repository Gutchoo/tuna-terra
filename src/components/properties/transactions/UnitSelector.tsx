"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { usePropertyUnits } from "@/hooks/use-property-units"
import type { Property } from "@/lib/supabase"

interface UnitSelectorProps {
  property: Property
  value: string | null
  onChange: (value: string | null) => void
  includePropertyLevel?: boolean
  disabled?: boolean
}

export function UnitSelector({
  property,
  value,
  onChange,
  includePropertyLevel = true,
  disabled = false,
}: UnitSelectorProps) {
  // Smart logic: Only show selector if property has units
  const hasUnits = property.num_units && property.num_units > 0

  // Fetch units if property has them
  const { data: unitsResponse, isLoading } = usePropertyUnits(
    hasUnits ? property.id : null,
    { is_active: true }
  )

  // If property has no units, hide the selector and auto-assign to property-level
  React.useEffect(() => {
    if (!hasUnits && value !== null) {
      onChange(null) // Auto-assign to property-level
    }
  }, [hasUnits, value, onChange])

  // Don't render anything for single-unit properties
  if (!hasUnits) {
    return null
  }

  const units = unitsResponse?.data || []

  return (
    <div className="space-y-2">
      <Label htmlFor="unit-selector" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Unit Assignment
      </Label>
      <Select
        value={value === null ? "property-level" : value}
        onValueChange={(val) => onChange(val === "property-level" ? null : val)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="unit-selector">
          <SelectValue placeholder={isLoading ? "Loading units..." : "Select a unit"} />
        </SelectTrigger>
        <SelectContent>
          {includePropertyLevel && (
            <SelectItem value="property-level">
              Property-level (no specific unit)
            </SelectItem>
          )}
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.unit_number}
              {unit.unit_name && ` - ${unit.unit_name}`}
              {unit.tenant_name && ` (${unit.tenant_name})`}
            </SelectItem>
          ))}
          {units.length === 0 && !isLoading && (
            <SelectItem value="no-units" disabled>
              No units configured yet
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {units.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">
          Create units in the Units tab to assign transactions to specific units
        </p>
      )}
    </div>
  )
}
