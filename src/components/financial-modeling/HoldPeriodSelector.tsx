'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface HoldPeriodSelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function HoldPeriodSelector({ value, onChange, className = '' }: HoldPeriodSelectorProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0])
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Investment Hold Period
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  The number of years you plan to hold the property before selling. 
                  This affects your financial projections and spreadsheet columns.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hold-period" className="text-base">
              Years to Hold Property
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {value} {value === 1 ? 'Year' : 'Years'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Slider
              id="hold-period"
              min={1}
              max={30}
              step={1}
              value={[value]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Common Hold Period Presets */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Common Hold Periods</Label>
          <div className="flex gap-2 flex-wrap">
            {[3, 5, 7, 10, 15].map((years) => (
              <button
                key={years}
                onClick={() => onChange(years)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${value === years 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }
                `}
              >
                {years} Years
              </button>
            ))}
          </div>
        </div>

        {/* Hold Period Insights */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            Investment Timeline Impact
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            {value <= 3 && (
              <>
                <li>• Short-term hold - focus on appreciation & quick flip</li>
                <li>• Higher tax rates on capital gains</li>
              </>
            )}
            {value > 3 && value <= 7 && (
              <>
                <li>• Medium-term hold - balance of cash flow & appreciation</li>
                <li>• Qualify for long-term capital gains rates</li>
              </>
            )}
            {value > 7 && (
              <>
                <li>• Long-term hold - maximize cash flow generation</li>
                <li>• Full depreciation benefits realized</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}