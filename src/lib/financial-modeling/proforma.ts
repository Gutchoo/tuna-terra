export interface CapitalImprovement {
  year: number           // Year placed in service (e.g., 3)
  amount: number         // Cost of improvement
  description?: string   // "Roof replacement", "HVAC upgrade", etc.
  recoveryPeriod?: number // Optional override, defaults to property type depreciation years
}

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
  loanCosts: number // loan costs amount (depending on loanCostType)
  loanCostType: 'percentage' | 'dollar' | '' // whether loan costs are percentage or dollar amount
  
  // DSCR-specific fields
  targetDSCR?: number // Debt Service Coverage Ratio target
  
  // LTV-specific fields  
  targetLTV?: number // Loan-to-Value ratio target
  
  // Tax & Depreciation
  propertyType: 'residential' | 'commercial' | 'industrial' | ''
  depreciationYears: number
  landPercentage: number // 0-100
  improvementsPercentage: number // 0-100 (must sum to 100 with landPercentage)
  acquisitionMonth: number // 1-12 (1 = January, 12 = December) for mid-month convention
  
  // Capital Improvements (future feature)
  capitalImprovements?: CapitalImprovement[] // Future feature for mid-stream capital expenditures
  
  // Detailed Tax Rates
  ordinaryIncomeTaxRate: number // 10%-37% - used for depreciation recapture calculation
  capitalGainsTaxRate: number // 0%, 15%, or 20% - for capital gains portion
  depreciationRecaptureRate: number // up to 25% max - actual recapture rate applied
  
  // Exit Strategy
  holdPeriodYears: number
  dispositionPriceType: 'dollar' | 'caprate' | '' // Method for determining sale price
  dispositionPrice: number // Direct dollar amount when dispositionPriceType is 'dollar'
  dispositionCapRate: number // Cap rate when dispositionPriceType is 'caprate'
  costOfSaleType: 'percentage' | 'dollar' | '' // Method for determining selling costs
  costOfSaleAmount: number // Direct dollar amount when costOfSaleType is 'dollar'
  costOfSalePercentage: number // Percentage when costOfSaleType is 'percentage'
  
  // Legacy fields (backward compatibility)
  taxRate: number // combined federal + state rate (deprecated, use specific rates above)
  exitCapRate?: number // deprecated, use dispositionCapRate
  salePrice?: number // deprecated, use dispositionPrice
  sellingCosts: number // deprecated, use costOfSale fields
}

export interface AnnualCashflow {
  year: number
  noi: number
  debtService: number
  interestExpense: number
  principalPayment: number
  beforeTaxCashflow: number
  depreciation: number
  loanCostsAmortization: number
  taxableIncome: number
  taxes: number
  afterTaxCashflow: number
  loanBalance: number
}

export interface SaleProceeds {
  // Sale Price Calculation
  yearAfterHoldNOI: number // NOI for year N+1 (e.g., Year 11 if hold is 10)
  exitCapRate: number // Cap rate used for sale price calculation
  salePrice: number
  
  // Sale Costs & Net Proceeds
  sellingCosts: number
  netSaleProceeds: number
  
  // Basis Calculations
  originalBasis: number // Purchase price + acquisition costs
  accumulatedDepreciation: number // Total depreciation taken
  adjustedBasis: number // Original basis - accumulated depreciation
  
  // Loan & Equity
  loanBalance: number
  beforeTaxSaleProceeds: number
  
  // Gain/Loss Analysis
  totalGain: number
  deprecationRecapture: number // Min of accumulated depreciation and total gain
  capitalGains: number // Gain above depreciation recapture
  
  // Tax Calculations
  capitalGainsTaxRate: number // User's capital gains tax rate
  depreciationRecaptureRate: number // User's depreciation recapture rate
  capitalGainsTax: number
  depreciationRecaptureTax: number
  taxesOnSale: number
  
  // Final Proceeds
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
  if (paymentsMade === 0) return originalAmount

  // Correct amortization formula: remaining balance is the present value of remaining payments
  const remainingPayments = totalPayments - paymentsMade
  const remainingBalance = periodicPayment * (1 - Math.pow(1 + periodicRate, -remainingPayments)) / periodicRate
  
  return Math.max(0, remainingBalance)
}

/**
 * Calculate mid-month convention factor for first year depreciation
 * @param acquisitionMonth - Month of acquisition (1-12)
 * @returns First year depreciation factor (0-1)
 */
export function calculateMidMonthFactor(acquisitionMonth: number): number {
  // Mid-month convention: property placed in service in middle of month
  // Formula: (12 - acquisitionMonth + 0.5) / 12
  // Example: February (month 2) = (12 - 2 + 0.5) / 12 = 10.5/12 = 0.875
  const monthsOfService = 12 - acquisitionMonth + 0.5
  return monthsOfService / 12
}

/**
 * Calculate depreciation for a given year with mid-month convention
 */
export function calculateDepreciation(
  depreciableBasis: number,
  propertyType: string,
  depreciationYears: number,
  year: number,
  acquisitionMonth: number = 1 // Default to January if not specified
): number {
  if (year > depreciationYears) return 0
  
  const annualDepreciation = depreciableBasis / depreciationYears
  
  // Apply mid-month convention for first year
  if (year === 1) {
    const midMonthFactor = calculateMidMonthFactor(acquisitionMonth)
    return annualDepreciation * midMonthFactor
  }
  
  // Full depreciation for middle years
  return annualDepreciation
}

/**
 * Calculate multi-schedule depreciation including capital improvements with mid-month convention
 * Each capital improvement gets its own full recovery period starting from placement year
 */
export function calculateMultiScheduleDepreciation(
  originalBasis: number,
  capitalImprovements: CapitalImprovement[],
  propertyType: string,
  depreciationYears: number,
  currentYear: number,
  acquisitionMonth: number = 1 // Default to January if not specified
): number {
  let totalDepreciation = 0
  
  // Original basis depreciation with mid-month convention for year 1
  if (currentYear <= depreciationYears) {
    const annualDepreciation = originalBasis / depreciationYears
    
    if (currentYear === 1) {
      // Apply mid-month convention for first year
      const midMonthFactor = calculateMidMonthFactor(acquisitionMonth)
      totalDepreciation += annualDepreciation * midMonthFactor
    } else {
      // Full depreciation for subsequent years
      totalDepreciation += annualDepreciation
    }
  }
  
  // Add depreciation for each capital improvement
  // Note: Capital improvements typically use mid-month convention based on when placed in service
  // For simplicity, we assume they're placed in service in January of their placement year
  if (capitalImprovements && capitalImprovements.length > 0) {
    capitalImprovements.forEach(improvement => {
      const improvementStartYear = improvement.year
      const improvementRecoveryPeriod = improvement.recoveryPeriod || depreciationYears
      const improvementEndYear = improvementStartYear + improvementRecoveryPeriod - 1
      
      // Only depreciate if current year is within this improvement's schedule
      if (currentYear >= improvementStartYear && currentYear <= improvementEndYear) {
        const annualImprovementDepreciation = improvement.amount / improvementRecoveryPeriod
        
        // Apply mid-month convention for first year of improvement (assuming January placement)
        if (currentYear === improvementStartYear) {
          const improvementMidMonthFactor = calculateMidMonthFactor(1) // Assume January for improvements
          totalDepreciation += annualImprovementDepreciation * improvementMidMonthFactor
        } else {
          totalDepreciation += annualImprovementDepreciation
        }
      }
    })
  }
  
  return totalDepreciation
}

/**
 * Calculate interest portion of a payment for a given period
 */
export function calculateInterestForPeriod(
  remainingBalance: number,
  annualRate: number,
  paymentsPerYear: number = 12
): number {
  return remainingBalance * (annualRate / paymentsPerYear)
}

/**
 * Calculate principal portion of a payment for a given period
 */
export function calculatePrincipalForPeriod(
  totalPayment: number,
  interestPayment: number
): number {
  return totalPayment - interestPayment
}

/**
 * Calculate annual interest expense for tax purposes
 */
export function calculateAnnualInterestExpense(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number,
  year: number,
  paymentsPerYear: number = 12
): number {
  let totalInterest = 0
  
  for (let month = 1; month <= paymentsPerYear; month++) {
    const paymentNumber = (year - 1) * paymentsPerYear + month
    const remainingBalance = calculateLoanBalance(loanAmount, annualRate, amortizationYears, paymentNumber - 1, paymentsPerYear)
    const interestPayment = calculateInterestForPeriod(remainingBalance, annualRate, paymentsPerYear)
    totalInterest += interestPayment
  }
  
  return totalInterest
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

  // Safe number conversion helpers
  private safeNumber(value: unknown): number {
    const num = Number(value)
    return isNaN(num) || !isFinite(num) ? 0 : num
  }

  private safePercentage(value: unknown): number {
    const num = this.safeNumber(value)
    return Math.max(0, Math.min(1, num))
  }

  private safeArray(array: unknown[], length: number = 30): number[] {
    if (!Array.isArray(array)) return new Array(length).fill(0)
    return array.slice(0, length).map(val => this.safeNumber(val))
      .concat(new Array(Math.max(0, length - array.length)).fill(0))
  }

  calculate(): ProFormaResults {
    try {
      const {
        purchasePrice: rawPurchasePrice,
        acquisitionCosts: rawAcquisitionCosts,
        potentialRentalIncome: rawPotentialRentalIncome,
        vacancyRates: rawVacancyRates,
        operatingExpenses: rawOperatingExpenses,
        operatingExpenseType,
        loanAmount: rawLoanAmount,
        interestRate: rawInterestRate,
        amortizationYears: rawAmortizationYears,
        paymentsPerYear: rawPaymentsPerYear,
        loanCosts: rawLoanCosts,
        propertyType,
        depreciationYears: rawDepreciationYears,
        // Updated tax fields
        ordinaryIncomeTaxRate: rawOrdinaryIncomeTaxRate,
        capitalGainsTaxRate: rawCapitalGainsTaxRate,
        depreciationRecaptureRate: rawDepreciationRecaptureRate,
        taxRate: rawTaxRate, // Keep for legacy fallback
        holdPeriodYears: rawHoldPeriodYears,
        // Updated disposition fields
        dispositionPriceType,
        dispositionPrice: rawDispositionPrice,
        dispositionCapRate: rawDispositionCapRate,
        costOfSaleType,
        costOfSaleAmount: rawCostOfSaleAmount,
        costOfSalePercentage: rawCostOfSalePercentage,
        // Legacy fields for fallback
        exitCapRate: rawExitCapRate,
        salePrice: rawSalePrice,
        sellingCosts: rawSellingCosts,
        year1NOI: rawYear1NOI,
        noiGrowthRate: rawNoiGrowthRate,
      } = this.assumptions

      // Safely convert all values
      const purchasePrice = this.safeNumber(rawPurchasePrice)
      const acquisitionCosts = this.safeNumber(rawAcquisitionCosts)
      const potentialRentalIncome = this.safeArray(rawPotentialRentalIncome)
      const vacancyRates = this.safeArray(rawVacancyRates).map(rate => this.safePercentage(rate))
      const operatingExpenses = this.safeArray(rawOperatingExpenses)
      const loanAmount = this.safeNumber(rawLoanAmount)
      const interestRate = this.safePercentage(rawInterestRate)
      const amortizationYears = Math.max(1, this.safeNumber(rawAmortizationYears) || 30)
      const paymentsPerYear = Math.max(1, this.safeNumber(rawPaymentsPerYear) || 12)
      const loanCosts = this.safeNumber(rawLoanCosts)
      const depreciationYears = Math.max(1, this.safeNumber(rawDepreciationYears) || (propertyType === 'residential' ? 27.5 : 39))
      
      // Enhanced tax rates with fallback to legacy
      const ordinaryIncomeTaxRate = this.safePercentage(rawOrdinaryIncomeTaxRate) || this.safePercentage(rawTaxRate)
      const capitalGainsTaxRate = this.safePercentage(rawCapitalGainsTaxRate) || this.safePercentage(rawTaxRate) * 0.6
      const depreciationRecaptureRate = this.safePercentage(rawDepreciationRecaptureRate) || Math.min(0.25, ordinaryIncomeTaxRate)
      
      const holdPeriodYears = Math.max(1, Math.min(50, this.safeNumber(rawHoldPeriodYears) || 5))
      
      // Enhanced disposition pricing
      const dispositionPrice = this.safeNumber(rawDispositionPrice)
      const dispositionCapRate = this.safePercentage(rawDispositionCapRate)
      const costOfSaleAmount = this.safeNumber(rawCostOfSaleAmount)
      const costOfSalePercentage = this.safePercentage(rawCostOfSalePercentage)
      
      // Legacy fields
      const exitCapRate = this.safePercentage(rawExitCapRate) || dispositionCapRate
      const salePrice = this.safeNumber(rawSalePrice) || dispositionPrice
      const sellingCosts = this.safePercentage(rawSellingCosts) || costOfSalePercentage
      const year1NOI = this.safeNumber(rawYear1NOI)
      const noiGrowthRate = this.safePercentage(rawNoiGrowthRate)

      // Calculate acquisition costs based on type
      const actualAcquisitionCosts = this.assumptions.acquisitionCostType === 'percentage' 
        ? purchasePrice * (acquisitionCosts / 100)
        : acquisitionCosts

      // Calculate loan costs
      const actualLoanCosts = loanAmount > 0 
        ? (this.assumptions.loanCostType === 'percentage' 
          ? loanAmount * (loanCosts / 100) 
          : loanCosts)
        : 0
    
      // Debug logging for loan costs
      console.log('=== LOAN COSTS DEBUG (Initial Calculation) ===')
      console.log('loanAmount:', loanAmount)
      console.log('loanCosts input:', loanCosts)
      console.log('loanCostType:', this.assumptions.loanCostType)
      console.log('actualLoanCosts calculated:', actualLoanCosts)
      console.log('Expected (if percentage):', loanAmount * (loanCosts / 100))
      console.log('===============================================')
    
      // Calculate equity invested (includes loan costs)
      const totalEquityInvested = purchasePrice + actualAcquisitionCosts + actualLoanCosts - loanAmount

    // Calculate annual debt service using the specified payment frequency
    const periodicPayment = calculatePeriodicPayment(loanAmount, interestRate, amortizationYears, paymentsPerYear || 12)
    const annualDebtService = periodicPayment * (paymentsPerYear || 12)

    // Depreciable basis (property value + acquisition costs, excluding land - uses improvements percentage)
    const depreciableBasis = (purchasePrice + actualAcquisitionCosts) * (this.assumptions.improvementsPercentage / 100)

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
      
      // Calculate interest expense for proper tax treatment
      const interestExpense = calculateAnnualInterestExpense(loanAmount, interestRate, amortizationYears, year, paymentsPerYear || 12)
      const principalPayment = annualDebtService - interestExpense
      
      // Before-tax cash flow
      const beforeTaxCashflow = noi - annualDebtService
      
      // Depreciation using multi-schedule approach with mid-month convention
      const depreciation = calculateMultiScheduleDepreciation(
        depreciableBasis, 
        this.assumptions.capitalImprovements || [], 
        propertyType, 
        depreciationYears, 
        year,
        this.assumptions.acquisitionMonth || 1 // Default to January if not specified
      )
      cumulativeDepreciation += depreciation
      
      // Calculate loan costs amortization (spread over loan term only)
      // Use the same logic as actualLoanCosts calculation, respecting loanCostType
      const totalLoanCosts = this.assumptions.loanCostType === 'percentage' 
        ? loanAmount * (loanCosts / 100)
        : loanCosts
      const loanCostsAmortization = loanAmount > 0 && this.assumptions.loanTermYears > 0 && year <= this.assumptions.loanTermYears
        ? totalLoanCosts / this.assumptions.loanTermYears
        : 0
      
      // Debug logging for loan costs amortization (only for year 1)
      if (year === 1) {
        console.log('=== LOAN COSTS AMORTIZATION DEBUG (Year 1) ===')
        console.log('Year:', year)
        console.log('loanAmount:', loanAmount)
        console.log('loanCosts input:', loanCosts)
        console.log('loanCostType:', this.assumptions.loanCostType)
        console.log('loanTermYears:', this.assumptions.loanTermYears)
        console.log('totalLoanCosts calculated:', totalLoanCosts)
        console.log('loanCostsAmortization per year:', loanCostsAmortization)
        console.log('Expected amortization:', totalLoanCosts, '/', this.assumptions.loanTermYears, '=', totalLoanCosts / this.assumptions.loanTermYears)
        console.log('===============================================')
      }
      
      // Proper taxable income calculation with all tax-deductible expenses
      const taxableIncome = noi - depreciation - interestExpense - loanCostsAmortization
      
      // Taxes (negative if tax shield) - use ordinary income tax rate
      const taxes = taxableIncome * ordinaryIncomeTaxRate
      
      // After-tax cash flow
      const afterTaxCashflow = beforeTaxCashflow - taxes
      
      // Loan balance at end of year
      const paymentsThisYear = year * (paymentsPerYear || 12)
      const loanBalance = calculateLoanBalance(loanAmount, interestRate, amortizationYears, paymentsThisYear, paymentsPerYear || 12)

      annualCashflows.push({
        year,
        noi,
        debtService: annualDebtService,
        interestExpense,
        principalPayment,
        beforeTaxCashflow,
        depreciation,
        loanCostsAmortization,
        taxableIncome,
        taxes,
        afterTaxCashflow,
        loanBalance,
      })
    }

    // Calculate sale proceeds
    const finalYearNOI = annualCashflows[annualCashflows.length - 1].noi
    const finalLoanBalance = annualCashflows[annualCashflows.length - 1].loanBalance
    
    // Calculate Year N+1 NOI (year after hold period) for sale price calculation
    let yearAfterHoldNOI: number
    if (potentialRentalIncome && potentialRentalIncome.length > 0 && potentialRentalIncome[holdPeriodYears - 1] > 0) {
      // Project one more year using the growth pattern from detailed income
      const lastYearIncome = potentialRentalIncome[holdPeriodYears - 1] || 0
      const growthRate = holdPeriodYears > 1 && potentialRentalIncome[holdPeriodYears - 2] > 0
        ? (lastYearIncome / potentialRentalIncome[holdPeriodYears - 2]) - 1
        : 0.03 // Default 3% growth if no pattern available
      
      const projectedGrossIncome = lastYearIncome * (1 + growthRate)
      const projectedVacancy = projectedGrossIncome * (vacancyRates?.[holdPeriodYears - 1] || 0)
      const projectedEGI = projectedGrossIncome - projectedVacancy
      
      let projectedOpEx = 0
      if (operatingExpenses && operatingExpenses[holdPeriodYears - 1] !== undefined) {
        if (operatingExpenseType === 'percentage') {
          projectedOpEx = projectedEGI * ((operatingExpenses[holdPeriodYears - 1] || 0) / 100)
        } else {
          // Project operating expenses with same growth rate
          projectedOpEx = (operatingExpenses[holdPeriodYears - 1] || 0) * (1 + growthRate)
        }
      }
      
      yearAfterHoldNOI = projectedEGI - projectedOpEx
    } else {
      // Fallback: project using NOI growth rate
      yearAfterHoldNOI = finalYearNOI * (1 + (noiGrowthRate || 0))
    }
    
    // Determine sale price using Year N+1 NOI
    let estimatedSalePrice: number
    let effectiveExitCapRate: number = dispositionCapRate || exitCapRate || 0.065 // Default 6.5%
    
    if (dispositionPriceType === 'dollar' && dispositionPrice > 0) {
      estimatedSalePrice = dispositionPrice
      // Calculate implied cap rate for display
      effectiveExitCapRate = yearAfterHoldNOI > 0 ? yearAfterHoldNOI / dispositionPrice : 0
    } else if (dispositionPriceType === 'caprate' && dispositionCapRate > 0) {
      estimatedSalePrice = estimateSalePrice(yearAfterHoldNOI, dispositionCapRate)
      effectiveExitCapRate = dispositionCapRate
    } else {
      // Fallback to legacy fields
      estimatedSalePrice = salePrice || (exitCapRate ? estimateSalePrice(yearAfterHoldNOI, exitCapRate) : purchasePrice)
    }
    
    // Determine selling costs using enhanced logic
    let sellingCostsAmount: number
    if (costOfSaleType === 'dollar' && costOfSaleAmount > 0) {
      sellingCostsAmount = costOfSaleAmount
    } else if (costOfSaleType === 'percentage' && costOfSalePercentage > 0) {
      sellingCostsAmount = estimatedSalePrice * costOfSalePercentage
    } else {
      // Fallback to legacy
      sellingCostsAmount = estimatedSalePrice * sellingCosts
    }
    
    const netSaleProceeds = estimatedSalePrice - sellingCostsAmount
    const beforeTaxSaleProceeds = netSaleProceeds - finalLoanBalance
    
    // Calculate basis components
    const originalBasis = purchasePrice + actualAcquisitionCosts
    
    // Industry-standard tax calculations
    const adjustedBasis = originalBasis - cumulativeDepreciation
    const totalGain = Math.max(0, estimatedSalePrice - sellingCostsAmount - adjustedBasis)
    
    // Split gain between depreciation recapture and capital gains
    const depreciationRecapture = Math.min(cumulativeDepreciation, totalGain)
    const capitalGains = Math.max(0, totalGain - depreciationRecapture)
    
    // Apply proper tax rates
    const capitalGainsTax = capitalGains * capitalGainsTaxRate
    const depreciationRecaptureTax = depreciationRecapture * depreciationRecaptureRate
    const taxesOnSale = capitalGainsTax + depreciationRecaptureTax
    
    const afterTaxSaleProceeds = beforeTaxSaleProceeds - taxesOnSale

    const saleProceeds: SaleProceeds = {
      // Sale Price Calculation
      yearAfterHoldNOI,
      exitCapRate: effectiveExitCapRate,
      salePrice: estimatedSalePrice,
      
      // Sale Costs & Net Proceeds
      sellingCosts: sellingCostsAmount,
      netSaleProceeds,
      
      // Basis Calculations
      originalBasis,
      accumulatedDepreciation: cumulativeDepreciation,
      adjustedBasis,
      
      // Loan & Equity
      loanBalance: finalLoanBalance,
      beforeTaxSaleProceeds,
      
      // Gain/Loss Analysis
      totalGain,
      deprecationRecapture: depreciationRecapture,
      capitalGains,
      
      // Tax Calculations
      capitalGainsTaxRate,
      depreciationRecaptureRate,
      capitalGainsTax,
      depreciationRecaptureTax,
      taxesOnSale,
      
      // Final Proceeds
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
    } catch (error) {
      console.debug('ProForma calculation error:', error)
      
      // Return minimal safe results when calculation fails
      const safeHoldPeriod = Math.max(1, this.safeNumber(this.assumptions.holdPeriodYears) || 5)
      const safePurchasePrice = this.safeNumber(this.assumptions.purchasePrice)
      const safeEquity = Math.max(0, safePurchasePrice - this.safeNumber(this.assumptions.loanAmount))
      
      return {
        totalEquityInvested: safeEquity,
        annualCashflows: Array(safeHoldPeriod).fill(0).map((_, index) => ({
          year: index + 1,
          noi: 0,
          debtService: 0,
          interestExpense: 0,
          principalPayment: 0,
          beforeTaxCashflow: 0,
          depreciation: 0,
          loanCostsAmortization: 0,
          taxableIncome: 0,
          taxes: 0,
          afterTaxCashflow: 0,
          loanBalance: 0,
        })),
        saleProceeds: {
          // Sale Price Calculation
          yearAfterHoldNOI: 0,
          exitCapRate: 0.065,
          salePrice: safePurchasePrice,
          
          // Sale Costs & Net Proceeds
          sellingCosts: 0,
          netSaleProceeds: safePurchasePrice,
          
          // Basis Calculations
          originalBasis: safePurchasePrice,
          accumulatedDepreciation: 0,
          adjustedBasis: safePurchasePrice,
          
          // Loan & Equity
          loanBalance: 0,
          beforeTaxSaleProceeds: safePurchasePrice,
          
          // Gain/Loss Analysis
          totalGain: 0,
          deprecationRecapture: 0,
          capitalGains: 0,
          
          // Tax Calculations
          capitalGainsTaxRate: 0.20,
          depreciationRecaptureRate: 0.25,
          capitalGainsTax: 0,
          depreciationRecaptureTax: 0,
          taxesOnSale: 0,
          
          // Final Proceeds
          afterTaxSaleProceeds: safePurchasePrice,
        },
        totalCashReturned: safeEquity,
        netProfit: 0,
        irr: null,
        equityMultiple: safeEquity > 0 ? 1 : 0,
        averageCashOnCash: 0,
        totalTaxSavings: 0,
      }
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
    loanCostType: 'percentage' as const,
    targetLTV: 70, // 70% LTV target
    propertyType: 'commercial',
    depreciationYears: 39, // Commercial real estate
    landPercentage: 20, // 20% land value
    improvementsPercentage: 80, // 80% improvements value
    acquisitionMonth: 1, // January (default)
    // Enhanced tax fields
    ordinaryIncomeTaxRate: 0.35, // 35% ordinary income tax rate
    capitalGainsTaxRate: 0.20, // 20% long-term capital gains
    depreciationRecaptureRate: 0.25, // 25% depreciation recapture
    taxRate: 0.35, // Legacy field - combined federal + state
    holdPeriodYears: 10,
    // Enhanced disposition fields
    dispositionPriceType: 'caprate' as const,
    dispositionPrice: 0, // Not used when using cap rate method
    dispositionCapRate: 0.075, // 7.5% exit cap rate
    costOfSaleType: 'percentage' as const,
    costOfSaleAmount: 0, // Not used when using percentage method
    costOfSalePercentage: 0.06, // 6% selling costs
    // Legacy fields for backward compatibility
    exitCapRate: 0.075, // 7.5% exit cap rate
    salePrice: 0, // Not used when using cap rate method
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