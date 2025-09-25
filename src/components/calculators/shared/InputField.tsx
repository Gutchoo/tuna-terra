'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface InputFieldProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
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
}

export function InputField({
  id,
  label,
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
}: InputFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
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
          inputMode="decimal"
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