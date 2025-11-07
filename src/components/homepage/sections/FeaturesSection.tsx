'use client'

import { MapIcon, TableIcon, UploadIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { ScrollReveal } from '../ui/ScrollReveal'

const features = [
  {
    icon: UploadIcon,
    title: 'Secure Storage',
    description: 'Store property data and documents with multi-user access controls.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: TableIcon,
    title: 'Collaborative Workspace',
    description: 'Share portfolios with team members (owner/editor/viewer roles).',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: MapIcon,
    title: 'Flexible Organization',
    description: 'Organize by portfolio, view on maps, or manage in data tables.',
    color: 'text-purple-600 dark:text-purple-400'
  }
]

export function FeaturesSection() {
  return (
    <section className="fluid-container py-24 sm:py-28 lg:py-36 xl:py-44">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 sm:mb-20 lg:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
            Powerful Features
          </h2>
          <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto px-fluid-md">
            Everything you need to store, organize, and access your property data securely
          </p>
        </ScrollReveal>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2 mx-auto" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* Additional Features Hint */}
        <ScrollReveal delay={0.8} className="text-center mt-16 sm:mt-20 lg:mt-24">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/20 rounded-full border border-border/50">
            <div className="flex -space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse animation-delay-200" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse animation-delay-400" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              And many more powerful features coming soon
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}