'use client'

import { useMemo, useState } from 'react'
import { DataStewardshipPanel } from '@/components/stewardship/DataStewardshipPanel'
import { PropertyModal } from '@/components/properties/PropertyModal'
import { useDemo } from '@/contexts/DemoContext'
import { useStewardshipLog } from '@/contexts/StewardshipLogContext'
import { simulateCountyFeedCheck } from '@/lib/demo-stewardship'
import { parseEventValue, type LifecycleEvent } from '@/lib/stewardship'
import type { Property } from '@/lib/supabase'
import { toast } from 'sonner'

interface DemoStewardshipSectionProps {
  properties: Property[]
  /** Apply an event to a static sample property (they live outside DemoContext) */
  onApplySampleOverride?: (propertyId: string, updates: Partial<Property>) => void
}

export function DemoStewardshipSection({ properties, onApplySampleOverride }: DemoStewardshipSectionProps) {
  const { updateDemoProperty } = useDemo()
  const log = useStewardshipLog()
  const [isChecking, setIsChecking] = useState(false)
  // Property modal opened in place from the stewardship screen
  const [openPropertyId, setOpenPropertyId] = useState<string | null>(null)

  const openProperty = useMemo(
    () => (openPropertyId ? properties.find(p => p.id === openPropertyId) : undefined),
    [openPropertyId, properties]
  )

  const handleCheckFeed = async (): Promise<LifecycleEvent[]> => {
    setIsChecking(true)
    // Brief delay so the check reads as a real feed poll
    await new Promise(resolve => setTimeout(resolve, 900))
    const events = simulateCountyFeedCheck(properties)
    setIsChecking(false)
    if (events.length === 0) {
      toast.info('Add a landmark property first — the feed check compares enriched records.')
    }
    return events
  }

  const handleApplyEvent = (event: LifecycleEvent) => {
    const value = parseEventValue(event.field, event.newValue)
    if (value == null) return
    const updates = { [event.field]: value } as Partial<Property>

    // Demo-added properties live in context; static sample fixtures are
    // patched via the page-level override map
    if (event.propertyId.startsWith('demo-property-')) {
      updateDemoProperty(event.propertyId, updates)
    } else {
      onApplySampleOverride?.(event.propertyId, updates)
    }
    log?.recordAppliedEvent(event)
    toast.success(`Updated ${event.label.toLowerCase()} for ${event.propertyAddress}`)
  }

  return (
    <>
      <DataStewardshipPanel
        properties={properties}
        onCheckFeed={handleCheckFeed}
        onApplyEvent={handleApplyEvent}
        onOpenProperty={setOpenPropertyId}
        isCheckingFeed={isChecking}
        feedDescription="Simulated county assessor feed (live accounts poll Regrid)"
      />

      {/* In-place property detail — stays on the stewardship screen */}
      <PropertyModal
        open={openPropertyId !== null}
        onOpenChange={open => !open && setOpenPropertyId(null)}
        propertyId={openPropertyId}
        portfolioId={null}
        property={openProperty}
      />
    </>
  )
}
