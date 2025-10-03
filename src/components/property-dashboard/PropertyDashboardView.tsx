'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { PropertyOverviewCard } from './PropertyOverviewCard'
import { PropertyMapCard } from './PropertyMapCard'
import { InvestmentMetricsCard } from './InvestmentMetricsCard'
import { FinancialAnalysisTabs } from './FinancialAnalysisTabs'
import { PropertyFinancialModelingProvider } from '@/lib/contexts/PropertyFinancialModelingContext'
import { EditPropertyDetailsModal } from '@/components/modals/EditPropertyDetailsModal'
import { usePortfolioRole } from '@/hooks/use-portfolio-role'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface PropertyDashboardViewProps {
  property: Property
  portfolioId: string
  portfolioName?: string
  onBack: () => void
}

export function PropertyDashboardView({
  property,
  portfolioId,
  portfolioName,
  onBack,
}: PropertyDashboardViewProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  // Get user's role for permission checking
  const { data: userRole } = usePortfolioRole(portfolioId)
  const canEdit = userRole === 'owner' || userRole === 'editor'

  const handleEditProperty = () => {
    setShowEditModal(true)
  }

  // Get purchase price and acquisition costs from property data
  // Priority: user-entered purchase_price > last_sale_price > assessed_total_value
  const purchasePrice = property.purchase_price || property.last_sale_price || property.assessed_total_value || 0
  const acquisitionCosts = 0 // TODO: Add acquisition costs field to property data or allow user input

  return (
    <PropertyFinancialModelingProvider
      propertyId={property.id}
      purchasePrice={purchasePrice}
      acquisitionCosts={acquisitionCosts}
    >
      <div className="min-h-screen bg-background">
        {/* Header with Breadcrumb */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Portfolio
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{portfolioName || 'Portfolio'}</span>
                <span>/</span>
                <span className="font-medium text-foreground">{property.address}</span>
                {!canEdit && (
                  <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                    View Only
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8 space-y-6">
          {/* Property Overview Section */}
          <PropertyOverviewCard
            property={property}
            canEdit={canEdit}
            onEdit={handleEditProperty}
          />

          {/* Property Map Section */}
          <PropertyMapCard property={property} />

          {/* Financial Analysis Tabs */}
          <FinancialAnalysisTabs propertyId={property.id} canEdit={canEdit} />

          {/* Investment Metrics */}
          <InvestmentMetricsCard useContext={true} />
        </div>

        {/* Edit Property Modal */}
        <EditPropertyDetailsModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          property={property}
        />
      </div>
    </PropertyFinancialModelingProvider>
  )
}
