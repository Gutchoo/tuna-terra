'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DemoProvider, useDemo } from '@/contexts/DemoContext'
import { StewardshipLogProvider } from '@/contexts/StewardshipLogContext'
import { DemoHeader } from '@/components/demo/DemoHeader'
import { DemoPropertyViewWrapper } from '@/components/demo/DemoPropertyViewWrapper'
import { DemoStewardshipSection } from '@/components/demo/DemoStewardshipSection'
import { DataDictionary } from '@/components/stewardship/DataDictionary'
import { ConversionPrompt } from '@/components/demo/ConversionPrompt'
import { DemoDebugPanel } from '@/components/demo/DemoDebugPanel'
import { VIRTUAL_SAMPLE_PROPERTIES } from '@/lib/sample-portfolio'
import { parseEventValue } from '@/lib/stewardship'
import type { Property } from '@/lib/supabase'

function DemoPageContent() {
  const { enterDemoMode, demoState, updateDemoProperty } = useDemo()
  const [activeTab, setActiveTab] = useState('properties')
  // Applied lifecycle events for the static sample fixtures (demo-added
  // properties live in DemoContext; these three don't)
  const [sampleOverrides, setSampleOverrides] = useState<Record<string, Partial<Property>>>({})

  // Enter demo mode when this page loads (only run once)
  useEffect(() => {
    console.log('Demo page: entering demo mode')
    enterDemoMode()
  }, [enterDemoMode]) // Remove demoState from dependencies to prevent infinite loop

  // Base sample properties with any applied stewardship updates merged in
  const sampleProperties = useMemo(
    () => VIRTUAL_SAMPLE_PROPERTIES.map(p => (sampleOverrides[p.id] ? { ...p, ...sampleOverrides[p.id] } : p)),
    [sampleOverrides]
  )
  const demoProperties = useMemo(() =>
    demoState.demoProperties || [],
    [demoState.demoProperties]
  )
  const allProperties = useMemo(() =>
    [...sampleProperties, ...demoProperties],
    [sampleProperties, demoProperties]
  )

  const handleApplySampleOverride = useCallback((propertyId: string, updates: Partial<Property>) => {
    setSampleOverrides(prev => ({ ...prev, [propertyId]: { ...prev[propertyId], ...updates } }))
  }, [])

  // Route a change-log revert back onto the right store (context vs overrides).
  // Values in log entries are display strings; parse them for storage.
  const applyFieldValue = useCallback((propertyId: string, field: string, value: string | null) => {
    const parsed = parseEventValue(field, value)
    const updates = { [field]: parsed } as Partial<Property>
    if (propertyId.startsWith('demo-property-')) {
      updateDemoProperty(propertyId, updates)
    } else {
      handleApplySampleOverride(propertyId, updates)
    }
  }, [updateDemoProperty, handleApplySampleOverride])

  return (
    <StewardshipLogProvider applyFieldValue={applyFieldValue}>
      <div className="min-h-screen bg-background">
        <DemoHeader />

        <div className="fluid-container py-fluid-md min-h-[calc(100vh+1px)]">
          <div className="px-6 py-8 max-w-[1500px] mx-auto">
            {/* Intro banner */}
            <div className="mb-8">
              <ConversionPrompt />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="stewardship">Data Stewardship</TabsTrigger>
                <TabsTrigger value="dictionary">Data Dictionary</TabsTrigger>
              </TabsList>

              {/* forceMount keeps both tabs alive: switching tabs must not
                  reset pending events or replay stale focus requests */}
              <TabsContent value="properties" forceMount className="data-[state=inactive]:hidden">
                <DemoPropertyViewWrapper properties={allProperties} />
              </TabsContent>

              <TabsContent value="stewardship" forceMount className="data-[state=inactive]:hidden">
                <DemoStewardshipSection
                  properties={allProperties}
                  onApplySampleOverride={handleApplySampleOverride}
                />
              </TabsContent>

              <TabsContent value="dictionary">
                <DataDictionary />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Debug Panel - Development Only */}
        <DemoDebugPanel />
      </div>
    </StewardshipLogProvider>
  )
}

export default function DemoPage() {
  return (
    <DemoProvider>
      <DemoPageContent />
    </DemoProvider>
  )
}
