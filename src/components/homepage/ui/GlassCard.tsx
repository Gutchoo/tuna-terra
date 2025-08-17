'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  delay = 0,
  hover = true
}: GlassCardProps) {
  const hoverProps = hover ? {
    whileHover: { 
      scale: 1.03, 
      y: -4,
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    }
  } : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15 
      }}
      viewport={{ once: true, margin: "-50px" }}
      {...hoverProps}
      className={cn(
        "glass-card glow-subtle rounded-lg p-6",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {children}
    </motion.div>
  )
}