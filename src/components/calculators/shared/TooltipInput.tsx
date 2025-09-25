'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipInputProps {
  id: string
  label: string
  tooltip: string
  value?: string | number
  onChange?: (value: string) => void
  type?: 'text' | 'number' | 'currency' | 'percentage'
  placeholder?: string
  prefix?: string
  suffix?: string
  required?: boolean
  className?: string
  min?: number
  max?: number
  step?: number | string
  disabled?: boolean
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export function TooltipInput({
  id,
  label,
  tooltip,
  value,
  onChange,
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
  onFocus,
  onBlur,
}: TooltipInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
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
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value === 0 ? '' : value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className={cn(
            prefix && 'pl-8',
            suffix && 'pr-8',
            '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-required={required}
          inputMode={type === 'number' ? 'decimal' : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}