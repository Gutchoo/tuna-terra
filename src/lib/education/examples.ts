/**
 * Shared example properties used across education lessons
 * Single source of truth for consistent examples
 */

export interface PropertyExample {
  name: string
  description: string
  units: number
  rentPerUnit: number
  purchasePrice: number
  
  // Income details
  grossRentalIncome: number
  otherIncome: number
  vacancyRate: number
  
  // Operating expenses
  expenses: {
    propertyTaxes: number
    insurance: number
    propertyManagementRate: number // as percentage
    utilities: number
    maintenanceRepairs: number
    otherExpenses: number
  }
  
  // Calculated values (derived from above)
  vacancyLoss: number
  effectiveGrossIncome: number
  propertyManagementCost: number
  totalOperatingExpenses: number
  noi: number
  capRate: number
}

/**
 * Tuna's Tower Apartments - Primary example used across lessons
 * 20-unit apartment building demonstrating NOI and cap rate concepts
 */
export const tunasTowerApartments: PropertyExample = {
  name: "Tuna's Tower Apartments",
  description: "20-unit apartment building",
  units: 20,
  rentPerUnit: 1500,
  purchasePrice: 3200000,
  
  // Income
  grossRentalIncome: 360000, // 20 * $1,500 * 12
  otherIncome: 12000, // parking/laundry
  vacancyRate: 0.05, // 5%
  
  // Operating expenses - UPDATE THESE AS NEEDED
  expenses: {
    propertyTaxes: 40000,
    insurance: 18000,
    propertyManagementRate: 0.06, // 6% of effective gross income
    utilities: 18600,
    maintenanceRepairs: 18200,
    otherExpenses: 6500
  },
  
  // Auto-calculated values
  get vacancyLoss() {
    return this.grossRentalIncome * this.vacancyRate
  },
  
  get effectiveGrossIncome() {
    return this.grossRentalIncome + this.otherIncome - this.vacancyLoss
  },
  
  get propertyManagementCost() {
    return this.effectiveGrossIncome * this.expenses.propertyManagementRate
  },
  
  get totalOperatingExpenses() {
    return this.expenses.propertyTaxes + 
           this.expenses.insurance + 
           this.propertyManagementCost +
           this.expenses.utilities + 
           this.expenses.maintenanceRepairs + 
           this.expenses.otherExpenses
  },
  
  get noi() {
    return this.effectiveGrossIncome - this.totalOperatingExpenses
  },
  
  get capRate() {
    return this.noi / this.purchasePrice
  }
}

/**
 * Generate multi-year projections with growth rates
 */
export function generateYearlyProjections(
  property: PropertyExample, 
  years: number = 3,
  incomeGrowthRate: number = 0.03,
  expenseGrowthRate: number = 0.03
) {
  const projections = []
  
  for (let year = 1; year <= years; year++) {
    const growthFactor = Math.pow(1 + incomeGrowthRate, year - 1)
    const expenseGrowthFactor = Math.pow(1 + expenseGrowthRate, year - 1)
    
    const yearlyRentalIncome = property.grossRentalIncome * growthFactor
    const yearlyOtherIncome = property.otherIncome * growthFactor
    const yearlyVacancyLoss = yearlyRentalIncome * property.vacancyRate
    const effectiveGrossIncome = yearlyRentalIncome + yearlyOtherIncome - yearlyVacancyLoss
    
    const yearlyExpenses = property.totalOperatingExpenses * expenseGrowthFactor
    const noi = effectiveGrossIncome - yearlyExpenses
    
    projections.push({
      year,
      grossRentalIncome: yearlyRentalIncome,
      otherIncome: yearlyOtherIncome,
      vacancyLoss: yearlyVacancyLoss,
      effectiveGrossIncome,
      totalOperatingExpenses: yearlyExpenses,
      noi,
      propertyValue: noi / property.capRate // assuming cap rate stays constant
    })
  }
  
  return projections
}