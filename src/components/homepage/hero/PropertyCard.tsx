'use client'

import { motion } from 'framer-motion'
import { MapPin, Home, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  className?: string
}

export function PropertyCard({ className }: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1, duration: 0.6, type: "spring", stiffness: 100 }}
      className={cn(
        "glass-card p-4 w-64 animate-float-subtle",
        "border border-border/50 shadow-lg",
        className
      )}
    >
      {/* Property Header */}
      <div className="flex items-start gap-3 mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.3, type: "spring", stiffness: 300 }}
          className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
        >
          <Home className="w-5 h-5 text-primary" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="font-semibold text-sm text-foreground truncate"
          >
            1234 Maple Street
          </motion.h3>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"
          >
            <MapPin className="w-3 h-3" />
            <span>San Francisco, CA</span>
          </motion.div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <span className="text-xs text-muted-foreground">Assessed Value</span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-sm font-semibold text-foreground">$1,245,000</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <span className="text-xs text-muted-foreground">Property Type</span>
          <span className="text-sm text-foreground">Residential</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <span className="text-xs text-muted-foreground">Lot Size</span>
          <span className="text-sm text-foreground">0.25 acres</span>
        </motion.div>
      </div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.9, duration: 0.4 }}
        className="mt-3 pt-3 border-t border-border/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Live Data</span>
          </div>
          <span className="text-xs text-primary font-medium">View Details</span>
        </div>
      </motion.div>
    </motion.div>
  )
}