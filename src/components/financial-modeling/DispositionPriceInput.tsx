"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DispositionPriceInputProps {
  label: string
  priceType: 'dollar' | 'caprate' | ''
  dollarValue: number
  capRateValue: number
  finalYearNOI?: number // Pass the final year NOI for cap rate calculation
  onPriceTypeChange: (type: 'dollar' | 'caprate') => void
  onDollarValueChange: (value: number) => void
  onCapRateValueChange: (value: number) => void
  tooltip?: string
  className?: string
}

export function DispositionPriceInput({
  label,
  priceType,
  dollarValue,
  capRateValue,
  finalYearNOI = 0,
  onPriceTypeChange,
  onDollarValueChange,
  onCapRateValueChange,
  tooltip,
  className
}: DispositionPriceInputProps) {
  
  const calculatedPrice = priceType === 'caprate' && capRateValue > 0 && finalYearNOI > 0 
    ? finalYearNOI / (capRateValue / 100)
    : 0

  const handleValueChange = (newValue: string) => {
    const numericValue = parseFloat(newValue) || 0
    if (priceType === 'dollar') {
      onDollarValueChange(numericValue)
    } else if (priceType === 'caprate') {
      onCapRateValueChange(numericValue)
    }
  }

  const handleTypeChange = (newType: string) => {
    const typeValue = newType as 'dollar' | 'caprate'
    onPriceTypeChange(typeValue)
  }

  // Get display info based on current type
  const getDisplayInfo = () => {
    if (!priceType) {
      return {
        placeholder: '0',
        prefix: '',
        suffix: ''
      }
    }

    if (priceType === 'dollar') {
      return {
        placeholder: '500000',
        prefix: '$',
        suffix: ''
      }
    } else {
      return {
        placeholder: '7.5',
        prefix: '',
        suffix: '%'
      }
    }
  }

  const displayInfo = getDisplayInfo()
  const currentValue = priceType === 'dollar' ? dollarValue : capRateValue

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="disposition-price" className="text-sm font-medium">
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
        <Select value={priceType || 'dollar'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-fit rounded-r-none border-r-0 focus:z-10">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dollar">Dollar Amount</SelectItem>
            <SelectItem value="caprate">Cap Rate Method</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          {displayInfo.prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {displayInfo.prefix}
            </div>
          )}
          <Input
            id="disposition-price"
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
          />
          {displayInfo.suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {displayInfo.suffix}
            </div>
          )}
        </div>
      </div>
      
      {/* Calculation display for cap rate method */}
      {priceType === 'caprate' && calculatedPrice > 0 && (
        <div className="text-sm text-muted-foreground">
          = ${calculatedPrice.toLocaleString()}
        </div>
      )}
      {priceType === 'caprate' && finalYearNOI === 0 && capRateValue > 0 && (
        <div className="text-sm text-orange-600">
          Final year NOI needed for calculation
        </div>
      )}
    </div>
  )
}