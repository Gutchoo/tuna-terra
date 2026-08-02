'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HistoryIcon, ArrowRightIcon, Undo2Icon } from 'lucide-react'
import { useStewardshipLog } from '@/contexts/StewardshipLogContext'
import { describeEventSource } from '@/lib/stewardship'

interface PropertyChangeLogProps {
  propertyId: string
  /** Render a placeholder when there are no entries (used as a dedicated Activity tab) */
  emptyState?: boolean
}

// Audit trail of stewardship actions on this property: what changed, the
// before/after values, where the data came from, who applied it, and revert.
// Renders nothing when no stewardship log provider is mounted.
export function PropertyChangeLog({ propertyId, emptyState = false }: PropertyChangeLogProps) {
  const log = useStewardshipLog()

  const entries = log?.getEntriesForProperty(propertyId) ?? []

  if (entries.length === 0 || !log) {
    if (!emptyState) return null
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <HistoryIcon className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          {log
            ? 'Stewardship decisions on this record — applied updates, dismissals, and reverts — will appear here with their full audit trail.'
            : 'Activity tracking is available in stewardship contexts.'}
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          Change Log
          <Badge variant="secondary" className="text-xs font-normal">{entries.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {entries.map((entry, index) => (
            <div key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${entry.revertedAt || entry.decision === 'dismissed' ? 'bg-muted-foreground/40' : 'bg-primary'}`} />
                {index < entries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>

              <div className={`min-w-0 flex-1 ${entry.revertedAt ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {entry.label} {entry.decision === 'dismissed' ? 'change dismissed' : 'updated'}
                      {entry.decision === 'dismissed' && (
                        <Badge variant="outline" className="ml-2 text-xs font-normal">Not applied</Badge>
                      )}
                      {entry.revertedAt && (
                        <Badge variant="outline" className="ml-2 text-xs font-normal">Reverted</Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm flex-wrap mt-0.5">
                      <span className={`text-muted-foreground ${entry.revertedAt || entry.decision === 'dismissed' ? '' : 'line-through'}`}>
                        {entry.oldValue ?? '—'}
                      </span>
                      <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className={entry.revertedAt || entry.decision === 'dismissed' ? 'text-muted-foreground' : 'font-medium'}>
                        {entry.newValue ?? '—'}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs mt-1 rounded bg-muted/60 px-2 py-1 italic">
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {describeEventSource(entry.source)} · {entry.decision} by {entry.appliedBy} ·{' '}
                      {new Date(entry.appliedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!entry.revertedAt && entry.decision === 'applied' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 shrink-0 text-muted-foreground"
                      onClick={() => log.revertEntry(entry.id)}
                    >
                      <Undo2Icon className="h-3 w-3" />
                      Revert
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
