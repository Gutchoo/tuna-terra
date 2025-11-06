'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Settings2Icon } from 'lucide-react'
import type { Property } from '@/lib/supabase'

export interface TableColumn {
  key: keyof Property | string // Allow virtual columns (like demographics)
  label: string
  category: 'basic' | 'property' | 'financial' | 'location' | 'demographics' | 'other'
  defaultVisible: boolean
  virtual?: boolean // Indicates this is a virtual column (not from database)
}

export const AVAILABLE_COLUMNS: TableColumn[] = [
  // Basic columns - always show
  { key: 'address', label: 'Address', category: 'basic', defaultVisible: true },
  { key: 'city', label: 'City', category: 'basic', defaultVisible: true },
  { key: 'state', label: 'State', category: 'basic', defaultVisible: true },
  { key: 'zip_code', label: 'Zip Code', category: 'basic', defaultVisible: true },
  { key: 'apn', label: 'APN', category: 'basic', defaultVisible: true },

  // Property details (keeping owner field for legacy data)
  { key: 'owner', label: 'Owner', category: 'property', defaultVisible: true },

  // DISABLED: Demographics (virtual columns) - Census API integration removed
  // To restore: uncomment these lines and restore Census API integration
  // { key: 'median_income', label: 'Area Median Income', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'mean_income', label: 'Area Mean Income', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'households', label: 'Area Households', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'population', label: 'Area Population', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'median_age', label: 'Median Age', category: 'demographics', defaultVisible: false, virtual: true },

  // DISABLED: Housing demographics (virtual columns from DP04)
  // { key: 'total_housing_units', label: 'Total Housing Units', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'median_rent', label: 'Area Median Rent', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'owner_occupied_units', label: 'Owner Occupied Units', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'renter_occupied_units', label: 'Renter Occupied Units', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'avg_household_size_owner', label: 'Avg HH Size (Owner)', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'avg_household_size_renter', label: 'Avg HH Size (Renter)', category: 'demographics', defaultVisible: false, virtual: true },

  // DISABLED: Education demographics (virtual columns from S1501)
  // { key: 'bachelor_rate_25_34', label: 'Bachelor Rate (25-34)', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'bachelor_rate_35_44', label: 'Bachelor Rate (35-44)', category: 'demographics', defaultVisible: false, virtual: true },
  // { key: 'bachelor_rate_45_64', label: 'Bachelor Rate (45-64)', category: 'demographics', defaultVisible: false, virtual: true },

  // Other
  { key: 'created_at', label: 'Added', category: 'other', defaultVisible: true },
  { key: 'user_notes', label: 'Notes', category: 'other', defaultVisible: false },
  { key: 'tags', label: 'Tags', category: 'other', defaultVisible: false },
]

interface ColumnSelectorProps {
  visibleColumns: Set<keyof Property | string> // Allow virtual column keys
  onColumnsChange: (columns: Set<keyof Property | string>) => void
}

export function ColumnSelector({ visibleColumns, onColumnsChange }: ColumnSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleColumnToggle = (columnKey: keyof Property | string, checked: boolean) => {
    const newColumns = new Set(visibleColumns)
    if (checked) {
      newColumns.add(columnKey)
    } else {
      newColumns.delete(columnKey)
    }
    onColumnsChange(newColumns)
  }

  const handleSelectAll = () => {
    const allColumns = new Set(AVAILABLE_COLUMNS.map(col => col.key))
    onColumnsChange(allColumns)
  }

  const handleSelectDefault = () => {
    const defaultColumns = new Set(
      AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.key)
    )
    onColumnsChange(defaultColumns)
  }

  const handleSelectNone = () => {
    // Keep basic columns always visible
    const basicColumns = new Set(
      AVAILABLE_COLUMNS.filter(col => col.category === 'basic').map(col => col.key)
    )
    onColumnsChange(basicColumns)
  }

  const categorizedColumns = AVAILABLE_COLUMNS.reduce((acc, column) => {
    if (!acc[column.category]) {
      acc[column.category] = []
    }
    acc[column.category].push(column)
    return acc
  }, {} as Record<string, TableColumn[]>)

  const categoryLabels = {
    basic: 'Basic Information',
    property: 'Property Details', 
    financial: 'Financial Data',
    location: 'Location Data',
    demographics: 'Area Demographics',
    other: 'Other'
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings2Icon className="mr-2 h-4 w-4" />
          Columns ({visibleColumns.size})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Table Columns</DropdownMenuLabel>
        
        <div className="flex gap-1 p-1">
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSelectAll}>
            All
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSelectDefault}>
            Default
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSelectNone}>
            Minimal
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {Object.entries(categorizedColumns).map(([category, columns]) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.key}
                className="flex items-center gap-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={visibleColumns.has(column.key)}
                  onCheckedChange={(checked) => handleColumnToggle(column.key, !!checked)}
                  disabled={column.category === 'basic'} // Keep basic columns always visible
                />
                <span className="flex-1 text-sm">{column.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}