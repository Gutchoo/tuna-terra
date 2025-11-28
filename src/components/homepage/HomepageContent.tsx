'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Map, Layers, MapPin, Ruler, Upload, Search } from 'lucide-react'
import { AnimatedButton } from './ui/AnimatedButton'
import { AuthModal } from '@/components/modals/AuthModal'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { ScrollReveal } from './ui/ScrollReveal'

const problems = [
  {
    icon: AlertCircle,
    text: 'Properties with no street address are hard to locate'
  },
  {
    icon: AlertCircle,
    text: 'Zoning and boundary data scattered across county websites'
  },
  {
    icon: AlertCircle,
    text: 'Coordinates and parcel lines require manual research'
  }
]

const solutions = [
  {
    icon: CheckCircle2,
    text: 'GPS coordinates for every property, addressless or not'
  },
  {
    icon: CheckCircle2,
    text: 'Automatic zoning and boundary data from county records'
  },
  {
    icon: CheckCircle2,
    text: 'All property data in one centralized repository'
  }
]

const capabilities = [
  {
    icon: MapPin,
    title: 'Precise Location Data',
    description: 'GPS coordinates and property boundaries for accurate mapping of any parcel.'
  },
  {
    icon: Layers,
    title: 'Zoning Intelligence',
    description: 'Up-to-date zoning classifications and land use restrictions.'
  },
  {
    icon: Ruler,
    title: 'Parcel Boundaries',
    description: 'Detailed property lines and lot dimensions from assessor data.'
  },
  {
    icon: Upload,
    title: 'Easy Import',
    description: 'Add properties via APN, address, or bulk CSV upload.'
  },
  {
    icon: Map,
    title: 'Visual Maps',
    description: 'Interactive maps with parcel overlays and satellite imagery.'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find properties instantly by any identifier—even without an address.'
  }
]

export function HomepageContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Hero Section */}
      <section className="fluid-container min-h-[calc(100vh-80px)] flex items-center justify-center py-20 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-fluid-4xl font-bold tracking-tight leading-normal mb-6"
          >
            Managing Remote Land Shouldn&apos;t Be Hard
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Enter an APN or address—we pull coordinates, boundaries, and zoning data. All in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <AnimatedButton
              size="lg"
              premium
              onClick={() => setAuthModalOpen(true)}
            >
              Start Free
            </AnimatedButton>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/demo')}
            >
              Try Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="fluid-container py-24 sm:py-28 lg:py-36 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Challenge of Remote Properties
            </h2>
            <p className="text-lg text-muted-foreground">
              Land in isolated areas presents unique management challenges
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <ScrollReveal delay={0.1}>
              <Card className="h-full bg-red-500/5 border-red-500/20">
                <CardHeader>
                  <h3 className="text-xl font-semibold mb-6 text-center">
                    Without TunaTerra
                  </h3>
                  <div className="space-y-4">
                    {problems.map((problem, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <problem.icon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">{problem.text}</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </ScrollReveal>

            {/* Solutions */}
            <ScrollReveal delay={0.2}>
              <Card className="h-full bg-emerald-500/5 border-emerald-500/20">
                <CardHeader>
                  <h3 className="text-xl font-semibold mb-6 text-center">
                    With TunaTerra
                  </h3>
                  <div className="space-y-4">
                    {solutions.map((solution, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <solution.icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">{solution.text}</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="fluid-container py-24 sm:py-28 lg:py-36">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete property data repository with powerful visualization
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, idx) => (
              <ScrollReveal key={capability.title} delay={idx * 0.05}>
                <Card className="h-full">
                  <CardHeader>
                    <capability.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {capability.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {capability.description}
                    </p>
                  </CardHeader>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="fluid-container py-24 sm:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple to Get Started
            </h2>
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="flex items-start gap-4 p-6 bg-background rounded-lg border">
                <div className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Import Your Properties</h3>
                  <p className="text-muted-foreground">
                    Add properties by APN or address, or upload a CSV file with parcel numbers
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex items-start gap-4 p-6 bg-background rounded-lg border">
                <div className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">We Pull the Data</h3>
                  <p className="text-muted-foreground">
                    TunaTerra automatically retrieves coordinates, boundaries, and zoning from county records
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex items-start gap-4 p-6 bg-background rounded-lg border">
                <div className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visualize & Manage</h3>
                  <p className="text-muted-foreground">
                    View all your properties on interactive maps, search by any field, and keep data up-to-date
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="fluid-container py-24 sm:py-28">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Organize Your Properties?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Import by APN or address—we handle the rest. No credit card required.
            </p>
            <AnimatedButton
              size="lg"
              premium
              onClick={() => setAuthModalOpen(true)}
            >
              Get Started Free
            </AnimatedButton>
          </div>
        </ScrollReveal>
      </section>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode="sign-up"
      />
    </>
  )
}
