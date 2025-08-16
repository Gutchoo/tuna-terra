'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="flex flex-col items-center gap-2 text-muted-foreground"
    >
      <span className="text-sm font-medium">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="p-2 rounded-full bg-muted/20 border border-border/50"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </motion.div>
  )
}