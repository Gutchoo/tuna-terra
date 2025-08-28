'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  initial?: MotionProps['initial']
  whileInView?: MotionProps['whileInView']
  transition?: MotionProps['transition']
  viewport?: MotionProps['viewport']
}

export function MotionWrapper({ 
  children, 
  className,
  initial,
  whileInView,
  transition,
  viewport
}: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      transition={transition}
      viewport={viewport}
    >
      {children}
    </motion.div>
  )
}