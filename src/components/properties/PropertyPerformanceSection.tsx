'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendingUpIcon, DatabaseIcon, DownloadIcon } from 'lucide-react'
import {
  getPropertyPerformance,
  derivePerformanceMetrics,
} from '@/lib/sample-performance'
import { exportPerformanceStatement } from '@/lib/stewardship-export'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`

interface PropertyPerformanceSectionProps {
  propertyId: string
  propertyAddress?: string
}

// Operating performance from the PM-system feed: the numbers an investor
// watches monthly. All ratios are derived on render from the stored
// statement lines — displayed metrics can never drift from source data.
export function PropertyPerformanceSection({ propertyId, propertyAddress = '' }: PropertyPerformanceSectionProps) {
  const perf = getPropertyPerformance(propertyId)
  if (!perf) return null

  const m = derivePerformanceMetrics(perf)

  const kpis = [
    { label: 'NOI (T12)', value: usd(m.noi) },
    { label: 'Cap Rate (cost)', value: pct(m.capRateOnCost, 2) },
    { label: 'DSCR', value: m.dscr.toFixed(2) },
    { label: 'Cash-on-Cash', value: pct(m.cashOnCashPct) },
    { label: 'Occupancy', value: pct(m.occupancyPct, 0) },
    { label: 'NOI / Unit', value: usd(m.noiPerUnit) },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Asset Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal gap-1.5">
              <DatabaseIcon className="h-3 w-3" />
              PM feed · as of {perf.asOf}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={() => exportPerformanceStatement(propertyAddress, perf)}
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Export T12
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI grid — derived at render from statement lines */}
        <div className="grid grid-cols-3 gap-px rounded-md border bg-border overflow-hidden">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-card p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-semibold tabular-nums tracking-tight mt-0.5">{kpi.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Ratios derived at render from the statement lines below — never stored, so they cannot drift from source.
        </p>

        {/* Acquisition & financing */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Basis & Financing
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
            <Datum label="Purchase price" value={usd(perf.acquisition.purchasePrice)} />
            <Datum label="Total basis" value={usd(m.totalBasis)} />
            <Datum label="Acquired" value={perf.acquisition.acquisitionDate} />
            <Datum label="LTV at close" value={pct(perf.financing.ltvAtClosePct, 0)} />
            <Datum label="Lender" value={perf.financing.lender} />
            <Datum label="Current balance" value={usd(perf.financing.currentBalance)} />
            <Datum label="Rate / Amort" value={`${perf.financing.ratePct}% / ${perf.financing.amortYears}yr`} />
            <Datum label="Debt service (mo)" value={usd(perf.financing.monthlyPayment)} />
          </div>
        </div>

        <Separator />

        {/* Unit mix */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Unit Mix ({m.totalUnits} units · {m.occupiedUnits} occupied)
          </p>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Avg SF</TableHead>
                  <TableHead className="text-right">Market Rent</TableHead>
                  <TableHead className="text-right">Occupied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perf.unitMix.map(u => (
                  <TableRow key={u.type}>
                    <TableCell className="font-medium">{u.type}</TableCell>
                    <TableCell className="text-right">{u.units}</TableCell>
                    <TableCell className="text-right">{u.avgSqft.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{usd(u.marketRent)}</TableCell>
                    <TableCell className="text-right">{u.occupied}/{u.units}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* T12 income statement */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Trailing-12 Operating Statement
          </p>
          <div className="rounded-md border overflow-hidden text-sm">
            <StatementRow label="Gross potential rent" value={perf.income.grossPotentialRent} />
            <StatementRow label="Vacancy & credit loss" value={-perf.income.vacancyLoss} />
            <StatementRow label="Other income" value={perf.income.otherIncome} />
            <StatementRow label="Effective gross income" value={m.effectiveGrossIncome} emphasis />
            {perf.expenses.map(e => (
              <StatementRow key={e.label} label={e.label} value={-e.annual} indent />
            ))}
            <StatementRow label={`Total expenses (${pct(m.expenseRatioPct, 0)} of EGI)`} value={-m.totalExpenses} emphasis />
            <StatementRow label="Net operating income" value={m.noi} emphasis />
            <StatementRow label="Annual debt service" value={-m.annualDebtService} />
            <StatementRow label="Cash flow after debt service" value={m.cashFlow} emphasis final />
          </div>
        </div>

        {/* Collections */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Rent Collections (last 3 months)
          </p>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Billed</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Collection %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perf.collections.map(c => {
                  const rate = (c.collected / c.billed) * 100
                  return (
                    <TableRow key={c.month}>
                      <TableCell className="font-medium">{c.month}</TableCell>
                      <TableCell className="text-right">{usd(c.billed)}</TableCell>
                      <TableCell className="text-right">{usd(c.collected)}</TableCell>
                      <TableCell className={`text-right ${rate < 97 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
                        {pct(rate)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <DatabaseIcon className="h-3 w-3" />
          Source: {perf.source}
        </p>
      </CardContent>
    </Card>
  )
}

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums break-words">{value}</p>
    </div>
  )
}

function StatementRow({
  label,
  value,
  emphasis = false,
  indent = false,
  final = false,
}: {
  label: string
  value: number
  emphasis?: boolean
  indent?: boolean
  final?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 border-b last:border-b-0 ${
        emphasis ? 'bg-muted/40 font-medium' : ''
      } ${final ? 'bg-muted/60' : ''}`}
    >
      <span className={indent ? 'pl-4 text-muted-foreground' : ''}>{label}</span>
      <span className={`tabular-nums ${value < 0 ? 'text-muted-foreground' : ''}`}>
        {value < 0 ? `(${usd(Math.abs(value))})` : usd(value)}
      </span>
    </div>
  )
}
