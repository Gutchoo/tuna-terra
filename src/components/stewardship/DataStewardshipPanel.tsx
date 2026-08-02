'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  RadioTowerIcon,
  ArrowRightIcon,
  CheckIcon,
  RefreshCwIcon,
  DatabaseIcon,
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import {
  classifyProperty,
  describeEventSource,
  type DataHealthResult,
  type LifecycleEvent,
} from '@/lib/stewardship'

interface DataStewardshipPanelProps {
  properties: Property[]
  /** Pull fresh county data / simulate a feed check. Returns detected events. */
  onCheckFeed: () => Promise<LifecycleEvent[]>
  /** Apply an acknowledged event to the record (demo: local state; live: PATCH). */
  onApplyEvent?: (event: LifecycleEvent) => Promise<void> | void
  /** Open a property's detail view (in place — no navigation) */
  onOpenProperty?: (propertyId: string) => void
  isCheckingFeed?: boolean
  /** Where the feed data comes from, shown under the feed header */
  feedDescription?: string
}

interface ClassifiedProperty {
  property: Property
  health: DataHealthResult
}

const EVENT_TYPE_STYLES: Record<LifecycleEvent['eventType'], { label: string; className: string }> = {
  ownership: { label: 'Ownership', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  valuation: { label: 'Valuation', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  sale: { label: 'Sale', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  zoning: { label: 'Zoning', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  attribute: { label: 'Attribute', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
}

export function DataStewardshipPanel({
  properties,
  onCheckFeed,
  onApplyEvent,
  onOpenProperty,
  isCheckingFeed = false,
  feedDescription = 'Compares each record against the latest county assessor data',
}: DataStewardshipPanelProps) {
  const [events, setEvents] = useState<LifecycleEvent[]>([])
  const [resolvedEventIds, setResolvedEventIds] = useState<Set<string>>(new Set())
  const [hasChecked, setHasChecked] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const [applyingEventId, setApplyingEventId] = useState<string | null>(null)

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
  }

  const handleApply = async (event: LifecycleEvent) => {
    setApplyingEventId(event.id)
    try {
      await onApplyEvent?.(event)
      setResolvedEventIds(prev => new Set(prev).add(event.id))
    } finally {
      setApplyingEventId(null)
    }
  }

  const handleDismiss = (event: LifecycleEvent) => {
    setResolvedEventIds(prev => new Set(prev).add(event.id))
  }

  return (
    <div className="space-y-8">
      {/* Health summary strip — flat stats, no nested cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border rounded-lg border bg-muted/20">
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Data Coverage</p>
          <p className="text-3xl font-semibold mt-1">{freshPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{lanes.fresh.length} of {classified.length} records fresh</p>
        </div>
        <StatCell icon={<ShieldCheckIcon className="h-4 w-4 text-emerald-600" />} label="Fresh" value={lanes.fresh.length} hint="Verified < 12 months" />
        <StatCell icon={<ClockIcon className="h-4 w-4 text-amber-600" />} label="Stale" value={lanes.stale.length} hint="Needs re-verification" />
        <StatCell icon={<AlertTriangleIcon className="h-4 w-4 text-red-600" />} label="Exceptions" value={lanes.exception.length} hint="Needs human review" />
      </div>

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
          <Button size="sm" onClick={handleCheckFeed} disabled={isCheckingFeed} className="gap-2">
            <RefreshCwIcon className={`h-4 w-4 ${isCheckingFeed ? 'animate-spin' : ''}`} />
            {isCheckingFeed ? 'Checking feed…' : 'Check county feed'}
          </Button>
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
                const style = EVENT_TYPE_STYLES[event.eventType]
                return (
                  <div key={event.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${style.className}`} variant="secondary">{style.label}</Badge>
                        <button
                          type="button"
                          onClick={() => onOpenProperty?.(event.propertyId)}
                          className="text-sm font-medium hover:underline truncate"
                        >
                          {event.propertyAddress}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-muted-foreground">{event.label}:</span>
                        <span className="line-through text-muted-foreground">{event.oldValue ?? '—'}</span>
                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{event.newValue}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Source: {describeEventSource(event.source)} · detected{' '}
                        {new Date(event.detectedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleDismiss(event)}>
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(event)}
                        disabled={applyingEventId === event.id}
                        className="gap-1"
                      >
                        <CheckIcon className="h-3 w-3" />
                        {applyingEventId === event.id ? 'Applying…' : 'Apply update'}
                      </Button>
                    </div>
                  </div>
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
              badge={<Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" variant="secondary">Stale</Badge>}
              onOpenProperty={onOpenProperty}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

function StatCell({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-semibold mt-1">{value}</p>
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
