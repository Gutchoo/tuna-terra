'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DemoProvider, useDemo } from '@/contexts/DemoContext'
import { DemoHeader } from '@/components/demo/DemoHeader'
import { DemoPropertyViewWrapper } from '@/components/demo/DemoPropertyViewWrapper'
import { DemoStewardshipSection } from '@/components/demo/DemoStewardshipSection'
import { ConversionPrompt } from '@/components/demo/ConversionPrompt'
import { DemoDebugPanel } from '@/components/demo/DemoDebugPanel'
import { VIRTUAL_SAMPLE_PROPERTIES } from '@/lib/sample-portfolio'

function DemoPageContent() {
  const { enterDemoMode, demoState } = useDemo()
  const [activeTab, setActiveTab] = useState('properties')
  const [stewardshipFocus, setStewardshipFocus] = useState<{ propertyId: string; ts: number } | null>(null)

  // Enter demo mode when this page loads (only run once)
  useEffect(() => {
    console.log('Demo page: entering demo mode')
    enterDemoMode()
  }, [enterDemoMode]) // Remove demoState from dependencies to prevent infinite loop

  // Base sample properties only — curated landmarks are added interactively via the demo modal
  const sampleProperties = useMemo(() => VIRTUAL_SAMPLE_PROPERTIES, [])
  const demoProperties = useMemo(() =>
    demoState.demoProperties || [],
    [demoState.demoProperties]
  )
  const allProperties = useMemo(() =>
    [...sampleProperties, ...demoProperties],
    [sampleProperties, demoProperties]
  )

  // Stewardship "Review" jumps back to the Properties tab focused on that record
  const handleOpenPropertyFromStewardship = (propertyId: string) => {
    setStewardshipFocus({ propertyId, ts: Date.now() })
    setActiveTab('properties')
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoHeader />

      <div className="fluid-container py-fluid-md min-h-[calc(100vh+1px)]">
        <div className="p-6">
          <Card>
            <CardContent className="pt-0">
              {/* Show conversion prompt always */}
              <div className="mb-6">
                <ConversionPrompt />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="stewardship" className="gap-2">
                    Data Stewardship
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties">
                  <DemoPropertyViewWrapper
                    properties={allProperties}
                    externalFocusRequest={stewardshipFocus}
                  />
                </TabsContent>

                <TabsContent value="stewardship">
                  <DemoStewardshipSection
                    properties={allProperties}
                    onOpenProperty={handleOpenPropertyFromStewardship}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel - Development Only */}
      <DemoDebugPanel />
    </div>
  )
}

export default function DemoPage() {
  return (
    <DemoProvider>
      <DemoPageContent />
    </DemoProvider>
  )
}
