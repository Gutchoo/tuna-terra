'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface HoldPeriodSelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function HoldPeriodSelector({ value, onChange, className = '' }: HoldPeriodSelectorProps) {
  const commonPeriods = [3, 5, 7, 10, 15]

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor="hold-period" className="text-sm font-medium">
          Investment Hold Period
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                The number of years you plan to hold the property before selling. 
                This controls the number of columns in your financial projections.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            id="hold-period"
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1
              if (val > 0 && val <= 30) {
                onChange(val)
              }
            }}
            className="w-20 text-center"
            min={1}
            max={30}
          />
          <span className="text-sm text-muted-foreground">years</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">or</span>
          {commonPeriods.map((years) => (
            <Button
              key={years}
              variant={value === years ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(years)}
              className="h-7 px-2 text-xs"
            >
              {years}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}