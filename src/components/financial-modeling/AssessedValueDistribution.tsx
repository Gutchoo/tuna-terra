'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputField } from '@/components/calculators/shared/InputField'
import { PieChart, Info } from 'lucide-react'

interface AssessedValueDistributionProps {
  landPercentage: number
  improvementsPercentage: number
  onLandPercentageChange: (value: number) => void
  onImprovementsPercentageChange: (value: number) => void
  purchasePrice: number
}

export function AssessedValueDistribution({
  landPercentage,
  improvementsPercentage,
  onLandPercentageChange,
  onImprovementsPercentageChange,
  purchasePrice
}: AssessedValueDistributionProps) {
  const landValue = (purchasePrice * landPercentage) / 100
  const improvementsValue = (purchasePrice * improvementsPercentage) / 100

  const handleLandChange = (value: string) => {
    console.log('Land input:', value)
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    console.log('Setting land to:', numValue)
    onLandPercentageChange(numValue)
  }

  const handleImprovementsChange = (value: string) => {
    console.log('Improvements input:', value)
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    console.log('Setting improvements to:', numValue)
    onImprovementsPercentageChange(numValue)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Assessed Value Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Allocate property value between land and improvements for depreciation calculation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <InputField
              id="landPercentage"
              label="Land Value"
              value={landPercentage}
              onChange={handleLandChange}
              type="text"
              suffix="%"
              min={0}
              max={100}
              step={0.1}
            />
            {purchasePrice > 0 && (
              <div className="text-xs text-muted-foreground">
                = ${landValue.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <InputField
              id="improvementsPercentage"
              label="Improvements Value"
              value={improvementsPercentage}
              onChange={handleImprovementsChange}
              type="text"
              suffix="%"
              min={0}
              max={100}
              step={0.1}
            />
            {purchasePrice > 0 && (
              <div className="text-xs text-muted-foreground">
                = ${improvementsValue.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Depreciation Impact:</strong> Only the improvements portion (${improvementsValue.toLocaleString()}) 
            can be depreciated for tax purposes. Land value is not depreciable.
          </AlertDescription>
        </Alert>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Land:</strong> Non-depreciable asset, typically 15-25% of total value</p>
          <p>• <strong>Improvements:</strong> Depreciable buildings and structures</p>
          <p>• Use property tax assessments or appraisals for accurate allocation</p>
        </div>
      </CardContent>
    </Card>
  )
}