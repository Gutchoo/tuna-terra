export interface TVMInputs {
  presentValue?: number
  futureValue?: number
  interestRate: number // annual rate as decimal (0.05 for 5%)
  periods: number // number of years
  payment?: number // annual payment
}

export interface TVMResults {
  presentValue?: number
  futureValue?: number
  payment?: number
  totalInterest: number
  totalPayments: number
}

export interface TVMGrowthPoint {
  period: number
  value: number
  cumulativeInterest: number
}

/**
 * Calculate Future Value from Present Value
 */
export function calculateFutureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods)
}

/**
 * Calculate Present Value from Future Value
 */
export function calculatePresentValue(fv: number, rate: number, periods: number): number {
  return fv / Math.pow(1 + rate, periods)
}

/**
 * Calculate Payment for annuity (PMT)
 */
export function calculatePayment(pv: number, rate: number, periods: number): number {
  if (rate === 0) return pv / periods
  return (pv * rate) / (1 - Math.pow(1 + rate, -periods))
}

/**
 * Calculate Present Value of annuity from payment
 */
export function calculatePVFromPayment(payment: number, rate: number, periods: number): number {
  if (rate === 0) return payment * periods
  return payment * (1 - Math.pow(1 + rate, -periods)) / rate
}

/**
 * Solve TVM equation for missing variable
 */
export function solveTVM(inputs: TVMInputs): TVMResults {
  const { presentValue, futureValue, interestRate, periods, payment } = inputs

  const result: TVMResults = {
    totalInterest: 0,
    totalPayments: 0,
  }

  // Count non-null inputs to determine what to solve for
  const hasInputs = {
    pv: presentValue !== undefined && presentValue !== null,
    fv: futureValue !== undefined && futureValue !== null,
    pmt: payment !== undefined && payment !== null,
  }

  if (hasInputs.pv && hasInputs.fv) {
    // Both PV and FV provided - this is a simple compound interest case
    result.presentValue = presentValue!
    result.futureValue = futureValue!
    result.totalInterest = futureValue! - presentValue!
  } else if (hasInputs.pv && !hasInputs.fv && !hasInputs.pmt) {
    // Solve for FV
    const fv = calculateFutureValue(presentValue!, interestRate, periods)
    result.presentValue = presentValue!
    result.futureValue = fv
    result.totalInterest = fv - presentValue!
  } else if (!hasInputs.pv && hasInputs.fv && !hasInputs.pmt) {
    // Solve for PV
    const pv = calculatePresentValue(futureValue!, interestRate, periods)
    result.presentValue = pv
    result.futureValue = futureValue!
    result.totalInterest = futureValue! - pv
  } else if (hasInputs.pv && !hasInputs.fv && !hasInputs.pmt) {
    // Solve for PMT (loan payment)
    const pmt = calculatePayment(presentValue!, interestRate, periods)
    result.presentValue = presentValue!
    result.payment = pmt
    result.totalPayments = pmt * periods
    result.totalInterest = result.totalPayments - presentValue!
  } else if (!hasInputs.pv && !hasInputs.fv && hasInputs.pmt) {
    // Solve for PV from payment (present value of annuity)
    const pv = calculatePVFromPayment(payment!, interestRate, periods)
    result.presentValue = pv
    result.payment = payment!
    result.totalPayments = payment! * periods
    result.totalInterest = result.totalPayments - pv
  }

  return result
}

/**
 * Generate growth timeline for visualization
 */
export function generateGrowthTimeline(
  initialValue: number,
  rate: number,
  periods: number,
  payment?: number
): TVMGrowthPoint[] {
  const timeline: TVMGrowthPoint[] = []
  let currentValue = initialValue
  let cumulativeInterest = 0

  for (let period = 0; period <= periods; period++) {
    timeline.push({
      period,
      value: Math.round(currentValue * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    })

    if (period < periods) {
      const interestEarned = currentValue * rate
      cumulativeInterest += interestEarned
      
      if (payment) {
        currentValue = currentValue + interestEarned - payment
      } else {
        currentValue = currentValue + interestEarned
      }
    }
  }

  return timeline
}

/**
 * Validate TVM inputs
 */
export function validateTVMInputs(inputs: Partial<TVMInputs>): string[] {
  const errors: string[] = []

  if (inputs.interestRate === undefined) {
    errors.push('Interest rate is required')
  } else if (inputs.interestRate < -1 || inputs.interestRate > 1) {
    errors.push('Interest rate must be between -100% and 100%')
  }

  if (!inputs.periods || inputs.periods <= 0 || inputs.periods > 100) {
    errors.push('Periods must be between 1 and 100')
  }

  // Check that at least one value is provided to solve for another
  const hasValues = [
    inputs.presentValue,
    inputs.futureValue,
    inputs.payment
  ].filter(v => v !== undefined && v !== null).length

  if (hasValues === 0) {
    errors.push('At least one of Present Value, Future Value, or Payment must be provided')
  }

  return errors
}