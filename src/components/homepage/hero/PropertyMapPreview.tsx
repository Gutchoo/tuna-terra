'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PropertyMapPreviewProps {
  className?: string
}

export function PropertyMapPreview({ className }: PropertyMapPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 100 }}
      className={cn(
        "relative w-full h-64 bg-muted/20 rounded-lg overflow-hidden border",
        "glass-card animate-float-subtle",
        className
      )}
    >
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          {/* Grid lines to simulate map */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Simulated streets */}
          <path d="M 0 120 L 400 120" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <path d="M 0 180 L 400 180" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path d="M 150 0 L 150 300" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path d="M 250 0 L 250 300" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        </svg>
      </div>

      {/* Animated property polygon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.svg 
          width="120" 
          height="80" 
          viewBox="0 0 120 80"
          className="drop-shadow-lg"
        >
          <motion.polygon
            points="20,20 100,15 100,65 15,70"
            fill="hsl(var(--primary) / 0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="animate-glow-pulse"
            initial={{ pathLength: 0, fill: "transparent" }}
            animate={{ 
              pathLength: 1, 
              fill: "hsl(var(--primary) / 0.2)"
            }}
            transition={{ 
              pathLength: { duration: 1.5, delay: 1.2 },
              fill: { duration: 0.5, delay: 2.2 }
            }}
          />
          
          {/* Property marker */}
          <motion.circle
            cx="60"
            cy="42"
            r="4"
            fill="hsl(var(--primary))"
            className="drop-shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 2.5, 
              type: "spring", 
              stiffness: 500, 
              damping: 15 
            }}
          />
          
          {/* Pulsing rings around marker */}
          <motion.circle
            cx="60"
            cy="42"
            r="8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.5, 1], 
              opacity: [0.6, 0, 0.6] 
            }}
            transition={{ 
              delay: 2.8,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none" />
      
      {/* Corner label */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="absolute top-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded"
      >
        Interactive Map
      </motion.div>
    </motion.div>
  )
}