'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface WaterfallLineItem {
  label: string
  amount: number
  isSubtraction?: boolean
  isSubtotal?: boolean
  isTotal?: boolean
  percentage?: number
  showPercentage?: boolean
}

interface WaterfallLineItemsProps {
  items: WaterfallLineItem[]
  className?: string
}

export function WaterfallLineItems({ items, className }: WaterfallLineItemsProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'flex items-center justify-between py-2 px-3 rounded-lg',
            item.isTotal && 'border-t border-border mt-3 pt-4 font-semibold',
            item.isSubtotal && 'bg-muted/50 font-medium',
            !item.isTotal && !item.isSubtotal && 'hover:bg-muted/30 transition-colors'
          )}
        >
          <div className="flex items-center gap-2">
            {item.isSubtraction && (
              <span className="text-muted-foreground">−</span>
            )}
            {!item.isSubtraction && !item.isTotal && !item.isSubtotal && (
              <span className="text-muted-foreground">+</span>
            )}
            <span className={cn(
              item.isTotal && 'text-primary font-semibold',
              item.isSubtotal && 'font-medium'
            )}>
              {item.label}
            </span>
            {item.showPercentage && item.percentage !== undefined && (
              <span className="text-sm text-muted-foreground ml-2">
                ({item.percentage.toFixed(1)}%)
              </span>
            )}
          </div>
          
          <div className="text-right">
            <span className={cn(
              'font-mono',
              item.isTotal && 'text-primary font-semibold text-lg',
              item.isSubtotal && 'font-medium',
              // Only use red for negative results (like negative NOI), not normal expense line items
              item.isTotal && item.amount < 0 && 'text-red-600'
            )}>
              {item.isSubtraction ? 
                `($${Math.abs(item.amount).toLocaleString()})` : 
                `$${item.amount.toLocaleString()}`
              }
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}