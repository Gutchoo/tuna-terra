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
  RadioTowerIcon,
  ArrowRightIcon,
  CheckIcon,
  RefreshCwIcon,
  DatabaseIcon,
  SearchIcon,
  DownloadIcon,
} from 'lucide-react'
import { exportDataHealthReport, exportLifecycleEvents } from '@/lib/stewardship-export'
import {
  buildLiveDelivery,
  getSeededDeliveries,
  type FeedDelivery,
} from '@/lib/feed-deliveries'
import { FeedDeliveriesPanel } from './FeedDeliveriesPanel'
import type { Property } from '@/lib/supabase'
import {
  classifyProperty,
  describeEventSource,
  buildVerificationChecks,
  type DataHealthResult,
  type LifecycleEvent,
} from '@/lib/stewardship'
import { EventReviewSheet } from './EventReviewSheet'

interface DataStewardshipPanelProps {
  properties: Property[]
  /** Pull fresh county data / simulate a feed check. Returns detected events. */
  onCheckFeed: () => Promise<LifecycleEvent[]>
  /** Apply an acknowledged event to the record (demo: local state; live: PATCH). */
  onApplyEvent?: (event: LifecycleEvent) => Promise<void> | void
  /** Record a decision (applied or dismissed, with the steward's note) in the audit log */
  onRecordDecision?: (event: LifecycleEvent, decision: 'applied' | 'dismissed', note: string) => void
  /** Open a property's detail view (in place — no navigation) */
  onOpenProperty?: (propertyId: string) => void
  isCheckingFeed?: boolean
  /** Where the feed data comes from, shown under the feed header */
  feedDescription?: string
  /** Export the decision audit log (provided where a log context exists) */
  onExportAuditLog?: () => void
}

interface ClassifiedProperty {
  property: Property
  health: DataHealthResult
}

// Neutral chip + colored signal dot (financial-terminal style, not pastel fills)
const EVENT_TYPE_STYLES: Record<LifecycleEvent['eventType'], { label: string; dotClass: string }> = {
  ownership: { label: 'Ownership', dotClass: 'bg-purple-500' },
  valuation: { label: 'Valuation', dotClass: 'bg-blue-500' },
  sale: { label: 'Sale', dotClass: 'bg-emerald-500' },
  zoning: { label: 'Zoning', dotClass: 'bg-amber-500' },
  attribute: { label: 'Attribute', dotClass: 'bg-slate-400' },
}

function EventTypeBadge({ eventType }: { eventType: LifecycleEvent['eventType'] }) {
  const style = EVENT_TYPE_STYLES[eventType]
  return (
    <Badge variant="outline" className="text-xs font-normal gap-1.5">
      <span className={`size-1.5 rounded-full ${style.dotClass}`} />
      {style.label}
    </Badge>
  )
}

export function DataStewardshipPanel({
  properties,
  onCheckFeed,
  onApplyEvent,
  onRecordDecision,
  onOpenProperty,
  isCheckingFeed = false,
  feedDescription = 'Compares each record against the latest county assessor data',
  onExportAuditLog,
}: DataStewardshipPanelProps) {
  const [events, setEvents] = useState<LifecycleEvent[]>([])
  const [resolvedEventIds, setResolvedEventIds] = useState<Set<string>>(new Set())
  const [hasChecked, setHasChecked] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const [reviewingEvent, setReviewingEvent] = useState<LifecycleEvent | null>(null)
  const [deliveries, setDeliveries] = useState<FeedDelivery[]>(getSeededDeliveries)

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

  const openEvents = events.filter(e => !resolvedEventIds.has(e.id))
  const total = classified.length || 1
  const freshPct = Math.round((lanes.fresh.length / total) * 100)

  const handleCheckFeed = async () => {
    const detected = await onCheckFeed()
    setEvents(detected)
    setResolvedEventIds(new Set())
    setHasChecked(true)
    setLastCheckedAt(new Date())

    // Log the run as a delivery with real pipeline counts, and stamp each
    // event with the delivery id so its lineage traces back to the batch
    const delivery = buildLiveDelivery({
      recordCount: properties.length,
      eventCount: detected.length,
      exceptionCount: lanes.exception.length,
      source: 'County assessor (Regrid)',
    })
    setDeliveries(prev => [delivery, ...prev])
    setEvents(detected.map(e => ({ ...e, deliveryId: delivery.id })))
  }

  // Decisions come from the review sheet: apply mutates the record, both
  // paths land in the audit log with the steward's note
  const handleDecide = async (event: LifecycleEvent, decision: 'applied' | 'dismissed', note: string) => {
    if (decision === 'applied') {
      await onApplyEvent?.(event)
    }
    onRecordDecision?.(event, decision, note)
    setResolvedEventIds(prev => new Set(prev).add(event.id))
    setReviewingEvent(null)
  }

  return (
    <div className="space-y-8">
      {/* Health summary strip — flat stats, no nested cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border rounded-lg border bg-card">
        <div className="p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Data Coverage</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight mt-1">{freshPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{lanes.fresh.length} of {classified.length} records fresh</p>
        </div>
        <StatCell icon={<ShieldCheckIcon className="h-4 w-4 text-emerald-600" />} label="Fresh" value={lanes.fresh.length} hint="Verified < 12 months" />
        <StatCell icon={<ClockIcon className="h-4 w-4 text-amber-600" />} label="Stale" value={lanes.stale.length} hint="Needs re-verification" />
        <StatCell icon={<AlertTriangleIcon className="h-4 w-4 text-red-600" />} label="Exceptions" value={lanes.exception.length} hint="Needs human review" />
      </div>

      {/* Feed delivery telemetry (ops surface) */}
      <FeedDeliveriesPanel deliveries={deliveries} />

      <Separator />

      {/* Lifecycle event feed */}
      <section>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <RadioTowerIcon className="h-4 w-4" />
              Lifecycle Events
              {openEvents.length > 0 && (
                <Badge variant="destructive">{openEvents.length} pending</Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <DatabaseIcon className="h-3.5 w-3.5" />
              {feedDescription}
              {lastCheckedAt && (
                <span>
                  {' '}· last checked{' '}
                  {lastCheckedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
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
                <DropdownMenuItem
                  disabled={events.length === 0}
                  onClick={() => exportLifecycleEvents(events, resolvedEventIds)}
                >
                  Lifecycle event feed (CSV)
                </DropdownMenuItem>
                {onExportAuditLog && (
                  <DropdownMenuItem onClick={onExportAuditLog}>
                    Decision audit log (CSV)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleCheckFeed} disabled={isCheckingFeed} className="gap-2">
              <RefreshCwIcon className={`h-4 w-4 ${isCheckingFeed ? 'animate-spin' : ''}`} />
              {isCheckingFeed ? 'Checking feed…' : 'Check county feed'}
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {!hasChecked ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <RadioTowerIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Run a feed check to compare each property against its latest county record.
                Changes to ownership, valuations, sales, and zoning surface here for review.
              </p>
            </div>
          ) : openEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              <CheckIcon className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
              {events.length === 0
                ? 'No changes detected — all records match the county feed.'
                : `All ${events.length} detected events reviewed.`}
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {openEvents.map(event => {
                const property = properties.find(p => p.id === event.propertyId)
                const warnings = buildVerificationChecks(event, property, events).filter(c => c.status === 'warn').length
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      // Open the full record behind the review sheet so the
                      // steward has complete context while deciding. The sheet
                      // opens a beat later so its Radix layer mounts on top of
                      // the modal and stays interactive.
                      onOpenProperty?.(event.propertyId)
                      setTimeout(() => setReviewingEvent(event), 200)
                    }}
                    className="w-full text-left p-4 flex items-start justify-between gap-4 flex-wrap hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <EventTypeBadge eventType={event.eventType} />
                        <span className="text-sm font-medium truncate">{event.propertyAddress}</span>
                        {warnings > 0 && (
                          <Badge variant="outline" className="text-xs font-normal gap-1 border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            <AlertTriangleIcon className="h-3 w-3" />
                            {warnings}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-muted-foreground">{event.label}:</span>
                        <span className="line-through text-muted-foreground">{event.oldValue ?? '—'}</span>
                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{event.newValue}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.deliveryId && (
                          <span className="font-mono">{event.deliveryId} · </span>
                        )}
                        Source: {describeEventSource(event.source)} · detected{' '}
                        {new Date(event.detectedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                      <SearchIcon className="h-3.5 w-3.5" />
                      Review
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Exception / staleness queues */}
      <section>
        <h3 className="text-base font-semibold mb-1">Review Queue</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Records that can&apos;t be auto-matched to the county feed or are due for re-verification
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
              emptyMessage="No exceptions — every record has a resolvable identity and county match."
              badge={<Badge variant="destructive" className="text-xs">Needs review</Badge>}
              onOpenProperty={onOpenProperty}
            />
          </TabsContent>

          <TabsContent value="stale" className="mt-3">
            <QueueList
              items={lanes.stale}
              emptyMessage="Nothing stale — all county records verified within the last 12 months."
              badge={<Badge variant="outline" className="text-xs font-normal border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">Stale</Badge>}
              onOpenProperty={onOpenProperty}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Review-before-decide sheet */}
      <EventReviewSheet
        event={reviewingEvent}
        property={reviewingEvent ? properties.find(p => p.id === reviewingEvent.propertyId) : undefined}
        batchEvents={events}
        onOpenChange={open => !open && setReviewingEvent(null)}
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
