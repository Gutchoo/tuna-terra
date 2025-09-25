'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CrownIcon,
  InfoIcon
} from 'lucide-react'
import { useDemo } from '@/contexts/DemoContext'
import { AuthModal } from '@/components/modals/AuthModal'
import { CURATED_DEMO_PROPERTIES, type CuratedDemoProperty } from '@/lib/curated-demo-properties'
import type { Property } from '@/lib/supabase'

interface DemoAddPropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  forceSuccessState?: boolean
}

export function DemoAddPropertyModal({
  open,
  onOpenChange,
  forceSuccessState = false
}: DemoAddPropertyModalProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'success'>('selection')
  const [selectedProperty, setSelectedProperty] = useState<CuratedDemoProperty | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { demoState, addDemoProperty, hasProperty } = useDemo()

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      if (forceSuccessState) {
        setCurrentStep('success')
      } else {
        setCurrentStep('selection')
        setSelectedProperty(null)
      }
    }
  }, [open, forceSuccessState])

  const handlePropertySelect = (property: CuratedDemoProperty) => {
    // Don't add if already exists
    if (hasProperty(property.apn || '')) {
      return
    }

    setSelectedProperty(property)

    try {
      // Create demo property with rich data
      const demoPropertyData = {
        // Required Property interface fields
        id: `demo-property-${Date.now()}`,
        user_id: 'demo-user',
        regrid_id: property.regrid_id || null,
        apn: property.apn || null,
        address: property.address || '',
        city: property.city || null,
        state: property.state || null,
        zip_code: property.zip_code || null,
        geometry: property.geometry || null,
        lat: property.lat || null,
        lng: property.lng || null,

        // Rich property data from Regrid API
        year_built: property.year_built || null,
        owner: property.owner || null,
        last_sale_price: null,
        sale_date: null,
        county: null,
        qoz_status: null,
        improvement_value: property.improvement_value || null,
        land_value: property.land_value || null,
        assessed_value: property.assessed_value || null,

        // Extended property details
        use_code: null,
        use_description: property.use_description || null,
        zoning: property.zoning || null,
        zoning_description: property.zoning_description || null,
        num_stories: property.num_stories || null,
        num_units: null,
        num_rooms: null,
        subdivision: null,
        lot_size_acres: property.lot_size_acres || null,
        lot_size_sqft: property.lot_size_sqft || null,

        // Financial & tax data
        tax_year: null,
        parcel_value_type: null,

        // Location data
        census_tract: null,
        census_block: null,
        qoz_tract: null,

        // Data freshness tracking
        last_refresh_date: null,
        regrid_updated_at: null,

        // Owner mailing address
        owner_mailing_address: null,
        owner_mail_city: null,
        owner_mail_state: null,
        owner_mail_zip: null,

        property_data: property.property_data || null,
        user_notes: null,
        tags: null,
        insurance_provider: null,
        maintenance_history: null,
        is_sample: false,
        portfolio_id: 'demo-portfolio',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // Add curated metadata for display (non-standard field for demo)
        curatedMetadata: property.curatedMetadata
      } as Property & { curatedMetadata: typeof property.curatedMetadata }

      addDemoProperty(demoPropertyData)
      setCurrentStep('success')
    } catch (error) {
      console.error('Demo property creation error:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset to selection after a delay
    setTimeout(() => {
      setCurrentStep('selection')
      setSelectedProperty(null)
    }, 300)
  }



  const renderPropertySelection = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">Sign up with a free account to search any property by address or parcel number</h2>
        <p className="text-muted-foreground text-md">
          Demo experience: Add and explore properties from some of the world&apos;s biggest companies
        </p>
      </div>

      {/* Curated Properties Grid - 4x2 layout matching wireframe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-none">
        {CURATED_DEMO_PROPERTIES.map((property) => {
          const isAdded = hasProperty(property.apn || '')
          return (
            <Card
              key={property.apn}
              className={`transition-all cursor-pointer h-36 sm:h-44 md:h-52 lg:h-56 flex flex-col ${
                isAdded
                  ? 'opacity-60 cursor-not-allowed bg-muted/30'
                  : 'hover:shadow-lg hover:border-primary/30 hover:-translate-y-1'
              }`}
              onClick={() => !isAdded && handlePropertySelect(property)}
            >
              <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col items-center justify-center text-center">

                {/* Property name */}
                <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] leading-tight">
                  {property.curatedMetadata.name}
                </h3>

                {/* Location */}
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                  {property.city}, {property.state}
                </p>

                {/* Status indicator */}
                {isAdded && (
                  <Badge variant="secondary" className="text-sm">
                    Added
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Show added properties count */}
      {demoState.demoProperties.length > 0 && (
        <div className="text-center">
          <p className="text-muted-foreground">
            {demoState.demoProperties.length} propert{demoState.demoProperties.length === 1 ? 'y' : 'ies'} added to your demo portfolio
          </p>
        </div>
      )}
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h3 className="text-3xl md:text-4xl font-bold text-foreground">Property Added!</h3>
        <h4 className="text-xl md:text-2xl font-medium text-foreground">
          {selectedProperty?.curatedMetadata.name} is now in your demo
        </h4>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore comprehensive data, parcel boundaries, and professional-grade analysis tools!
        </p>
      </div>


      <Card className="bg-muted/30 border-border max-w-2xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <div className="text-center">
            <p className="text-lg md:text-xl font-semibold text-foreground mb-3">
              Ready to manage your own portfolio?
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Create a free account for 10 monthly property lookups, saved portfolios, and comprehensive property data
            </p>
            <Button
              size="lg"
              onClick={() => setShowAuthModal(true)}
              className="bg-primary hover:bg-primary/90 px-8 py-3"
            >
              Create Free Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('selection')}
          disabled={demoState.demoProperties.length >= CURATED_DEMO_PROPERTIES.length}
        >
          {demoState.demoProperties.length >= CURATED_DEMO_PROPERTIES.length ? 'All Properties Added' : 'Add More Properties'}
        </Button>
        <Button onClick={handleClose}>
          Start Exploring
        </Button>
      </div>
    </div>
  )


  const getDialogTitle = () => {
    switch (currentStep) {
      case 'selection':
        return ''
      case 'success':
        return ''
      default:
        return ''
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[90vw] !max-w-[1400px] !h-auto !max-h-[90vh] overflow-y-auto p-3 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">{getDialogTitle()}</DialogTitle>
          </DialogHeader>

          <div>
            {currentStep === 'selection' && renderPropertySelection()}
            {currentStep === 'success' && renderSuccess()}
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode="sign-up"
      />
    </>
  )
}