'use client'

import { useEffect, useState } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { useProperties } from '@/hooks/use-properties'
import { usePropertyUnits } from '@/hooks/use-property-units'
import { useQuery } from '@tanstack/react-query'
import type { Property, PropertyFinancials } from '@/lib/supabase'

import { PropertyListPanel } from './PropertyListPanel'
import { PropertyOverviewPanel } from './PropertyOverviewPanel'
import { IncomePanel } from './IncomePanel'
import { ExpensesPanel } from './ExpensesPanel'
import { UnitBreakdownPanel } from './UnitBreakdownPanel'

interface ResizableDashboardLayoutProps {
  portfolioId: string | null
}

// Fetch property financials
async function fetchPropertyFinancials(propertyId: string): Promise<PropertyFinancials | null> {
  const response = await fetch(`/api/properties/${propertyId}/financials`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Failed to fetch property financials')
  }
  const data = await response.json()
  return data.financials
}

export function ResizableDashboardLayout({ portfolioId }: ResizableDashboardLayoutProps) {
  const {
    layout,
    togglePanel,
    selectProperty,
    selectedPropertyId,
  } = useDashboardLayout()

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useProperties(portfolioId)

  // Local selected property state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Update selected property when selectedPropertyId changes
  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find(p => p.id === selectedPropertyId)
      setSelectedProperty(property || null)
    } else if (properties.length > 0) {
      // Auto-select first property if none selected
      setSelectedProperty(properties[0])
      selectProperty(properties[0])
    }
  }, [selectedPropertyId, properties, selectProperty])

  // Fetch financials for selected property
  const { data: financials } = useQuery({
    queryKey: ['property-financials', selectedProperty?.id],
    queryFn: () => fetchPropertyFinancials(selectedProperty!.id),
    enabled: !!selectedProperty?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch units for selected property
  const { data: unitsData } = usePropertyUnits(selectedProperty?.id || null)
  const units = unitsData?.data || []

  // Handle property selection
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    selectProperty(property)
    // Close mobile sidebar when property is selected
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="h-full w-full flex">
      {/* Desktop Sidebar - Fixed 300px */}
      <div className="hidden md:block w-[300px] border-r shrink-0">
        <PropertyListPanel
          properties={properties}
          selectedPropertyId={selectedProperty?.id || null}
          onPropertySelect={handlePropertySelect}
          isLoading={isLoadingProperties}
        />
      </div>

      {/* Mobile Sidebar - Sheet Overlay */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[320px] p-0">
          <PropertyListPanel
            properties={properties}
            selectedPropertyId={selectedProperty?.id || null}
            onPropertySelect={handlePropertySelect}
            isLoading={isLoadingProperties}
          />
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-16 left-4 z-50 shadow-lg"
        onClick={() => setIsMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Main Content Area - Detail Panels in 2x2 Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden p-4">
          {!selectedProperty ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Select a property</p>
                <p className="text-sm mt-2">Choose a property from the list to view details</p>
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="vertical">
              {/* Top Row: Property Overview and Unit Breakdown */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full p-2">
                  <ResizablePanelGroup direction="horizontal">
                    {/* Property Overview - Smaller default width */}
                    <ResizablePanel defaultSize={35} minSize={25}>
                      <div className="h-full pr-2">
                        <PropertyOverviewPanel
                          property={selectedProperty}
                          isVisible={layout.panels.overview.isVisible}
                          onToggleVisibility={() => togglePanel('overview')}
                          loanAmount={financials?.loan_amount}
                        />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Unit Breakdown - Larger default width */}
                    <ResizablePanel defaultSize={65} minSize={30}>
                      <div className="h-full pl-2">
                        <UnitBreakdownPanel
                          propertyId={selectedProperty.id}
                          units={units}
                          isVisible={layout.panels.units.isVisible}
                          onToggleVisibility={() => togglePanel('units')}
                        />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Bottom Row: Income and Expenses */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full p-2">
                  <ResizablePanelGroup direction="horizontal">
                    {/* Income Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full pr-2">
                        <IncomePanel
                          propertyId={selectedProperty.id}
                          financials={financials || null}
                          isVisible={layout.panels.income.isVisible}
                          onToggleVisibility={() => togglePanel('income')}
                        />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Expenses Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full pl-2">
                        <ExpensesPanel
                          propertyId={selectedProperty.id}
                          financials={financials || null}
                          isVisible={layout.panels.expenses.isVisible}
                          onToggleVisibility={() => togglePanel('expenses')}
                        />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </div>
  )
}
