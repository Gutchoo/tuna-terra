'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useUserPreference } from './use-user-preferences'
import type { Property } from '@/lib/supabase'

// Define panel IDs
export type PanelId = 'overview' | 'income' | 'expenses' | 'units'

// Panel visibility and sizes
interface PanelState {
  isVisible: boolean
  size?: number // Size in percentage
}

interface DashboardLayoutState {
  panels: Record<PanelId, PanelState>
  listPanelSize: number // Size of the left property list panel (percentage)
  selectedPropertyId: string | null
}

const DEFAULT_LAYOUT: DashboardLayoutState = {
  panels: {
    overview: { isVisible: true, size: 25 },
    income: { isVisible: true, size: 25 },
    expenses: { isVisible: true, size: 25 },
    units: { isVisible: true, size: 25 },
  },
  listPanelSize: 30, // 30% for list, 70% for details
  selectedPropertyId: null,
}

/**
 * Hook to manage dashboard layout state with persistent storage
 * Handles panel visibility, sizes, and selected property
 */
export function useDashboardLayout() {
  const {
    value: savedLayout,
    updatePreference,
    isLoading,
  } = useUserPreference<DashboardLayoutState>('dashboard-layout', DEFAULT_LAYOUT)

  // Local state for immediate UI updates
  const [layout, setLayout] = useState<DashboardLayoutState>(DEFAULT_LAYOUT)

  // Track if we've initialized from saved preferences
  const initializedRef = useRef(false)

  // Debounce timer for saving to database
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize layout from saved preferences once
  useEffect(() => {
    if (!isLoading && savedLayout && !initializedRef.current) {
      setLayout(savedLayout)
      initializedRef.current = true
    }
  }, [savedLayout, isLoading])

  // Debounced save to database
  const debouncedSave = useCallback((newLayout: DashboardLayoutState) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      updatePreference(newLayout)
    }, 500) // 500ms debounce
  }, [updatePreference])

  // Update layout and trigger save
  const updateLayout = useCallback((updates: Partial<DashboardLayoutState>) => {
    setLayout(prev => {
      const newLayout = { ...prev, ...updates }
      debouncedSave(newLayout)
      return newLayout
    })
  }, [debouncedSave])

  // Toggle panel visibility
  const togglePanel = useCallback((panelId: PanelId) => {
    setLayout(prev => {
      const newLayout = {
        ...prev,
        panels: {
          ...prev.panels,
          [panelId]: {
            ...prev.panels[panelId],
            isVisible: !prev.panels[panelId].isVisible,
          },
        },
      }
      debouncedSave(newLayout)
      return newLayout
    })
  }, [debouncedSave])

  // Update panel size
  const setPanelSize = useCallback((panelId: PanelId, size: number) => {
    setLayout(prev => {
      const newLayout = {
        ...prev,
        panels: {
          ...prev.panels,
          [panelId]: {
            ...prev.panels[panelId],
            size,
          },
        },
      }
      debouncedSave(newLayout)
      return newLayout
    })
  }, [debouncedSave])

  // Update list panel size
  const setListPanelSize = useCallback((size: number) => {
    setLayout(prev => {
      const newLayout = { ...prev, listPanelSize: size }
      debouncedSave(newLayout)
      return newLayout
    })
  }, [debouncedSave])

  // Select a property
  const selectProperty = useCallback((property: Property | null) => {
    setLayout(prev => ({
      ...prev,
      selectedPropertyId: property?.id || null,
    }))
    // Don't save property selection to database - it's session-only
  }, [])

  // Reset layout to defaults
  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
    updatePreference(DEFAULT_LAYOUT)
  }, [updatePreference])

  // Get visible panels
  const visiblePanels = Object.entries(layout.panels)
    .filter(([_, state]) => state.isVisible)
    .map(([id]) => id as PanelId)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return {
    layout,
    isLoading,
    togglePanel,
    setPanelSize,
    setListPanelSize,
    selectProperty,
    updateLayout,
    resetLayout,
    visiblePanels,
    selectedPropertyId: layout.selectedPropertyId,
  }
}
