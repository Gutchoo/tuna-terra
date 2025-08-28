'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ResultItem {
  label: string
  value: string | number
  formatted?: string
  description?: string
  highlight?: boolean
  type?: 'currency' | 'percentage' | 'ratio' | 'text'
}

interface ResultsDisplayProps {
  title: string
  results: ResultItem[]
  status?: 'positive' | 'negative' | 'neutral' | 'warning'
  statusText?: string
  className?: string
}

export function ResultsDisplay({
  title,
  results,
  status,
  statusText,
  className,
}: ResultsDisplayProps) {
  const formatValue = (item: ResultItem): string => {
    if (item.formatted) return item.formatted

    switch (item.type) {
      case 'currency':
        return typeof item.value === 'number'
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(item.value)
          : String(item.value)
      
      case 'percentage':
        return typeof item.value === 'number'
          ? `${item.value.toFixed(2)}%`
          : String(item.value)
      
      case 'ratio':
        return typeof item.value === 'number'
          ? `${item.value.toFixed(2)}x`
          : String(item.value)
      
      default:
        return String(item.value)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {status && statusText && (
              <Badge variant="outline" className={getStatusColor(status)}>
                {statusText}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div
                className={cn(
                  'flex items-center justify-between py-2',
                  index > 0 && 'border-t border-border',
                  result.highlight && 'bg-muted/30 -mx-2 px-2 rounded'
                )}
              >
                <div className="flex-1">
                  <div className={cn(
                    'font-medium',
                    result.highlight && 'text-lg font-semibold'
                  )}>
                    {result.label}
                  </div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.description}
                    </div>
                  )}
                </div>
                <div className={cn(
                  'text-right font-mono',
                  result.highlight && 'text-lg font-semibold text-primary'
                )}>
                  <motion.span
                    key={formatValue(result)}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatValue(result)}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}