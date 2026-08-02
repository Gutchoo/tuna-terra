'use client'

import { Badge } from '@/components/ui/badge'
import { FileTextIcon } from 'lucide-react'
import {
  getDocumentsForProperty,
  DOC_TYPE_LABELS,
  RECEIVED_VIA_LABELS,
} from '@/lib/document-intake'

interface PropertyIntakeDocumentsProps {
  propertyId: string
}

const STATUS_STYLES: Record<string, string> = {
  'needs-review': 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  posted: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
}

// Source documents received for this property via the intake pipeline.
// Returns null when the property has none (caller falls back to the
// document-upload center).
export function PropertyIntakeDocuments({ propertyId }: PropertyIntakeDocumentsProps) {
  const docs = getDocumentsForProperty(propertyId)
  if (docs.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Documents received through intake — the source records behind this property&apos;s data.
      </p>
      <div className="rounded-lg border divide-y">
        {docs.map(doc => (
          <div key={doc.id} className="p-3 flex items-start gap-3">
            <FileTextIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium">{DOC_TYPE_LABELS[doc.type]}</p>
                <Badge variant="outline" className={`text-xs font-normal capitalize ${STATUS_STYLES[doc.status] ?? ''}`}>
                  {doc.status === 'needs-review' ? 'Needs review' : doc.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doc.title} · {doc.sender}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{doc.id}</span> · {RECEIVED_VIA_LABELS[doc.receivedVia]} ·{' '}
                {new Date(doc.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
