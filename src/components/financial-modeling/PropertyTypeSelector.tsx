'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Info, Home, Building } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyTypeSelectorProps {
  id?: string
  label?: string
  propertyType: 'residential' | 'commercial' | 'industrial' | ''
  depreciationYears: number
  onPropertyTypeChange: (type: 'residential' | 'commercial' | 'industrial') => void
  className?: string
  tooltip?: string
  inline?: boolean
}

const propertyTypeOptions = [
  { 
    value: 'residential' as const, 
    label: 'Residential',
    icon: Home,
    years: 27.5,
    description: 'IRS standard for rental properties'
  },
  { 
    value: 'commercial' as const, 
    label: 'Commercial',
    icon: Building,
    years: 39,
    description: 'IRS standard for commercial properties'
  }
]

export function PropertyTypeSelector({
  id = 'property-type',
  label = 'Property Type',
  propertyType,
  depreciationYears,
  onPropertyTypeChange,
  className,
  tooltip = 'Property type determines the IRS depreciation schedule used for tax calculations. Residential: 27.5 years, Commercial: 39 years.',
  inline = false,
}: PropertyTypeSelectorProps) {
  const handlePropertyTypeChange = (value: string) => {
    onPropertyTypeChange(value as 'residential' | 'commercial' | 'industrial')
  }

  const selectedOption = propertyTypeOptions.find(opt => opt.value === propertyType)
  const Icon = selectedOption?.icon || Building

  if (inline) {
    // Inline version for form grids
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <Select 
          value={propertyType || undefined} 
          onValueChange={handlePropertyTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type">
              {selectedOption && (
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{selectedOption.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {propertyTypeOptions.map((option) => {
              const OptionIcon = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <OptionIcon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Standard version with more details
  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        
        <Select 
          value={propertyType || undefined} 
          onValueChange={handlePropertyTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type">
              {selectedOption && (
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{selectedOption.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {propertyTypeOptions.map((option) => {
              const OptionIcon = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <OptionIcon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      
      {propertyType && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">{selectedOption?.label}</h4>
                <p className="text-xs text-muted-foreground">{selectedOption?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">{depreciationYears}</div>
              <div className="text-xs text-muted-foreground">years</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}