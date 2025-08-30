'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Building, DollarSign, TrendingUp, Calculator, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useFinancialModeling } from '@/lib/contexts/FinancialModelingContext'

interface HorizontalSectionNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  { 
    id: 'property-income', 
    label: 'Property & Income',
    icon: Building,
    step: 1
  },
  { 
    id: 'financing', 
    label: 'Financing',
    icon: DollarSign,
    step: 2
  },
  { 
    id: 'assumptions', 
    label: 'Tax & Exit',
    icon: Calculator,
    step: 3
  }
]

export function HorizontalSectionNav({ activeSection, onSectionChange }: HorizontalSectionNavProps) {
  const { state } = useFinancialModeling()
  const { completionState } = state
  
  // Determine if each section is complete
  const getSectionComplete = (sectionId: string) => {
    switch (sectionId) {
      case 'property-income':
        return completionState.propertyIncomeComplete
      case 'financing':
        return completionState.financingComplete
      case 'assumptions':
        return completionState.taxExitComplete
      default:
        return false
    }
  }
  
  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isComplete = getSectionComplete(section.id)
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200",
                "hover:bg-background/60",
                isActive 
                  ? "text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSectionBackground"
                  className="absolute inset-0 bg-background rounded-md shadow-sm"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">{section.label}</span>
                <span className="md:hidden text-xs">{section.label.split(' ')[0]}</span>
                {/* Completion indicator */}
                {isComplete ? (
                  <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                    {section.step}
                  </Badge>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress Indicator with Section Markers */}
      <div className="mt-2 relative">
        {/* Background track with section divisions */}
        <div className="h-1 bg-muted rounded-full relative overflow-hidden">
          {/* Section dividers */}
          <div className="absolute left-1/3 top-0 w-px h-full bg-background/50 z-10" />
          <div className="absolute left-2/3 top-0 w-px h-full bg-background/50 z-10" />
          
          {/* Animated progress indicator */}
          <motion.div
            className="h-full bg-primary rounded-full absolute left-0 top-0"
            initial={{ width: "0%" }}
            animate={{ 
              width: activeSection === 'property-income' ? "33.33%" : 
                     activeSection === 'financing' ? "66.66%" : "100%"
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        </div>
        
      </div>
    </div>
  )
}