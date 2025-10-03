'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePropertyFinancialModeling } from '@/lib/contexts/PropertyFinancialModelingContext'
import { formatCurrency } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'

interface ExitTabProps {
  canEdit?: boolean
}

export function ExitTab({ canEdit = true }: ExitTabProps) {
  const { state, updateAssumption } = usePropertyFinancialModeling()
  const { assumptions, results, isSaving } = state

  // Calculate sale price and proceeds
  const calculateSaleMetrics = () => {
    if (!results?.saleProceeds) {
      return { salePrice: 0, afterTaxProceeds: 0 }
    }

    return {
      salePrice: results.saleProceeds.salePrice || 0,
      afterTaxProceeds: results.saleProceeds.afterTaxSaleProceeds || 0,
    }
  }

  const { salePrice, afterTaxProceeds } = calculateSaleMetrics()

  return (
    <div className="space-y-6">
      {/* Exit Strategy Inputs */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Exit Strategy</h3>

        <div className="space-y-4">
          {/* Hold Period */}
          <div className="space-y-2">
            <Label htmlFor="hold-period" className="flex items-center gap-2">
              Hold Period (Years)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Number of years before selling the property (max 10 years)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="hold-period"
              type="number"
              min="0"
              max="10"
              step="1"
              value={assumptions.holdPeriodYears || ''}
              onChange={(e) => updateAssumption('holdPeriodYears', parseInt(e.target.value) || 0)}
              disabled={!canEdit}
              placeholder="5"
              className="text-right"
            />
          </div>

          {/* Exit Cap Rate */}
          <div className="space-y-2">
            <Label htmlFor="exit-cap-rate" className="flex items-center gap-2">
              Exit Cap Rate (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Cap rate used to calculate sale price based on Year N+1 NOI
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="exit-cap-rate"
                type="number"
                min="0"
                max="100"
                step="0.25"
                value={(assumptions.dispositionCapRate * 100) || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  updateAssumption('dispositionCapRate', value / 100)
                  updateAssumption('dispositionPriceType', 'caprate')
                }}
                disabled={!canEdit}
                placeholder="6.0"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>

          {/* Selling Costs */}
          <div className="space-y-2">
            <Label htmlFor="selling-costs" className="flex items-center gap-2">
              Selling Costs (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Broker fees, closing costs, etc. (typically 2-6%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="selling-costs"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={(assumptions.costOfSalePercentage * 100) || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  updateAssumption('costOfSalePercentage', value / 100)
                  updateAssumption('costOfSaleType', 'percentage')
                }}
                disabled={!canEdit}
                placeholder="3.0"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Property & Depreciation */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Property & Depreciation</h3>

        <div className="space-y-4">
          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="property-type">Property Type</Label>
            <Select
              value={assumptions.propertyType}
              onValueChange={(value) => {
                updateAssumption('propertyType', value as 'residential' | 'commercial')
                updateAssumption('depreciationYears', value === 'residential' ? 27.5 : 39)
              }}
              disabled={!canEdit}
            >
              <SelectTrigger id="property-type">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential (27.5 years)</SelectItem>
                <SelectItem value="commercial">Commercial (39 years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Land / Improvements Split */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="land-percentage" className="flex items-center gap-2">
                Land %
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Land is not depreciable. Must sum to 100% with Improvements.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Input
                  id="land-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={assumptions.landPercentage || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    updateAssumption('landPercentage', value)
                    updateAssumption('improvementsPercentage', 100 - value)
                  }}
                  disabled={!canEdit}
                  placeholder="20"
                  className="text-right pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements-percentage" className="flex items-center gap-2">
                Improvements %
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Building and improvements are depreciable. Auto-calculated as 100% - Land %.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Input
                  id="improvements-percentage"
                  type="number"
                  value={assumptions.improvementsPercentage || ''}
                  disabled
                  className="text-right pr-8 bg-muted"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tax Rates */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Tax Rates</h3>

        <div className="space-y-4">
          {/* Ordinary Income Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="ordinary-tax-rate" className="flex items-center gap-2">
              Ordinary Income Tax Rate (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Federal + state tax rate on ordinary income (10%-37%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="ordinary-tax-rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={(assumptions.ordinaryIncomeTaxRate * 100) || ''}
                onChange={(e) => updateAssumption('ordinaryIncomeTaxRate', (parseFloat(e.target.value) || 0) / 100)}
                disabled={!canEdit}
                placeholder="24"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>

          {/* Capital Gains Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="capital-gains-rate" className="flex items-center gap-2">
              Capital Gains Tax Rate (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Long-term capital gains rate (0%, 15%, or 20%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="capital-gains-rate"
                type="number"
                min="0"
                max="100"
                step="5"
                value={(assumptions.capitalGainsTaxRate * 100) || ''}
                onChange={(e) => updateAssumption('capitalGainsTaxRate', (parseFloat(e.target.value) || 0) / 100)}
                disabled={!canEdit}
                placeholder="15"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>

          {/* Depreciation Recapture Rate */}
          <div className="space-y-2">
            <Label htmlFor="recapture-rate" className="flex items-center gap-2">
              Depreciation Recapture Rate (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Section 1250 recapture rate (max 25%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="recapture-rate"
                type="number"
                min="0"
                max="25"
                step="1"
                value={(assumptions.depreciationRecaptureRate * 100) || ''}
                onChange={(e) => updateAssumption('depreciationRecaptureRate', (parseFloat(e.target.value) || 0) / 100)}
                disabled={!canEdit}
                placeholder="25"
                className="text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            Saving...
          </div>
        )}
      </Card>

      {/* Mini Metrics Preview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">Sale Price</p>
          <p className="text-xl font-bold">
            {salePrice > 0 ? formatCurrency(salePrice) : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Year N+1 NOI / Exit Cap Rate
          </p>
        </Card>

        <Card className="p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">After-Tax Proceeds</p>
          <p className="text-xl font-bold">
            {afterTaxProceeds > 0 ? formatCurrency(afterTaxProceeds) : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sale Price - Costs - Taxes
          </p>
        </Card>
      </div>
    </div>
  )
}
