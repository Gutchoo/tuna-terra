import type { Property } from '@/lib/supabase'
import type { LifecycleEvent } from '@/lib/stewardship'
import type { ChangeLogEntry } from '@/contexts/StewardshipLogContext'
import { classifyProperty, describeEventSource } from '@/lib/stewardship'
import { derivePerformanceMetrics, type PropertyPerformance } from '@/lib/sample-performance'

// ============================================================================
// Structured exports: the deliverables a reference-data team distributes to
// downstream consumers — a data-health report, the lifecycle event feed,
// and the decision audit log. CSV with a metadata header block.
// ============================================================================

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toCSV(headers: string[], rows: unknown[][], meta: Record<string, string>): string {
  const metaBlock = Object.entries(meta)
    .map(([k, v]) => `# ${k}: ${v}`)
    .join('\n')
  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = rows.map(row => row.map(escapeCSV).join(',')).join('\n')
  return `${metaBlock}\n${headerRow}\n${dataRows}\n`
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const stamp = () => new Date().toISOString()
const dateSlug = () => new Date().toISOString().split('T')[0]

/** Data-health report: one row per record with classification and reasons */
export function exportDataHealthReport(properties: Property[]) {
  const rows = properties.map(p => {
    const health = classifyProperty(p)
    return [
      p.apn ?? '',
      p.address,
      p.city ?? '',
      p.state ?? '',
      p.county ?? '',
      health.status.toUpperCase(),
      health.monthsSinceVerified === null ? '' : health.monthsSinceVerified.toFixed(1),
      health.reasons.join('; '),
      p.owner ?? '',
      p.assessed_value ?? '',
      p.last_refresh_date ?? '',
    ]
  })

  const counts = rows.reduce((acc, r) => {
    const k = String(r[5]); acc[k] = (acc[k] || 0) + 1; return acc
  }, {} as Record<string, number>)

  download(
    `data-health-report-${dateSlug()}.csv`,
    toCSV(
      ['apn', 'address', 'city', 'state', 'county', 'status', 'months_since_verified', 'review_reasons', 'owner_of_record', 'assessed_value', 'last_verified'],
      rows,
      {
        report: 'Portfolio Data Health',
        generated_at: stamp(),
        records: String(properties.length),
        summary: Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' '),
        methodology: 'FRESH: county record verified <12mo. STALE: verified >12mo or undated. EXCEPTION: unresolvable identity or missing county record.',
      }
    )
  )
}

/** Lifecycle event feed: every detected change with review disposition */
export function exportLifecycleEvents(events: LifecycleEvent[], resolvedIds: Set<string>) {
  const rows = events.map(e => [
    e.detectedAt,
    e.propertyAddress,
    e.propertyId,
    e.eventType.toUpperCase(),
    e.label,
    e.field,
    e.oldValue ?? '',
    e.newValue ?? '',
    describeEventSource(e.source),
    resolvedIds.has(e.id) ? 'REVIEWED' : 'PENDING',
  ])

  download(
    `lifecycle-events-${dateSlug()}.csv`,
    toCSV(
      ['detected_at', 'address', 'record_id', 'event_type', 'field_label', 'field', 'prior_value', 'incoming_value', 'source', 'review_status'],
      rows,
      {
        report: 'Lifecycle Event Feed',
        generated_at: stamp(),
        events: String(events.length),
        pending_review: String(events.filter(e => !resolvedIds.has(e.id)).length),
      }
    )
  )
}

/** Operating statement: T12 lines + derived metrics for one asset */
export function exportPerformanceStatement(address: string, perf: PropertyPerformance) {
  const m = derivePerformanceMetrics(perf)
  const rows: unknown[][] = [
    ['income', 'gross_potential_rent', perf.income.grossPotentialRent],
    ['income', 'vacancy_credit_loss', -perf.income.vacancyLoss],
    ['income', 'other_income', perf.income.otherIncome],
    ['income', 'effective_gross_income', m.effectiveGrossIncome],
    ...perf.expenses.map(e => ['expense', e.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'), -e.annual]),
    ['expense', 'total_operating_expenses', -m.totalExpenses],
    ['result', 'net_operating_income', m.noi],
    ['debt', 'annual_debt_service', -m.annualDebtService],
    ['result', 'cash_flow_after_debt_service', m.cashFlow],
    ['metric', 'cap_rate_on_cost_pct', m.capRateOnCost.toFixed(2)],
    ['metric', 'dscr', m.dscr.toFixed(2)],
    ['metric', 'cash_on_cash_pct', m.cashOnCashPct.toFixed(2)],
    ['metric', 'occupancy_pct', m.occupancyPct.toFixed(1)],
    ['metric', 'noi_per_unit', Math.round(m.noiPerUnit)],
    ['metric', 'expense_ratio_pct', m.expenseRatioPct.toFixed(1)],
  ]

  download(
    `operating-statement-${dateSlug()}.csv`,
    toCSV(
      ['section', 'line_item', 'amount'],
      rows,
      {
        report: 'Trailing-12 Operating Statement',
        property: address,
        as_of: perf.asOf,
        source: perf.source,
        generated_at: stamp(),
        note: 'Derived metrics computed from statement lines at export time.',
      }
    )
  )
}

/** Decision audit log: every steward action with rationale */
export function exportAuditLog(entries: ChangeLogEntry[]) {
  const rows = entries.map(e => [
    e.appliedAt,
    e.propertyId,
    e.label,
    e.field,
    e.oldValue ?? '',
    e.newValue ?? '',
    e.decision.toUpperCase(),
    e.note ?? '',
    describeEventSource(e.source),
    e.appliedBy,
    e.revertedAt ?? '',
  ])

  download(
    `stewardship-audit-log-${dateSlug()}.csv`,
    toCSV(
      ['decided_at', 'record_id', 'field_label', 'field', 'prior_value', 'incoming_value', 'decision', 'decision_note', 'source', 'steward', 'reverted_at'],
      rows,
      {
        report: 'Stewardship Decision Audit Log',
        generated_at: stamp(),
        decisions: String(entries.length),
        applied: String(entries.filter(e => e.decision === 'applied').length),
        dismissed: String(entries.filter(e => e.decision === 'dismissed').length),
      }
    )
  )
}
