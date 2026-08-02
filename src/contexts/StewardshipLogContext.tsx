'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { LifecycleEvent } from '@/lib/stewardship'

// ============================================================================
// Audit trail for stewardship actions. Every applied lifecycle event becomes
// a change-log entry (what changed, old/new value, source, when, by whom),
// viewable per property and revertible. Optional context: components render
// nothing when no provider is mounted (e.g. the signed-in dashboard today).
// ============================================================================

export interface ChangeLogEntry {
  id: string
  propertyId: string
  field: string
  label: string
  oldValue: string | null
  newValue: string | null
  eventType: LifecycleEvent['eventType']
  source: LifecycleEvent['source']
  decision: 'applied' | 'dismissed'
  /** Steward's rationale recorded with the decision */
  note: string | null
  appliedAt: string
  appliedBy: string
  revertedAt: string | null
}

interface StewardshipLogContextType {
  entries: ChangeLogEntry[]
  getEntriesForProperty: (propertyId: string) => ChangeLogEntry[]
  recordDecision: (event: LifecycleEvent, decision: 'applied' | 'dismissed', note?: string) => void
  revertEntry: (entryId: string) => void
}

const StewardshipLogContext = createContext<StewardshipLogContextType | null>(null)

interface StewardshipLogProviderProps {
  children: React.ReactNode
  /** Route a field value back onto the property record (revert path) */
  applyFieldValue: (propertyId: string, field: string, value: string | null) => void
  /** Display name recorded against each action */
  actor?: string
}

export function StewardshipLogProvider({
  children,
  applyFieldValue,
  actor = 'Demo steward',
}: StewardshipLogProviderProps) {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])

  const recordDecision = useCallback((event: LifecycleEvent, decision: 'applied' | 'dismissed', note?: string) => {
    const entry: ChangeLogEntry = {
      id: `log-${event.id}-${Date.now()}`,
      propertyId: event.propertyId,
      field: event.field,
      label: event.label,
      oldValue: event.oldValue,
      newValue: event.newValue,
      eventType: event.eventType,
      source: event.source,
      decision,
      note: note?.trim() || null,
      appliedAt: new Date().toISOString(),
      appliedBy: actor,
      revertedAt: null,
    }
    setEntries(prev => [entry, ...prev])
  }, [actor])

  const revertEntry = useCallback((entryId: string) => {
    // Read from current entries outside the updater: calling another
    // component's setState inside a state updater violates React rendering
    setEntries(prev => {
      const entry = prev.find(e => e.id === entryId)
      // Dismissals never changed the record, so there is nothing to revert
      if (!entry || entry.revertedAt || entry.decision !== 'applied') return prev
      // Defer the cross-store write until after this update commits
      queueMicrotask(() => applyFieldValue(entry.propertyId, entry.field, entry.oldValue))
      return prev.map(e => (e.id === entryId ? { ...e, revertedAt: new Date().toISOString() } : e))
    })
  }, [applyFieldValue])

  const getEntriesForProperty = useCallback(
    (propertyId: string) => entries.filter(e => e.propertyId === propertyId),
    [entries]
  )

  const value = useMemo(
    () => ({ entries, getEntriesForProperty, recordDecision, revertEntry }),
    [entries, getEntriesForProperty, recordDecision, revertEntry]
  )

  return <StewardshipLogContext.Provider value={value}>{children}</StewardshipLogContext.Provider>
}

/** Null when no provider is mounted — callers should render nothing in that case */
export function useStewardshipLog(): StewardshipLogContextType | null {
  return useContext(StewardshipLogContext)
}
