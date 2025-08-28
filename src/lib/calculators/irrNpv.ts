export interface CashFlow {
  period: number
  amount: number
  description?: string
}

export interface IRRNPVInputs {
  cashFlows: CashFlow[]
  discountRate: number // as decimal (0.10 for 10%)
}

export interface IRRNPVResults {
  npv: number
  irr: number | null
  irrPercentage: string
  totalCashIn: number
  totalCashOut: number
  netCashFlow: number
  paybackPeriod: number | null
}

/**
 * Calculate Net Present Value (NPV)
 */
export function calculateNPV(cashFlows: CashFlow[], discountRate: number): number {
  return cashFlows.reduce((npv, cashFlow) => {
    const presentValue = cashFlow.amount / Math.pow(1 + discountRate, cashFlow.period)
    return npv + presentValue
  }, 0)
}

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 */
export function calculateIRR(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length < 2) return null

  // Initial guess
  let rate = 0.1
  let iteration = 0
  const maxIterations = 1000
  const tolerance = 0.000001

  while (iteration < maxIterations) {
    let npv = 0
    let dnpv = 0

    for (const cashFlow of cashFlows) {
      const period = cashFlow.period
      if (period === 0) {
        npv += cashFlow.amount
      } else {
        const factor = Math.pow(1 + rate, period)
        npv += cashFlow.amount / factor
        dnpv -= (cashFlow.amount * period) / (factor * (1 + rate))
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate
    }

    if (Math.abs(dnpv) < tolerance) {
      return null // Derivative too small, no solution found
    }

    const newRate = rate - npv / dnpv

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate
    }

    rate = newRate
    iteration++
  }

  return null // No solution found within iterations
}

/**
 * Calculate payback period (simple, not discounted)
 */
export function calculatePaybackPeriod(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length === 0) return null

  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period)
  let cumulativeCashFlow = 0

  for (const cashFlow of sortedCashFlows) {
    cumulativeCashFlow += cashFlow.amount

    if (cumulativeCashFlow >= 0 && cashFlow.period > 0) {
      return cashFlow.period
    }
  }

  return null // Payback never achieved
}

/**
 * Analyze cash flows and calculate all metrics
 */
export function analyzeIRRNPV(inputs: IRRNPVInputs): IRRNPVResults {
  const { cashFlows, discountRate } = inputs

  const npv = calculateNPV(cashFlows, discountRate)
  const irr = calculateIRR(cashFlows)
  const paybackPeriod = calculatePaybackPeriod(cashFlows)

  const totalCashIn = cashFlows
    .filter(cf => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0)

  const totalCashOut = Math.abs(
    cashFlows
      .filter(cf => cf.amount < 0)
      .reduce((sum, cf) => sum + cf.amount, 0)
  )

  const netCashFlow = totalCashIn - totalCashOut

  return {
    npv,
    irr,
    irrPercentage: irr ? `${(irr * 100).toFixed(2)}%` : 'N/A',
    totalCashIn,
    totalCashOut,
    netCashFlow,
    paybackPeriod,
  }
}

/**
 * Generate sample real estate cash flows
 */
export function generateSampleRealEstateCashFlows(): CashFlow[] {
  return [
    { period: 0, amount: -500000, description: 'Initial Investment' },
    { period: 1, amount: 50000, description: 'Year 1 Cash Flow' },
    { period: 2, amount: 52000, description: 'Year 2 Cash Flow' },
    { period: 3, amount: 54000, description: 'Year 3 Cash Flow' },
    { period: 4, amount: 56000, description: 'Year 4 Cash Flow' },
    { period: 5, amount: 650000, description: 'Year 5 Cash Flow + Sale' },
  ]
}

/**
 * Validate IRR/NPV inputs
 */
export function validateIRRNPVInputs(inputs: Partial<IRRNPVInputs>): string[] {
  const errors: string[] = []

  if (!inputs.cashFlows || inputs.cashFlows.length === 0) {
    errors.push('At least one cash flow is required')
  } else {
    // Check for valid periods
    const periods = inputs.cashFlows.map(cf => cf.period)
    if (periods.some(p => p < 0)) {
      errors.push('All periods must be 0 or greater')
    }

    // Check for duplicate periods
    const uniquePeriods = new Set(periods)
    if (uniquePeriods.size !== periods.length) {
      errors.push('Each period can only have one cash flow')
    }

    // Check that we have both positive and negative cash flows for meaningful IRR
    const hasPositive = inputs.cashFlows.some(cf => cf.amount > 0)
    const hasNegative = inputs.cashFlows.some(cf => cf.amount < 0)

    if (!hasPositive || !hasNegative) {
      errors.push('Cash flows must include both inflows (positive) and outflows (negative) for meaningful analysis')
    }
  }

  if (inputs.discountRate === undefined) {
    errors.push('Discount rate is required')
  } else if (inputs.discountRate < -1 || inputs.discountRate > 2) {
    errors.push('Discount rate must be between -100% and 200%')
  }

  return errors
}