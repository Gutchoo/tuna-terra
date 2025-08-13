'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CSVUpload } from '@/components/upload/csv-upload'
import { APNForm } from '@/components/upload/apn-form'
import { AddressForm } from '@/components/upload/address-form'
import { PortfolioSelector } from '@/components/portfolios/PortfolioSelector'
import { UsageIndicator } from '@/components/usage/UsageIndicator'
import { UploadIcon, FileTextIcon, MapPinIcon } from 'lucide-react'
import type { PortfolioWithMembership } from '@/lib/supabase'

function UploadPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null)
  const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioWithMembership | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Get portfolio_id from URL params
  useEffect(() => {
    const portfolioIdFromUrl = searchParams.get('portfolio_id')
    setCurrentPortfolioId(portfolioIdFromUrl)
  }, [searchParams])

  // Handle default portfolio redirect when no portfolio_id is specified
  useEffect(() => {
    const portfolioId = searchParams.get('portfolio_id')
    
    // Only run redirect logic once when we first load without a portfolio
    if (!portfolioId && !isRedirecting && !currentPortfolioId) {
      setIsRedirecting(true)
      
      const redirectToDefaultPortfolio = async () => {
        try {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (!response.ok) {
            console.error('Failed to fetch portfolios:', response.statusText)
            setIsRedirecting(false)
            return
          }
          
          const data = await response.json()
          const portfolios = data.portfolios || []
          
          if (portfolios.length === 0) {
            // No portfolios - redirect to create one
            router.replace('/dashboard/portfolios/new')
            return
          }
          
          // Find default portfolio or use first one
          const targetPortfolio = portfolios.find((p: PortfolioWithMembership) => p.is_default) || portfolios[0]
          
          if (targetPortfolio) {
            router.replace(`/upload?portfolio_id=${targetPortfolio.id}`)
          } else {
            // Fallback: clear loading state if no portfolio found
            setIsRedirecting(false)
          }
        } catch (error) {
          console.error('Error fetching portfolios for upload:', error)
          setIsRedirecting(false)
        }
      }
      
      redirectToDefaultPortfolio()
    } else if (portfolioId && isRedirecting) {
      // Clear redirecting state if we now have a portfolio ID
      setIsRedirecting(false)
    }
  }, [searchParams, router, isRedirecting, currentPortfolioId])

  // Fetch current portfolio details
  useEffect(() => {
    if (currentPortfolioId) {
      const fetchCurrentPortfolio = async () => {
        try {
          const response = await fetch('/api/portfolios?include_stats=true')
          if (response.ok) {
            const data = await response.json()
            const portfolio = data.portfolios?.find((p: PortfolioWithMembership) => p.id === currentPortfolioId)
            setCurrentPortfolio(portfolio || null)
          }
        } catch (error) {
          console.error('Error fetching current portfolio:', error)
        }
      }
      
      fetchCurrentPortfolio()
    }
  }, [currentPortfolioId])

  if (isRedirecting) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your portfolio...</p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Properties{currentPortfolio ? ` to ${currentPortfolio.name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Import properties to your portfolio using CSV files, APNs, or addresses
          </p>
        </div>
      </div>

      {/* Portfolio Selector */}
      <PortfolioSelector 
        onPortfolioChange={(portfolioId) => {
          setCurrentPortfolioId(portfolioId)
        }}
        compact={true}
        enableInlineEdit={true}
      />

      {/* Usage Indicator */}
      <UsageIndicator compact={true} />

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="apn" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            APN Entry
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            Address Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
              <CardDescription>
                Upload a CSV file containing property data. Supported formats include APN-only files 
                or address-based files with columns for address, city, and state.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CSVUpload portfolioId={currentPortfolioId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apn" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add by APN</CardTitle>
              <CardDescription>
                Enter an Assessor Parcel Number (APN) to fetch property details automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APNForm portfolioId={currentPortfolioId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add by Address</CardTitle>
              <CardDescription>
                Search for properties by address with autocomplete suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressForm portfolioId={currentPortfolioId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading upload page...</p>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  )
}