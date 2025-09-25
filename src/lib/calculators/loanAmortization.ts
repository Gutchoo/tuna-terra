export interface LoanAmortizationInputs {
  loanAmount: number
  interestRate: number // annual rate as decimal
  loanTermYears: number
  extraPayment?: number // additional monthly payment
  paymentFrequency?: 'monthly' | 'bi-weekly' | 'weekly'
}

export interface AmortizationEntry {
  paymentNumber: number
  paymentDate: Date
  paymentAmount: number
  principalPayment: number
  interestPayment: number
  extraPayment: number
  totalPayment: number
  remainingBalance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

export interface LoanAmortizationResults {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  payoffDate: Date
  amortizationSchedule: AmortizationEntry[]
  summary: {
    originalLoanAmount: number
    totalAmountPaid: number
    totalInterestPaid: number
    totalExtraPayments: number
    interestSaved: number
    timeSaved: string // e.g., "2 years, 3 months"
  }
}

/**
 * Calculate monthly payment (PMT formula)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number
): number {
  if (annualRate === 0) {
    return loanAmount / (loanTermYears * 12)
  }

  const monthlyRate = annualRate / 12
  const numberOfPayments = loanTermYears * 12

  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
}

/**
 * Generate full amortization schedule
 */
export function generateAmortizationSchedule(inputs: LoanAmortizationInputs): LoanAmortizationResults {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    extraPayment = 0,
    paymentFrequency = 'monthly'
  } = inputs

  // Calculate payment frequency multiplier
  const paymentsPerYear = paymentFrequency === 'weekly' ? 52 : 
                         paymentFrequency === 'bi-weekly' ? 26 : 12
  
  const periodicRate = interestRate / paymentsPerYear
  const totalPayments = loanTermYears * paymentsPerYear
  
  // Calculate base payment amount
  let basePayment: number
  if (interestRate === 0) {
    basePayment = loanAmount / totalPayments
  } else {
    basePayment = (loanAmount * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                  (Math.pow(1 + periodicRate, totalPayments) - 1)
  }

  const schedule: AmortizationEntry[] = []
  let remainingBalance = loanAmount
  let paymentNumber = 1
  const currentDate = new Date()
  let cumulativeInterest = 0
  let cumulativePrincipal = 0
  let totalExtraPayments = 0

  // Calculate original loan totals for comparison
  const originalMonthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears)
  const originalTotalInterest = (originalMonthlyPayment * loanTermYears * 12) - loanAmount

  while (remainingBalance > 0.01 && paymentNumber <= totalPayments + 120) { // Safety limit
    const interestPayment = remainingBalance * periodicRate
    let principalPayment = basePayment - interestPayment
    let actualExtraPayment = extraPayment

    // Ensure we don't overpay
    if (principalPayment + actualExtraPayment > remainingBalance) {
      principalPayment = remainingBalance - actualExtraPayment
      if (principalPayment < 0) {
        actualExtraPayment = remainingBalance
        principalPayment = 0
      }
    }

    const totalPayment = principalPayment + interestPayment + actualExtraPayment
    remainingBalance -= (principalPayment + actualExtraPayment)
    
    cumulativeInterest += interestPayment
    cumulativePrincipal += principalPayment
    totalExtraPayments += actualExtraPayment

    schedule.push({
      paymentNumber,
      paymentDate: new Date(currentDate),
      paymentAmount: basePayment,
      principalPayment,
      interestPayment,
      extraPayment: actualExtraPayment,
      totalPayment,
      remainingBalance: Math.max(0, remainingBalance),
      cumulativeInterest,
      cumulativePrincipal,
    })

    // Advance date based on payment frequency
    if (paymentFrequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7)
    } else if (paymentFrequency === 'bi-weekly') {
      currentDate.setDate(currentDate.getDate() + 14)
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    paymentNumber++

    // Break if balance is paid off
    if (remainingBalance <= 0.01) break
  }

  const payoffDate = schedule[schedule.length - 1]?.paymentDate || new Date()
  const totalAmountPaid = schedule.reduce((sum, entry) => sum + entry.totalPayment, 0)
  const interestSaved = originalTotalInterest - cumulativeInterest

  // Calculate time saved
  const originalPayoffMonths = loanTermYears * 12
  const actualPayoffMonths = schedule.length * (12 / paymentsPerYear)
  const monthsSaved = originalPayoffMonths - actualPayoffMonths
  const yearsSaved = Math.floor(monthsSaved / 12)
  const remainingMonthsSaved = Math.round(monthsSaved % 12)
  
  let timeSaved = ''
  if (yearsSaved > 0) {
    timeSaved += `${yearsSaved} year${yearsSaved !== 1 ? 's' : ''}`
    if (remainingMonthsSaved > 0) {
      timeSaved += `, ${remainingMonthsSaved} month${remainingMonthsSaved !== 1 ? 's' : ''}`
    }
  } else if (remainingMonthsSaved > 0) {
    timeSaved = `${remainingMonthsSaved} month${remainingMonthsSaved !== 1 ? 's' : ''}`
  } else {
    timeSaved = 'None'
  }

  return {
    monthlyPayment: basePayment,
    totalPayments: schedule.length,
    totalInterest: cumulativeInterest,
    payoffDate,
    amortizationSchedule: schedule,
    summary: {
      originalLoanAmount: loanAmount,
      totalAmountPaid,
      totalInterestPaid: cumulativeInterest,
      totalExtraPayments,
      interestSaved,
      timeSaved,
    },
  }
}

/**
 * Calculate loan balance at specific point in time
 */
export function calculateRemainingBalance(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  paymentsMade: number
): number {
  if (interestRate === 0) {
    const totalPayments = loanTermYears * 12
    return Math.max(0, loanAmount - (loanAmount * paymentsMade / totalPayments))
  }

  const monthlyRate = interestRate / 12
  const totalPayments = loanTermYears * 12
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears)

  if (paymentsMade >= totalPayments) return 0

  const factor = Math.pow(1 + monthlyRate, totalPayments - paymentsMade)
  return loanAmount * factor - monthlyPayment * (factor - 1) / monthlyRate
}

/**
 * Calculate total interest for loan
 */
export function calculateTotalInterest(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  extraPayment: number = 0
): number {
  if (extraPayment > 0) {
    const schedule = generateAmortizationSchedule({
      loanAmount,
      interestRate,
      loanTermYears,
      extraPayment,
    })
    return schedule.totalInterest
  }

  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears)
  return (monthlyPayment * loanTermYears * 12) - loanAmount
}

/**
 * Validate loan amortization inputs
 */
export function validateLoanAmortizationInputs(inputs: Partial<LoanAmortizationInputs>): string[] {
  const errors: string[] = []

  if (!inputs.loanAmount || inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0')
  }

  if (inputs.loanAmount && inputs.loanAmount > 100000000) {
    errors.push('Loan amount must be less than $100,000,000')
  }

  if (inputs.interestRate === undefined || inputs.interestRate < 0) {
    errors.push('Interest rate must be 0 or greater')
  }

  if (inputs.interestRate && inputs.interestRate > 1) {
    errors.push('Interest rate must be less than 100%')
  }

  if (!inputs.loanTermYears || inputs.loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0')
  }

  if (inputs.loanTermYears && inputs.loanTermYears > 50) {
    errors.push('Loan term must be 50 years or less')
  }

  if (inputs.extraPayment && inputs.extraPayment < 0) {
    errors.push('Extra payment cannot be negative')
  }

  // Check if extra payment is reasonable compared to loan amount
  if (inputs.extraPayment && inputs.loanAmount && inputs.loanTermYears) {
    const basePayment = calculateMonthlyPayment(inputs.loanAmount, inputs.interestRate || 0, inputs.loanTermYears)
    if (inputs.extraPayment > basePayment * 10) {
      errors.push('Extra payment seems unusually high compared to base payment')
    }
  }

  return errors
}

/**
 * Generate sample real estate loan data
 */
export function generateSampleRealEstateLoan(): LoanAmortizationInputs {
  return {
    loanAmount: 800000,
    interestRate: 0.065,
    loanTermYears: 30,
    extraPayment: 500,
    paymentFrequency: 'monthly',
  }
}