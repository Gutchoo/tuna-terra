// ============================================================================
// Asset performance data: what an investor monitors monthly on an operating
// property — acquisition basis, financing, unit mix, trailing-12 income
// statement, and rent collections. In production this arrives as a feed from
// the property management system; the demo ships a textbook-style sample.
// ============================================================================

export interface UnitMixEntry {
  type: string
  units: number
  avgSqft: number
  marketRent: number
  occupied: number
}

export interface ExpenseLine {
  label: string
  annual: number
}

export interface MonthlyCollection {
  month: string
  billed: number
  collected: number
  occupancyPct: number
}

export interface PropertyPerformance {
  /** Statement period end */
  asOf: string
  /** Where this data arrives from — provenance, same as the county feed */
  source: string
  acquisition: {
    purchasePrice: number
    closingCosts: number
    acquisitionDate: string
  }
  financing: {
    lender: string
    originalBalance: number
    currentBalance: number
    ratePct: number
    amortYears: number
    maturityDate: string
    monthlyPayment: number
    ltvAtClosePct: number
  }
  unitMix: UnitMixEntry[]
  income: {
    grossPotentialRent: number
    vacancyLoss: number
    otherIncome: number
  }
  expenses: ExpenseLine[]
  /** Trailing 3 months of rent collections from the PM feed */
  collections: MonthlyCollection[]
}

// Derived metrics — computed, never stored (single source of truth)
export function derivePerformanceMetrics(perf: PropertyPerformance) {
  const totalUnits = perf.unitMix.reduce((s, u) => s + u.units, 0)
  const occupiedUnits = perf.unitMix.reduce((s, u) => s + u.occupied, 0)
  const effectiveGrossIncome =
    perf.income.grossPotentialRent - perf.income.vacancyLoss + perf.income.otherIncome
  const totalExpenses = perf.expenses.reduce((s, e) => s + e.annual, 0)
  const noi = effectiveGrossIncome - totalExpenses
  const annualDebtService = perf.financing.monthlyPayment * 12
  const totalBasis = perf.acquisition.purchasePrice + perf.acquisition.closingCosts
  const equity = totalBasis - perf.financing.originalBalance
  const cashFlow = noi - annualDebtService

  return {
    totalUnits,
    occupiedUnits,
    occupancyPct: totalUnits ? (occupiedUnits / totalUnits) * 100 : 0,
    effectiveGrossIncome,
    totalExpenses,
    noi,
    annualDebtService,
    totalBasis,
    capRateOnCost: totalBasis ? (noi / totalBasis) * 100 : 0,
    dscr: annualDebtService ? noi / annualDebtService : 0,
    cashFlow,
    cashOnCashPct: equity ? (cashFlow / equity) * 100 : 0,
    noiPerUnit: totalUnits ? noi / totalUnits : 0,
    expenseRatioPct: effectiveGrossIncome ? (totalExpenses / effectiveGrossIncome) * 100 : 0,
  }
}

// ----------------------------------------------------------------------------
// Plaza Suites — 20-unit garden apartment, classic acquisition-analysis sample
// ----------------------------------------------------------------------------
const PLAZA_SUITES_PERFORMANCE: PropertyPerformance = {
  asOf: '2026-07-31',
  source: 'Property management system feed (monthly close)',
  acquisition: {
    purchasePrice: 2_400_000,
    closingCosts: 48_000,
    acquisitionDate: '2023-06-15',
  },
  financing: {
    lender: 'Pacific Western Bank',
    originalBalance: 1_800_000,
    currentBalance: 1_752_340,
    ratePct: 6.5,
    amortYears: 30,
    maturityDate: '2033-07-01',
    monthlyPayment: 11_378,
    ltvAtClosePct: 75,
  },
  unitMix: [
    { type: '1BR / 1BA', units: 8, avgSqft: 650, marketRent: 1_150, occupied: 8 },
    { type: '2BR / 1BA', units: 12, avgSqft: 900, marketRent: 1_450, occupied: 11 },
  ],
  income: {
    grossPotentialRent: 319_200,
    vacancyLoss: 15_960,
    otherIncome: 9_600,
  },
  expenses: [
    { label: 'Property taxes', annual: 30_000 },
    { label: 'Insurance', annual: 14_400 },
    { label: 'Repairs & maintenance', annual: 22_000 },
    { label: 'Property management (8% EGI)', annual: 25_027 },
    { label: 'Utilities', annual: 18_600 },
    { label: 'Turnover & landscaping', annual: 6_800 },
    { label: 'Replacement reserves', annual: 10_000 },
  ],
  collections: [
    { month: '2026-05', billed: 25_900, collected: 25_900, occupancyPct: 95 },
    { month: '2026-06', billed: 25_900, collected: 25_320, occupancyPct: 95 },
    { month: '2026-07', billed: 25_900, collected: 24_750, occupancyPct: 95 },
  ],
}

/** Performance data keyed by property id (demo: sample fixtures only) */
const PERFORMANCE_BY_PROPERTY: Record<string, PropertyPerformance> = {
  'sample-property-plaza-suites': PLAZA_SUITES_PERFORMANCE,
}

export function getPropertyPerformance(propertyId: string): PropertyPerformance | null {
  return PERFORMANCE_BY_PROPERTY[propertyId] ?? null
}
