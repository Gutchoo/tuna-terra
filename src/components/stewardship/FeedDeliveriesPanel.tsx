'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InboxIcon, AlertTriangleIcon, CheckIcon } from 'lucide-react'
import {
  checkCompleteness,
  STATUS_META,
  TRANSPORT_LABELS,
  type FeedDelivery,
} from '@/lib/feed-deliveries'

interface FeedDeliveriesPanelProps {
  deliveries: FeedDelivery[]
}

const STATUS_DOT: Record<FeedDelivery['status'], string> = {
  processed: 'bg-emerald-500',
  processed_with_exceptions: 'bg-amber-500',
  no_changes: 'bg-slate-400',
  failed: 'bg-red-500',
}

// Ops-grid view of inbound batches, tracked through the EDM pipeline stages:
// Acquire (rows received) -> Validate (schema/identity checks) -> Master
// (merged to golden record) -> Review (changes routed to stewards).
export function FeedDeliveriesPanel({ deliveries }: FeedDeliveriesPanelProps) {
  return (
    <section>
      <h3 className="text-base font-semibold flex items-center gap-2 mb-1">
        <InboxIcon className="h-4 w-4" />
        Feed Deliveries
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Inbound batches tracked through the pipeline: acquire → validate → master → review.
        Row counts are reconciled against each delivery&apos;s manifest.
      </p>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[150px]">Delivery</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[130px]">Received</TableHead>
              <TableHead className="text-right w-[85px]">Acquired</TableHead>
              <TableHead className="text-right w-[85px]">Validated</TableHead>
              <TableHead className="text-right w-[85px]">Mastered</TableHead>
              <TableHead className="text-right w-[80px]">Review</TableHead>
              <TableHead className="text-right w-[95px]">Exceptions</TableHead>
              <TableHead className="w-[190px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map(delivery => {
              const completeness = checkCompleteness(delivery)
              const failed = delivery.status === 'failed'
              return (
                <TableRow key={delivery.id} className={failed ? 'bg-red-500/5' : undefined}>
                  <TableCell>
                    <span className="font-mono text-xs">{delivery.id}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{delivery.source}</p>
                    <p className="text-xs text-muted-foreground">{TRANSPORT_LABELS[delivery.transport]}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {new Date(delivery.receivedAt).toLocaleString('en-US', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`inline-flex items-center gap-1 ${completeness.ok ? '' : 'text-red-600 dark:text-red-400 font-medium'}`}>
                            {delivery.counts.acquired}
                            {completeness.ok ? (
                              <CheckIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangleIcon className="h-3 w-3" />
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {completeness.detail}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">{failed ? '—' : delivery.counts.validated}</TableCell>
                  <TableCell className="text-right">{failed ? '—' : delivery.counts.mastered}</TableCell>
                  <TableCell className="text-right">
                    {delivery.counts.forReview > 0 ? (
                      <span className="font-medium">{delivery.counts.forReview}</span>
                    ) : failed ? '—' : 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {delivery.counts.exceptions > 0 ? (
                      <span className="font-medium text-amber-700 dark:text-amber-400">{delivery.counts.exceptions}</span>
                    ) : failed ? '—' : 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full shrink-0 ${STATUS_DOT[delivery.status]}`} />
                      <span className="text-xs">{STATUS_META[delivery.status].label}</span>
                    </div>
                    {delivery.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">{delivery.notes}</p>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
