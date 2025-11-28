"use client"

import { createContext, useContext, useReducer, ReactNode, useMemo, useEffect, useCallback } from "react"
import { type PropertyAssumptions, type ProFormaResults, ProFormaCalculator } from "@/lib/financial-modeling/proforma"
import type { PropertyFinancials } from "@/lib/supabase"

interface PropertyFinancialState {
  propertyId: string
  purchasePrice: number // From property data
  acquisitionCosts: number // From property data
  financialData: PropertyFinancials | null
  assumptions: PropertyAssumptions
  results: ProFormaResults | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

type PropertyFinancialAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_FINANCIAL_DATA'; payload: PropertyFinancials | null }
  | { type: 'UPDATE_ASSUMPTIONS'; payload: Partial<PropertyAssumptions> }
  | { type: 'SET_RESULTS'; payload: ProFormaResults | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FINANCIALS' }

interface PropertyFinancialModelingContextType {
  state: PropertyFinancialState
  dispatch: React.Dispatch<PropertyFinancialAction>
  updateAssumption: <K extends keyof PropertyAssumptions>(key: K, value: PropertyAssumptions[K]) => void
  saveFinancials: () => Promise<void>
  calculateResults: () => void
  resetFinancials: () => void
}

const PropertyFinancialModelingContext = createContext<PropertyFinancialModelingContextType | null>(null)

// Convert PropertyFinancials (database format) to PropertyAssumptions (calculator format)
function convertToAssumptions(
  financials: PropertyFinancials,
  purchasePrice: number,
  acquisitionCosts: number
): PropertyAssumptions {
  // Helper to get single-year value from array (first position)
  const getSingleValue = (arr: number[] | null | undefined): number => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return 0
    return Number(arr[0]) || 0
  }

  return {
    // Property Details
    purchasePrice,
    acquisitionCosts,
    acquisitionCostType: 'dollar' as const,

    // Income - Convert from single-year to 30-year arrays (replicate first value)
    potentialRentalIncome: Array(30).fill(getSingleValue(financials.potential_rental_income)),
    otherIncome: Array(30).fill(getSingleValue(financials.other_income)),
    vacancyRates: Array(30).fill(getSingleValue(financials.vacancy_rates)),
    rentalIncomeGrowthRate: financials.rental_income_growth_rate || 0,
    defaultVacancyRate: financials.default_vacancy_rate || 0,

    // Operating Expenses
    operatingExpenses: Array(30).fill(getSingleValue(financials.operating_expenses)),
    operatingExpenseType: (financials.operating_expense_type || '') as 'percentage' | 'dollar' | '',
    propertyTaxes: Array(30).fill(getSingleValue(financials.property_taxes)),
    insurance: Array(30).fill(getSingleValue(financials.insurance)),
    maintenance: Array(30).fill(getSingleValue(financials.maintenance)),
    propertyManagement: Array(30).fill(getSingleValue(financials.property_management)),
    utilities: Array(30).fill(getSingleValue(financials.utilities)),
    otherExpenses: Array(30).fill(getSingleValue(financials.other_expenses)),
    defaultOperatingExpenseRate: financials.default_operating_expense_rate || 0,

    // Legacy fields
    year1NOI: 0,
    noiGrowthRate: 0,

    // Financing
    financingType: (financials.financing_type || '') as 'dscr' | 'ltv' | 'cash' | '',
    loanAmount: financials.loan_amount || 0,
    interestRate: financials.interest_rate || 0,
    loanTermYears: financials.loan_term_years || 0,
    amortizationYears: financials.amortization_years || 0,
    paymentsPerYear: financials.payments_per_year || 12,
    loanCosts: financials.loan_costs || 0,
    loanCostType: (financials.loan_cost_type || '') as 'percentage' | 'dollar' | '',
    targetDSCR: financials.target_dscr || undefined,
    targetLTV: financials.target_ltv || undefined,

    // Tax & Depreciation
    propertyType: (financials.property_type || '') as 'residential' | 'commercial' | '',
    depreciationYears: financials.property_type === 'residential' ? 27.5 : 39,
    landPercentage: financials.land_percentage || 0,
    improvementsPercentage: financials.improvements_percentage || 0,
    acquisitionMonth: 1,
    ordinaryIncomeTaxRate: financials.ordinary_income_tax_rate || 0,
    capitalGainsTaxRate: financials.capital_gains_tax_rate || 0,
    depreciationRecaptureRate: financials.depreciation_recapture_rate || 0,

    // Exit Strategy
    holdPeriodYears: financials.hold_period_years || 0,
    dispositionPriceType: (financials.disposition_price_type || '') as 'dollar' | 'caprate' | '',
    dispositionPrice: financials.disposition_price || 0,
    dispositionCapRate: financials.disposition_cap_rate || 0,
    costOfSaleType: (financials.cost_of_sale_type || '') as 'percentage' | 'dollar' | '',
    costOfSaleAmount: financials.cost_of_sale_amount || 0,
    costOfSalePercentage: financials.cost_of_sale_percentage || 0,

    // Legacy fields
    taxRate: 0,
    sellingCosts: 0,
  }
}

// Convert PropertyAssumptions (calculator format) to PropertyFinancials (database format)
function convertToFinancials(assumptions: PropertyAssumptions): Partial<PropertyFinancials> {
  // Helper to store single-year value in array format [value, 0, 0, ...]
  const toSingleValueArray = (value: number): number[] => {
    return [value, ...Array(29).fill(0)]
  }

  // Get single-year value from 30-year array
  const getSingleValue = (arr: number[]): number => {
    return arr[0] || 0
  }

  return {
    // Income
    potential_rental_income: toSingleValueArray(getSingleValue(assumptions.potentialRentalIncome)),
    other_income: toSingleValueArray(getSingleValue(assumptions.otherIncome)),
    vacancy_rates: toSingleValueArray(getSingleValue(assumptions.vacancyRates)),
    rental_income_growth_rate: assumptions.rentalIncomeGrowthRate || 0,
    default_vacancy_rate: assumptions.defaultVacancyRate || 0,

    // Operating Expenses
    operating_expenses: toSingleValueArray(getSingleValue(assumptions.operatingExpenses)),
    operating_expense_type: assumptions.operatingExpenseType || '',
    property_taxes: toSingleValueArray(getSingleValue(assumptions.propertyTaxes)),
    insurance: toSingleValueArray(getSingleValue(assumptions.insurance)),
    maintenance: toSingleValueArray(getSingleValue(assumptions.maintenance)),
    property_management: toSingleValueArray(getSingleValue(assumptions.propertyManagement)),
    utilities: toSingleValueArray(getSingleValue(assumptions.utilities)),
    other_expenses: toSingleValueArray(getSingleValue(assumptions.otherExpenses)),
    default_operating_expense_rate: assumptions.defaultOperatingExpenseRate || 0,

    // Financing
    financing_type: assumptions.financingType || '',
    loan_amount: assumptions.loanAmount || 0,
    interest_rate: assumptions.interestRate || 0,
    loan_term_years: assumptions.loanTermYears || 0,
    amortization_years: assumptions.amortizationYears || 0,
    payments_per_year: assumptions.paymentsPerYear || 12,
    loan_costs: assumptions.loanCosts || 0,
    loan_cost_type: assumptions.loanCostType || '',
    target_dscr: assumptions.targetDSCR || null,
    target_ltv: assumptions.targetLTV || null,

    // Tax & Depreciation
    property_type: assumptions.propertyType || '',
    land_percentage: assumptions.landPercentage || 0,
    improvements_percentage: assumptions.improvementsPercentage || 0,
    ordinary_income_tax_rate: assumptions.ordinaryIncomeTaxRate || 0,
    capital_gains_tax_rate: assumptions.capitalGainsTaxRate || 0,
    depreciation_recapture_rate: assumptions.depreciationRecaptureRate || 0,

    // Exit Strategy
    hold_period_years: assumptions.holdPeriodYears || 0,
    disposition_price_type: assumptions.dispositionPriceType || '',
    disposition_price: assumptions.dispositionPrice || 0,
    disposition_cap_rate: assumptions.dispositionCapRate || 0,
    cost_of_sale_type: assumptions.costOfSaleType || '',
    cost_of_sale_amount: assumptions.costOfSaleAmount || 0,
    cost_of_sale_percentage: assumptions.costOfSalePercentage || 0,
  }
}

// Default assumptions
function getDefaultAssumptions(purchasePrice: number, acquisitionCosts: number): PropertyAssumptions {
  return {
    purchasePrice,
    acquisitionCosts,
    acquisitionCostType: 'dollar' as const,
    potentialRentalIncome: Array(30).fill(0),
    otherIncome: Array(30).fill(0),
    vacancyRates: Array(30).fill(0),
    operatingExpenses: Array(30).fill(0),
    operatingExpenseType: '' as const,
    propertyTaxes: Array(30).fill(0),
    insurance: Array(30).fill(0),
    maintenance: Array(30).fill(0),
    propertyManagement: Array(30).fill(0),
    utilities: Array(30).fill(0),
    otherExpenses: Array(30).fill(0),
    rentalIncomeGrowthRate: 0,
    defaultVacancyRate: 0,
    defaultOperatingExpenseRate: 0,
    year1NOI: 0,
    noiGrowthRate: 0,
    financingType: '' as const,
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
    amortizationYears: 0,
    paymentsPerYear: 12,
    loanCosts: 0,
    loanCostType: 'percentage' as const,
    targetDSCR: undefined,
    targetLTV: undefined,
    propertyType: '' as const,
    depreciationYears: 0,
    landPercentage: 0,
    improvementsPercentage: 0,
    acquisitionMonth: 1,
    ordinaryIncomeTaxRate: 0,
    capitalGainsTaxRate: 0,
    depreciationRecaptureRate: 0,
    taxRate: 0,
    holdPeriodYears: 0,
    dispositionPriceType: '' as const,
    dispositionPrice: 0,
    dispositionCapRate: 0,
    costOfSaleType: '' as const,
    costOfSaleAmount: 0,
    costOfSalePercentage: 0,
    sellingCosts: 0,
  }
}

function propertyFinancialReducer(state: PropertyFinancialState, action: PropertyFinancialAction): PropertyFinancialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    case 'SET_FINANCIAL_DATA':
      return { ...state, financialData: action.payload }
    case 'UPDATE_ASSUMPTIONS':
      return { ...state, assumptions: { ...state.assumptions, ...action.payload } }
    case 'SET_RESULTS':
      return { ...state, results: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'RESET_FINANCIALS':
      return {
        ...state,
        financialData: null,
        assumptions: getDefaultAssumptions(state.purchasePrice, state.acquisitionCosts),
        results: null,
        error: null,
      }
    default:
      return state
  }
}

interface PropertyFinancialModelingProviderProps {
  children: ReactNode
  propertyId: string
  purchasePrice: number
  acquisitionCosts: number
}

export function PropertyFinancialModelingProvider({
  children,
  propertyId,
  purchasePrice,
  acquisitionCosts,
}: PropertyFinancialModelingProviderProps) {
  const initialState: PropertyFinancialState = {
    propertyId,
    purchasePrice,
    acquisitionCosts,
    financialData: null,
    assumptions: getDefaultAssumptions(purchasePrice, acquisitionCosts),
    results: null,
    isLoading: true,
    isSaving: false,
    error: null,
  }

  const [state, dispatch] = useReducer(propertyFinancialReducer, initialState)

  // Load financial data on mount
  useEffect(() => {
    const loadFinancialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      try {
        const response = await fetch(`/api/properties/${propertyId}/financials`)
        const { data, error } = await response.json()

        if (error) {
          throw new Error(error)
        }

        if (data) {
          // Convert database format to assumptions format
          const assumptions = convertToAssumptions(data, purchasePrice, acquisitionCosts)
          dispatch({ type: 'SET_FINANCIAL_DATA', payload: data })
          dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: assumptions })
        } else {
          // No financial data exists yet, use defaults
          dispatch({ type: 'SET_FINANCIAL_DATA', payload: null })
          dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: getDefaultAssumptions(purchasePrice, acquisitionCosts) })
        }
      } catch (error) {
        console.error('Error loading financial data:', error)
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load financial data' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadFinancialData()
  }, [propertyId, purchasePrice, acquisitionCosts])

  // Auto-calculate results whenever assumptions change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only calculate if we have some basic inputs
      if (state.assumptions.purchasePrice > 0 ||
          state.assumptions.potentialRentalIncome.some(income => income > 0)) {
        try {
          const calculator = new ProFormaCalculator(state.assumptions)
          const results = calculator.calculate()
          dispatch({ type: 'SET_RESULTS', payload: results })
        } catch (error) {
          console.debug('Auto-calculation in progress:', error)
          // Don't clear results on error, keep showing partial results
        }
      } else {
        dispatch({ type: 'SET_RESULTS', payload: null })
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [state.assumptions])

  // Auto-save financial data whenever assumptions change (debounced)
  useEffect(() => {
    // Don't auto-save during initial load
    if (state.isLoading) return

    const timer = setTimeout(() => {
      saveFinancials()
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.assumptions, state.isLoading])

  const updateAssumption = useCallback(<K extends keyof PropertyAssumptions>(
    key: K,
    value: PropertyAssumptions[K]
  ) => {
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: { [key]: value } })
  }, [])

  const saveFinancials = useCallback(async () => {
    // Don't save if already saving or loading
    if (state.isSaving || state.isLoading) return

    dispatch({ type: 'SET_SAVING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const financialData = convertToFinancials(state.assumptions)

      const response = await fetch(`/api/properties/${propertyId}/financials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(financialData),
      })

      const { data, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      dispatch({ type: 'SET_FINANCIAL_DATA', payload: data })
    } catch (error) {
      console.error('Error saving financial data:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save financial data' })
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [propertyId, state.assumptions, state.isSaving, state.isLoading])

  const calculateResults = useCallback(() => {
    try {
      const calculator = new ProFormaCalculator(state.assumptions)
      const results = calculator.calculate()
      dispatch({ type: 'SET_RESULTS', payload: results })
    } catch (error) {
      console.error('Calculation error:', error)
      dispatch({ type: 'SET_RESULTS', payload: null })
    }
  }, [state.assumptions])

  const resetFinancials = useCallback(() => {
    dispatch({ type: 'RESET_FINANCIALS' })
  }, [])

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    updateAssumption,
    saveFinancials,
    calculateResults,
    resetFinancials,
  }), [state, updateAssumption, saveFinancials, calculateResults, resetFinancials])

  return (
    <PropertyFinancialModelingContext.Provider value={contextValue}>
      {children}
    </PropertyFinancialModelingContext.Provider>
  )
}

export const usePropertyFinancialModeling = () => {
  const context = useContext(PropertyFinancialModelingContext)
  if (!context) {
    throw new Error('usePropertyFinancialModeling must be used within PropertyFinancialModelingProvider')
  }
  return context
}
