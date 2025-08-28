'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Building, DollarSign, TrendingUp, Calculator } from 'lucide-react'

interface HorizontalSectionNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  { 
    id: 'property-income', 
    label: 'Property & Income',
    icon: Building
  },
  { 
    id: 'financing', 
    label: 'Financing',
    icon: DollarSign
  },
  { 
    id: 'assumptions', 
    label: 'Tax & Exit',
    icon: Calculator
  }
]

export function HorizontalSectionNav({ activeSection, onSectionChange }: HorizontalSectionNavProps) {
  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200",
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
              <span className="relative flex items-center gap-1.5 sm:gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">{section.label}</span>
                <span className="md:hidden text-xs">{section.label.split(' ')[0]}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "33%" }}
          animate={{ 
            width: activeSection === 'property-income' ? "33%" : 
                   activeSection === 'financing' ? "66%" : "100%"
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>
    </div>
  )
}