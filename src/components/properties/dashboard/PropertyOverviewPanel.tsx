'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Minimize2, Maximize2 } from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface PropertyOverviewPanelProps {
  property: Property | null
  isVisible: boolean
  onToggleVisibility: () => void
  loanAmount?: number | null // From property_financials
}

export function PropertyOverviewPanel({
  property,
  isVisible,
  onToggleVisibility,
  loanAmount,
}: PropertyOverviewPanelProps) {
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
          Show Property Overview
        </Button>
      </div>
    )
  }

  if (!property) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Property Overview</CardTitle>
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
            Select a property to view details
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine property type from available data
  const getPropertyType = () => {
    if (property.num_units) {
      if (property.num_units === 1) return 'Single Family'
      if (property.num_units === 2) return 'Duplex'
      if (property.num_units <= 4) return `${property.num_units}-Unit Multi-Family`
      return `Multi-Family (${property.num_units} units)`
    }
    if (property.use_description) {
      return property.use_description
    }
    return 'Unknown'
  }

  // Determine debt status
  const getDebtStatus = () => {
    if (loanAmount && loanAmount > 0) {
      return 'Financed'
    }
    return 'Cash/No Debt'
  }

  const infoItems = [
    { label: 'Address', value: property.address || 'N/A' },
    { label: 'City', value: property.city || 'N/A' },
    { label: 'State', value: property.state || 'N/A' },
    { label: 'APN', value: property.apn || 'N/A' },
    { label: 'Year Built', value: property.year_built?.toString() || 'N/A' },
    { label: 'Owner', value: property.owner || 'N/A' },
    { label: 'Property Type', value: getPropertyType() },
    { label: 'Debt Status', value: getDebtStatus() },
    { label: 'Management', value: 'Self-Managed' }, // Placeholder for future feature
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle className="text-sm font-medium">Property Overview</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleVisibility}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto flex-1">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex justify-between items-start py-2',
              index < infoItems.length - 1 && 'border-b'
            )}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {item.label}
            </span>
            <span className="text-xs font-mono text-right max-w-[60%] truncate">
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
