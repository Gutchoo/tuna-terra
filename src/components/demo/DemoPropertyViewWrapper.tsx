'use client'

import { PropertyView } from '@/components/properties/PropertyView'
import { DemoAddPropertyModal } from './DemoAddPropertyModal'
import { useDemoPropertyHandlers } from '@/hooks/useDemoPropertyHandlers'
import type { Property } from '@/lib/supabase'

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
      />

      {/* Demo-specific modals */}
      <DemoAddPropertyModal
        open={showDemoModal}
        onOpenChange={setShowDemoModal}
      />
    </>
  )
}