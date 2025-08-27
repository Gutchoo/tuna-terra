export interface PropertyAssumptions {
  // Property Details
  purchasePrice: number
  acquisitionCosts: number // closing costs, due diligence, etc.
  acquisitionCostType: 'percentage' | 'dollar' | '' // whether acquisition costs are percentage or dollar amount
  
  // Income Assumptions - Detailed Year-by-Year
  potentialRentalIncome: number[]  // Array of up to 30 years
  otherIncome: number[]            // Array of up to 30 years for additional income
  vacancyRates: number[]           // Array of up to 30 years (as decimals 0-1)
  operatingExpenses: number[]      // Array of up to 30 years 
  operatingExpenseType: 'percentage' | 'dollar' | '' // whether operating expenses are percentage or dollar amount
  
  // Detailed Expense Categories (all arrays up to 30 years)
  propertyTaxes: number[]
  insurance: number[]
  maintenance: number[]
  propertyManagement: number[]
  utilities: number[]
  otherExpenses: number[]
  
  // Auto-population helpers (optional)
  rentalIncomeGrowthRate?: number    // For auto-populating rental income increases
  defaultVacancyRate?: number        // For auto-populating vacancy rates
  defaultOperatingExpenseRate?: number  // For auto-populating operating expenses
  
  // Legacy fields (for backward compatibility during transition)
  year1NOI?: number
  noiGrowthRate?: number // annual percentage
  
  // Financing
  financingType: 'dscr' | 'ltv' | 'cash' | '' // Financing method selector
  loanAmount: number
  interestRate: number // annual rate as decimal
  loanTermYears: number
  amortizationYears: number
  paymentsPerYear: number // 1, 2, 4, 12 (annual, semi-annual, quarterly, monthly)
  loanCosts: number // as percentage of loan amount
  
  // DSCR-specific fields
  targetDSCR?: number // Debt Service Coverage Ratio target
  
  // LTV-specific fields  
  targetLTV?: number // Loan-to-Value ratio target
  
  // Tax & Depreciation
  propertyType: 'residential' | 'commercial' | 'industrial' | ''
  depreciationYears: number
  landPercentage: number // 0-100
  improvementsPercentage: number // 0-100 (must sum to 100 with landPercentage)
  taxRate: number // combined federal + state rate
  
  // Exit Strategy
  holdPeriodYears: number
  exitCapRate?: number
  salePrice?: number
  sellingCosts: number // percentage of sale price
}

export interface AnnualCashflow {
  year: number
  noi: number
  debtService: number
  beforeTaxCashflow: number
  depreciation: number
  taxableIncome: number
  taxes: number
  afterTaxCashflow: number
  loanBalance: number
}

export interface SaleProceeds {
  salePrice: number
  sellingCosts: number
  netSaleProceeds: number
  loanBalance: number
  beforeTaxSaleProceeds: number
  capitalGains: number
  deprecationRecapture: number
  taxesOnSale: number
  afterTaxSaleProceeds: number
}

export interface ProFormaResults {
  totalEquityInvested: number
  annualCashflows: AnnualCashflow[]
  saleProceeds: SaleProceeds
  totalCashReturned: number
  netProfit: number
  irr: number | null
  equityMultiple: number
  averageCashOnCash: number
  totalTaxSavings: number
}

/**
 * Calculate monthly payment for loan
 */
export function calculatePeriodicPayment(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number,
  paymentsPerYear: number = 12
): number {
  if (loanAmount === 0) {
    return 0
  }
  
  if (annualRate === 0) {
    return loanAmount / (amortizationYears * paymentsPerYear)
  }

  const periodicRate = annualRate / paymentsPerYear
  const numberOfPayments = amortizationYears * paymentsPerYear

  return (loanAmount * periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) /
         (Math.pow(1 + periodicRate, numberOfPayments) - 1)
}

// Legacy function for backward compatibility
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number
): number {
  return calculatePeriodicPayment(loanAmount, annualRate, amortizationYears, 12)
}

/**
 * Calculate remaining loan balance after specified payments
 */
export function calculateLoanBalance(
  originalAmount: number,
  annualRate: number,
  amortizationYears: number,
  paymentsMade: number,
  paymentsPerYear: number = 12
): number {
  if (originalAmount === 0) {
    return 0
  }
  
  if (annualRate === 0) {
    const totalPayments = amortizationYears * paymentsPerYear
    const principalPerPayment = originalAmount / totalPayments
    return Math.max(0, originalAmount - (principalPerPayment * paymentsMade))
  }

  const periodicRate = annualRate / paymentsPerYear
  const totalPayments = amortizationYears * paymentsPerYear
  const periodicPayment = calculatePeriodicPayment(originalAmount, annualRate, amortizationYears, paymentsPerYear)

  if (paymentsMade >= totalPayments) return 0

  const factor = Math.pow(1 + periodicRate, totalPayments - paymentsMade)
  return originalAmount * factor - periodicPayment * (factor - 1) / periodicRate
}

/**
 * Calculate depreciation for a given year
 */
export function calculateDepreciation(
  depreciableBasis: number,
  propertyType: string,
  depreciationYears: number,
  year: number
): number {
  if (year > depreciationYears) return 0
  
  // Simple straight-line depreciation
  // In reality, real estate uses MACRS with half-year convention, but this simplifies
  return depreciableBasis / depreciationYears
}

/**
 * Estimate sale price based on NOI and cap rate
 */
export function estimateSalePrice(finalYearNOI: number, exitCapRate: number): number {
  return finalYearNOI / exitCapRate
}

/**
 * Calculate IRR using Newton-Raphson method
 */
export function calculateIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null
  
  let rate = 0.1 // Initial guess
  const maxIterations = 1000
  const tolerance = 0.000001

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let npv = 0
    let dnpv = 0

    for (let i = 0; i < cashFlows.length; i++) {
      const factor = Math.pow(1 + rate, i)
      npv += cashFlows[i] / factor
      if (i > 0) {
        dnpv -= (cashFlows[i] * i) / (factor * (1 + rate))
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate
    }

    if (Math.abs(dnpv) < tolerance) {
      return null // Derivative too small
    }

    const newRate = rate - npv / dnpv
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate
    }

    rate = newRate
  }

  return null
}

/**
 * Main ProForma calculation engine
 */
export class ProFormaCalculator {
  private assumptions: PropertyAssumptions

  constructor(assumptions: PropertyAssumptions) {
    this.assumptions = assumptions
  }

  calculate(): ProFormaResults {
    const {
      purchasePrice,
      acquisitionCosts,
      potentialRentalIncome,
      vacancyRates,
      operatingExpenses,
      operatingExpenseType,
      loanAmount,
      interestRate,
      amortizationYears,
      paymentsPerYear,
      loanCosts,
      propertyType,
      depreciationYears,
      taxRate,
      holdPeriodYears,
      exitCapRate,
      salePrice,
      sellingCosts,
      // Legacy fields for fallback
      year1NOI,
      noiGrowthRate,
    } = this.assumptions

    // Calculate acquisition costs based on type
    const actualAcquisitionCosts = this.assumptions.acquisitionCostType === 'percentage' 
      ? purchasePrice * (acquisitionCosts / 100)
      : acquisitionCosts

    // Calculate loan costs
    const actualLoanCosts = loanAmount > 0 ? (loanCosts / 100) * loanAmount : 0
    
    // Calculate equity invested (includes loan costs)
    const totalEquityInvested = purchasePrice + actualAcquisitionCosts + actualLoanCosts - loanAmount

    // Calculate annual debt service using the specified payment frequency
    const periodicPayment = calculatePeriodicPayment(loanAmount, interestRate, amortizationYears, paymentsPerYear || 12)
    const annualDebtService = periodicPayment * (paymentsPerYear || 12)

    // Depreciable basis (property value excluding land - uses improvements percentage)
    const depreciableBasis = purchasePrice * (this.assumptions.improvementsPercentage / 100)

    // Generate annual cashflows
    const annualCashflows: AnnualCashflow[] = []
    let cumulativeDepreciation = 0

    for (let year = 1; year <= holdPeriodYears; year++) {
      // Calculate NOI from detailed income structure
      let noi: number
      
      if (potentialRentalIncome && potentialRentalIncome.length > 0 && potentialRentalIncome[year - 1] > 0) {
        // Use detailed income structure
        const grossIncome = potentialRentalIncome[year - 1] || 0
        const vacancyAmount = grossIncome * (vacancyRates?.[year - 1] || 0)
        const effectiveGrossIncome = grossIncome - vacancyAmount
        
        let opEx = 0
        if (operatingExpenses && operatingExpenses[year - 1] !== undefined) {
          if (operatingExpenseType === 'percentage') {
            // Operating expenses as percentage of effective gross income (after vacancy)
            opEx = effectiveGrossIncome * ((operatingExpenses[year - 1] || 0) / 100)
          } else {
            opEx = operatingExpenses[year - 1] || 0
          }
        }
        
        noi = effectiveGrossIncome - opEx
      } else {
        // Fallback to legacy calculation if detailed structure not available
        noi = (year1NOI || 0) * Math.pow(1 + (noiGrowthRate || 0), year - 1)
      }
      
      // Before-tax cash flow
      const beforeTaxCashflow = noi - annualDebtService
      
      // Depreciation
      const depreciation = calculateDepreciation(depreciableBasis, propertyType, depreciationYears, year)
      cumulativeDepreciation += depreciation
      
      // Taxable income (could be negative)
      const taxableIncome = beforeTaxCashflow - depreciation
      
      // Taxes (negative if tax shield)
      const taxes = taxableIncome * taxRate
      
      // After-tax cash flow
      const afterTaxCashflow = beforeTaxCashflow - taxes
      
      // Loan balance at end of year
      const paymentsThisYear = year * (paymentsPerYear || 12)
      const loanBalance = calculateLoanBalance(loanAmount, interestRate, amortizationYears, paymentsThisYear, paymentsPerYear || 12)

      annualCashflows.push({
        year,
        noi,
        debtService: annualDebtService,
        beforeTaxCashflow,
        depreciation,
        taxableIncome,
        taxes,
        afterTaxCashflow,
        loanBalance,
      })
    }

    // Calculate sale proceeds
    const finalYearNOI = annualCashflows[annualCashflows.length - 1].noi
    const finalLoanBalance = annualCashflows[annualCashflows.length - 1].loanBalance
    
    const estimatedSalePrice = salePrice || (exitCapRate ? estimateSalePrice(finalYearNOI, exitCapRate) : purchasePrice)
    const sellingCostsAmount = estimatedSalePrice * sellingCosts
    const netSaleProceeds = estimatedSalePrice - sellingCostsAmount
    const beforeTaxSaleProceeds = netSaleProceeds - finalLoanBalance
    
    // Capital gains and depreciation recapture
    const capitalGains = Math.max(0, estimatedSalePrice - purchasePrice - cumulativeDepreciation)
    const depreciationRecapture = Math.min(cumulativeDepreciation, Math.max(0, estimatedSalePrice - purchasePrice))
    
    // Simplified tax calculation (real world is more complex)
    const capitalGainsTaxRate = taxRate * 0.6 // Assume 60% of ordinary rate for simplicity
    const recaptureTaxRate = 0.25 // 25% depreciation recapture rate
    const taxesOnSale = (capitalGains * capitalGainsTaxRate) + (depreciationRecapture * recaptureTaxRate)
    
    const afterTaxSaleProceeds = beforeTaxSaleProceeds - taxesOnSale

    const saleProceeds: SaleProceeds = {
      salePrice: estimatedSalePrice,
      sellingCosts: sellingCostsAmount,
      netSaleProceeds,
      loanBalance: finalLoanBalance,
      beforeTaxSaleProceeds,
      capitalGains,
      deprecationRecapture: depreciationRecapture,
      taxesOnSale,
      afterTaxSaleProceeds,
    }

    // Calculate total returns
    const totalAfterTaxCashflows = annualCashflows.reduce((sum, cf) => sum + cf.afterTaxCashflow, 0)
    const totalCashReturned = totalAfterTaxCashflows + afterTaxSaleProceeds
    const netProfit = totalCashReturned - totalEquityInvested

    // Calculate IRR using after-tax cash flows
    const irrCashFlows = [
      -totalEquityInvested, // Initial investment (negative)
      ...annualCashflows.slice(0, -1).map(cf => cf.afterTaxCashflow), // Annual cash flows
      annualCashflows[annualCashflows.length - 1].afterTaxCashflow + afterTaxSaleProceeds // Final year + sale
    ]
    const irr = calculateIRR(irrCashFlows)

    // Other metrics
    const equityMultiple = totalCashReturned / totalEquityInvested
    const averageCashOnCash = (totalAfterTaxCashflows / holdPeriodYears) / totalEquityInvested
    const totalTaxSavings = annualCashflows.reduce((sum, cf) => sum + Math.max(0, -cf.taxes), 0)

    return {
      totalEquityInvested,
      annualCashflows,
      saleProceeds,
      totalCashReturned,
      netProfit,
      irr,
      equityMultiple,
      averageCashOnCash,
      totalTaxSavings,
    }
  }

  updateAssumptions(newAssumptions: Partial<PropertyAssumptions>) {
    this.assumptions = { ...this.assumptions, ...newAssumptions }
  }

  getAssumptions(): PropertyAssumptions {
    return { ...this.assumptions }
  }
}

/**
 * Generate sample real estate investment assumptions
 */
export function generateSampleAssumptions(): PropertyAssumptions {
  // Generate sample rental income with 3% growth
  const baseRental = 240000 // $240k gross rental income
  const rentalIncomeArray = Array(10).fill(0).map((_, i) => baseRental * Math.pow(1.03, i))
  
  return {
    purchasePrice: 2000000,
    acquisitionCosts: 4, // 4% of purchase price
    acquisitionCostType: 'percentage' as const,
    // New detailed income structure
    potentialRentalIncome: rentalIncomeArray,
    otherIncome: Array(30).fill(0),
    vacancyRates: Array(10).fill(0.05), // 5% vacancy
    operatingExpenses: Array(10).fill(40), // 40% of income
    operatingExpenseType: 'percentage' as const,
    // Detailed expense categories
    propertyTaxes: Array(30).fill(0),
    insurance: Array(30).fill(0),
    maintenance: Array(30).fill(0),
    propertyManagement: Array(30).fill(0),
    utilities: Array(30).fill(0),
    otherExpenses: Array(30).fill(0),
    rentalIncomeGrowthRate: 3, // 3% annual growth
    defaultVacancyRate: 5, // 5% vacancy
    defaultOperatingExpenseRate: 40, // 40% operating ratio
    // Legacy fields for backward compatibility
    year1NOI: 180000,
    noiGrowthRate: 0.03, // 3% annual growth
    // Enhanced financing structure
    financingType: 'ltv' as const,
    loanAmount: 1400000, // 70% LTV
    interestRate: 0.065, // 6.5%
    loanTermYears: 10,
    amortizationYears: 30,
    paymentsPerYear: 12, // Monthly payments
    loanCosts: 2.0, // 2% loan costs
    targetLTV: 70, // 70% LTV target
    propertyType: 'commercial',
    depreciationYears: 39, // Commercial real estate
    landPercentage: 20, // 20% land value
    improvementsPercentage: 80, // 80% improvements value
    taxRate: 0.35, // Combined federal + state
    holdPeriodYears: 10,
    exitCapRate: 0.075, // 7.5% exit cap rate
    sellingCosts: 0.06, // 6% selling costs
  }
}

/**
 * Validate pro forma assumptions
 */
export function validateAssumptions(assumptions: Partial<PropertyAssumptions>): string[] {
  const errors: string[] = []

  if (!assumptions.purchasePrice || assumptions.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0')
  }

  // Check income structure - either detailed or legacy
  const hasDetailedIncome = assumptions.potentialRentalIncome && 
                           assumptions.potentialRentalIncome.length > 0 && 
                           assumptions.potentialRentalIncome[0] > 0
  const hasLegacyIncome = assumptions.year1NOI && assumptions.year1NOI > 0

  if (!hasDetailedIncome && !hasLegacyIncome) {
    errors.push('Either detailed income structure or Year 1 NOI must be provided')
  }

  // Validate detailed income structure if provided
  if (hasDetailedIncome && assumptions.holdPeriodYears) {
    for (let i = 0; i < assumptions.holdPeriodYears; i++) {
      if (!assumptions.potentialRentalIncome![i] || assumptions.potentialRentalIncome![i] <= 0) {
        errors.push(`Year ${i + 1} rental income must be greater than 0`)
        break // Only show first missing year
      }
      
      if (assumptions.vacancyRates && assumptions.vacancyRates[i] !== undefined) {
        if (assumptions.vacancyRates[i] < 0 || assumptions.vacancyRates[i] > 1) {
          errors.push(`Year ${i + 1} vacancy rate must be between 0% and 100%`)
          break
        }
      }
      
      if (assumptions.operatingExpenses && assumptions.operatingExpenses[i] !== undefined) {
        if (assumptions.operatingExpenseType === 'percentage' && 
            (assumptions.operatingExpenses[i] < 0 || assumptions.operatingExpenses[i] > 100)) {
          errors.push(`Year ${i + 1} operating expenses must be between 0% and 100%`)
          break
        } else if (assumptions.operatingExpenseType === 'dollar' && assumptions.operatingExpenses[i] < 0) {
          errors.push(`Year ${i + 1} operating expenses must be positive`)
          break
        }
      }
    }
  }

  // Validate legacy fields if used
  if (assumptions.noiGrowthRate !== undefined && (assumptions.noiGrowthRate < -0.5 || assumptions.noiGrowthRate > 1)) {
    errors.push('NOI growth rate must be between -50% and 100%')
  }

  if (assumptions.loanAmount === undefined || assumptions.loanAmount < 0) {
    errors.push('Loan amount must be 0 or greater')
  }

  if (assumptions.loanAmount && assumptions.purchasePrice && assumptions.loanAmount > assumptions.purchasePrice) {
    errors.push('Loan amount cannot exceed purchase price')
  }

  if (assumptions.interestRate === undefined || assumptions.interestRate < 0 || assumptions.interestRate > 1) {
    errors.push('Interest rate must be between 0% and 100%')
  }

  if (!assumptions.holdPeriodYears || assumptions.holdPeriodYears <= 0 || assumptions.holdPeriodYears > 50) {
    errors.push('Hold period must be between 1 and 50 years')
  }

  if (assumptions.taxRate === undefined || assumptions.taxRate < 0 || assumptions.taxRate > 1) {
    errors.push('Tax rate must be between 0% and 100%')
  }

  if (assumptions.exitCapRate && (assumptions.exitCapRate <= 0 || assumptions.exitCapRate > 1)) {
    errors.push('Exit cap rate must be between 0% and 100%')
  }
  
  // Land/Improvements validation
  if (assumptions.landPercentage !== undefined && assumptions.improvementsPercentage !== undefined) {
    const total = assumptions.landPercentage + assumptions.improvementsPercentage
    if (Math.abs(total - 100) > 0.01) { // Allow small rounding differences
      errors.push('Land % and Improvements % must add up to 100%')
    }
  }
  
  if (assumptions.landPercentage !== undefined && (assumptions.landPercentage < 0 || assumptions.landPercentage > 100)) {
    errors.push('Land percentage must be between 0% and 100%')
  }
  
  if (assumptions.improvementsPercentage !== undefined && (assumptions.improvementsPercentage < 0 || assumptions.improvementsPercentage > 100)) {
    errors.push('Improvements percentage must be between 0% and 100%')
  }

  return errors
}