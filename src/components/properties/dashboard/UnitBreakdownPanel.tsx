'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Minimize2, Maximize2 } from 'lucide-react'
import type { PropertyUnit } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface UnitBreakdownPanelProps {
  propertyId: string | null
  units: PropertyUnit[]
  isVisible: boolean
  onToggleVisibility: () => void
}

export function UnitBreakdownPanel({
  propertyId,
  units,
  isVisible,
  onToggleVisibility,
}: UnitBreakdownPanelProps) {
  if (!isVisible) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="w-full justify-start"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Show Unit Breakdown
        </Button>
      </div>
    )
  }

  if (!propertyId) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unit Breakdown</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onToggleVisibility}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Select a property to view units
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate occupancy stats
  const totalUnits = units.length
  const occupiedUnits = units.filter(u => u.is_occupied).length
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle className="text-sm font-medium">Unit Breakdown</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleVisibility}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {units.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No units found
          </div>
        ) : (
          <div className="space-y-3">
            {/* Occupancy Summary */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="text-xs">
                <div className="font-medium">
                  {occupiedUnits} of {totalUnits} Units Occupied
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {occupancyRate.toFixed(1)}% Occupancy
                </div>
              </div>
            </div>

            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b text-xs font-medium text-muted-foreground">
              <div>Unit</div>
              <div>Status</div>
              <div className="text-right">Rent</div>
              <div className="text-right">Lease End</div>
            </div>

            {/* Unit List */}
            <div className="space-y-2">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="grid grid-cols-4 gap-2 text-xs items-center"
                >
                  <div className="font-mono font-medium truncate">
                    {unit.unit_number}
                  </div>
                  <div>
                    <Badge
                      variant={unit.is_occupied ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {unit.is_occupied ? 'Occupied' : 'Vacant'}
                    </Badge>
                  </div>
                  <div className="text-right font-mono">
                    {formatCurrency(unit.monthly_rent)}
                  </div>
                  <div className="text-right font-mono text-muted-foreground">
                    {formatDate(unit.lease_end_date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
