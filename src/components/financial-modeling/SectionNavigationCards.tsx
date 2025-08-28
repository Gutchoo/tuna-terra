'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, DollarSign, Building2, Calculator } from 'lucide-react'
import { assumptionsPageAnimations } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface SectionNavigationCardsProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  { 
    id: 'property', 
    label: 'Property', 
    icon: Home,
    description: 'Property details & acquisition costs'
  },
  { 
    id: 'income', 
    label: 'Income', 
    icon: DollarSign,
    description: 'Rental income & operating expenses'
  },
  { 
    id: 'financing', 
    label: 'Financing', 
    icon: Building2,
    description: 'Loan terms & interest rates'
  },
  { 
    id: 'exit', 
    label: 'Exit & Tax', 
    icon: Calculator,
    description: 'Sale assumptions & tax planning'
  }
]

export function SectionNavigationCards({ activeSection, onSectionChange }: SectionNavigationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        
        return (
          <motion.div
            key={section.id}
            variants={assumptionsPageAnimations.navCard}
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ willChange: 'transform' }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2 h-full",
                isActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/30'
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <CardContent className="pt-2">
                <div className="text-center space-y-3">
                  <div className={cn(
                    "w-12 h-12 mx-auto rounded-full flex items-center justify-center",
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-medium",
                      isActive ? 'text-primary' : ''
                    )}>
                      {section.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                  <div className="h-6 flex items-center justify-center">
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}