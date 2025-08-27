'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Percent, HelpCircle } from 'lucide-react'
import type { PropertyAssumptions } from '@/lib/financial-modeling/proforma'

interface IncomeSpreadsheetProps {
  assumptions: PropertyAssumptions
  onAssumptionsChange: (assumptions: PropertyAssumptions) => void
  maxYears?: number
}

export function IncomeSpreadsheet({ 
  assumptions, 
  onAssumptionsChange, 
  maxYears = 10 
}: IncomeSpreadsheetProps) {
  const displayYears = Math.min(maxYears, assumptions.holdPeriodYears || 10)
  const [otherIncomeGrowthRate, setOtherIncomeGrowthRate] = useState<number | undefined>(undefined)
  
  const updateArray = (field: 'potentialRentalIncome' | 'otherIncome' | 'vacancyRates' | 'operatingExpenses', index: number, value: number) => {
    const newArray = [...(assumptions[field] || [])]
    newArray[index] = value
    onAssumptionsChange({
      ...assumptions,
      [field]: newArray
    })
  }

  const autoPopulateWithGrowth = (
    field: 'potentialRentalIncome' | 'otherIncome',
    growthRate: number,
    startValue: number
  ) => {
    if (!growthRate || !startValue) return
    
    const newArray = Array(30).fill(0)
    newArray[0] = startValue
    
    for (let i = 1; i < displayYears; i++) {
      newArray[i] = newArray[i - 1] * (1 + growthRate / 100)
    }
    
    onAssumptionsChange({
      ...assumptions,
      [field]: newArray
    })
  }

  const autoPopulateVacancyRates = () => {
    if (assumptions.defaultVacancyRate === undefined) return
    
    onAssumptionsChange({
      ...assumptions,
      vacancyRates: Array(10).fill(assumptions.defaultVacancyRate / 100)
    })
  }

  const autoPopulateOperatingExpenses = () => {
    if (assumptions.defaultOperatingExpenseRate === undefined) return
    
    const newExpenses = Array(10).fill(0)
    
    for (let i = 0; i < 10; i++) {
      if (assumptions.operatingExpenseType === 'percentage') {
        // For percentage type, store the percentage value
        newExpenses[i] = assumptions.defaultOperatingExpenseRate
      } else {
        // For dollar type, store the fixed amount
        newExpenses[i] = assumptions.defaultOperatingExpenseRate
      }
    }
    
    onAssumptionsChange({
      ...assumptions,
      operatingExpenses: newExpenses
    })
  }

  const calculateNOI = (year: number) => {
    const rentalIncome = assumptions.potentialRentalIncome[year] || 0
    const otherIncome = assumptions.otherIncome?.[year] || 0
    const gross = rentalIncome + otherIncome
    const vacancy = rentalIncome * (assumptions.vacancyRates[year] || 0) // Vacancy only applies to rental income
    const effectiveGross = gross - vacancy
    
    let opEx = 0
    if (assumptions.operatingExpenseType === 'percentage') {
      // Operating expenses as percentage of effective gross income (after vacancy)
      opEx = effectiveGross * ((assumptions.operatingExpenses[year] || 0) / 100)
    } else {
      opEx = assumptions.operatingExpenses[year] || 0
    }
    
    return Math.round((effectiveGross - opEx) * 100) / 100 // Round to 2 decimal places
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Detailed Income Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your rental income projections, vacancy rates, and operating expenses for each year.
          {assumptions.holdPeriodYears > 0 && (
            <span className="ml-2">
              Showing {displayYears} years based on your {assumptions.holdPeriodYears}-year hold period.
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Auto-population Controls */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Rental Income Auto-populate */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Auto-populate Rental Income</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Annual increase %"
                  value={assumptions.rentalIncomeGrowthRate || ''}
                  onChange={(e) => onAssumptionsChange({
                    ...assumptions,
                    rentalIncomeGrowthRate: parseFloat(e.target.value) || undefined
                  })}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => autoPopulateWithGrowth(
                  'potentialRentalIncome', 
                  assumptions.rentalIncomeGrowthRate || 0,
                  assumptions.potentialRentalIncome[0] || 0
                )}
                disabled={!assumptions.rentalIncomeGrowthRate || !assumptions.potentialRentalIncome[0]}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Other Income Auto-populate */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Auto-populate Other Income</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Annual increase %"
                  value={otherIncomeGrowthRate || ''}
                  onChange={(e) => setOtherIncomeGrowthRate(parseFloat(e.target.value) || undefined)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => autoPopulateWithGrowth(
                  'otherIncome',
                  otherIncomeGrowthRate || 0,
                  assumptions.otherIncome?.[0] || 0
                )}
                disabled={!otherIncomeGrowthRate || !(assumptions.otherIncome?.[0] > 0)}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Vacancy Rate Auto-populate */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Auto-populate Vacancy Rate</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Default vacancy %"
                  value={assumptions.defaultVacancyRate || ''}
                  onChange={(e) => onAssumptionsChange({
                    ...assumptions,
                    defaultVacancyRate: parseFloat(e.target.value) || undefined
                  })}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={autoPopulateVacancyRates}
                disabled={assumptions.defaultVacancyRate === undefined}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Operating Expenses Auto-populate */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Auto-populate Operating Expenses</Label>
            <div className="flex gap-2">
              <Select
                value={assumptions.operatingExpenseType}
                onValueChange={(value: 'percentage' | 'dollar') => onAssumptionsChange({
                  ...assumptions,
                  operatingExpenseType: value
                })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">% of Income</SelectItem>
                  <SelectItem value="dollar">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder={assumptions.operatingExpenseType === 'percentage' ? 'Rate %' : 'Amount $'}
                  value={assumptions.defaultOperatingExpenseRate || ''}
                  onChange={(e) => onAssumptionsChange({
                    ...assumptions,
                    defaultOperatingExpenseRate: parseFloat(e.target.value) || undefined
                  })}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={autoPopulateOperatingExpenses}
                disabled={assumptions.defaultOperatingExpenseRate === undefined || !assumptions.operatingExpenseType}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Income Item</TableHead>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableHead key={i} className="text-center min-w-24">
                    Year {i + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              
              {/* Potential Rental Income Row */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>Potential Rental Income</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Gross rental income before vacancy and expenses</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableCell key={i}>
                    <Input
                      type="number"
                      className="text-center h-8"
                      value={assumptions.potentialRentalIncome[i] ? (Math.round(assumptions.potentialRentalIncome[i] * 100) / 100).toFixed(2) : ''}
                      onChange={(e) => updateArray('potentialRentalIncome', i, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Other Income Row */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>Other Income</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Additional income (parking, laundry, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableCell key={i}>
                    <Input
                      type="number"
                      className="text-center h-8"
                      value={assumptions.otherIncome?.[i] ? (Math.round(assumptions.otherIncome[i] * 100) / 100).toFixed(2) : ''}
                      onChange={(e) => updateArray('otherIncome', i, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Vacancy Rate Row */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>Vacancy Rate (%)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Expected vacancy as percentage of rental income</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableCell key={i}>
                    <Input
                      type="number"
                      className="text-center h-8"
                      value={(assumptions.vacancyRates[i] * 100) || ''}
                      onChange={(e) => updateArray('vacancyRates', i, (parseFloat(e.target.value) || 0) / 100)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Operating Expenses Row */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>Operating Expenses</span>
                    {assumptions.operatingExpenseType === 'percentage' && <Percent className="w-3 h-3" />}
                    {assumptions.operatingExpenseType === 'dollar' && <DollarSign className="w-3 h-3" />}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {assumptions.operatingExpenseType === 'percentage' 
                              ? 'Operating expenses as percentage of rental income' 
                              : 'Fixed operating expenses amount'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableCell key={i}>
                    <Input
                      type="number"
                      className="text-center h-8"
                      value={assumptions.operatingExpenses[i] || ''}
                      onChange={(e) => updateArray('operatingExpenses', i, parseFloat(e.target.value) || 0)}
                      min="0"
                      step={assumptions.operatingExpenseType === 'percentage' ? '0.1' : '100'}
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Calculated NOI Row (Read-only) */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-2">
                    <span>Net Operating Income</span>
                    <Badge variant="secondary" className="text-xs">Calculated</Badge>
                  </div>
                </TableCell>
                {Array.from({ length: displayYears }, (_, i) => (
                  <TableCell key={i} className="text-center font-medium">
                    ${calculateNOI(i).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Average NOI</div>
            <div className="text-lg font-semibold">
              ${(Math.round(Array.from({ length: displayYears }, (_, i) => calculateNOI(i))
                .reduce((sum, noi, _, arr) => sum + noi / arr.length, 0) * 100) / 100)
                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Year 1 NOI</div>
            <div className="text-lg font-semibold">
              ${calculateNOI(0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Final Year NOI</div>
            <div className="text-lg font-semibold">
              ${calculateNOI(displayYears - 1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}