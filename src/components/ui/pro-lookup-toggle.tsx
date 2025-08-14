'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { InfoIcon, MapIcon, UserIcon, HomeIcon, FileTextIcon, DollarSignIcon } from 'lucide-react'

interface ProLookupToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function ProLookupToggle({ enabled, onToggle, className }: ProLookupToggleProps) {
  return (
    <div className={`flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Switch
          id="pro-lookup"
          checked={enabled}
          onCheckedChange={onToggle}
        />
        <Label htmlFor="pro-lookup" className="flex items-center gap-2 font-medium">
          Pro Lookup
        </Label>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <InfoIcon className="h-4 w-4" />
            <span className="sr-only">Pro Lookup Information</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Pro Lookup Features
              </h4>
              <p className="text-sm text-muted-foreground">
                Enhanced property data from official tax records and assessments
              </p>
            </div>
            
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <MapIcon className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <div className="font-medium">Property Mapping</div>
                  <div className="text-xs text-muted-foreground">
                    Exact boundaries and coordinates for map visualization
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <UserIcon className="h-4 w-4 mt-0.5 text-green-500" />
                <div>
                  <div className="font-medium">Owner Information</div>
                  <div className="text-xs text-muted-foreground">
                    Current owner names and mailing addresses
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <DollarSignIcon className="h-4 w-4 mt-0.5 text-yellow-500" />
                <div>
                  <div className="font-medium">Financial Data</div>
                  <div className="text-xs text-muted-foreground">
                    Assessed values, sale history, and tax information
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <HomeIcon className="h-4 w-4 mt-0.5 text-purple-500" />
                <div>
                  <div className="font-medium">Property Details</div>
                  <div className="text-xs text-muted-foreground">
                    Lot size, building details, year built, stories, units
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileTextIcon className="h-4 w-4 mt-0.5 text-orange-500" />
                <div>
                  <div className="font-medium">Zoning & Use</div>
                  <div className="text-xs text-muted-foreground">
                    Zoning codes, property use, and development restrictions
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <strong>Basic Mode:</strong> Only stores the address/APN you provide. 
                Perfect for simple portfolio tracking without detailed property data.
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1 text-right">
        <div className="text-sm font-medium">
          {enabled ? 'Pro Mode' : 'Basic Mode'}
        </div>
        <div className="text-xs text-muted-foreground">
          {enabled ? 'Full property data' : 'Address only'}
        </div>
      </div>
    </div>
  )
}