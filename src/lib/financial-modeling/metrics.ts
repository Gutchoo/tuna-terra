import { PropertyAssumptions, ProFormaResults, ProFormaCalculator, calculateIRR } from "./proforma"

/**
 * Calculate Net Present Value (NPV) of cash flows (After-Tax)
 */
export function calculateNPV(results: ProFormaResults, discountRate: number): number {
  let npv = -results.totalEquityInvested
  
  // Add present value of operating cash flows
  results.annualCashflows.forEach((cf, index) => {
    const year = index + 1
    npv += cf.afterTaxCashflow / Math.pow(1 + discountRate, year)
  })
  
  // Add present value of sale proceeds
  const holdPeriod = results.annualCashflows.length
  if (results.saleProceeds && holdPeriod > 0) {
    npv += results.saleProceeds.afterTaxSaleProceeds / Math.pow(1 + discountRate, holdPeriod)
  }
  
  return npv
}

/**
 * Calculate Before-Tax IRR
 */
export function calculateBeforeTaxIRR(results: ProFormaResults): number | null {
  const cashFlows = [
    -results.totalEquityInvested, // Initial investment
    ...results.annualCashflows.slice(0, -1).map(cf => cf.beforeTaxCashflow), // Annual before-tax cash flows
    results.annualCashflows[results.annualCashflows.length - 1].beforeTaxCashflow + 
      results.saleProceeds.beforeTaxSaleProceeds // Final year + before-tax sale proceeds
  ]
  return calculateIRR(cashFlows)
}

/**
 * Calculate Before-Tax Equity Multiple
 */
export function calculateBeforeTaxEquityMultiple(results: ProFormaResults): number {
  const totalBeforeTaxCashflows = results.annualCashflows.reduce((sum, cf) => sum + cf.beforeTaxCashflow, 0)
  const totalBeforeTaxReturned = totalBeforeTaxCashflows + results.saleProceeds.beforeTaxSaleProceeds
  return totalBeforeTaxReturned / results.totalEquityInvested
}

/**
 * Calculate Before-Tax NPV
 */
export function calculateBeforeTaxNPV(results: ProFormaResults, discountRate: number): number {
  let npv = -results.totalEquityInvested
  
  // Add present value of before-tax operating cash flows
  results.annualCashflows.forEach((cf, index) => {
    const year = index + 1
    npv += cf.beforeTaxCashflow / Math.pow(1 + discountRate, year)
  })
  
  // Add present value of before-tax sale proceeds
  const holdPeriod = results.annualCashflows.length
  if (results.saleProceeds && holdPeriod > 0) {
    npv += results.saleProceeds.beforeTaxSaleProceeds / Math.pow(1 + discountRate, holdPeriod)
  }
  
  return npv
}

/**
 * Calculate Unlevered After-Tax IRR (cash purchase scenario)
 */
export function calculateUnleveredIRR(assumptions: PropertyAssumptions): number | null {
  // Create a copy of assumptions with cash financing
  const cashAssumptions: PropertyAssumptions = {
    ...assumptions,
    financingType: 'cash',
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
    amortizationYears: 0,
    loanCosts: 0,
    targetDSCR: undefined,
    targetLTV: undefined
  }
  
  try {
    const calculator = new ProFormaCalculator(cashAssumptions)
    const cashResults = calculator.calculate()
    return cashResults.irr // This is after-tax IRR
  } catch (error) {
    console.error('Error calculating unlevered IRR:', error)
    return null
  }
}

/**
 * Calculate Unlevered Before-Tax IRR (cash purchase scenario)
 */
export function calculateUnleveredBeforeTaxIRR(assumptions: PropertyAssumptions): number | null {
  // Create a copy of assumptions with cash financing
  const cashAssumptions: PropertyAssumptions = {
    ...assumptions,
    financingType: 'cash',
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
    amortizationYears: 0,
    loanCosts: 0,
    targetDSCR: undefined,
    targetLTV: undefined
  }
  
  try {
    const calculator = new ProFormaCalculator(cashAssumptions)
    const cashResults = calculator.calculate()
    return calculateBeforeTaxIRR(cashResults) // Use before-tax calculation
  } catch (error) {
    console.error('Error calculating unlevered before-tax IRR:', error)
    return null
  }
}

/**
 * Calculate Debt Yield
 */
export function calculateDebtYield(year1NOI: number, loanAmount: number): number {
  if (loanAmount === 0) return 0
  return (year1NOI / loanAmount) * 100
}

/**
 * Calculate Purchase Cap Rate
 */
export function calculatePurchaseCapRate(year1NOI: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0
  return (year1NOI / purchasePrice) * 100
}

/**
 * Calculate Yield on Cost
 */
export function calculateYieldOnCost(stabilizedNOI: number, totalProjectCost: number): number {
  if (totalProjectCost === 0) return 0
  return (stabilizedNOI / totalProjectCost) * 100
}

/**
 * Run sensitivity analysis on key metrics
 */
export function runSensitivityAnalysis(
  assumptions: PropertyAssumptions, 
  baseResults: ProFormaResults
) {
  const sensitivities = {
    exitCap: {
      minus50bps: 0,
      plus50bps: 0
    },
    rentGrowth: {
      minus100bps: 0,
      plus100bps: 0
    },
    interestRate: {
      dscr: {
        minus50bps: 0,
        plus50bps: 0
      }
    }
  }
  
  try {
    // Exit Cap Rate sensitivity (±50 bps)
    if (assumptions.dispositionCapRate) {
      // -50 bps (lower cap rate = higher value)
      const lowerCapAssumptions = {
        ...assumptions,
        dispositionCapRate: assumptions.dispositionCapRate - 0.005
      }
      const lowerCapCalculator = new ProFormaCalculator(lowerCapAssumptions)
      const lowerCapResults = lowerCapCalculator.calculate()
      sensitivities.exitCap.minus50bps = lowerCapResults.irr || 0
      
      // +50 bps (higher cap rate = lower value)
      const higherCapAssumptions = {
        ...assumptions,
        dispositionCapRate: assumptions.dispositionCapRate + 0.005
      }
      const higherCapCalculator = new ProFormaCalculator(higherCapAssumptions)
      const higherCapResults = higherCapCalculator.calculate()
      sensitivities.exitCap.plus50bps = higherCapResults.irr || 0
    }
    
    // Rent Growth sensitivity (±100 bps)
    // We'll approximate by adjusting rental income by growth rate
    const baseRentalIncome = assumptions.potentialRentalIncome[0] || 0
    if (baseRentalIncome > 0) {
      // -100 bps growth
      const lowerGrowthIncome = assumptions.potentialRentalIncome.map((income, year) => {
        if (year === 0) return income
        return income * Math.pow(0.99, year) / Math.pow(1.02, year) // Adjust for -1% growth vs base
      })
      const lowerGrowthAssumptions = {
        ...assumptions,
        potentialRentalIncome: lowerGrowthIncome
      }
      const lowerGrowthCalculator = new ProFormaCalculator(lowerGrowthAssumptions)
      const lowerGrowthResults = lowerGrowthCalculator.calculate()
      sensitivities.rentGrowth.minus100bps = lowerGrowthResults.irr || 0
      
      // +100 bps growth
      const higherGrowthIncome = assumptions.potentialRentalIncome.map((income, year) => {
        if (year === 0) return income
        return income * Math.pow(1.01, year) / Math.pow(1.00, year) // Adjust for +1% growth vs base
      })
      const higherGrowthAssumptions = {
        ...assumptions,
        potentialRentalIncome: higherGrowthIncome
      }
      const higherGrowthCalculator = new ProFormaCalculator(higherGrowthAssumptions)
      const higherGrowthResults = higherGrowthCalculator.calculate()
      sensitivities.rentGrowth.plus100bps = higherGrowthResults.irr || 0
    }
    
    // Interest Rate sensitivity for DSCR (±50 bps)
    if (assumptions.financingType !== 'cash' && assumptions.interestRate > 0) {
      const year1NOI = baseResults.annualCashflows[0]?.noi || 0
      
      // -50 bps
      const lowerRate = assumptions.interestRate - 0.005
      const lowerRateADS = calculateAnnualDebtService(
        assumptions.loanAmount,
        lowerRate,
        assumptions.amortizationYears,
        assumptions.paymentsPerYear
      )
      sensitivities.interestRate.dscr.minus50bps = year1NOI / lowerRateADS
      
      // +50 bps
      const higherRate = assumptions.interestRate + 0.005
      const higherRateADS = calculateAnnualDebtService(
        assumptions.loanAmount,
        higherRate,
        assumptions.amortizationYears,
        assumptions.paymentsPerYear
      )
      sensitivities.interestRate.dscr.plus50bps = year1NOI / higherRateADS
    }
  } catch (error) {
    console.error('Error in sensitivity analysis:', error)
  }
  
  return sensitivities
}

/**
 * Helper to calculate annual debt service
 */
function calculateAnnualDebtService(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number,
  paymentsPerYear: number = 12
): number {
  if (loanAmount === 0 || annualRate === 0) return 0
  
  const periodicRate = annualRate / paymentsPerYear
  const totalPayments = amortizationYears * paymentsPerYear
  
  const periodicPayment = (loanAmount * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                          (Math.pow(1 + periodicRate, totalPayments) - 1)
  
  return periodicPayment * paymentsPerYear
}