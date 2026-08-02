'use client'

import { useState } from 'react'
import { DataStewardshipPanel } from '@/components/stewardship/DataStewardshipPanel'
import { useDemo } from '@/contexts/DemoContext'
import { simulateCountyFeedCheck } from '@/lib/demo-stewardship'
import type { LifecycleEvent } from '@/lib/stewardship'
import type { Property } from '@/lib/supabase'
import { toast } from 'sonner'

interface DemoStewardshipSectionProps {
  properties: Property[]
  onOpenProperty?: (propertyId: string) => void
}

// Money-formatted event values need to be parsed back to numbers for storage
const NUMERIC_FIELDS = new Set(['assessed_value', 'land_value', 'improvement_value', 'last_sale_price'])

export function DemoStewardshipSection({ properties, onOpenProperty }: DemoStewardshipSectionProps) {
  const { updateDemoProperty } = useDemo()
  const [isChecking, setIsChecking] = useState(false)

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
    if (event.newValue == null) return
    const value = NUMERIC_FIELDS.has(event.field)
      ? parseFloat(event.newValue.replace(/[^0-9.]/g, ''))
      : event.newValue

    // Sample properties are static fixtures; demo-added properties live in context
    if (event.propertyId.startsWith('demo-property-')) {
      updateDemoProperty(event.propertyId, { [event.field]: value } as Partial<Property>)
    }
    toast.success(`Updated ${event.label.toLowerCase()} for ${event.propertyAddress}`)
  }

  return (
    <DataStewardshipPanel
      properties={properties}
      onCheckFeed={handleCheckFeed}
      onApplyEvent={handleApplyEvent}
      onOpenProperty={onOpenProperty}
      isCheckingFeed={isChecking}
    />
  )
}
