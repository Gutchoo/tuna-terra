'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoProvider, useDemo } from '@/contexts/DemoContext'
import { DemoHeader } from '@/components/demo/DemoHeader'
import { DemoPropertyViewWrapper } from '@/components/demo/DemoPropertyViewWrapper'
import { ConversionPrompt } from '@/components/demo/ConversionPrompt'
import { DemoDebugPanel } from '@/components/demo/DemoDebugPanel'
import { getVirtualSampleProperties } from '@/lib/sample-portfolio'

function DemoPageContent() {
  const { enterDemoMode, demoState } = useDemo()

  // Enter demo mode when this page loads (only run once)
  useEffect(() => {
    console.log('Demo page: entering demo mode')
    enterDemoMode()
  }, [enterDemoMode]) // Remove demoState from dependencies to prevent infinite loop

  // Get sample properties to show alongside demo properties (memoized to prevent infinite re-renders)
  const sampleProperties = useMemo(() => getVirtualSampleProperties(), [])
  const demoProperties = useMemo(() =>
    demoState.demoProperties || [],
    [demoState.demoProperties]
  )
  const allProperties = useMemo(() =>
    [...sampleProperties, ...demoProperties],
    [sampleProperties, demoProperties]
  )

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
            
            <DemoPropertyViewWrapper
              properties={allProperties}
            />
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