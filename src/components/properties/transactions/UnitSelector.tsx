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
  // Always fetch units for the property
  const { data: unitsResponse, isLoading } = usePropertyUnits(
    property.id,
    { is_active: true }
  )

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
              {unit.is_occupied ? " (Occupied)" : " (Vacant)"}
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
          Create units in the Units tab to track occupancy. Units are automatically marked occupied when rental income is assigned.
        </p>
      )}
    </div>
  )
}
