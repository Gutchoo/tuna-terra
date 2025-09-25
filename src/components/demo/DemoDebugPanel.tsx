'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, Power, RotateCcw, Plus, Minus, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import { useDemo } from '@/contexts/DemoContext'
import { DemoAddPropertyModal } from './DemoAddPropertyModal'
import { CURATED_DEMO_PROPERTIES } from '@/lib/curated-demo-properties'
import type { Property } from '@/lib/supabase'

export function DemoDebugPanel() {
  const { demoState, addDemoProperty, clearAllDemoProperties, enterDemoMode, exitDemoMode } = useDemo()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Debug log the demo state
  console.log('DemoDebugPanel - Current demo state:', demoState)
  
  // Only show in development when test data is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DATA === 'false') {
    return null
  }

  const handleAddMockProperty = () => {
    // Add a mock demo property
    const mockProperty = {
      id: `debug-property-${Date.now()}`,
      user_id: 'demo-user',
      regrid_id: null,
      apn: null,
      address: `${100 + demoState.demoProperties.length} Debug Street`,
      city: 'Demo City',
      state: 'CA',
      zip_code: '90210',
      geometry: null,
      lat: null,
      lng: null,
      year_built: 2020,
      owner: 'Debug User',
      last_sale_price: null,
      sale_date: null,
      county: null,
      qoz_status: null,
      improvement_value: null,
      land_value: null,
      assessed_value: 650000 + (demoState.demoProperties.length * 50000),
      use_code: null,
      use_description: null,
      zoning: null,
      zoning_description: null,
      num_stories: null,
      num_units: null,
      num_rooms: null,
      subdivision: null,
      lot_size_acres: null,
      lot_size_sqft: null,
      tax_year: null,
      parcel_value_type: null,
      census_tract: null,
      census_block: null,
      qoz_tract: null,
      last_refresh_date: null,
      regrid_updated_at: null,
      owner_mailing_address: null,
      owner_mail_city: null,
      owner_mail_state: null,
      owner_mail_zip: null,
      property_data: null,
      user_notes: null,
      tags: null,
      insurance_provider: null,
      maintenance_history: null,
      is_sample: false,
      portfolio_id: 'demo-portfolio',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Property
    addDemoProperty(mockProperty)
  }

  const handleResetDemoState = () => {
    exitDemoMode()
    // Re-enter demo mode to reset everything
    setTimeout(() => {
      enterDemoMode()
    }, 100)
  }

  const handleAddAllProperties = () => {
    CURATED_DEMO_PROPERTIES.forEach((property) => {
      const demoPropertyData = {
        id: `demo-property-${property.apn}`,
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
        year_built: property.year_built || null,
        owner: property.owner || null,
        last_sale_price: null,
        sale_date: null,
        county: null,
        qoz_status: null,
        improvement_value: property.improvement_value || null,
        land_value: property.land_value || null,
        assessed_value: property.assessed_value || null,
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
        tax_year: null,
        parcel_value_type: null,
        census_tract: null,
        census_block: null,
        qoz_tract: null,
        last_refresh_date: null,
        regrid_updated_at: null,
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
        curatedMetadata: property.curatedMetadata
      } as Property & { curatedMetadata: typeof property.curatedMetadata }
      addDemoProperty(demoPropertyData)
    })
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between text-blue-700">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Demo Debug Panel (Dev Only)
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
        <div>
          <div className="text-xs font-medium text-blue-700 mb-1">
            Demo Mode: {demoState.isDemoMode ? 'Active' : 'Inactive'}
          </div>
          <div className="text-xs font-medium text-blue-700 mb-2">
            Properties Status:
          </div>
          <div className="space-y-1">
            <Badge
              variant={demoState.demoProperties.length > 0 ? "default" : "outline"}
              className="text-xs mr-1"
            >
              {demoState.demoProperties.length} Properties Added
            </Badge>
            {demoState.demoProperties.map((property, index) => (
              <div key={property.id} className="text-xs text-blue-600 mt-1">
                {index + 1}. {property.address}
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={handleAddMockProperty}
            size="sm"
            variant="default"
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add Mock Property
          </Button>

          <Button
            onClick={handleAddAllProperties}
            size="sm"
            variant="default"
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add All 8 Properties
          </Button>

          {demoState.demoProperties.length > 0 && (
            <Button
              onClick={clearAllDemoProperties}
              size="sm"
              variant="destructive"
              className="w-full"
            >
              <Minus className="h-3 w-3 mr-2" />
              Clear All Properties
            </Button>
          )}

          <Button
            onClick={handleResetDemoState}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset Demo State
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            <Settings className="h-3 w-3 mr-2" />
            View Add Modal
          </Button>

          <Button
            onClick={() => setShowSuccessModal(true)}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            <Settings className="h-3 w-3 mr-2" />
            View Success Modal
          </Button>

          {!demoState.isDemoMode && (
            <Button
              onClick={() => {
                console.log('Debug: Forcing demo mode on')
                enterDemoMode()
              }}
              size="sm"
              variant="default"
              className="w-full"
            >
              <Power className="h-3 w-3 mr-2" />
              Force Demo Mode On
            </Button>
          )}
        </div>
        
        <div className="text-xs text-blue-600 space-y-1">
          <div>Toggle property state to test banner visibility and demo flow.</div>
          <div className="font-medium">🎯 Test conversion banner appearance!</div>
          <div>Use &quot;View Add Modal&quot; to see modal states regardless of property status.</div>
        </div>
        </CardContent>
      )}

      <DemoAddPropertyModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      <DemoAddPropertyModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        forceSuccessState={true}
      />
    </Card>
  )
}