import type { Property } from '@/lib/supabase'
import type { LifecycleEvent } from '@/lib/stewardship'

// ============================================================================
// Demo-mode county feed simulation.
// Real refreshes cost Regrid lookups, so the demo "feed check" replays a
// deterministic set of lifecycle events against whatever enriched properties
// are on screen — same shapes the live refresh endpoint returns.
// ============================================================================

interface SimulatedChange {
  field: string
  label: string
  eventType: LifecycleEvent['eventType']
  /** Derive old/new display values from the current record */
  derive: (property: Property) => { oldValue: string | null; newValue: string } | null
}

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// One scenario per slot, applied to enriched properties in display order.
// Written to read like a real overnight vendor delta.
const SCENARIOS: SimulatedChange[][] = [
  [
    {
      field: 'assessed_value',
      label: 'Assessed value',
      eventType: 'valuation',
      derive: p => {
        if (!p.assessed_value) return null
        const next = Math.round(p.assessed_value * 1.07)
        return { oldValue: money(p.assessed_value), newValue: money(next) }
      },
    },
    {
      field: 'tax_year',
      label: 'Tax year',
      eventType: 'attribute',
      // Only derive from a value actually present in the record — a simulated
      // change must trace back to the stored/raw payload
      derive: p => {
        if (!p.tax_year) return null
        const next = String(parseInt(p.tax_year) + 1)
        return { oldValue: p.tax_year, newValue: next }
      },
    },
  ],
  [
    {
      field: 'owner',
      label: 'Owner of record',
      eventType: 'ownership',
      derive: p => {
        if (!p.owner) return null
        return { oldValue: p.owner, newValue: `${p.owner.split(' ')[0]} PROPCO II LLC` }
      },
    },
    {
      field: 'owner_mailing_address',
      label: 'Owner mailing address',
      eventType: 'ownership',
      derive: p => {
        if (!p.owner_mailing_address) return null
        return {
          oldValue: p.owner_mailing_address,
          newValue: '712 FIFTH AVE, FLOOR 30, NEW YORK, NY 10019',
        }
      },
    },
  ],
  [
    {
      field: 'last_sale_price',
      label: 'Last sale price',
      eventType: 'sale',
      derive: p => {
        const base = p.assessed_value || 50_000_000
        return { oldValue: p.last_sale_price ? money(p.last_sale_price) : null, newValue: money(Math.round(base * 1.12)) }
      },
    },
    {
      field: 'sale_date',
      label: 'Last sale date',
      eventType: 'sale',
      derive: p => ({ oldValue: p.sale_date || null, newValue: '2026-06-17' }),
    },
  ],
  [
    {
      field: 'zoning',
      label: 'Zoning',
      eventType: 'zoning',
      derive: p => {
        if (!p.zoning) return null
        return { oldValue: p.zoning, newValue: `${p.zoning} (PUD overlay)` }
      },
    },
  ],
]

/**
 * Simulate an overnight county feed check for the demo. Deterministic:
 * the Nth enriched property gets the Nth scenario. Returns events in the
 * same shape as the live refresh endpoint.
 */
export function simulateCountyFeedCheck(properties: Property[]): LifecycleEvent[] {
  const enriched = properties.filter(p => p.owner || p.assessed_value)
  const now = new Date().toISOString()
  const events: LifecycleEvent[] = []

  enriched.slice(0, SCENARIOS.length).forEach((property, index) => {
    for (const change of SCENARIOS[index]) {
      const derived = change.derive(property)
      if (!derived) continue
      events.push({
        id: `sim-${property.id}-${change.field}`,
        propertyId: property.id,
        propertyAddress: property.address,
        field: change.field,
        label: change.label,
        oldValue: derived.oldValue,
        newValue: derived.newValue,
        eventType: change.eventType,
        source: 'simulated',
        detectedAt: now,
      })
    }
  })

  return events
}
