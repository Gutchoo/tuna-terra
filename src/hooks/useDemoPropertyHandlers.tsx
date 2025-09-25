'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Property } from '@/lib/supabase'
import { isDemoProperty } from '@/contexts/DemoContext'

export function useDemoPropertyHandlers() {
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleRefresh = (property: Property) => {
    if (isDemoProperty(property.id)) {
      // Allow actions on demo properties
      toast.info('Demo Feature', {
        description: 'Property data refresh is available in the full version. Sign up for live data updates!'
      })
    } else {
      // Sample properties - show demo limitations
      toast.info('Demo Limitation', {
        description: 'These are sample properties. Sign up to manage your own properties!'
      })
    }
  }

  const handleDelete = (property: Property) => {
    if (isDemoProperty(property.id)) {
      // Allow actions on demo properties
      toast.info('Demo Feature', {
        description: 'Property deletion is available in the full version. Sign up to manage your properties!'
      })
    } else {
      // Sample properties - show demo limitations
      toast.info('Demo Limitation', {
        description: 'These are sample properties. Sign up to manage your own properties!'
      })
    }
  }

  const handleAddProperties = () => {
    setShowDemoModal(true)
  }

  // Mock handlers for onPropertiesChange and onError that do nothing
  const handlePropertiesChange = () => {
    // No-op for demo
  }

  const handleError = () => {
    // No-op for demo
  }

  return {
    handleRefresh,
    handleDelete,
    handleAddProperties,
    handlePropertiesChange,
    handleError,
    showDemoModal,
    setShowDemoModal
  }
}