export interface CapRateInputs {
  noi: number
  price: number
}

export interface CapRateResults {
  capRate: number
  capRatePercentage: string
  valueFromCapRate?: number
}

export interface CapRateSensitivity {
  capRate: number
  value: number
}

/**
 * Calculate capitalization rate from NOI and property value
 */
export function calculateCapRate(inputs: CapRateInputs): CapRateResults {
  const { noi, price } = inputs

  if (price <= 0) {
    throw new Error('Property price must be greater than 0')
  }

  const capRate = noi / price
  const capRatePercentage = (capRate * 100).toFixed(2)

  return {
    capRate,
    capRatePercentage: `${capRatePercentage}%`,
  }
}

/**
 * Calculate property value from NOI and target cap rate
 */
export function calculateValueFromCapRate(noi: number, targetCapRate: number): number {
  if (targetCapRate <= 0) {
    throw new Error('Cap rate must be greater than 0')
  }

  return noi / targetCapRate
}

/**
 * Generate sensitivity analysis for cap rate vs property value
 */
export function generateCapRateSensitivity(
  noi: number,
  baseCapRate: number,
  range: number = 0.02,
  steps: number = 10
): CapRateSensitivity[] {
  const sensitivity: CapRateSensitivity[] = []
  const stepSize = (range * 2) / steps

  for (let i = 0; i <= steps; i++) {
    const capRate = Math.max(0.001, baseCapRate - range + (i * stepSize))
    const value = calculateValueFromCapRate(noi, capRate)
    
    sensitivity.push({
      capRate: Math.round(capRate * 10000) / 100, // Convert to percentage with 2 decimals
      value: Math.round(value)
    })
  }

  return sensitivity
}

/**
 * Validate cap rate inputs
 */
export function validateCapRateInputs(inputs: Partial<CapRateInputs>): string[] {
  const errors: string[] = []

  if (!inputs.noi || inputs.noi <= 0) {
    errors.push('NOI must be greater than 0')
  }

  if (!inputs.price || inputs.price <= 0) {
    errors.push('Property price must be greater than 0')
  }

  if (inputs.noi && inputs.price && inputs.noi > inputs.price) {
    errors.push('NOI cannot exceed property price')
  }

  return errors
}