'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CrownIcon, 
  ArrowRightIcon,
  SaveIcon,
  UsersIcon,
  MapIcon,
  BarChart3Icon
} from 'lucide-react'
import { AuthModal } from '@/components/modals/AuthModal'

interface ConversionPromptProps {
  variant?: 'banner' | 'card'
  className?: string
}

const features = [
  {
    icon: SaveIcon,
    title: 'Save Your Work',
    description: 'Keep all your properties and data permanently'
  },
  {
    icon: UsersIcon,
    title: 'More Monthly Lookups',
    description: 'Get additional property lookups each month'
  },
  {
    icon: MapIcon,
    title: 'Advanced Features',
    description: 'Full editing, portfolio sharing, and more'
  },
  {
    icon: BarChart3Icon,
    title: 'Professional Tools',
    description: 'Financial modeling and analytics'
  }
]

export function ConversionPrompt({ 
  variant = 'banner', 
  className = '' 
}: ConversionPromptProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignUp = () => {
    setShowAuthModal(true)
  }

  if (variant === 'banner') {
    return (
      <>
        <Card className={`bg-muted/30 border-border ${className}`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Left side - Message */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Explore Sample Properties with Extensive Data
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Browse commercial properties owned by some of the world&apos;s biggest companies with complete data and interactive maps.
                  Sign up for a free account to search any property using parcel numbers or addresses.
                </p>
              </div>

              {/* Right side - Action */}
              <div className="flex flex-col items-center gap-4 lg:min-w-[280px]">
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 py-3 w-full lg:w-auto"
                >
                  Create Free Account
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  10 free lookups monthly • No credit card required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AuthModal 
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultMode="sign-up"
        />
      </>
    )
  }

  // Card variant - more detailed
  return (
    <>
      <Card className={`bg-muted/30 border-border ${className}`}>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CrownIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Upgrade Your Experience
            </h3>
            <p className="text-muted-foreground">
              You&apos;ve seen what our platform can do. Ready to unlock everything?
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/10 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={handleSignUp}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-12 py-4 mb-3"
            >
              Create Free Account
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">
              10 free lookups monthly • No credit card required • Set up in 30 seconds
            </p>
          </div>
        </CardContent>
      </Card>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode="sign-up"
      />
    </>
  )
}