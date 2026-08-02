'use client'

import { PropertyView } from '@/components/properties/PropertyView'
import { DemoAddPropertyModal } from './DemoAddPropertyModal'
import { useDemoPropertyHandlers } from '@/hooks/useDemoPropertyHandlers'
import type { Property } from '@/lib/supabase'
import { useState } from 'react'

interface DemoPropertyViewWrapperProps {
  properties: Property[]
  /** External focus request (e.g. stewardship "Review" jumps to a property) */
  externalFocusRequest?: { propertyId: string; ts: number } | null
}

export function DemoPropertyViewWrapper({
  properties,
  externalFocusRequest = null,
}: DemoPropertyViewWrapperProps) {
  const {
    handleRefresh,
    handleDelete,
    handleAddProperties,
    handlePropertiesChange,
    handleError,
    showDemoModal,
    setShowDemoModal
  } = useDemoPropertyHandlers()

  // After a demo property is added, focus it in whatever view is active
  // (map centers on it, cards/table open its drawer)
  const [focusRequest, setFocusRequest] = useState<{ propertyId: string; ts: number } | null>(null)

  const handlePropertyAdded = (propertyId: string) => {
    setFocusRequest({ propertyId, ts: Date.now() })
  }

  // Prefer the newer of internal vs external focus requests
  const activeFocusRequest =
    externalFocusRequest && (!focusRequest || externalFocusRequest.ts > focusRequest.ts)
      ? externalFocusRequest
      : focusRequest

  return (
    <>
      <PropertyView
        properties={properties}
        onPropertiesChange={handlePropertiesChange}
        onError={handleError}
        portfolioId={null} // No portfolio in demo
        onAddProperties={handleAddProperties}
        onRefreshOverride={handleRefresh}
        onDeleteOverride={handleDelete}
        focusRequest={activeFocusRequest}
      />

      {/* Demo-specific modals */}
      <DemoAddPropertyModal
        open={showDemoModal}
        onOpenChange={setShowDemoModal}
        onPropertyAdded={handlePropertyAdded}
      />
    </>
  )
}
