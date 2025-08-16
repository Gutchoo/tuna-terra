'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, ArrowRightIcon, BookOpenIcon, PlayIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VirtualSamplePortfolioStateProps {
  onCreatePortfolio?: () => void
}

export function VirtualSamplePortfolioState({ onCreatePortfolio }: VirtualSamplePortfolioStateProps) {
  const router = useRouter()

  const handleCreatePortfolio = () => {
    if (onCreatePortfolio) {
      onCreatePortfolio()
    } else {
      // Fallback to portfolios page where user can create portfolio
      router.push('/dashboard/portfolios')
    }
  }

  const handleViewDocumentation = () => {
    // You can update this to link to your actual documentation
    window.open('/docs', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Demo Portfolio</h1>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Demo
          </Badge>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg max-w-2xl mx-auto">
          <p className="text-purple-800 dark:text-purple-200">
            <strong>This is a demonstration portfolio</strong> showcasing our comprehensive real estate platform capabilities. 
            You can explore the features but cannot add or modify properties in this demo portfolio.
          </p>
          <p className="text-purple-700 dark:text-purple-300 mt-2">
            Create your own portfolio to start managing your property data with our advanced tools and features.
          </p>
        </div>
      </div>

      {/* Feature Showcase Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              Rich Property Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Access comprehensive property information including ownership details, financial data, 
              zoning information, and market analytics all in one place.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayIcon className="h-5 w-5 text-green-600" />
              Advanced Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Powerful search and filtering capabilities to find properties by address, owner, 
              APN, location, and custom criteria across your entire portfolio.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightIcon className="h-5 w-5 text-purple-600" />
              Portfolio Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Organize properties into portfolios, collaborate with team members, 
              and track performance with detailed analytics and reporting tools.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Ready to Get Started?</h2>
              <p className="text-muted-foreground">
                Create your first portfolio to begin managing your real estate data with our powerful platform.
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={handleCreatePortfolio} size="lg" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Your First Portfolio
              </Button>
              <Button variant="outline" onClick={handleViewDocumentation} size="lg" className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}