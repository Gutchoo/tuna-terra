'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AnimatedButton } from '../ui/AnimatedButton'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 lg:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            Manage Your Real Estate Portfolio
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Visualize, track, and manage properties with interactive maps, 
            dynamic tables, and smart insights.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <AnimatedButton 
            size="lg" 
            className="w-full sm:w-auto text-base px-8 py-3"
            premium
            asChild
          >
            <Link href="/sign-up">Get Started Free</Link>
          </AnimatedButton>
          
          <AnimatedButton 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-base px-8 py-3"
            asChild
          >
            <Link href="/sign-in">Sign In</Link>
          </AnimatedButton>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          No credit card required • Start managing properties in minutes
        </motion.div>
      </div>
    </section>
  )
}