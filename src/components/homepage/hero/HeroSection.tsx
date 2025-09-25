'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AnimatedButton } from '../ui/AnimatedButton'
import { AuthModal } from '@/components/modals/AuthModal'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()

  const handleTryDemo = () => {
    router.push('/demo')
  }

  return (
    <section className="fluid-container py-20 sm:py-24 lg:py-32 xl:py-40">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="text-fluid-4xl font-bold tracking-tight leading-normal mb-6 sm:mb-8"
          >
            Manage Your Real Estate Portfolio
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-fluid-md"
          >
            Visualize, track, and manage properties with interactive maps, 
            dynamic tables, and smart insights.
          </motion.p>
        </div>
        
        {/* CTA Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 px-fluid-md"
        >
          <AnimatedButton 
            size="lg" 
            className="w-full sm:w-auto px-fluid-lg py-fluid-md text-primary-foreground"
            premium
            onClick={() => setAuthModalOpen(true)}
          >
            Start Building Your Portfolio
          </AnimatedButton>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-fluid-lg py-fluid-md"
            onClick={handleTryDemo}
          >
            Try Demo
          </Button>
        </motion.div>
        
      </div>
      
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode="sign-up"
      />
    </section>
  )
}