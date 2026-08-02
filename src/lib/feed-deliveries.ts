// ============================================================================
// Feed delivery telemetry, modeled on the EDM (enterprise data management)
// pipeline: every inbound batch is tracked through Acquire -> Validate ->
// Master -> Distribute, with row counts and exceptions at each stage.
// This is the ops surface a reference-data team monitors each morning.
// ============================================================================

export type DeliveryStatus = 'processed' | 'processed_with_exceptions' | 'no_changes' | 'failed'

export interface StageCounts {
  /** Rows received in the delivery */
  acquired: number
  /** Rows passing schema/type/identity validation */
  validated: number
  /** Rows matched and merged into the golden record */
  mastered: number
  /** Changes surfaced for steward review (lifecycle events) */
  forReview: number
  /** Rows rejected or routed to the exception queue */
  exceptions: number
}

export interface FeedDelivery {
  id: string
  source: string
  /** Transport the batch arrived by */
  transport: 'sftp-file' | 'api-pull' | 'manual-upload'
  receivedAt: string
  status: DeliveryStatus
  counts: StageCounts
  /** Expected row count from the delivery manifest, for completeness checks */
  expectedRecords: number | null
  notes?: string
}

export const TRANSPORT_LABELS: Record<FeedDelivery['transport'], string> = {
  'sftp-file': 'SFTP file',
  'api-pull': 'API pull',
  'manual-upload': 'Manual upload',
}

export const STATUS_META: Record<DeliveryStatus, { label: string }> = {
  processed: { label: 'Processed' },
  processed_with_exceptions: { label: 'Processed w/ exceptions' },
  no_changes: { label: 'No changes' },
  failed: { label: 'Failed' },
}

/** Completeness check: did the delivery arrive with the manifest's row count? */
export function checkCompleteness(delivery: FeedDelivery): { ok: boolean; detail: string } {
  if (delivery.expectedRecords === null) {
    return { ok: true, detail: 'No manifest count provided' }
  }
  if (delivery.counts.acquired === delivery.expectedRecords) {
    return { ok: true, detail: `${delivery.counts.acquired} of ${delivery.expectedRecords} expected rows received` }
  }
  return {
    ok: false,
    detail: `Short delivery: ${delivery.counts.acquired} of ${delivery.expectedRecords} expected rows`,
  }
}

/**
 * Seeded delivery history for the demo — reads like a normal week of feeds:
 * daily county pulls, a monthly PM close, a geocoding batch, and one prior
 * short delivery that was caught and re-requested.
 */
export function getSeededDeliveries(): FeedDelivery[] {
  return [
    {
      id: 'PM-2026-07M',
      source: 'Property management system (monthly close)',
      transport: 'api-pull',
      receivedAt: '2026-07-31T07:31:00',
      status: 'processed',
      counts: { acquired: 1, validated: 1, mastered: 1, forReview: 0, exceptions: 0 },
      expectedRecords: 1,
      notes: 'Plaza Suites July operating statement and rent roll',
    },
    {
      id: 'CNTY-2026-0729',
      source: 'County assessor (Regrid)',
      transport: 'api-pull',
      receivedAt: '2026-07-29T06:02:00',
      status: 'no_changes',
      counts: { acquired: 11, validated: 11, mastered: 11, forReview: 0, exceptions: 0 },
      expectedRecords: 11,
    },
    {
      id: 'CNTY-2026-0722',
      source: 'County assessor (Regrid)',
      transport: 'api-pull',
      receivedAt: '2026-07-22T06:05:00',
      status: 'failed',
      counts: { acquired: 7, validated: 0, mastered: 0, forReview: 0, exceptions: 0 },
      expectedRecords: 11,
      notes: 'Short delivery vs. manifest (7 of 11). Rejected at acquire; full batch re-requested and processed 07-23.',
    },
    {
      id: 'GEO-2026-0715',
      source: 'Geocoding batch (Google)',
      transport: 'api-pull',
      receivedAt: '2026-07-15T06:12:00',
      status: 'processed',
      counts: { acquired: 11, validated: 11, mastered: 11, forReview: 0, exceptions: 0 },
      expectedRecords: 11,
    },
  ]
}

let liveDeliverySeq = 0

/** Build a delivery record from a live feed-check run */
export function buildLiveDelivery(params: {
  recordCount: number
  eventCount: number
  exceptionCount: number
  source: string
}): FeedDelivery {
  liveDeliverySeq += 1
  const now = new Date()
  const dateSlug = now.toISOString().slice(0, 10).replace(/-/g, '')
  const validated = params.recordCount - params.exceptionCount

  return {
    id: `CNTY-${dateSlug}-${String(liveDeliverySeq).padStart(2, '0')}`,
    source: params.source,
    transport: 'api-pull',
    receivedAt: now.toISOString(),
    status:
      params.exceptionCount > 0
        ? 'processed_with_exceptions'
        : params.eventCount > 0
          ? 'processed'
          : 'no_changes',
    counts: {
      acquired: params.recordCount,
      validated,
      mastered: validated,
      forReview: params.eventCount,
      exceptions: params.exceptionCount,
    },
    expectedRecords: params.recordCount,
  }
}
