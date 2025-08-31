import { PropertyAssumptions } from './proforma'

export type SectionStatus = 'locked' | 'ready' | 'complete' | 'viewed'

export interface CompletionState {
  propertyIncomeComplete: boolean
  financingComplete: boolean
  taxExitComplete: boolean
  cashflowsReady: boolean
  saleAnalysisReady: boolean
  overallProgress: number
  inputSheetProgress: number
}

/**
 * Check if Property & Income section has sufficient data
 */
export function isPropertyIncomeComplete(assumptions: PropertyAssumptions): boolean {
  // Must have purchase price
  if (!assumptions.purchasePrice || assumptions.purchasePrice <= 0) {
    return false
  }

  // Must have property type selected
  if (!assumptions.propertyType) {
    return false
  }

  // Must have hold period
  if (!assumptions.holdPeriodYears || assumptions.holdPeriodYears <= 0) {
    return false
  }

  // Must have some income data for at least the first year
  const hasDetailedIncome = assumptions.potentialRentalIncome && 
                           assumptions.potentialRentalIncome.length > 0 && 
                           assumptions.potentialRentalIncome[0] > 0

  const hasLegacyIncome = assumptions.year1NOI && assumptions.year1NOI > 0

  return Boolean(hasDetailedIncome || hasLegacyIncome)
}

/**
 * Check if Financing section has sufficient data
 */
export function isFinancingComplete(assumptions: PropertyAssumptions): boolean {
  // Cash deals don't need financing details
  if (assumptions.financingType === 'cash') {
    return true
  }

  // If no financing type selected, it's not complete
  if (!assumptions.financingType) {
    return false
  }

  // For DSCR financing
  if (assumptions.financingType === 'dscr') {
    return !!(assumptions.targetDSCR && assumptions.targetDSCR > 0 &&
             assumptions.interestRate && assumptions.interestRate > 0 &&
             assumptions.loanTermYears && assumptions.loanTermYears > 0 &&
             assumptions.amortizationYears && assumptions.amortizationYears > 0)
  }

  // For LTV financing
  if (assumptions.financingType === 'ltv') {
    return !!(assumptions.targetLTV && assumptions.targetLTV > 0 &&
             assumptions.interestRate && assumptions.interestRate > 0 &&
             assumptions.loanTermYears && assumptions.loanTermYears > 0 &&
             assumptions.amortizationYears && assumptions.amortizationYears > 0)
  }

  // For manual loan amount
  return !!(assumptions.loanAmount && assumptions.loanAmount > 0 &&
           assumptions.interestRate && assumptions.interestRate > 0 &&
           assumptions.loanTermYears && assumptions.loanTermYears > 0 &&
           assumptions.amortizationYears && assumptions.amortizationYears > 0)
}

/**
 * Check if Tax & Exit section has sufficient data
 */
export function isTaxExitComplete(assumptions: PropertyAssumptions): boolean {
  // Must have tax rates
  const hasTaxRates = (assumptions.ordinaryIncomeTaxRate !== undefined && assumptions.ordinaryIncomeTaxRate >= 0) &&
                      (assumptions.capitalGainsTaxRate !== undefined && assumptions.capitalGainsTaxRate >= 0) &&
                      (assumptions.depreciationRecaptureRate !== undefined && assumptions.depreciationRecaptureRate >= 0)

  // Must have exit strategy
  const hasExitStrategy = (assumptions.dispositionPriceType === 'dollar' && assumptions.dispositionPrice > 0) ||
                         (assumptions.dispositionPriceType === 'caprate' && assumptions.dispositionCapRate > 0)

  // Must have cost of sale
  const hasCostOfSale = (assumptions.costOfSaleType === 'dollar' && assumptions.costOfSaleAmount >= 0) ||
                        (assumptions.costOfSaleType === 'percentage' && assumptions.costOfSalePercentage >= 0)

  return hasTaxRates && hasExitStrategy && hasCostOfSale
}

/**
 * Check if user can view meaningful Cashflows
 */
export function isCashflowsReady(assumptions: PropertyAssumptions): boolean {
  // Need property/income data and financing to show cashflows
  return isPropertyIncomeComplete(assumptions) && isFinancingComplete(assumptions)
}

/**
 * Check if user can view meaningful Sale Analysis
 */
export function isSaleAnalysisReady(assumptions: PropertyAssumptions): boolean {
  // Need all input data to show sale analysis
  return isPropertyIncomeComplete(assumptions) && 
         isFinancingComplete(assumptions) && 
         isTaxExitComplete(assumptions)
}

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(assumptions: PropertyAssumptions): number {
  let progress = 0
  const totalSections = 3

  if (isPropertyIncomeComplete(assumptions)) progress += 1
  if (isFinancingComplete(assumptions)) progress += 1
  if (isTaxExitComplete(assumptions)) progress += 1

  return Math.round((progress / totalSections) * 100)
}

/**
 * Calculate Input Sheet progress percentage
 */
export function calculateInputSheetProgress(assumptions: PropertyAssumptions): number {
  let points = 0
  const maxPoints = 100

  // Property & Income (40 points)
  if (assumptions.purchasePrice && assumptions.purchasePrice > 0) points += 10
  if (assumptions.propertyType) points += 5
  if (assumptions.holdPeriodYears && assumptions.holdPeriodYears > 0) points += 5
  if (assumptions.landPercentage >= 0 && assumptions.improvementsPercentage >= 0) points += 5
  
  // Income data (15 points)
  const hasIncome = (assumptions.potentialRentalIncome?.[0] > 0) || (assumptions.year1NOI && assumptions.year1NOI > 0)
  if (hasIncome) points += 15

  // Financing (25 points)
  if (assumptions.financingType) points += 5
  if (assumptions.financingType === 'cash') {
    points += 20 // Cash deals get full financing points
  } else if (assumptions.financingType) {
    if (assumptions.interestRate > 0) points += 5
    if (assumptions.loanTermYears > 0) points += 5
    if (assumptions.amortizationYears > 0) points += 5
    if (((assumptions.targetDSCR ?? 0) > 0) || ((assumptions.targetLTV ?? 0) > 0) || (assumptions.loanAmount > 0)) points += 5
  }

  // Tax & Exit (20 points)
  if (assumptions.ordinaryIncomeTaxRate >= 0) points += 3
  if (assumptions.capitalGainsTaxRate >= 0) points += 3
  if (assumptions.depreciationRecaptureRate >= 0) points += 4
  if (assumptions.dispositionPriceType) points += 5
  if (assumptions.costOfSaleType) points += 5

  return Math.min(100, points)
}

/**
 * Get the completion state for the entire model
 */
export function getCompletionState(assumptions: PropertyAssumptions): CompletionState {
  return {
    propertyIncomeComplete: isPropertyIncomeComplete(assumptions),
    financingComplete: isFinancingComplete(assumptions),
    taxExitComplete: isTaxExitComplete(assumptions),
    cashflowsReady: isCashflowsReady(assumptions),
    saleAnalysisReady: isSaleAnalysisReady(assumptions),
    overallProgress: calculateOverallProgress(assumptions),
    inputSheetProgress: calculateInputSheetProgress(assumptions)
  }
}

/**
 * Get status for a section
 */
export function getSectionStatus(
  sectionId: 'input-sheet' | 'cashflows' | 'sale',
  assumptions: PropertyAssumptions,
  viewedSections: Set<string>
): SectionStatus {
  const completion = getCompletionState(assumptions)

  if (viewedSections.has(sectionId)) {
    return 'viewed'
  }

  switch (sectionId) {
    case 'input-sheet':
      if (completion.inputSheetProgress === 100) return 'complete'
      if (completion.inputSheetProgress > 0) return 'ready'
      return 'locked'
    
    case 'cashflows':
      if (completion.cashflowsReady) return 'ready'
      return 'locked'
    
    case 'sale':
      if (completion.saleAnalysisReady) return 'ready'
      return 'locked'
    
    default:
      return 'locked'
  }
}