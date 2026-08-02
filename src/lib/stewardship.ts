import type { Property } from '@/lib/supabase'

// ============================================================================
// Data stewardship: health classification and lifecycle event detection.
// Mirrors a reference-data workflow: county records are the vendor feed,
// user-entered fields are internal data, properties are the securities.
// ============================================================================

export type DataHealthStatus = 'fresh' | 'stale' | 'exception'

export interface DataHealthResult {
  status: DataHealthStatus
  reasons: string[]
  /** Months since the county record was last verified, if known */
  monthsSinceVerified: number | null
}

export interface LifecycleEvent {
  id: string
  propertyId: string
  propertyAddress: string
  field: string
  label: string
  oldValue: string | null
  newValue: string | null
  eventType: 'ownership' | 'valuation' | 'sale' | 'zoning' | 'attribute'
  source: 'county-refresh' | 'simulated'
  detectedAt: string
}

/** County data older than this is considered stale */
export const STALE_THRESHOLD_MONTHS = 12

function monthsSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const then = new Date(dateStr)
  if (isNaN(then.getTime())) return null
  return (Date.now() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
}

/**
 * Classify a property's data health.
 * - exception: needs human review (unresolvable identity or missing county record)
 * - stale: county record exists but is past the freshness threshold
 * - fresh: verified county record within threshold
 */
export function classifyProperty(property: Property): DataHealthResult {
  const reasons: string[] = []

  // Identity checks — without an APN the record can't be matched to the feed
  if (!property.apn) {
    reasons.push('No parcel number (APN) — cannot match to county records')
  }
  if (property.apn && !property.state) {
    reasons.push('APN without state — parcel numbers repeat across counties')
  }

  // County record presence — enriched records always carry an owner or valuation
  const hasCountyRecord = Boolean(
    property.owner || property.assessed_value || property.regrid_updated_at || property.last_refresh_date
  )
  if (!hasCountyRecord) {
    reasons.push('No county assessor record on file')
  } else {
    if (!property.owner) reasons.push('Missing owner of record')
    if (!property.assessed_value) reasons.push('Missing assessed value')
    if (!property.lat || !property.lng) reasons.push('Missing coordinates — will not appear on map')
  }

  const verified = property.last_refresh_date || property.regrid_updated_at
  const age = monthsSince(verified)

  if (reasons.length > 0) {
    return { status: 'exception', reasons, monthsSinceVerified: age }
  }

  if (age === null || age > STALE_THRESHOLD_MONTHS) {
    return {
      status: 'stale',
      reasons: [
        age === null
          ? 'County record has no verification date'
          : `County record last verified ${Math.floor(age)} months ago`,
      ],
      monthsSinceVerified: age,
    }
  }

  return { status: 'fresh', reasons: [], monthsSinceVerified: age }
}

/** Fields we watch for lifecycle events, with display metadata */
const WATCHED_FIELDS: Array<{
  field: keyof Property
  label: string
  eventType: LifecycleEvent['eventType']
  format?: (v: unknown) => string
}> = [
  { field: 'owner', label: 'Owner of record', eventType: 'ownership' },
  { field: 'owner_mailing_address', label: 'Owner mailing address', eventType: 'ownership' },
  { field: 'assessed_value', label: 'Assessed value', eventType: 'valuation', format: formatMoney },
  { field: 'land_value', label: 'Land value', eventType: 'valuation', format: formatMoney },
  { field: 'improvement_value', label: 'Improvement value', eventType: 'valuation', format: formatMoney },
  { field: 'last_sale_price', label: 'Last sale price', eventType: 'sale', format: formatMoney },
  { field: 'sale_date', label: 'Last sale date', eventType: 'sale' },
  { field: 'zoning', label: 'Zoning', eventType: 'zoning' },
  { field: 'zoning_description', label: 'Zoning description', eventType: 'zoning' },
  { field: 'use_description', label: 'Land use', eventType: 'zoning' },
  { field: 'year_built', label: 'Year built', eventType: 'attribute' },
  { field: 'num_units', label: 'Unit count', eventType: 'attribute' },
]

function formatMoney(v: unknown): string {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  if (n == null || isNaN(n)) return String(v ?? '')
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Diff two versions of a property record and emit lifecycle events for
 * watched fields that changed. Used after a county refresh (and by the
 * demo simulator).
 */
export function diffPropertyRecords(
  before: Partial<Property>,
  after: Partial<Property>,
  meta: { propertyId: string; propertyAddress: string; source: LifecycleEvent['source'] }
): LifecycleEvent[] {
  const events: LifecycleEvent[] = []
  const now = new Date().toISOString()

  for (const watched of WATCHED_FIELDS) {
    const oldRaw = before[watched.field]
    const newRaw = after[watched.field]

    // Normalize for comparison: treat '', null, undefined as absent
    const oldNorm = oldRaw === '' || oldRaw == null ? null : String(oldRaw)
    const newNorm = newRaw === '' || newRaw == null ? null : String(newRaw)

    if (oldNorm === newNorm) continue
    // A value disappearing on refresh is usually a feed gap, not an event
    if (newNorm === null) continue

    const fmt = watched.format || ((v: unknown) => String(v))
    events.push({
      id: `${meta.propertyId}-${watched.field}-${now}`,
      propertyId: meta.propertyId,
      propertyAddress: meta.propertyAddress,
      field: watched.field,
      label: watched.label,
      oldValue: oldNorm === null ? null : fmt(oldRaw),
      newValue: fmt(newRaw),
      eventType: watched.eventType,
      source: meta.source,
      detectedAt: now,
    })
  }

  return events
}
