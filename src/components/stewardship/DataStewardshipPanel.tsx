'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import type { Property } from '@/lib/supabase'
import { classifyProperty, type DataHealthResult, type LifecycleEvent } from '@/lib/stewardship'

interface DataStewardshipPanelProps {
  properties: Property[]
  /** Pull fresh county data / simulate a feed check. Returns detected events. */
  onCheckFeed: () => Promise<LifecycleEvent[]>
  /** Apply an acknowledged event to the record (demo: local state; live: PATCH). */
  onApplyEvent?: (event: LifecycleEvent) => Promise<void> | void
  /** Open a property's detail view for manual exception resolution */
  onOpenProperty?: (propertyId: string) => void
  isCheckingFeed?: boolean
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
}: DataStewardshipPanelProps) {
  const [events, setEvents] = useState<LifecycleEvent[]>([])
  const [resolvedEventIds, setResolvedEventIds] = useState<Set<string>>(new Set())
  const [hasChecked, setHasChecked] = useState(false)
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
    <div className="space-y-4">
      {/* Health summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Data Coverage</p>
            <p className="text-2xl font-semibold">{freshPct}%</p>
            <p className="text-xs text-muted-foreground">{lanes.fresh.length} of {classified.length} records fresh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fresh</p>
            </div>
            <p className="text-2xl font-semibold">{lanes.fresh.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-amber-600" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stale</p>
            </div>
            <p className="text-2xl font-semibold">{lanes.stale.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Exceptions</p>
            </div>
            <p className="text-2xl font-semibold">{lanes.exception.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle event feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <RadioTowerIcon className="h-4 w-4" />
              Lifecycle Events
              {openEvents.length > 0 && (
                <Badge variant="destructive" className="ml-1">{openEvents.length} pending</Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleCheckFeed} disabled={isCheckingFeed} className="gap-2">
              <RefreshCwIcon className={`h-4 w-4 ${isCheckingFeed ? 'animate-spin' : ''}`} />
              {isCheckingFeed ? 'Checking feed…' : 'Check county feed'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasChecked ? (
            <p className="text-sm text-muted-foreground">
              Run a feed check to compare each property against its latest county record.
              Changes to ownership, valuations, sales, and zoning surface here for review.
            </p>
          ) : openEvents.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckIcon className="h-4 w-4 text-emerald-600" />
              {events.length === 0
                ? 'No changes detected — all records match the county feed.'
                : `All ${events.length} detected events reviewed.`}
            </div>
          ) : (
            <div className="space-y-3">
              {openEvents.map(event => {
                const style = EVENT_TYPE_STYLES[event.eventType]
                return (
                  <div key={event.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 space-y-1">
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
                        <p className="text-sm text-muted-foreground">{event.label} changed</p>
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="line-through text-muted-foreground">{event.oldValue ?? '—'}</span>
                          <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-medium">{event.newValue}</span>
                        </div>
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
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exception / staleness queues */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
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
              {lanes.exception.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exceptions — every record has a resolvable identity and county match.</p>
              ) : (
                <div className="space-y-2">
                  {lanes.exception.map(({ property, health }) => (
                    <QueueRow
                      key={property.id}
                      property={property}
                      reasons={health.reasons}
                      onOpenProperty={onOpenProperty}
                      badge={<Badge variant="destructive" className="text-xs">Needs review</Badge>}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stale" className="mt-3">
              {lanes.stale.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing stale — all county records verified within the last 12 months.</p>
              ) : (
                <div className="space-y-2">
                  {lanes.stale.map(({ property, health }) => (
                    <QueueRow
                      key={property.id}
                      property={property}
                      reasons={health.reasons}
                      onOpenProperty={onOpenProperty}
                      badge={<Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" variant="secondary">Stale</Badge>}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function QueueRow({
  property,
  reasons,
  badge,
  onOpenProperty,
}: {
  property: Property
  reasons: string[]
  badge: React.ReactNode
  onOpenProperty?: (propertyId: string) => void
}) {
  return (
    <div className="rounded-lg border p-3 flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {badge}
          <p className="text-sm font-medium truncate">{property.address || property.apn || 'Unknown property'}</p>
          {(property.city || property.state) && (
            <p className="text-xs text-muted-foreground">
              {[property.city, property.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <Separator className="my-2" />
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {reasons.map(reason => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      </div>
      {onOpenProperty && (
        <Button size="sm" variant="outline" onClick={() => onOpenProperty(property.id)}>
          Review
        </Button>
      )}
    </div>
  )
}
