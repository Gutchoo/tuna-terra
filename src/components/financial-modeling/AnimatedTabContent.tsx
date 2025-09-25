'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { assumptionsPageAnimations } from '@/lib/animations'

interface AnimatedTabContentProps {
  activeTab: string
  children: React.ReactNode
  className?: string
}

export function AnimatedTabContent({ 
  activeTab, 
  children, 
  className = "" 
}: AnimatedTabContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={assumptionsPageAnimations.sectionContent}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}