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

/** Fields whose event values are money-formatted strings that must be parsed back to numbers */
export const NUMERIC_EVENT_FIELDS = new Set(['assessed_value', 'land_value', 'improvement_value', 'last_sale_price'])

/** Convert an event's display value back to a storable field value */
export function parseEventValue(field: string, value: string | null): string | number | null {
  if (value == null) return null
  if (NUMERIC_EVENT_FIELDS.has(field)) {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
    return isNaN(parsed) ? null : parsed
  }
  return value
}

/** Human-readable provenance for an event source */
export function describeEventSource(source: LifecycleEvent['source']): string {
  return source === 'county-refresh'
    ? 'County assessor feed (Regrid API)'
    : 'Simulated county feed (demo)'
}

// ============================================================================
// Verification checks: automated review signals a steward inspects before
// applying or dismissing an incoming change.
// ============================================================================

export interface VerificationCheck {
  label: string
  status: 'pass' | 'warn' | 'info'
  detail: string
}

function parseMoney(v: string | null): number | null {
  if (!v) return null
  const n = parseFloat(v.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

/**
 * Build review signals for an event: parcel identity, magnitude sanity,
 * cross-field corroboration within the same feed batch, and provenance.
 */
export function buildVerificationChecks(
  event: LifecycleEvent,
  property: Property | undefined,
  batchEvents: LifecycleEvent[]
): VerificationCheck[] {
  const checks: VerificationCheck[] = []

  // 1. Parcel identity — can this record be tied unambiguously to the feed?
  if (property?.apn && property?.state) {
    checks.push({
      label: 'Parcel identity',
      status: 'pass',
      detail: `Matched on APN ${property.apn}${property.county ? `, ${property.county} county` : ''}, ${property.state}`,
    })
  } else {
    checks.push({
      label: 'Parcel identity',
      status: 'warn',
      detail: 'Record lacks a full APN + state identity — confirm the feed matched the right parcel',
    })
  }

  // 2. Magnitude sanity for money fields
  if (NUMERIC_EVENT_FIELDS.has(event.field)) {
    const oldN = parseMoney(event.oldValue)
    const newN = parseMoney(event.newValue)
    if (oldN && newN) {
      const pct = ((newN - oldN) / oldN) * 100
      const pctLabel = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
      if (Math.abs(pct) <= 15) {
        checks.push({
          label: 'Magnitude check',
          status: 'pass',
          detail: `${pctLabel} — within typical annual reassessment range (±15%)`,
        })
      } else {
        checks.push({
          label: 'Magnitude check',
          status: 'warn',
          detail: `${pctLabel} — large move; verify against county tax roll before applying`,
        })
      }
    } else if (newN && !oldN) {
      checks.push({
        label: 'Magnitude check',
        status: 'info',
        detail: 'No prior value on file — this fills a gap rather than changing a value',
      })
    }
  }

  // 3. Ownership plausibility — related-entity transfers are common and low-risk
  if (event.eventType === 'ownership' && event.field === 'owner' && event.oldValue && event.newValue) {
    const oldTokens = new Set(event.oldValue.toUpperCase().split(/[^A-Z0-9]+/).filter(t => t.length > 2))
    const newTokens = event.newValue.toUpperCase().split(/[^A-Z0-9]+/).filter(t => t.length > 2)
    const shared = newTokens.some(t => oldTokens.has(t))
    checks.push({
      label: 'Ownership continuity',
      status: shared ? 'info' : 'warn',
      detail: shared
        ? 'New owner shares naming with prior owner — likely related-entity transfer'
        : 'New owner is unrelated to prior owner — confirm a deed transfer was recorded',
    })
  }

  // 4. Cross-field corroboration within the same batch
  const siblings = batchEvents.filter(e => e.propertyId === event.propertyId && e.id !== event.id)
  if (event.eventType === 'sale') {
    const pairedField = event.field === 'last_sale_price' ? 'sale_date' : 'last_sale_price'
    const paired = siblings.find(e => e.field === pairedField)
    checks.push({
      label: 'Corroboration',
      status: paired ? 'pass' : 'warn',
      detail: paired
        ? `Arrived with a matching ${paired.label.toLowerCase()} change (${paired.newValue}) — consistent with a recorded transaction`
        : 'No paired sale field in this batch — a lone sale change may be a data correction, not a transaction',
    })
  } else if (event.eventType === 'ownership') {
    const paired = siblings.find(e => e.eventType === 'ownership' && e.id !== event.id)
    if (paired) {
      checks.push({
        label: 'Corroboration',
        status: 'pass',
        detail: `Arrived with a matching ${paired.label.toLowerCase()} change — consistent with an ownership transfer`,
      })
    }
  } else if (siblings.length > 0) {
    checks.push({
      label: 'Corroboration',
      status: 'info',
      detail: `${siblings.length} other change${siblings.length === 1 ? '' : 's'} for this parcel in the same batch`,
    })
  }

  // 5. Record freshness context
  const verified = property?.last_refresh_date || property?.regrid_updated_at
  if (verified) {
    checks.push({
      label: 'Prior verification',
      status: 'info',
      detail: `Record last verified ${verified} — this is the first change since`,
    })
  }

  return checks
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
