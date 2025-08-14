'use client'

import { Toggle } from '@/components/ui/toggle'

interface ModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
  disabled?: boolean
}

export function ModeToggle({ enabled, onToggle, className, disabled = false }: ModeToggleProps) {
  return (
    <div className={`flex items-center rounded-md border border-input bg-background p-1 ${className || ''}`}>
      <Toggle
        pressed={!enabled}
        onPressedChange={(pressed) => onToggle(!pressed)}
        variant="outline"
        size="sm"
        className="h-9 px-3 rounded-[4px] data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent border-transparent"
      >
        Basic
      </Toggle>
      <Toggle
        pressed={enabled}
        onPressedChange={(pressed) => onToggle(pressed)}
        variant="outline"
        size="sm"
        disabled={disabled}
        className={`h-9 px-3 rounded-[4px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary border-transparent ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Pro
      </Toggle>
    </div>
  )
}