export interface DSCRInputs {
  noi: number
  annualDebtService?: number
  loanAmount?: number
  interestRate?: number // annual rate as decimal
  loanTermYears?: number
  amortizationYears?: number
}

export interface DSCRResults {
  dscr: number
  dscrFormatted: string
  annualDebtService: number
  monthlyPayment: number
  isHealthy: boolean
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High'
  interpretation: string
}

export interface LoanSummary {
  loanAmount: number
  interestRate: number
  loanTermYears: number
  amortizationYears: number
  monthlyPayment: number
  annualDebtService: number
  totalInterestPaid: number
  totalPayments: number
}

/**
 * Calculate monthly mortgage payment (PMT)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (annualRate === 0) {
    return loanAmount / (amortizationYears * 12)
  }

  const monthlyRate = annualRate / 12
  const numberOfPayments = amortizationYears * 12

  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
}

/**
 * Calculate annual debt service from loan parameters
 */
export function calculateAnnualDebtService(
  loanAmount: number,
  interestRate: number,
  amortizationYears: number
): number {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, amortizationYears)
  return monthlyPayment * 12
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 */
export function calculateDSCR(noi: number, annualDebtService: number): number {
  if (annualDebtService === 0) return Infinity
  return noi / annualDebtService
}

/**
 * Determine DSCR risk level and interpretation
 */
export function analyzeDSCR(dscr: number): {
  isHealthy: boolean
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High'
  interpretation: string
} {
  if (dscr >= 1.5) {
    return {
      isHealthy: true,
      riskLevel: 'Low',
      interpretation: 'Excellent coverage ratio. Property generates strong cash flow relative to debt service.',
    }
  } else if (dscr >= 1.25) {
    return {
      isHealthy: true,
      riskLevel: 'Moderate',
      interpretation: 'Good coverage ratio. Property comfortably covers debt service with reasonable margin.',
    }
  } else if (dscr >= 1.0) {
    return {
      isHealthy: false,
      riskLevel: 'High',
      interpretation: 'Marginal coverage ratio. Property barely covers debt service. High risk of cash flow issues.',
    }
  } else {
    return {
      isHealthy: false,
      riskLevel: 'Very High',
      interpretation: 'Inadequate coverage ratio. Property cannot cover debt service from operating income.',
    }
  }
}

/**
 * Comprehensive DSCR analysis
 */
export function analyzeDSCRInputs(inputs: DSCRInputs): DSCRResults {
  let annualDebtService: number

  // Calculate annual debt service if not provided directly
  if (inputs.annualDebtService) {
    annualDebtService = inputs.annualDebtService
  } else if (
    inputs.loanAmount &&
    inputs.interestRate !== undefined &&
    inputs.amortizationYears
  ) {
    annualDebtService = calculateAnnualDebtService(
      inputs.loanAmount,
      inputs.interestRate,
      inputs.amortizationYears
    )
  } else {
    throw new Error('Either annual debt service or loan details (amount, rate, term) must be provided')
  }

  const dscr = calculateDSCR(inputs.noi, annualDebtService)
  const analysis = analyzeDSCR(dscr)
  const monthlyPayment = annualDebtService / 12

  return {
    dscr,
    dscrFormatted: `${dscr.toFixed(2)}x`,
    annualDebtService,
    monthlyPayment,
    ...analysis,
  }
}

/**
 * Generate loan summary with full details
 */
export function generateLoanSummary(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  amortizationYears: number = loanTermYears
): LoanSummary {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, amortizationYears)
  const annualDebtService = monthlyPayment * 12
  const totalPayments = monthlyPayment * loanTermYears * 12
  const totalInterestPaid = totalPayments - loanAmount

  return {
    loanAmount,
    interestRate,
    loanTermYears,
    amortizationYears,
    monthlyPayment,
    annualDebtService,
    totalInterestPaid,
    totalPayments,
  }
}

/**
 * Calculate maximum loan amount for target DSCR
 */
export function calculateMaxLoanAmount(
  noi: number,
  targetDSCR: number,
  interestRate: number,
  amortizationYears: number
): number {
  const maxAnnualDebtService = noi / targetDSCR
  const maxMonthlyPayment = maxAnnualDebtService / 12

  if (interestRate === 0) {
    return maxMonthlyPayment * amortizationYears * 12
  }

  const monthlyRate = interestRate / 12
  const numberOfPayments = amortizationYears * 12

  return (maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
         (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
}

/**
 * Validate DSCR inputs
 */
export function validateDSCRInputs(inputs: Partial<DSCRInputs>): string[] {
  const errors: string[] = []

  if (!inputs.noi || inputs.noi <= 0) {
    errors.push('NOI must be greater than 0')
  }

  // Check if we have either direct debt service or loan calculation inputs
  const hasDirectDebtService = inputs.annualDebtService && inputs.annualDebtService > 0
  const hasLoanInputs = inputs.loanAmount && 
                        inputs.interestRate !== undefined && 
                        inputs.amortizationYears

  if (!hasDirectDebtService && !hasLoanInputs) {
    errors.push('Either provide annual debt service directly OR loan amount, interest rate, and amortization period')
  }

  if (inputs.annualDebtService && inputs.annualDebtService < 0) {
    errors.push('Annual debt service must be 0 or greater')
  }

  if (inputs.loanAmount && inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0')
  }

  if (inputs.interestRate !== undefined && (inputs.interestRate < 0 || inputs.interestRate > 1)) {
    errors.push('Interest rate must be between 0% and 100%')
  }

  if (inputs.loanTermYears && inputs.loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0')
  }

  if (inputs.amortizationYears && inputs.amortizationYears <= 0) {
    errors.push('Amortization period must be greater than 0')
  }

  if (inputs.loanTermYears && inputs.amortizationYears && 
      inputs.loanTermYears > inputs.amortizationYears) {
    errors.push('Loan term cannot exceed amortization period')
  }

  return errors
}