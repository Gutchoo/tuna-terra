"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CostOfSaleInputProps {
  label: string
  type: 'percentage' | 'dollar' | ''
  percentageValue: number
  dollarValue: number
  salePrice?: number // Pass sale price for percentage calculation display
  onTypeChange: (type: 'percentage' | 'dollar') => void
  onPercentageValueChange: (value: number) => void
  onDollarValueChange: (value: number) => void
  tooltip?: string
  className?: string
}

export function CostOfSaleInput({
  label,
  type,
  percentageValue,
  dollarValue,
  salePrice = 0,
  onTypeChange,
  onPercentageValueChange,
  onDollarValueChange,
  tooltip,
  className
}: CostOfSaleInputProps) {
  
  const calculatedDollarAmount = type === 'percentage' && percentageValue > 0 && salePrice > 0 
    ? salePrice * (percentageValue / 100)
    : 0

  const handleValueChange = (newValue: string) => {
    const numericValue = parseFloat(newValue) || 0
    if (type === 'percentage') {
      onPercentageValueChange(numericValue)
    } else if (type === 'dollar') {
      onDollarValueChange(numericValue)
    }
  }

  const handleTypeChange = (newType: string) => {
    const typeValue = newType as 'percentage' | 'dollar'
    onTypeChange(typeValue)
  }

  // Get display info based on current type
  const getDisplayInfo = () => {
    if (!type) {
      return {
        placeholder: '0',
        prefix: '',
        suffix: ''
      }
    }

    if (type === 'percentage') {
      return {
        placeholder: '6',
        prefix: '',
        suffix: '%'
      }
    } else {
      return {
        placeholder: '30000',
        prefix: '$',
        suffix: ''
      }
    }
  }

  const displayInfo = getDisplayInfo()
  const currentValue = type === 'percentage' ? percentageValue : dollarValue

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="cost-of-sale" className="text-sm font-medium">
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-80 p-3">
              <p className="text-sm leading-relaxed">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex">
        <Select value={type || 'percentage'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-fit rounded-r-none border-r-0 focus:z-10">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">% of Sale Price</SelectItem>
            <SelectItem value="dollar">Dollar Amount</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          {displayInfo.prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {displayInfo.prefix}
            </div>
          )}
          <Input
            id="cost-of-sale"
            type="number"
            value={currentValue === 0 ? '' : currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={displayInfo.placeholder}
            className={cn(
              'rounded-l-none focus:z-10',
              displayInfo.prefix && 'pl-8',
              displayInfo.suffix && 'pr-8',
              '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
            step="any"
            inputMode="decimal"
            min="0"
          />
          {displayInfo.suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {displayInfo.suffix}
            </div>
          )}
        </div>
      </div>
      
      {/* Calculation display for percentage method */}
      {type === 'percentage' && calculatedDollarAmount > 0 && (
        <div className="text-sm text-muted-foreground">
          = ${calculatedDollarAmount.toLocaleString()}
        </div>
      )}
      {type === 'percentage' && salePrice === 0 && percentageValue > 0 && (
        <div className="text-sm text-orange-600">
          Sale price needed for calculation
        </div>
      )}
    </div>
  )
}