'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoanCostsInputProps {
  label: string
  value: number
  type: 'percentage' | 'dollar' | ''
  onValueChange: (value: number) => void
  onTypeChange: (type: 'percentage' | 'dollar') => void
  tooltip: string
  loanAmount?: number
  className?: string
}

export function LoanCostsInput({
  label,
  value,
  type,
  onValueChange,
  onTypeChange,
  tooltip,
  loanAmount = 0,
  className,
}: LoanCostsInputProps) {
  const handleValueChange = (newValue: string) => {
    const numericValue = parseFloat(newValue) || 0
    onValueChange(numericValue)
  }

  const handleTypeChange = (newType: string) => {
    const typeValue = newType as 'percentage' | 'dollar'
    onTypeChange(typeValue)
  }

  // Calculate display value based on current type and loan amount
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
        placeholder: '2.0',
        prefix: '',
        suffix: '%'
      }
    } else {
      return {
        placeholder: '25000',
        prefix: '$',
        suffix: ''
      }
    }
  }

  const displayInfo = getDisplayInfo()

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="loan-costs" className="text-sm font-medium">
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
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">% of Loan Amount</SelectItem>
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
            id="loan-costs"
            type="number"
            value={value === 0 ? '' : value}
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
    </div>
  )
}