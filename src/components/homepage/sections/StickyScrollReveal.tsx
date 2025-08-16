'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface StickyScrollContent {
  title: string
  description: string
  content?: React.ReactNode
  gradient?: string
}

interface StickyScrollRevealProps {
  content: StickyScrollContent[]
  className?: string
}

export function StickyScrollReveal({ 
  content, 
  className 
}: StickyScrollRevealProps) {
  const [activeCard, setActiveCard] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.3", "end 0.7"]
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const totalCards = content.length
    const cardIndex = Math.min(Math.floor(latest * totalCards), totalCards - 1)
    setActiveCard(cardIndex)
  })

  const backgroundGradient = content[activeCard]?.gradient || 
    "from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800"

  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that make real estate portfolio management effortless
          </p>
        </motion.div>

        {/* Sticky Scroll Container */}
        <motion.div
          ref={ref}
          className={cn(
            "relative lg:h-[32rem] bg-gradient-to-br rounded-2xl overflow-hidden",
            backgroundGradient,
            className
          )}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Desktop Layout */}
          <div className="hidden lg:flex h-full">
            {/* Left side - Scrolling content */}
            <div className="flex-1 p-8 lg:p-12">
              <div ref={contentRef} className="space-y-24">
                {content.map((item, index) => (
                  <motion.div
                    key={item.title + index}
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0.3,
                      scale: activeCard === index ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl lg:text-3xl font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-lg leading-relaxed max-w-lg">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
                <div className="h-20" />
              </div>
            </div>

            {/* Right side - Sticky content */}
            <div className="w-80 xl:w-96 p-8 lg:p-12 flex items-center">
              <motion.div
                key={activeCard}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-72 rounded-xl overflow-hidden shadow-2xl"
              >
                {content[activeCard]?.content ?? (
                  <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-white/60">Content Preview</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden p-6">
            {content.map((item, index) => (
              <motion.div
                key={item.title + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-12 last:mb-0"
              >
                <div className="space-y-4 mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {item.content && (
                  <div className="h-48 rounded-lg overflow-hidden">
                    {item.content}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>
  )
}