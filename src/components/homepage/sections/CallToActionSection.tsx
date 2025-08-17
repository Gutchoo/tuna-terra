'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AnimatedButton } from '../ui/AnimatedButton'
import { ScrollReveal } from '../ui/ScrollReveal'

export function CallToActionSection() {
  return (
    <section className="py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Floating Elements */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="absolute -top-4 left-1/4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -top-2 right-1/3 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </motion.div>

              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Start building your portfolio today
              </h2>
            </div>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join professionals who trust our platform to manage their real estate investments 
              with precision and insight.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <AnimatedButton 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 py-3 gap-2"
                premium
                asChild
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </AnimatedButton>
              
              <AnimatedButton 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 py-3"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </AnimatedButton>
            </div>
            
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Free forever plan</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>No setup fees</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Background Pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}