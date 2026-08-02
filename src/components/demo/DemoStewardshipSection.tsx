'use client'

import { useMemo, useState } from 'react'
import { DataStewardshipPanel } from '@/components/stewardship/DataStewardshipPanel'
import { PropertyModal } from '@/components/properties/PropertyModal'
import { useDemo } from '@/contexts/DemoContext'
import { useStewardshipLog } from '@/contexts/StewardshipLogContext'
import { getIntakeDocuments, type IntakeDocument } from '@/lib/document-intake'
import { exportAuditLog } from '@/lib/stewardship-export'
import type { LifecycleEvent } from '@/lib/stewardship'
import type { Property } from '@/lib/supabase'
import { toast } from 'sonner'

interface DemoStewardshipSectionProps {
  properties: Property[]
  /** Apply values to a static sample property (they live outside DemoContext) */
  onApplySampleOverride?: (propertyId: string, updates: Partial<Property>) => void
}

export function DemoStewardshipSection({ properties, onApplySampleOverride }: DemoStewardshipSectionProps) {
  const { updateDemoProperty } = useDemo()
  const log = useStewardshipLog()
  const [documents, setDocuments] = useState<IntakeDocument[]>(getIntakeDocuments)
  // Property modal opened in place from the stewardship screen
  const [openPropertyId, setOpenPropertyId] = useState<string | null>(null)

  const openProperty = useMemo(
    () => (openPropertyId ? properties.find(p => p.id === openPropertyId) : undefined),
    [openPropertyId, properties]
  )

  const applyUpdates = (propertyId: string, updates: Partial<Property>) => {
    if (propertyId.startsWith('demo-property-')) {
      updateDemoProperty(propertyId, updates)
    } else {
      onApplySampleOverride?.(propertyId, updates)
    }
  }

  const handleDecideDocument = (doc: IntakeDocument, decision: 'posted' | 'rejected', note: string) => {
    if (decision === 'posted') {
      // Post extracted values that map to record fields and differ
      const updates: Partial<Property> = {}
      for (const field of doc.extractedFields) {
        if (field.field && String(field.value) !== String(field.currentValue ?? '')) {
          ;(updates as Record<string, unknown>)[field.field] = field.value
        }
      }
      if (Object.keys(updates).length > 0) {
        applyUpdates(doc.propertyId, updates)
      }
      toast.success(`Posted ${doc.title} to ${doc.propertyAddress}`)
    } else {
      toast.info(`Rejected ${doc.title}`)
    }

    // Audit trail: one entry per record-changing field (posted), or one
    // rejection entry for the document as a whole
    if (log) {
      const changed = doc.extractedFields.filter(
        f => f.field && String(f.value) !== String(f.currentValue ?? '')
      )
      const asEvent = (label: string, field: string, oldV: string | null, newV: string | null): LifecycleEvent => ({
        id: `${doc.id}-${field}`,
        propertyId: doc.propertyId,
        propertyAddress: doc.propertyAddress,
        field,
        label,
        oldValue: oldV,
        newValue: newV,
        eventType: 'attribute',
        source: 'document-intake',
        detectedAt: new Date().toISOString(),
        deliveryId: doc.id,
      })

      if (decision === 'posted') {
        for (const f of changed) {
          log.recordDecision(
            asEvent(f.label, f.field as string, f.currentValue == null ? null : String(f.currentValue), String(f.value)),
            'applied',
            note || `Posted from ${doc.title} (${doc.id})`
          )
        }
      } else {
        log.recordDecision(
          asEvent(doc.title, 'document', null, doc.id),
          'dismissed',
          note || `Rejected ${doc.id}`
        )
      }
    }

    setDocuments(prev => prev.map(d => (d.id === doc.id ? { ...d, status: decision } : d)))
  }

  return (
    <>
      <DataStewardshipPanel
        properties={properties}
        documents={documents}
        onDecideDocument={handleDecideDocument}
        onOpenProperty={setOpenPropertyId}
        onExportAuditLog={log ? () => {
          if (log.entries.length === 0) {
            toast.info('No decisions recorded yet — review a document first.')
            return
          }
          exportAuditLog(log.entries)
        } : undefined}
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
