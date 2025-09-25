'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboInputProps {
  id: string
  label: string
  tooltip: string
  percentageLabel: string
  dollarLabel: string
  percentagePlaceholder?: string
  dollarPlaceholder?: string
  defaultMode?: 'percentage' | 'dollar' | ''
  value?: string
  onValueChange?: (value: string, mode: 'percentage' | 'dollar') => void
  className?: string
}

export function ComboInput({
  id,
  label,
  tooltip,
  percentageLabel,
  dollarLabel,
  percentagePlaceholder = '',
  dollarPlaceholder = '',
  defaultMode = 'percentage',
  value = '',
  onValueChange,
  className,
}: ComboInputProps) {
  const [mode, setMode] = useState<'percentage' | 'dollar'>(defaultMode || 'percentage')
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    setMode(defaultMode || 'percentage')
  }, [defaultMode])

  const handleValueChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange?.(newValue, mode)
  }

  const handleModeChange = (newMode: string) => {
    const newModeValue = newMode as 'percentage' | 'dollar'
    setMode(newModeValue)
    onValueChange?.(inputValue, newModeValue)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
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
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-fit rounded-r-none border-r-0 focus:z-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">{percentageLabel}</SelectItem>
            <SelectItem value="dollar">{dollarLabel}</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          {mode === 'dollar' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </div>
          )}
          <Input
            id={id}
            type="number"
            value={inputValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={mode === 'percentage' ? percentagePlaceholder : dollarPlaceholder}
            className={cn(
              'rounded-l-none focus:z-10',
              mode === 'dollar' && 'pl-8',
              mode === 'percentage' && 'pr-8',
              '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
            step="any"
            inputMode="decimal"
          />
          {mode === 'percentage' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </div>
          )}
        </div>
      </div>
    </div>
  )
}