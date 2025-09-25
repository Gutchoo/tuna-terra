'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import type { Property } from '@/lib/supabase'

interface DemoState {
  isDemoMode: boolean
  demoProperties: Property[]
}

interface DemoContextType {
  demoState: DemoState
  enterDemoMode: () => void
  exitDemoMode: () => void
  addDemoProperty: (property: Property) => void
  removeDemoProperty: (propertyId: string) => void
  clearAllDemoProperties: () => void
  getDemoProperties: () => Property[]
  hasProperty: (apn: string) => boolean
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

const DEMO_STORAGE_KEY = 'cre-claude-demo-state'

// Generate a unique demo property ID
function generateDemoPropertyId(): string {
  return `demo-property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Create a demo property structure that matches the database schema
function createDemoProperty(baseData: unknown): Property {
  const now = new Date().toISOString()
  const data = baseData as Record<string, unknown>
  
  return {
    id: generateDemoPropertyId(),
    user_id: 'demo-user',
    regrid_id: null,
    apn: (data.apn as string) || null,
    address: (data.address as string) || '',
    city: (data.city as string) || '',
    state: (data.state as string) || '',
    zip_code: (data.zip_code as string) || null,
    geometry: (data.geometry as Record<string, unknown>) || null,
    lat: (data.lat as number) || null,
    lng: (data.lng as number) || null,
    
    // Rich property data (will be filled by API call or defaults)
    year_built: (data.year_built as number) || null,
    owner: (data.owner as string) || null,
    last_sale_price: (data.last_sale_price as number) || null,
    sale_date: (data.sale_date as string) || null,
    county: (data.county as string) || null,
    qoz_status: (data.qoz_status as string) || null,
    improvement_value: (data.improvement_value as number) || null,
    land_value: (data.land_value as number) || null,
    assessed_value: (data.assessed_value as number) || null,
    
    // Extended property details
    use_code: (data.use_code as string) || null,
    use_description: (data.use_description as string) || null,
    zoning: (data.zoning as string) || null,
    zoning_description: (data.zoning_description as string) || null,
    num_stories: (data.num_stories as number) || null,
    num_units: (data.num_units as number) || null,
    num_rooms: (data.num_rooms as number) || null,
    subdivision: (data.subdivision as string) || null,
    lot_size_acres: (data.lot_size_acres as number) || null,
    lot_size_sqft: (data.lot_size_sqft as number) || null,
    
    // Financial & tax data
    tax_year: (data.tax_year as string) || null,
    parcel_value_type: (data.parcel_value_type as string) || null,
    
    // Location data
    census_tract: (data.census_tract as string) || null,
    census_block: (data.census_block as string) || null,
    qoz_tract: (data.qoz_tract as string) || null,
    
    // Data freshness tracking
    last_refresh_date: (data.last_refresh_date as string) || new Date().toISOString().split('T')[0],
    regrid_updated_at: (data.regrid_updated_at as string) || null,
    
    // Owner mailing address
    owner_mailing_address: (data.owner_mailing_address as string) || null,
    owner_mail_city: (data.owner_mail_city as string) || null,
    owner_mail_state: (data.owner_mail_state as string) || null,
    owner_mail_zip: (data.owner_mail_zip as string) || null,
    
    // Stored property data (full Regrid response for reference)
    property_data: (data.property_data as Record<string, unknown>) || null,
    
    // User fields
    user_notes: null,
    tags: null,
    insurance_provider: null,
    maintenance_history: null,
    is_sample: false,
    portfolio_id: 'demo-portfolio',
    created_at: now,
    updated_at: now
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoState, setDemoState] = useState<DemoState>({
    isDemoMode: false,
    demoProperties: []
  })

  // Load demo state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(DEMO_STORAGE_KEY)
        if (saved) {
          const parsedState = JSON.parse(saved)
          setDemoState(parsedState)
        }
      } catch (error) {
        console.warn('Failed to load demo state from sessionStorage:', error)
      }
    }
  }, [])

  // Save demo state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState))
      } catch (error) {
        console.warn('Failed to save demo state to sessionStorage:', error)
      }
    }
  }, [demoState])

  const enterDemoMode = useCallback(() => {
    setDemoState(prev => ({ ...prev, isDemoMode: true }))
  }, [])

  const exitDemoMode = useCallback(() => {
    setDemoState({
      isDemoMode: false,
      demoProperties: []
    })
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(DEMO_STORAGE_KEY)
    }
  }, [])

  const addDemoProperty = useCallback((propertyData: unknown) => {
    const demoProperty = createDemoProperty(propertyData)
    setDemoState(prev => ({
      ...prev,
      demoProperties: [...prev.demoProperties, demoProperty]
    }))
  }, [])

  const removeDemoProperty = useCallback((propertyId: string) => {
    setDemoState(prev => ({
      ...prev,
      demoProperties: prev.demoProperties.filter(p => p.id !== propertyId)
    }))
  }, [])

  const clearAllDemoProperties = useCallback(() => {
    setDemoState(prev => ({
      ...prev,
      demoProperties: []
    }))
  }, [])

  const getDemoProperties = useCallback((): Property[] => {
    return demoState.demoProperties
  }, [demoState.demoProperties])

  const hasProperty = useCallback((apn: string): boolean => {
    return demoState.demoProperties.some(p => p.apn === apn)
  }, [demoState.demoProperties])

  const contextValue: DemoContextType = useMemo(() => ({
    demoState,
    enterDemoMode,
    exitDemoMode,
    addDemoProperty,
    removeDemoProperty,
    clearAllDemoProperties,
    getDemoProperties,
    hasProperty
  }), [demoState, enterDemoMode, exitDemoMode, addDemoProperty, removeDemoProperty, clearAllDemoProperties, getDemoProperties, hasProperty])

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}

// Check if a property ID is a demo property
export function isDemoProperty(propertyId: string): boolean {
  return propertyId.startsWith('demo-property-')
}