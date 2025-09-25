'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedExplainerProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function AnimatedExplainer({ title, children, className }: AnimatedExplainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold mb-6 text-center"
          >
            {title}
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Waterfall animation component for NOI breakdown
export function NOIWaterfall({ steps }: { steps: Array<{ label: string; value: number; isSubtraction: boolean }> }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: step.isSubtraction ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border',
            step.isSubtraction 
              ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' 
              : 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-2 h-2 rounded-full',
              step.isSubtraction ? 'bg-red-500' : 'bg-green-500'
            )} />
            <span className="font-medium">{step.label}</span>
          </div>
          
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 + 0.3, duration: 0.3 }}
            className={cn(
              'font-mono font-semibold',
              step.isSubtraction ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            )}
          >
            {step.isSubtraction ? '-' : '+'}${step.value.toLocaleString()}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}

// TVM growth visualization
export function TVMGrowthVisual({ 
  initialValue, 
  finalValue, 
  periods, 
  rate 
}: { 
  initialValue: number
  finalValue: number
  periods: number
  rate: number
}) {
  const growthSteps = Array.from({ length: periods + 1 }, (_, i) => {
    const value = initialValue * Math.pow(1 + rate, i)
    return { period: i, value }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${initialValue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Present Value</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${finalValue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Future Value</div>
        </motion.div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-end h-32">
          {growthSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(step.value / finalValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary/60 to-primary mx-1 rounded-t"
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {growthSteps.map((step, index) => (
            <span key={index} className="flex-1 text-center">
              Y{step.period}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Cash flow timeline for IRR/NPV
export function CashFlowTimeline({ 
  cashFlows 
}: { 
  cashFlows: Array<{ period: number; amount: number; description?: string }> 
}) {
  // const maxAmount = Math.max(...cashFlows.map(cf => Math.abs(cf.amount)))

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
        
        {/* Cash flow points */}
        <div className="flex justify-between items-center relative">
          {cashFlows.map((cf, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: cf.amount > 0 ? 20 : -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.3 }}
                className={cn(
                  'p-3 rounded-lg text-center min-w-[80px]',
                  cf.amount > 0 
                    ? 'bg-green-50 border-2 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                    : 'bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                )}
              >
                <div className={cn(
                  'font-mono font-semibold text-sm',
                  cf.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  ${cf.amount.toLocaleString()}
                </div>
                {cf.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {cf.description}
                  </div>
                )}
              </motion.div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                Year {cf.period}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}