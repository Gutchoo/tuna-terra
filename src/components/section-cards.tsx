"use client"

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'
import { motion } from 'framer-motion'

export function SectionCards() {
  const { state } = useFinancialModeling()
  const assumptions = state.assumptions
  
  // Calculate total basis
  const actualAcquisitionCosts = assumptions.acquisitionCostType === 'percentage' 
    ? assumptions.purchasePrice * (assumptions.acquisitionCosts / 100)
    : assumptions.acquisitionCostType === 'dollar' 
      ? assumptions.acquisitionCosts 
      : 0
  
  const totalBasis = assumptions.purchasePrice + actualAcquisitionCosts

  const formatCurrency = (value: number | undefined | null) => {
    const numValue = Number(value) || 0
    
    if (numValue === 0 || isNaN(numValue)) return '$0'
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)}M`
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(0)}K`
    }
    return `$${numValue.toFixed(0)}`
  }

  // Calculate Year 1 NOI for DSCR calculations
  const getYear1NOI = () => {
    if (assumptions.potentialRentalIncome?.[0] && assumptions.potentialRentalIncome[0] > 0) {
      const grossIncome = assumptions.potentialRentalIncome[0]
      const vacancyAmount = grossIncome * (assumptions.vacancyRates?.[0] || 0)
      const effectiveGrossIncome = grossIncome - vacancyAmount
      
      let opEx = 0
      if (assumptions.operatingExpenses?.[0] !== undefined) {
        if (assumptions.operatingExpenseType === 'percentage') {
          opEx = effectiveGrossIncome * ((assumptions.operatingExpenses[0] || 0) / 100)
        } else {
          opEx = assumptions.operatingExpenses[0] || 0
        }
      }
      
      return effectiveGrossIncome - opEx
    } else if (assumptions.year1NOI) {
      return assumptions.year1NOI
    }
    return 0
  }

  // Calculate loan amount for DSCR financing
  const calculateDSCRLoanAmount = () => {
    if (assumptions.financingType === 'dscr' && assumptions.targetDSCR) {
      const year1NOI = getYear1NOI()
      
      if (year1NOI > 0 && assumptions.interestRate > 0 && assumptions.amortizationYears > 0 && assumptions.targetDSCR > 0) {
        const maxAnnualDebtService = year1NOI / assumptions.targetDSCR
        const paymentsPerYear = assumptions.paymentsPerYear || 12
        const periodicRate = assumptions.interestRate / paymentsPerYear
        const totalPayments = assumptions.amortizationYears * paymentsPerYear
        const periodicPayment = maxAnnualDebtService / paymentsPerYear
        
        if (periodicRate > 0) {
          const loanAmount = periodicPayment * ((1 - Math.pow(1 + periodicRate, -totalPayments)) / periodicRate)
          return loanAmount
        }
      }
    }
    return 0
  }

  // Format financing strategy
  const getFinancingStrategy = () => {
    if (assumptions.financingType === 'cash') {
      return {
        label: 'All Cash Purchase',
        value: 'No Financing',
        subtitle: 'No debt service'
      }
    } else if (assumptions.financingType === 'dscr') {
      const calculatedLoanAmount = calculateDSCRLoanAmount()
      const loanAmount = calculatedLoanAmount > 0 ? calculatedLoanAmount : assumptions.loanAmount || 0
      const dscrText = assumptions.targetDSCR ? `${assumptions.targetDSCR.toFixed(2)}x DSCR` : 'DSCR not set'
      
      return {
        label: 'DSCR Financing',
        value: loanAmount > 0 ? formatCurrency(loanAmount) : 'Not calculated',
        subtitle: dscrText
      }
    } else if (assumptions.financingType === 'ltv') {
      const loanAmount = assumptions.loanAmount || 0
      const ltv = assumptions.targetLTV || (assumptions.purchasePrice > 0 ? (loanAmount / assumptions.purchasePrice * 100) : 0)
      const ltvText = ltv > 0 ? `${ltv.toFixed(1)}% LTV` : 'LTV not set'
      
      return {
        label: 'LTV Financing',
        value: loanAmount > 0 ? formatCurrency(loanAmount) : 'Not calculated',
        subtitle: ltvText
      }
    }
    return {
      label: 'Financing',
      value: 'Not configured',
      subtitle: 'Select financing method'
    }
  }

  const financingStrategy = getFinancingStrategy()
  
  // Calculate exit year
  const currentYear = new Date().getFullYear()
  const exitYear = assumptions.holdPeriodYears > 0 ? currentYear + assumptions.holdPeriodYears : null

  const cards = [
    {
      icon: DollarSign,
      title: 'Investment Basis',
      value: formatCurrency(totalBasis),
      subtitle: totalBasis > 0 ? `${formatCurrency(assumptions.purchasePrice)} + ${formatCurrency(actualAcquisitionCosts)} costs` : 'Enter purchase price'
    },
    {
      icon: TrendingUp,
      title: financingStrategy.label,
      value: financingStrategy.value,
      subtitle: financingStrategy.subtitle
    },
    {
      icon: Calendar,
      title: 'Hold Period',
      value: assumptions.holdPeriodYears > 0 ? `${assumptions.holdPeriodYears} Year${assumptions.holdPeriodYears !== 1 ? 's' : ''}` : 'Not Set',
      subtitle: exitYear ? `Exit Year ${exitYear}` : 'Enter hold period'
    }
  ]

  return (
    <div className="px-4 lg:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          const staticKeys = ['investment-basis', 'financing', 'hold-period']
          
          return (
            <motion.div
              key={staticKeys[index]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-base font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {card.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-muted/5 pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}