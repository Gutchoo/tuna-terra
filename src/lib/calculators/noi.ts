export interface NOIInputs {
  grossRentalIncome: number
  vacancyRate: number // as decimal (0.05 for 5%)
  otherIncome: number
  operatingExpenses: number
}

export interface NOIResults {
  grossRentalIncome: number
  vacancyLoss: number
  effectiveGrossIncome: number
  netOperatingIncome: number
  operatingExpenseRatio: number
  operatingExpenseRatioPercentage: string
}

export interface NOIWaterfallStep {
  label: string
  value: number
  isSubtraction: boolean
}

/**
 * Calculate Net Operating Income (NOI)
 */
export function calculateNOI(inputs: NOIInputs): NOIResults {
  const { grossRentalIncome, vacancyRate, otherIncome, operatingExpenses } = inputs

  const vacancyLoss = grossRentalIncome * vacancyRate
  const effectiveGrossIncome = grossRentalIncome - vacancyLoss + otherIncome
  const netOperatingIncome = effectiveGrossIncome - operatingExpenses
  
  const operatingExpenseRatio = effectiveGrossIncome > 0 ? operatingExpenses / effectiveGrossIncome : 0
  const operatingExpenseRatioPercentage = (operatingExpenseRatio * 100).toFixed(1)

  return {
    grossRentalIncome,
    vacancyLoss,
    effectiveGrossIncome,
    netOperatingIncome,
    operatingExpenseRatio,
    operatingExpenseRatioPercentage: `${operatingExpenseRatioPercentage}%`,
  }
}

/**
 * Generate waterfall breakdown for NOI calculation
 */
export function generateNOIWaterfall(inputs: NOIInputs): NOIWaterfallStep[] {
  const { grossRentalIncome, vacancyRate, otherIncome, operatingExpenses } = inputs
  const vacancyLoss = grossRentalIncome * vacancyRate

  return [
    {
      label: 'Gross Rental Income',
      value: grossRentalIncome,
      isSubtraction: false,
    },
    {
      label: `Vacancy Loss (${(vacancyRate * 100).toFixed(1)}%)`,
      value: vacancyLoss,
      isSubtraction: true,
    },
    {
      label: 'Other Income',
      value: otherIncome,
      isSubtraction: false,
    },
    {
      label: 'Operating Expenses',
      value: operatingExpenses,
      isSubtraction: true,
    },
  ]
}

/**
 * Validate NOI inputs
 */
export function validateNOIInputs(inputs: Partial<NOIInputs>): string[] {
  const errors: string[] = []

  if (!inputs.grossRentalIncome || inputs.grossRentalIncome < 0) {
    errors.push('Gross rental income must be 0 or greater')
  }

  if (inputs.vacancyRate === undefined || inputs.vacancyRate < 0 || inputs.vacancyRate > 1) {
    errors.push('Vacancy rate must be between 0% and 100%')
  }

  if (inputs.otherIncome === undefined || inputs.otherIncome < 0) {
    errors.push('Other income must be 0 or greater')
  }

  if (inputs.operatingExpenses === undefined || inputs.operatingExpenses < 0) {
    errors.push('Operating expenses must be 0 or greater')
  }

  return errors
}