"use client"

import { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from "react"
import { type PropertyAssumptions, type ProFormaResults, ProFormaCalculator } from "@/lib/financial-modeling/proforma"

interface FinancialState {
  activeSection: string
  assumptions: PropertyAssumptions
  results: ProFormaResults | null
  isCalculating: boolean
}

type FinancialAction = 
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'UPDATE_ASSUMPTIONS'; payload: Partial<PropertyAssumptions> }
  | { type: 'SET_RESULTS'; payload: ProFormaResults | null }
  | { type: 'SET_CALCULATING'; payload: boolean }

interface FinancialModelingContextType {
  state: FinancialState
  dispatch: React.Dispatch<FinancialAction>
  updateAssumption: <K extends keyof PropertyAssumptions>(key: K, value: PropertyAssumptions[K]) => void
  calculateResults: () => void
}

const defaultAssumptions: PropertyAssumptions = {
  purchasePrice: 0,
  acquisitionCosts: 0,
  acquisitionCostType: 'percentage' as const,
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
  financingType: 'dscr' as const,
  loanAmount: 0,
  interestRate: 0,
  loanTermYears: 0,
  amortizationYears: 0,
  paymentsPerYear: 12,
  loanCosts: 0,
  loanCostType: 'percentage' as const,
  targetDSCR: undefined,
  targetLTV: undefined,
  propertyType: '' as 'residential' | 'commercial' | '',
  depreciationYears: 0,
  landPercentage: 0,
  improvementsPercentage: 0,
  acquisitionMonth: 1, // Default to January
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

const initialState: FinancialState = {
  activeSection: "input-sheet",
  assumptions: defaultAssumptions,
  results: null,
  isCalculating: false
}

function financialReducer(state: FinancialState, action: FinancialAction): FinancialState {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload }
    case 'UPDATE_ASSUMPTIONS':
      return { ...state, assumptions: { ...state.assumptions, ...action.payload } }
    case 'SET_RESULTS':
      return { ...state, results: action.payload }
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload }
    default:
      return state
  }
}

// Sanitize assumptions to provide safe defaults for calculations
function sanitizeAssumptions(assumptions: PropertyAssumptions): PropertyAssumptions {
  return {
    ...assumptions,
    purchasePrice: Number(assumptions.purchasePrice) || 0,
    acquisitionCosts: Number(assumptions.acquisitionCosts) || 0,
    loanAmount: Math.min(Number(assumptions.loanAmount) || 0, Number(assumptions.purchasePrice) || 0),
    interestRate: Math.max(0, Math.min(1, Number(assumptions.interestRate) || 0)),
    loanTermYears: Math.max(0, Math.min(50, Number(assumptions.loanTermYears) || 0)),
    amortizationYears: Math.max(0, Math.min(50, Number(assumptions.amortizationYears) || 0)),
    taxRate: Math.max(0, Math.min(1, Number(assumptions.taxRate) || 0)),
    ordinaryIncomeTaxRate: Math.max(0, Math.min(1, Number(assumptions.ordinaryIncomeTaxRate) || 0)),
    capitalGainsTaxRate: Math.max(0, Math.min(1, Number(assumptions.capitalGainsTaxRate) || 0)),
    depreciationRecaptureRate: Math.max(0, Math.min(0.25, Number(assumptions.depreciationRecaptureRate) || 0)),
    holdPeriodYears: assumptions.holdPeriodYears === 0 ? 0 : Math.max(1, Math.min(10, Number(assumptions.holdPeriodYears) || 5)),
    landPercentage: Math.max(0, Math.min(100, Number(assumptions.landPercentage) || 0)),
    improvementsPercentage: Math.max(0, Math.min(100, Number(assumptions.improvementsPercentage) || 0)),
    acquisitionMonth: Math.max(1, Math.min(12, Number(assumptions.acquisitionMonth) || 1)),
    dispositionPrice: Math.max(0, Number(assumptions.dispositionPrice) || 0),
    dispositionCapRate: Math.max(0, Math.min(1, Number(assumptions.dispositionCapRate) || 0)),
    costOfSaleAmount: Math.max(0, Number(assumptions.costOfSaleAmount) || 0),
    costOfSalePercentage: Math.max(0, Math.min(1, Number(assumptions.costOfSalePercentage) || 0)),
    sellingCosts: Math.max(0, Math.min(1, Number(assumptions.sellingCosts) || 0)),
    depreciationYears: Number(assumptions.depreciationYears) || (assumptions.propertyType === 'residential' ? 27.5 : 39),
    paymentsPerYear: Number(assumptions.paymentsPerYear) || 12,
    loanCosts: Math.max(0, Number(assumptions.loanCosts) || 0), // No max limit - can be percentage or dollar amount
    // Sanitize arrays
    potentialRentalIncome: assumptions.potentialRentalIncome.map(val => Math.max(0, Number(val) || 0)),
    otherIncome: assumptions.otherIncome.map(val => Math.max(0, Number(val) || 0)),
    vacancyRates: assumptions.vacancyRates.map(val => Math.max(0, Math.min(1, Number(val) || 0))),
    operatingExpenses: assumptions.operatingExpenses.map(val => Math.max(0, Number(val) || 0)),
    propertyTaxes: assumptions.propertyTaxes.map(val => Math.max(0, Number(val) || 0)),
    insurance: assumptions.insurance.map(val => Math.max(0, Number(val) || 0)),
    maintenance: assumptions.maintenance.map(val => Math.max(0, Number(val) || 0)),
    propertyManagement: assumptions.propertyManagement.map(val => Math.max(0, Number(val) || 0)),
    utilities: assumptions.utilities.map(val => Math.max(0, Number(val) || 0)),
    otherExpenses: assumptions.otherExpenses.map(val => Math.max(0, Number(val) || 0)),
  }
}

const FinancialModelingContext = createContext<FinancialModelingContextType | null>(null)

export function FinancialModelingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financialReducer, initialState)

  const updateAssumption = <K extends keyof PropertyAssumptions>(
    key: K,
    value: PropertyAssumptions[K]
  ) => {
    dispatch({ type: 'UPDATE_ASSUMPTIONS', payload: { [key]: value } })
  }

  // Auto-calculate results whenever assumptions change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only calculate if we have some basic inputs
      if (state.assumptions.purchasePrice > 0 || 
          state.assumptions.potentialRentalIncome.some(income => income > 0)) {
        dispatch({ type: 'SET_CALCULATING', payload: true })
        
        try {
          const sanitizedAssumptions = sanitizeAssumptions(state.assumptions)
          const calculator = new ProFormaCalculator(sanitizedAssumptions)
          const results = calculator.calculate()
          dispatch({ type: 'SET_RESULTS', payload: results })
        } catch (error) {
          console.debug('Auto-calculation in progress:', error)
          // Don't clear results on error, keep showing partial results
        } finally {
          dispatch({ type: 'SET_CALCULATING', payload: false })
        }
      } else {
        // Clear results when no meaningful inputs
        dispatch({ type: 'SET_RESULTS', payload: null })
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [state.assumptions])

  // Legacy calculateResults for backward compatibility (now just triggers immediate calculation)
  const calculateResults = useMemo(() => {
    return () => {
      dispatch({ type: 'SET_CALCULATING', payload: true })
      
      setTimeout(() => {
        try {
          const sanitizedAssumptions = sanitizeAssumptions(state.assumptions)
          const calculator = new ProFormaCalculator(sanitizedAssumptions)
          const results = calculator.calculate()
          dispatch({ type: 'SET_RESULTS', payload: results })
        } catch (error) {
          console.error('Manual calculation error:', error)
          dispatch({ type: 'SET_RESULTS', payload: null })
        } finally {
          dispatch({ type: 'SET_CALCULATING', payload: false })
        }
      }, 100)
    }
  }, [state.assumptions])

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    updateAssumption,
    calculateResults
  }), [state, updateAssumption, calculateResults])

  return (
    <FinancialModelingContext.Provider value={contextValue}>
      {children}
    </FinancialModelingContext.Provider>
  )
}

export const useFinancialModeling = () => {
  const context = useContext(FinancialModelingContext)
  if (!context) {
    throw new Error('useFinancialModeling must be used within FinancialModelingProvider')
  }
  return context
}