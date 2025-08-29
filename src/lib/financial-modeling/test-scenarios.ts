import { type PropertyAssumptions } from './proforma'

export interface TestScenario {
  id: string
  name: string
  description: string
  assumptions: PropertyAssumptions
}

/**
 * Collection of realistic test scenarios for development and testing
 */
export const testScenarios: TestScenario[] = [
  {
    id: 'standard',
    name: 'Standard Office Building',
    description: 'Conservative 65% LTV office investment with stable income growth',
    assumptions: {
      purchasePrice: 2000000,
      acquisitionCosts: 4, // 4% of purchase price
      acquisitionCostType: 'percentage' as const,
      // Income - 10-year stable growth
      potentialRentalIncome: Array(10).fill(0).map((_, i) => 240000 * Math.pow(1.03, i)),
      otherIncome: Array(30).fill(0),
      vacancyRates: Array(10).fill(0.05), // 5% vacancy
      operatingExpenses: Array(10).fill(40), // 40% operating ratio
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: 3,
      defaultVacancyRate: 5,
      defaultOperatingExpenseRate: 40,
      year1NOI: 144000,
      noiGrowthRate: 0.03,
      // Conservative financing
      financingType: 'ltv' as const,
      loanAmount: 1300000, // 65% LTV
      interestRate: 0.065, // 6.5%
      loanTermYears: 10,
      amortizationYears: 30,
      paymentsPerYear: 12,
      loanCosts: 2.0,
      loanCostType: 'percentage' as const,
      targetLTV: 65,
      propertyType: 'commercial',
      depreciationYears: 39,
      landPercentage: 20,
      improvementsPercentage: 80,
      // Tax assumptions
      ordinaryIncomeTaxRate: 0.35,
      capitalGainsTaxRate: 0.20,
      depreciationRecaptureRate: 0.25,
      taxRate: 0.35,
      holdPeriodYears: 7,
      // Exit strategy
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.075, // 7.5% exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.06,
      // Legacy
      exitCapRate: 0.075,
      salePrice: 0,
      sellingCosts: 0.06,
    }
  },
  {
    id: 'valueadd',
    name: 'Value-Add Multifamily',
    description: 'High leverage multifamily with renovation period and rent growth',
    assumptions: {
      purchasePrice: 5000000,
      acquisitionCosts: 3, // 3% of purchase price
      acquisitionCostType: 'percentage' as const,
      // Income - renovation in years 1-2, then strong growth
      potentialRentalIncome: [
        480000, 500000, 650000, 689500, 731327, 775877, 823180, 873271, 926168, 982498
      ].concat(Array(20).fill(0)),
      otherIncome: Array(30).fill(0),
      vacancyRates: [0.15, 0.12, 0.08, 0.07, 0.06, 0.05, 0.05, 0.05, 0.05, 0.05].concat(Array(20).fill(0.05)),
      operatingExpenses: Array(10).fill(45), // 45% operating ratio
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: 6,
      defaultVacancyRate: 8,
      defaultOperatingExpenseRate: 45,
      year1NOI: 244800,
      noiGrowthRate: 0.06,
      // Aggressive financing
      financingType: 'ltv' as const,
      loanAmount: 4000000, // 80% LTV
      interestRate: 0.075, // 7.5%
      loanTermYears: 5,
      amortizationYears: 30,
      paymentsPerYear: 12,
      loanCosts: 2.5,
      loanCostType: 'percentage' as const,
      targetLTV: 80,
      propertyType: 'residential',
      depreciationYears: 27.5,
      landPercentage: 15,
      improvementsPercentage: 85,
      // Tax assumptions
      ordinaryIncomeTaxRate: 0.37, // Higher tax bracket
      capitalGainsTaxRate: 0.20,
      depreciationRecaptureRate: 0.25,
      taxRate: 0.37,
      holdPeriodYears: 5,
      // Exit strategy - higher exit cap due to value-add execution
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.065, // 6.5% exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.07, // Higher selling costs
      // Legacy
      exitCapRate: 0.065,
      salePrice: 0,
      sellingCosts: 0.07,
    }
  },
  {
    id: 'nnn',
    name: 'Triple Net Retail',
    description: 'Single-tenant NNN retail with long-term lease and minimal expenses',
    assumptions: {
      purchasePrice: 3500000,
      acquisitionCosts: 2.5, // 2.5% of purchase price
      acquisitionCostType: 'percentage' as const,
      // Income - very stable with built-in increases
      potentialRentalIncome: Array(15).fill(0).map((_, i) => 
        i < 5 ? 350000 : i < 10 ? 367500 : 385875
      ).concat(Array(15).fill(0)),
      otherIncome: Array(30).fill(0),
      vacancyRates: Array(15).fill(0.0).concat(Array(15).fill(0.0)), // Zero vacancy - NNN lease
      operatingExpenses: Array(15).fill(5), // 5% operating ratio (management only)
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: 2,
      defaultVacancyRate: 0,
      defaultOperatingExpenseRate: 5,
      year1NOI: 332500,
      noiGrowthRate: 0.02,
      // Conservative financing
      financingType: 'ltv' as const,
      loanAmount: 2450000, // 70% LTV
      interestRate: 0.055, // 5.5% - good rate for NNN
      loanTermYears: 15,
      amortizationYears: 25,
      paymentsPerYear: 12,
      loanCosts: 1.5,
      loanCostType: 'percentage' as const,
      targetLTV: 70,
      propertyType: 'commercial',
      depreciationYears: 39,
      landPercentage: 25, // Higher land value for retail
      improvementsPercentage: 75,
      // Tax assumptions
      ordinaryIncomeTaxRate: 0.32,
      capitalGainsTaxRate: 0.15, // Lower bracket
      depreciationRecaptureRate: 0.25,
      taxRate: 0.32,
      holdPeriodYears: 15,
      // Exit strategy
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.07, // 7% exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.05, // Lower selling costs
      // Legacy
      exitCapRate: 0.07,
      salePrice: 0,
      sellingCosts: 0.05,
    }
  },
  {
    id: 'development',
    name: 'Development Deal',
    description: 'Ground-up development with construction loan and lease-up period',
    assumptions: {
      purchasePrice: 8000000,
      acquisitionCosts: 5, // 5% - higher due diligence costs
      acquisitionCostType: 'percentage' as const,
      // Income - no income first 2 years, then lease-up
      potentialRentalIncome: [
        0, 0, 480000, 720000, 960000, 1008000, 1058400, 1111372, 1166441, 1224163
      ].concat(Array(20).fill(0)),
      otherIncome: Array(30).fill(0),
      vacancyRates: [0, 0, 0.30, 0.15, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05].concat(Array(20).fill(0.05)),
      operatingExpenses: [0, 0, 50, 45, 42, 40, 40, 40, 40, 40].concat(Array(20).fill(40)), // Higher initially
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: 4,
      defaultVacancyRate: 15,
      defaultOperatingExpenseRate: 42,
      year1NOI: 0,
      noiGrowthRate: 0.04,
      // Construction/permanent financing
      financingType: 'ltv' as const,
      loanAmount: 5600000, // 70% of total project cost
      interestRate: 0.085, // 8.5% construction/perm loan
      loanTermYears: 7,
      amortizationYears: 30,
      paymentsPerYear: 12,
      loanCosts: 3.0, // Higher loan costs
      loanCostType: 'percentage' as const,
      targetLTV: 70,
      propertyType: 'commercial',
      depreciationYears: 39,
      landPercentage: 30, // Higher land component
      improvementsPercentage: 70,
      // Tax assumptions
      ordinaryIncomeTaxRate: 0.37,
      capitalGainsTaxRate: 0.20,
      depreciationRecaptureRate: 0.25,
      taxRate: 0.37,
      holdPeriodYears: 7,
      // Exit strategy - stabilized value
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.065, // 6.5% stabilized exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.06,
      // Legacy
      exitCapRate: 0.065,
      salePrice: 0,
      sellingCosts: 0.06,
    }
  },
  {
    id: 'stress',
    name: 'Stress Test Scenario',
    description: 'High interest rates, declining income, and market stress conditions',
    assumptions: {
      purchasePrice: 1500000,
      acquisitionCosts: 6, // 6% - distressed sale costs
      acquisitionCostType: 'percentage' as const,
      // Income - declining then recovering
      potentialRentalIncome: [
        180000, 162000, 145800, 140000, 142800, 148000, 155000, 162750, 170787, 179327
      ].concat(Array(20).fill(0)),
      otherIncome: Array(30).fill(0),
      vacancyRates: [0.08, 0.15, 0.20, 0.18, 0.15, 0.12, 0.08, 0.06, 0.05, 0.05].concat(Array(20).fill(0.05)),
      operatingExpenses: Array(10).fill(55), // High operating ratio due to management issues
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: -2, // Initially declining
      defaultVacancyRate: 15,
      defaultOperatingExpenseRate: 55,
      year1NOI: 74520,
      noiGrowthRate: -0.02,
      // High interest rate environment
      financingType: 'ltv' as const,
      loanAmount: 1050000, // 70% LTV
      interestRate: 0.095, // 9.5% high rate environment
      loanTermYears: 5, // Short term due to market conditions
      amortizationYears: 25,
      paymentsPerYear: 12,
      loanCosts: 3.5, // High loan costs due to risk
      loanCostType: 'percentage' as const,
      targetLTV: 70,
      propertyType: 'commercial',
      depreciationYears: 39,
      landPercentage: 15,
      improvementsPercentage: 85,
      // Tax assumptions
      ordinaryIncomeTaxRate: 0.35,
      capitalGainsTaxRate: 0.20,
      depreciationRecaptureRate: 0.25,
      taxRate: 0.35,
      holdPeriodYears: 5,
      // Exit strategy - distressed exit cap
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.095, // 9.5% distressed exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.08, // Higher costs in distressed sale
      // Legacy
      exitCapRate: 0.095,
      salePrice: 0,
      sellingCosts: 0.08,
    }
  },
  {
    id: 'quickflip',
    name: 'Quick Flip Strategy',
    description: '2-year hold with renovation and quick appreciation',
    assumptions: {
      purchasePrice: 800000,
      acquisitionCosts: 3, // 3% of purchase price
      acquisitionCostType: 'percentage' as const,
      // Income - growing through renovation
      potentialRentalIncome: [96000, 132000].concat(Array(28).fill(0)),
      otherIncome: Array(30).fill(0),
      vacancyRates: [0.20, 0.05].concat(Array(28).fill(0.05)), // High vacancy during reno
      operatingExpenses: [60, 35].concat(Array(28).fill(35)), // High expenses during reno
      operatingExpenseType: 'percentage' as const,
      propertyTaxes: Array(30).fill(0),
      insurance: Array(30).fill(0),
      maintenance: Array(30).fill(0),
      propertyManagement: Array(30).fill(0),
      utilities: Array(30).fill(0),
      otherExpenses: Array(30).fill(0),
      rentalIncomeGrowthRate: 25, // High growth through renovation
      defaultVacancyRate: 5,
      defaultOperatingExpenseRate: 35,
      year1NOI: 30720,
      noiGrowthRate: 0.25,
      // Bridge financing
      financingType: 'ltv' as const,
      loanAmount: 600000, // 75% LTV
      interestRate: 0.10, // 10% bridge loan rate
      loanTermYears: 3, // Bridge loan term
      amortizationYears: 30,
      paymentsPerYear: 12,
      loanCosts: 4.0, // High bridge loan costs
      loanCostType: 'percentage' as const,
      targetLTV: 75,
      propertyType: 'commercial',
      depreciationYears: 39,
      landPercentage: 10, // Lower land value
      improvementsPercentage: 90,
      // Tax assumptions - short-term gains
      ordinaryIncomeTaxRate: 0.37, // Short-term gains taxed as ordinary
      capitalGainsTaxRate: 0.37, // No long-term treatment
      depreciationRecaptureRate: 0.25,
      taxRate: 0.37,
      holdPeriodYears: 2, // Quick flip
      // Exit strategy - aggressive assumptions
      dispositionPriceType: 'caprate' as const,
      dispositionPrice: 0,
      dispositionCapRate: 0.055, // 5.5% aggressive exit cap
      costOfSaleType: 'percentage' as const,
      costOfSaleAmount: 0,
      costOfSalePercentage: 0.07, // Higher selling costs for quick sale
      // Legacy
      exitCapRate: 0.055,
      salePrice: 0,
      sellingCosts: 0.07,
    }
  }
]

/**
 * Get a specific test scenario by ID
 */
export function getTestScenario(id: string): TestScenario | undefined {
  return testScenarios.find(scenario => scenario.id === id)
}

/**
 * Get all available scenario names for UI dropdown
 */
export function getScenarioNames(): Array<{id: string, name: string, description: string}> {
  return testScenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description
  }))
}

/**
 * Generate random variations of a scenario for fuzzing/edge case testing
 */
export function randomizeScenario(baseScenario: PropertyAssumptions): PropertyAssumptions {
  const variance = (base: number, factor: number = 0.15) => {
    const multiplier = 1 + (Math.random() - 0.5) * 2 * factor
    return Math.max(0, base * multiplier)
  }

  return {
    ...baseScenario,
    purchasePrice: variance(baseScenario.purchasePrice, 0.20),
    acquisitionCosts: variance(baseScenario.acquisitionCosts, 0.25),
    interestRate: variance(baseScenario.interestRate, 0.30),
    potentialRentalIncome: baseScenario.potentialRentalIncome.map(income => 
      variance(income, 0.15)
    ),
    vacancyRates: baseScenario.vacancyRates.map(rate => 
      Math.min(0.25, variance(rate, 0.50))
    ),
    operatingExpenses: baseScenario.operatingExpenses.map(expense => 
      variance(expense, 0.20)
    ),
    dispositionCapRate: variance(baseScenario.dispositionCapRate, 0.25),
  }
}