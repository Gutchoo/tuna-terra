'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
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
    icon: MapIcon,
    title: 'Parcel-Level Data',
    description: 'Ownership, assessed values, zoning, and lot boundaries from county records'
  },
  {
    icon: BarChart3Icon,
    title: 'Financial Modeling',
    description: 'NOI, cap rate, DSCR, and IRR analysis built for CRE workflows'
  },
  {
    icon: SaveIcon,
    title: 'Portfolio Tracking',
    description: 'Organize properties into portfolios with cards, table, and map views'
  },
  {
    icon: UsersIcon,
    title: 'Collaboration',
    description: 'Share portfolios with role-based permissions'
  }
]

export function ConversionPrompt({
  variant = 'banner',
  className = ''
}: ConversionPromptProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (variant === 'banner') {
    return (
      <>
        <Card className={`bg-muted/30 border-border ${className}`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Left side - Message */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Real parcel data on real properties
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Every property below is enriched with live county assessor data — ownership,
                  assessed value, zoning, lot size, and parcel boundaries. Add a landmark property,
                  open it to see the full record, and switch to the map view to see its footprint.
                </p>
              </div>

              {/* Right side - subtle account link */}
              <div className="flex flex-col items-center gap-2 lg:min-w-[220px]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  Create free account
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  to search any US property
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
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              What&apos;s under the hood
            </h3>
            <p className="text-muted-foreground">
              The same tools available on every property in a real portfolio
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
              variant="outline"
              onClick={() => setShowAuthModal(true)}
              className="px-8"
            >
              Create free account
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
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
