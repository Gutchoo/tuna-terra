'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShieldCheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  DownloadIcon,
} from 'lucide-react'
import { exportDataHealthReport } from '@/lib/stewardship-export'
import type { Property } from '@/lib/supabase'
import { classifyProperty, type DataHealthResult } from '@/lib/stewardship'
import type { IntakeDocument } from '@/lib/document-intake'
import { DocumentIntakePanel } from './DocumentIntakePanel'
import { DocumentReviewSheet } from './DocumentReviewSheet'

interface DataStewardshipPanelProps {
  properties: Property[]
  /** Intake queue documents (state owned by the parent so posts persist) */
  documents: IntakeDocument[]
  /** Post or reject a reviewed document; parent applies values + audit log */
  onDecideDocument: (doc: IntakeDocument, decision: 'posted' | 'rejected', note: string) => void
  /** Open a property's detail view (in place — no navigation) */
  onOpenProperty?: (propertyId: string) => void
  /** Export the decision audit log (provided where a log context exists) */
  onExportAuditLog?: () => void
}

interface ClassifiedProperty {
  property: Property
  health: DataHealthResult
}

export function DataStewardshipPanel({
  properties,
  documents,
  onDecideDocument,
  onOpenProperty,
  onExportAuditLog,
}: DataStewardshipPanelProps) {
  const [reviewingDoc, setReviewingDoc] = useState<IntakeDocument | null>(null)

  const classified: ClassifiedProperty[] = useMemo(
    () => properties.map(property => ({ property, health: classifyProperty(property) })),
    [properties]
  )

  const lanes = useMemo(
    () => ({
      fresh: classified.filter(c => c.health.status === 'fresh'),
      stale: classified.filter(c => c.health.status === 'stale'),
      exception: classified.filter(c => c.health.status === 'exception'),
    }),
    [classified]
  )

  const total = classified.length || 1
  const freshPct = Math.round((lanes.fresh.length / total) * 100)
  const pendingDocs = documents.filter(d => d.status === 'needs-review').length

  const handleReviewDoc = (doc: IntakeDocument) => {
    // Open the property record behind the sheet for full context; the sheet
    // mounts a beat later so its layer lands on top and stays interactive
    onOpenProperty?.(doc.propertyId)
    setTimeout(() => setReviewingDoc(doc), 200)
  }

  const handleDecide = (doc: IntakeDocument, decision: 'posted' | 'rejected', note: string) => {
    onDecideDocument(doc, decision, note)
    setReviewingDoc(null)
  }

  return (
    <div className="space-y-8">
      {/* Health summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border rounded-lg border bg-card">
        <div className="p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Data Coverage</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight mt-1">{freshPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{lanes.fresh.length} of {classified.length} records fresh</p>
        </div>
        <StatCell icon={<ShieldCheckIcon className="h-4 w-4 text-emerald-600" />} label="Fresh" value={lanes.fresh.length} hint="Verified < 12 months" />
        <StatCell icon={<ClockIcon className="h-4 w-4 text-amber-600" />} label="Stale" value={lanes.stale.length} hint="Needs re-verification" />
        <StatCell
          icon={<AlertTriangleIcon className="h-4 w-4 text-red-600" />}
          label="To Review"
          value={pendingDocs + lanes.exception.length}
          hint={`${pendingDocs} documents · ${lanes.exception.length} record exceptions`}
        />
      </div>

      {/* Export deliverables */}
      <div className="flex justify-end -mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Downstream deliverables</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exportDataHealthReport(properties)}>
              Data health report (CSV)
            </DropdownMenuItem>
            {onExportAuditLog && (
              <DropdownMenuItem onClick={onExportAuditLog}>
                Decision audit log (CSV)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Document intake queue */}
      <DocumentIntakePanel documents={documents} onReview={handleReviewDoc} />

      <Separator />

      {/* Record health queues */}
      <section>
        <h3 className="text-base font-semibold mb-1">Record Health</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Records that can&apos;t be matched to source data or are due for re-verification
        </p>
        <Tabs defaultValue="exceptions">
          <TabsList>
            <TabsTrigger value="exceptions" className="gap-2">
              Exceptions
              {lanes.exception.length > 0 && <Badge variant="secondary">{lanes.exception.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="stale" className="gap-2">
              Stale
              {lanes.stale.length > 0 && <Badge variant="secondary">{lanes.stale.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exceptions" className="mt-3">
            <QueueList
              items={lanes.exception}
              emptyMessage="No exceptions — every record has a resolvable identity and source match."
              badge={<Badge variant="destructive" className="text-xs">Needs review</Badge>}
              onOpenProperty={onOpenProperty}
            />
          </TabsContent>

          <TabsContent value="stale" className="mt-3">
            <QueueList
              items={lanes.stale}
              emptyMessage="Nothing stale — all records verified within the last 12 months."
              badge={<Badge variant="outline" className="text-xs font-normal border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">Stale</Badge>}
              onOpenProperty={onOpenProperty}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Extraction review sheet */}
      <DocumentReviewSheet
        doc={reviewingDoc}
        onOpenChange={open => !open && setReviewingDoc(null)}
        onDecide={handleDecide}
        onOpenProperty={onOpenProperty}
      />
    </div>
  )
}

function StatCell({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </div>
  )
}

function QueueList({
  items,
  emptyMessage,
  badge,
  onOpenProperty,
}: {
  items: ClassifiedProperty[]
  emptyMessage: string
  badge: React.ReactNode
  onOpenProperty?: (propertyId: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="rounded-lg border divide-y">
      {items.map(({ property, health }) => (
        <div key={property.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {badge}
              <button
                type="button"
                onClick={() => onOpenProperty?.(property.id)}
                className="text-sm font-medium hover:underline truncate"
              >
                {property.address || property.apn || 'Unknown property'}
              </button>
              {(property.city || property.state) && (
                <span className="text-xs text-muted-foreground">
                  {[property.city, property.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {health.reasons.join(' · ')}
            </p>
          </div>
          {onOpenProperty && (
            <Button size="sm" variant="outline" onClick={() => onOpenProperty(property.id)}>
              Review
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
