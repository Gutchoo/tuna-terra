'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboInputFieldProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  selectorValue: string
  onSelectorChange: (value: string) => void
  selectorOptions: { value: string; label: string }[]
  type?: 'text' | 'number'
  placeholder?: string
  prefix?: string
  suffix?: string
  required?: boolean
  className?: string
  min?: number
  max?: number
  step?: number | string
  disabled?: boolean
  tooltip?: string
}

export function ComboInputField({
  id,
  label,
  value,
  onChange,
  selectorValue,
  onSelectorChange,
  selectorOptions,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  required = false,
  className,
  min,
  max,
  step = 'any',
  disabled = false,
  tooltip,
}: ComboInputFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex">
        <Select value={selectorValue} onValueChange={onSelectorChange}>
          <SelectTrigger className="w-fit rounded-r-none border-r-0 focus:z-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {prefix}
            </div>
          )}
          <Input
            id={id}
            type={type}
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'rounded-l-none focus:z-10',
              prefix && 'pl-8',
              suffix && 'pr-8',
              '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-required={required}
            inputMode="decimal"
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}