'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  FileJsonIcon,
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import {
  buildVerificationChecks,
  describeEventSource,
  RAW_FIELD_MAP,
  type LifecycleEvent,
} from '@/lib/stewardship'

interface EventReviewSheetProps {
  event: LifecycleEvent | null
  property: Property | undefined
  /** All events in the same feed batch, for corroboration checks */
  batchEvents: LifecycleEvent[]
  onOpenChange: (open: boolean) => void
  onDecide: (event: LifecycleEvent, decision: 'applied' | 'dismissed', note: string) => void
  onOpenProperty?: (propertyId: string) => void
}

// Pull the event's vendor field out of the raw payload so the steward can
// see the stored source value without scanning the whole JSON blob
function RawFieldCallout({ property, field }: { property: Property; field: string }) {
  const vendorField = RAW_FIELD_MAP[field]
  if (!vendorField) return null

  const raw = property.property_data as Record<string, unknown> | null
  // Payload shapes: normalized RegridProperty ({properties: {fields}}) or raw feature
  const fields =
    ((raw?.properties as Record<string, unknown> | undefined)?.fields as Record<string, unknown> | undefined) ??
    (raw?.fields as Record<string, unknown> | undefined)
  const value = fields?.[vendorField]

  return (
    <div className="rounded-md border border-blue-500/40 bg-blue-500/5 dark:border-blue-400/40 px-3 py-2 mb-1.5 text-xs">
      <span className="font-mono text-muted-foreground">fields.{vendorField}</span>
      {value !== undefined && value !== null && value !== '' ? (
        <span className="font-mono font-medium"> = {JSON.stringify(value)}</span>
      ) : (
        <span className="text-muted-foreground italic">
          {' '}— not present in the stored payload; the incoming value originates from the newer feed delivery
        </span>
      )}
    </div>
  )
}

const CHECK_ICONS = {
  pass: <CheckCircle2Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
  warn: <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
  info: <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
}

// Review-before-decide: the steward inspects the incoming change against the
// current record, automated verification signals, and provenance, then
// records a decision with an optional rationale.
export function EventReviewSheet({
  event,
  property,
  batchEvents,
  onOpenChange,
  onDecide,
  onOpenProperty,
}: EventReviewSheetProps) {
  const [note, setNote] = useState('')

  // Reset the note whenever a different event is opened
  useEffect(() => {
    setNote('')
  }, [event?.id])

  const checks = useMemo(
    () => (event ? buildVerificationChecks(event, property, batchEvents) : []),
    [event, property, batchEvents]
  )

  const warnings = checks.filter(c => c.status === 'warn').length

  if (!event) return null

  return (
    <Sheet open={event !== null} onOpenChange={onOpenChange}>
      {/* z-60: the decision surface stays above the property modal when both are open */}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto z-[60]">
        <SheetHeader className="pb-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            Review change
            <Badge variant="secondary" className="text-xs capitalize">{event.eventType}</Badge>
          </SheetTitle>
          <SheetDescription className="flex items-center gap-1">
            <button
              type="button"
              className="hover:underline inline-flex items-center gap-1"
              onClick={() => onOpenProperty?.(event.propertyId)}
            >
              {event.propertyAddress}
              <ExternalLinkIcon className="h-3 w-3" />
            </button>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-5">
          {/* Current vs incoming */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {event.label}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground mb-1">Current record</p>
                <p className="text-sm font-medium break-words">{event.oldValue ?? '—'}</p>
              </div>
              <div className="rounded-md border border-blue-500/40 bg-blue-500/5 dark:border-blue-400/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Incoming from feed</p>
                <p className="text-sm font-medium break-words">{event.newValue ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Provenance */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Provenance
            </p>
            <div className="text-sm space-y-1">
              <p className="flex items-center gap-1.5">
                <DatabaseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {describeEventSource(event.source)}
              </p>
              <p className="text-xs text-muted-foreground">
                Detected {new Date(event.detectedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
                {property?.county && ` · ${property.county} county roll`}
                {property?.apn && ` · APN ${property.apn}`}
              </p>
              {event.deliveryId && (
                <p className="text-xs text-muted-foreground">
                  Delivery: <span className="font-mono">{event.deliveryId}</span> — traceable in Feed Deliveries
                </p>
              )}
              {RAW_FIELD_MAP[event.field] && (
                <p className="text-xs text-muted-foreground">
                  Vendor field: <span className="font-mono">fields.{RAW_FIELD_MAP[event.field]}</span>
                  {' '}→ normalized as <span className="font-mono">{event.field}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Verification checks */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Verification checks
              </p>
              {warnings > 0 ? (
                <Badge variant="secondary" className="text-xs border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  {warnings} of {checks.length} checks flagged
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  {checks.length} checks passed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2.5">
              {warnings > 0
                ? 'Automated screens found conditions worth verifying before you apply this change.'
                : 'Automated screens found no anomalies — the change is consistent with the record and its feed batch.'}
            </p>
            <div className="space-y-2.5">
              {checks.map(check => (
                <div key={check.label} className="flex gap-2">
                  {CHECK_ICONS[check.status]}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{check.label}</p>
                    <p className="text-xs text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw vendor record: the source payload behind the normalized fields */}
          {property?.property_data != null && (
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group">
                <span className="flex items-center gap-1.5">
                  <FileJsonIcon className="h-3.5 w-3.5" />
                  Raw vendor record
                </span>
                <ChevronDownIcon className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-xs text-muted-foreground mt-2 mb-1.5">
                  Source payload the normalized fields were derived from — retained verbatim for lineage.
                </p>
                <RawFieldCallout property={property} field={event.field} />
                <pre className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed font-mono overflow-x-auto max-h-64 overflow-y-auto">
                  {JSON.stringify(property.property_data, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Separator />

          {/* Decision note */}
          <div className="space-y-1.5">
            <Label htmlFor="review-note" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Decision note
            </Label>
            <Textarea
              id="review-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Why are you applying or dismissing this change? Recorded in the audit log."
              rows={3}
            />
          </div>

          {/* Decision */}
          <div className="flex gap-2 pb-6">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => onDecide(event, 'dismissed', note)}
            >
              <XIcon className="h-4 w-4" />
              Dismiss
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={() => onDecide(event, 'applied', note)}
            >
              <CheckIcon className="h-4 w-4" />
              Apply update
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
