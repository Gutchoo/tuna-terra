"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Building, DollarSign, Calculator, TestTube, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { TooltipInput, TooltipSelect, financialTooltips } from '@/components/calculators/shared'
import { HorizontalSectionNav } from './HorizontalSectionNav'
import { InputSummaryCards } from './InputSummaryCards'
import { AnimatedTabContent } from './AnimatedTabContent'
import { IncomeSpreadsheet } from './IncomeSpreadsheet'
import { FinancingCard } from './FinancingCard'
import { AcquisitionCostsInput } from './AcquisitionCostsInput'
import { DispositionPriceInput } from './DispositionPriceInput'
import { CostOfSaleInput } from './CostOfSaleInput'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'
import { getScenarioNames, getTestScenario, randomizeScenario } from '@/lib/financial-modeling/test-scenarios'

export function InputSheetContent() {
  const { state, updateAssumption, dispatch } = useFinancialModeling()
  const { assumptions } = state
  const [activeSection, setActiveSection] = useState('property-income')
  const [isDevelopment, setIsDevelopment] = useState(false)

  // Check if we're in development mode
  useEffect(() => {
    // DEBUG: Show what variables we're checking
    console.log('=== TEST PANEL DEBUG ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('NEXT_PUBLIC_ENABLE_TEST_DATA:', process.env.NEXT_PUBLIC_ENABLE_TEST_DATA)
    console.log('Will show test panel:', 
      process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_ENABLE_TEST_DATA !== 'false'
    )
    console.log('========================')
    
    setIsDevelopment(
      process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_ENABLE_TEST_DATA !== 'false'
    )
  }, [])

  const handleAssumptionsChange = (newAssumptions: typeof assumptions) => {
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: newAssumptions })
  }

  const handlePropertyTypeChange = (value: string) => {
    const type = value as 'residential' | 'commercial' | ''
    const depreciationYears = type === 'residential' ? 27.5 : type === 'commercial' ? 39 : 39
    updateAssumption('propertyType', type)
    updateAssumption('depreciationYears', depreciationYears)
  }

  // Load test scenario
  const loadTestScenario = useCallback((scenarioId: string) => {
    if (scenarioId === 'clear') {
      // Clear all data
      dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: {
        purchasePrice: 0,
        acquisitionCosts: 0,
        potentialRentalIncome: Array(30).fill(0),
        vacancyRates: Array(30).fill(0),
        operatingExpenses: Array(30).fill(0),
        loanAmount: 0,
        interestRate: 0,
        holdPeriodYears: 0,
        dispositionPrice: 0,
        dispositionCapRate: 0,
        ordinaryIncomeTaxRate: 0,
        capitalGainsTaxRate: 0,
        depreciationRecaptureRate: 0,
      }})
      toast.success('All fields cleared')
      return
    }

    const scenario = getTestScenario(scenarioId)
    if (scenario) {
      dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: scenario.assumptions })
      toast.success(`Loaded: ${scenario.name}`, {
        description: scenario.description
      })
    }
  }, [dispatch])

  // Randomize current scenario
  const randomizeData = useCallback(() => {
    const randomized = randomizeScenario(assumptions)
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: randomized })
    toast.success('Data randomized for testing')
  }, [assumptions, dispatch])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        // Load the standard scenario as default
        loadTestScenario('standard')
      }
    }

    if (isDevelopment) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDevelopment, loadTestScenario])


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InputSummaryCards assumptions={assumptions} />

      {/* Development Controls */}
      {isDevelopment && (
        <Card className="border-dashed border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TestTube className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Development Mode</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Press Cmd+Shift+T for quick test data
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={loadTestScenario}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Load test scenario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getScenarioNames().map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{scenario.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {scenario.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="clear">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-3 w-3" />
                        Clear All Data
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={randomizeData}
                  className="text-orange-600 border-orange-200 hover:bg-orange-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Randomize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horizontal Section Navigation */}
      <HorizontalSectionNav 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Content */}
      <AnimatedTabContent activeTab={activeSection}>
        {/* Combined Property & Income Section */}
        {activeSection === 'property-income' && (
          <div className="space-y-6">
            {/* Property Details Card */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic property information and acquisition details
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {/* Responsive grid layout - better handling for mixed input types */}
                <div className="space-y-4">
                  {/* Row 1: Core Property Info - these work well together */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TooltipInput
                      label="Purchase Price"
                      id="purchase-price"
                      type="number"
                      value={assumptions.purchasePrice}
                      onChange={(value) => updateAssumption('purchasePrice', parseFloat(value) || 0)}
                      tooltip={financialTooltips.purchasePrice}
                      placeholder="$0"
                    />
                    
                    <div className="md:col-span-1 lg:col-span-1">
                      <AcquisitionCostsInput
                        label="Acquisition Costs"
                        value={assumptions.acquisitionCosts}
                        type={assumptions.acquisitionCostType}
                        onValueChange={(value) => updateAssumption('acquisitionCosts', value)}
                        onTypeChange={(type) => updateAssumption('acquisitionCostType', type)}
                        tooltip={financialTooltips.acquisitionCosts}
                        purchasePrice={assumptions.purchasePrice}
                        className="min-w-0"
                      />
                    </div>

                    <TooltipSelect
                      id="property-type"
                      label="Property Type"
                      value={assumptions.propertyType}
                      onValueChange={handlePropertyTypeChange}
                      tooltip="Classification of the property which determines the depreciation schedule for tax purposes. Residential properties depreciate over 27.5 years, while commercial properties depreciate over 39 years."
                      placeholder="Select property type"
                      className="w-full"
                    >
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </TooltipSelect>
                  </div>

                  {/* Row 2: Property Allocation & Timeline - simpler inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TooltipInput
                      label="Land (%)"
                      id="land-percentage"
                      type="percentage"
                      tooltip={financialTooltips.landPercentage}
                      value={assumptions.landPercentage}
                      onChange={(value) => {
                        const numValue = parseFloat(value) || 0
                        const cappedValue = Math.min(Math.max(numValue, 0), 100)
                        updateAssumption('landPercentage', cappedValue)
                        updateAssumption('improvementsPercentage', 100 - cappedValue)
                      }}
                      placeholder="20%"
                      min={0}
                      max={100}
                    />

                    <TooltipInput
                      label="Improvements (%)"
                      id="improvements-percentage"
                      type="percentage"
                      value={assumptions.improvementsPercentage}
                      onChange={(value) => {
                        const numValue = parseFloat(value) || 0
                        const cappedValue = Math.min(Math.max(numValue, 0), 100)
                        updateAssumption('improvementsPercentage', cappedValue)
                        updateAssumption('landPercentage', 100 - cappedValue)
                      }}
                      tooltip={financialTooltips.improvementsPercentage}
                      placeholder="80%"
                      min={0}
                      max={100}
                    />

                    <TooltipInput
                      label="Hold Period (Years)"
                      id="hold-period"
                      type="number"
                      value={assumptions.holdPeriodYears === 0 ? '' : assumptions.holdPeriodYears}
                      onChange={(value) => {
                        if (value === '' || value === null || value === undefined) {
                          updateAssumption('holdPeriodYears', 0)
                          return
                        }
                        const numValue = parseFloat(value) || 0
                        const cappedValue = Math.min(Math.max(numValue, 0), 10) // Cap at 10 years, minimum 0
                        updateAssumption('holdPeriodYears', cappedValue)
                      }}
                      tooltip={`${financialTooltips.holdPeriod} Maximum 10 years for optimal analysis.`}
                      placeholder="Enter years"
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Spreadsheet */}
            <IncomeSpreadsheet 
              assumptions={assumptions}
              onAssumptionsChange={handleAssumptionsChange}
            />
          </div>
        )}

        {/* Financing Section */}
        {activeSection === 'financing' && (
          <FinancingCard 
            assumptions={assumptions}
            onAssumptionsChange={(newAssumptions) => {
              // Update each changed field individually to ensure proper state sync
              Object.keys(newAssumptions).forEach(key => {
                const typedKey = key as keyof typeof assumptions
                if (newAssumptions[typedKey] !== assumptions[typedKey]) {
                  updateAssumption(typedKey, newAssumptions[typedKey])
                }
              })
            }}
          />
        )}

        {/* Tax & Exit Section */}
        {activeSection === 'assumptions' && (
          <div className="space-y-6">
            {/* Depreciation Settings Section */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Depreciation Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Property acquisition timing for depreciation calculations
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TooltipSelect
                    id="acquisition-month"
                    label="Acquisition Month"
                    value={assumptions.acquisitionMonth?.toString() || '1'}
                    onValueChange={(value) => updateAssumption('acquisitionMonth', parseInt(value))}
                    tooltip={financialTooltips.acquisitionMonth}
                    placeholder="Select month"
                    className="w-full"
                  >
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </TooltipSelect>
                </div>
              </CardContent>
            </Card>

            {/* Tax Rates Section */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Assumptions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tax rates for income and gain calculations
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TooltipInput
                    label="Ordinary Income Rate (%)"
                    id="ordinary-income-tax-rate"
                    type="percentage"
                    value={assumptions.ordinaryIncomeTaxRate * 100}
                    onChange={(value) => updateAssumption('ordinaryIncomeTaxRate', (parseFloat(value) || 0) / 100)}
                    tooltip={financialTooltips.ordinaryIncomeTaxRate}
                    placeholder="35%"
                    min={0}
                    max={100}
                  />

                  <TooltipInput
                    label="Capital Gains Rate (%)"
                    id="capital-gains-tax-rate"
                    type="percentage"
                    value={assumptions.capitalGainsTaxRate * 100}
                    onChange={(value) => updateAssumption('capitalGainsTaxRate', (parseFloat(value) || 0) / 100)}
                    tooltip={financialTooltips.capitalGainsTaxRate}
                    placeholder="15%"
                    min={0}
                    max={100}
                  />

                  <TooltipInput
                    label="Depreciation Recapture (%)"
                    id="depreciation-recapture-rate"
                    type="percentage"
                    value={assumptions.depreciationRecaptureRate * 100}
                    onChange={(value) => updateAssumption('depreciationRecaptureRate', (parseFloat(value) || 0) / 100)}
                    tooltip={financialTooltips.depreciationRecaptureRate}
                    placeholder="25%"
                    min={0}
                    max={25}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exit Strategy Section */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Exit Strategy
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Property disposition assumptions and sale costs
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Disposition Price */}
                  <DispositionPriceInput
                    label="Disposition Price"
                    priceType={assumptions.dispositionPriceType}
                    dollarValue={assumptions.dispositionPrice}
                    capRateValue={assumptions.dispositionCapRate * 100}
                    finalYearNOI={state.results?.annualCashflows?.[assumptions.holdPeriodYears - 1]?.noi || 0}
                    onPriceTypeChange={(type) => updateAssumption('dispositionPriceType', type)}
                    onDollarValueChange={(value) => updateAssumption('dispositionPrice', value)}
                    onCapRateValueChange={(value) => updateAssumption('dispositionCapRate', value / 100)}
                    tooltip={assumptions.dispositionPriceType === 'dollar' 
                      ? financialTooltips.dispositionPrice 
                      : financialTooltips.dispositionCapRate}
                  />

                  {/* Cost of Sale */}
                  <CostOfSaleInput
                    label="Cost of Sale"
                    type={assumptions.costOfSaleType}
                    percentageValue={assumptions.costOfSalePercentage * 100}
                    dollarValue={assumptions.costOfSaleAmount}
                    salePrice={assumptions.dispositionPriceType === 'dollar' 
                      ? assumptions.dispositionPrice
                      : (assumptions.dispositionCapRate > 0 && state.results?.annualCashflows?.[assumptions.holdPeriodYears - 1]?.noi 
                        ? state.results.annualCashflows[assumptions.holdPeriodYears - 1].noi / assumptions.dispositionCapRate
                        : 0)}
                    onTypeChange={(type) => updateAssumption('costOfSaleType', type)}
                    onPercentageValueChange={(value) => updateAssumption('costOfSalePercentage', value / 100)}
                    onDollarValueChange={(value) => updateAssumption('costOfSaleAmount', value)}
                    tooltip={assumptions.costOfSaleType === 'dollar' 
                      ? financialTooltips.costOfSaleAmount 
                      : financialTooltips.costOfSalePercentage}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Alert - Show when all inputs are complete */}
            {state.completionState.saleAnalysisReady && (
              <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>All Inputs Complete!</AlertTitle>
                <AlertDescription>
                  <p className="mb-3">Your financial model is ready for comprehensive analysis. View your projected cash flows and exit strategy.</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'cashflows' })}
                    >
                      View Cashflows
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'sale' })}
                    >
                      View Sale Analysis
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Partial Completion Alert - Show when cashflows are ready but not sale analysis */}
            {state.completionState.cashflowsReady && !state.completionState.saleAnalysisReady && (
              <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>Ready for Cash Flow Analysis</AlertTitle>
                <AlertDescription>
                  <p className="mb-3">You have sufficient data to view cash flow projections. Complete the tax settings above to unlock sale analysis.</p>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'cashflows' })}
                  >
                    View Cashflows
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </AnimatedTabContent>
    </div>
  )
}