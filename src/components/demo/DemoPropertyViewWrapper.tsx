'use client'

import { PropertyView } from '@/components/properties/PropertyView'
import { DemoAddPropertyModal } from './DemoAddPropertyModal'
import { useDemoPropertyHandlers } from '@/hooks/useDemoPropertyHandlers'
import type { Property } from '@/lib/supabase'
import { useState } from 'react'

interface DemoPropertyViewWrapperProps {
  properties: Property[]
}

export function DemoPropertyViewWrapper({
  properties,
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
        focusRequest={focusRequest}
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
