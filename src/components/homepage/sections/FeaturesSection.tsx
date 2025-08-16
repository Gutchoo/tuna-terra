'use client'

import { MapIcon, TableIcon, UploadIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { ScrollReveal } from '../ui/ScrollReveal'

const features = [
  {
    icon: MapIcon,
    title: 'Interactive Maps',
    description: 'Visualize your properties on interactive maps with parcel boundaries and detailed overlays.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: TableIcon,
    title: 'Data Management',
    description: 'Filter, search, and edit property details in powerful data tables with real-time updates.',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: UploadIcon,
    title: 'Easy Import',
    description: 'Upload CSV files, enter APNs, or search addresses to quickly add properties to your portfolio.',
    color: 'text-purple-600 dark:text-purple-400'
  }
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20 lg:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your real estate portfolio efficiently and effectively
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
        <ScrollReveal delay={0.8} className="text-center mt-16">
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