'use client'

import { PropertyView } from '@/components/properties/PropertyView'
import { DemoAddPropertyModal } from './DemoAddPropertyModal'
import { AuthModal } from '@/components/modals/AuthModal'
import { useDemoPropertyHandlers } from '@/hooks/useDemoPropertyHandlers'
import type { Property } from '@/lib/supabase'
import { useState } from 'react'

interface DemoPropertyViewWrapperProps {
  properties: Property[]
  sampleProperties: Property[]
  demoProperties: Property[]
}

export function DemoPropertyViewWrapper({
  properties,
  sampleProperties,
  demoProperties
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

  const [showAuthModal, setShowAuthModal] = useState(false)

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

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode="sign-up"
      />
    </>
  )
}