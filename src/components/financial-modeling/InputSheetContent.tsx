"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { Building, DollarSign, Calculator } from 'lucide-react'

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

export function InputSheetContent() {
  const { state, updateAssumption, dispatch } = useFinancialModeling()
  const { assumptions } = state
  const [activeSection, setActiveSection] = useState('property-income')

  const handleAssumptionsChange = (newAssumptions: typeof assumptions) => {
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: newAssumptions })
  }

  const handlePropertyTypeChange = (value: string) => {
    const type = value as 'residential' | 'commercial' | ''
    const depreciationYears = type === 'residential' ? 27.5 : type === 'commercial' ? 39 : 39
    updateAssumption('propertyType', type)
    updateAssumption('depreciationYears', depreciationYears)
  }


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InputSummaryCards assumptions={assumptions} />

      {/* Horizontal Section Navigation */}
      <HorizontalSectionNav 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const sections = [
                { id: 'property-income', title: 'Property & Income', icon: Building },
                { id: 'financing', title: 'Financing', icon: DollarSign },
                { id: 'assumptions', title: 'Tax & Exit', icon: Calculator }
              ]
              const currentSection = sections.find(s => s.id === activeSection)
              const Icon = currentSection?.icon || Building
              return (
                <>
                  <Icon className="w-5 h-5" />
                  {currentSection?.title || 'Property & Income'}
                </>
              )
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedTabContent activeTab={activeSection}>
            {/* Combined Property & Income Section */}
            {activeSection === 'property-income' && (
              <div className="space-y-6">
                {/* Compact Property Details Card */}
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Property Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Single row with all 6 fields - responsive breakpoints */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <TooltipInput
                        label="Purchase Price"
                        id="purchase-price"
                        type="number"
                        value={assumptions.purchasePrice}
                        onChange={(value) => updateAssumption('purchasePrice', parseFloat(value) || 0)}
                        tooltip={financialTooltips.purchasePrice}
                        placeholder="$0"
                      />
                      
                      <AcquisitionCostsInput
                        label="Acquisition Costs"
                        value={assumptions.acquisitionCosts}
                        type={assumptions.acquisitionCostType}
                        onValueChange={(value) => updateAssumption('acquisitionCosts', value)}
                        onTypeChange={(type) => updateAssumption('acquisitionCostType', type)}
                        tooltip={financialTooltips.acquisitionCosts}
                        purchasePrice={assumptions.purchasePrice}
                      />

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

                      <TooltipInput
                        label="Land (%)"
                        id="land-percentage"
                        type="percentage"
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
                {/* Tax Rates Section */}
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Tax Assumptions</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Exit Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
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
              </div>
            )}
          </AnimatedTabContent>
        </CardContent>
      </Card>
    </div>
  )
}