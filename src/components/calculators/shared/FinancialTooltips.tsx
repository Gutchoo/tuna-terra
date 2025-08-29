export const financialTooltips = {
  // Key Metrics
  totalInvestment: "The total amount of capital required to acquire the property, including the purchase price plus all acquisition costs such as closing costs, inspections, and due diligence expenses.",
  
  equityRequired: "The amount of cash you need to invest from your own funds. This is calculated as Total Investment minus the Loan Amount, representing your down payment and out-of-pocket costs.",
  
  goingInCapRate: "The initial capitalization rate, calculated as Year 1 Net Operating Income divided by the Purchase Price. This metric shows the property's initial return before considering financing.",
  
  ltvRatio: "Loan-to-Value ratio represents the percentage of the property's value that is financed with debt. A lower LTV means more equity investment and typically better loan terms.",

  // Property Assumptions
  purchasePrice: "The agreed-upon price to acquire the property, excluding closing costs and other acquisition expenses. The purchase price along with acquisition costs forms the investment basis for financial calculations.",
  
  acquisitionCosts: "All costs associated with acquiring the property beyond the purchase price, including title insurance, inspections, legal fees, lender fees, and other closing costs. Can be entered as a percentage of purchase price or fixed dollar amount.",
  
  propertyType: "Classification of the property which determines the depreciation schedule for tax purposes. Residential commercial properties depreciate over 27.5 years, while non-residential commercial properties depreciate over 39 years.",
  
  landPercentage: "The percentage of the property's value attributed to land. Land cannot be depreciated for tax purposes, so this helps determine what portion of your investment can be used for depreciation deductions.",
  
  improvementsPercentage: "The percentage of the property's value attributed to buildings and improvements. This portion can be depreciated for tax purposes over the applicable recovery period (27.5 years for residential, 39 years for commercial).",

  // Income Assumptions
  monthlyRent: "The gross rental income collected per month before any expenses. This should reflect market rates and actual or expected rental income.",
  
  annualRentGrowth: "The expected annual percentage increase in rental income. Market research and lease terms should inform this assumption. Typical ranges are 2-4% annually.",
  
  vacancyRate: "The percentage of time the property is expected to be vacant. This accounts for tenant turnover, market conditions, and time to re-lease. Typical ranges are 5-10%.",
  
  propertyTaxes: "Annual property taxes paid to local government. These can usually be found in public records or obtained from the current owner or listing agent.",
  
  insurance: "Annual cost for property insurance including fire, liability, and other hazard coverage. Obtain quotes from insurance providers for accurate estimates.",
  
  maintenanceRepairs: "Annual budget for ongoing property maintenance, repairs, and capital improvements. This includes both routine maintenance and unexpected repairs.",
  
  propertyManagement: "Fee paid to property management company, typically expressed as a percentage of gross rental income. Self-managed properties may still budget this for time value.",

  // Financing Assumptions
  loanAmount: "The total amount borrowed to finance the property purchase. This determines your loan payments and affects cash flow and returns.",
  
  interestRate: "The annual interest rate charged on the loan. This significantly impacts your debt service payments and overall investment returns.",
  
  loanFees: "Upfront fees paid to obtain the loan, including origination fees, points, and other lender charges. These are typically amortized over the loan term for tax purposes.",
  
  loanTerm: "The number of years until the loan must be paid in full or refinanced. Commercial loans often have terms shorter than the amortization period.",
  
  amortization: "The number of years over which the loan payments are calculated. A longer amortization results in lower monthly payments but higher total interest.",
  
  loanType: "The structure of the loan payments. Fixed rate maintains the same interest rate throughout. Adjustable rate may change over time. Interest-only loans defer principal payments.",

  // Exit & Tax Assumptions
  holdPeriod: "The number of years you plan to own the property before selling. This affects the total return calculation and tax implications.",
  
  // Tax Rate Fields
  ordinaryIncomeTaxRate: "Your marginal ordinary income tax rate. Used for calculating depreciation recapture and affects the actual recapture rate applied.",
  
  capitalGainsTaxRate: "Your long-term capital gains tax rate. Applied to the capital appreciation portion of the gain after depreciation recapture.",
  
  depreciationRecaptureRate: "The tax rate applied to depreciation recapture. May be limited by your ordinary income tax rate if it's lower.",
  
  // Disposition Price Fields
  dispositionPrice: "The expected sale price of the property when using direct dollar amount method.",
  
  dispositionCapRate: "The capitalization rate assumed when selling the property. This, combined with the final year NOI, determines the estimated sale price when using cap rate method.",
  
  // Cost of Sale Fields
  costOfSaleAmount: "Fixed dollar amount for total costs to sell the property, including broker commissions, legal fees, title insurance, and other transaction costs.",
  
  costOfSalePercentage: "Percentage of sale price for total selling costs, including broker commissions, legal fees, title insurance, and other transaction costs.",
  
  // Legacy fields
  exitCapRate: "The capitalization rate assumed when selling the property. This, combined with the final year NOI, determines the estimated sale price.",
  
  sellingCosts: "Total costs to sell the property, including broker commissions, legal fees, title insurance, and other transaction costs.",
  
  capitalGainsRate: "The tax rate applied to capital gains upon sale based on holding period, income level, and tax jurisdiction.",
  
  depreciationRecapture: "The tax rate applied to depreciation claimed during ownership for real estate depreciation.",
  
  stateTaxRate: "Additional state income tax rate applied to capital gains and depreciation recapture.",
  
  taxRate: "Combined federal and state tax rate (deprecated - use specific tax rate fields for more accurate calculations).",

  // Results Tooltips
  totalReturn: "The total financial gain from the investment, including cash flows received during ownership plus proceeds from sale, minus initial equity invested.",
  
  annualizedIRR: "Internal Rate of Return - the annual rate of return that makes the net present value of all cash flows equal to zero. IRR accounts for timing of cash flows.",
  
  cashOnCashReturn: "The annual pre-tax cash flow divided by the initial equity invested. This measures the cash yield on your invested capital.",
  
  netOperatingIncome: "Property income minus operating expenses, excluding debt service. NOI is used to calculate cap rates and property values.",
} as const