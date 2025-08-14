'use client'

import { Suspense, lazy, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadIcon, FileTextIcon, MapPinIcon } from 'lucide-react'

// Lazy load heavy upload components
const CSVUpload = lazy(() => import('./csv-upload').then(module => ({ default: module.CSVUpload })))
const APNForm = lazy(() => import('./apn-form').then(module => ({ default: module.APNForm })))
const AddressForm = lazy(() => import('./address-form').then(module => ({ default: module.AddressForm })))

interface LazyUploadTabsProps {
  currentPortfolioId: string | null
  proLookupEnabled: boolean
}

// Loading component for upload forms
function UploadFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 w-full bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-32 bg-muted rounded animate-pulse" />
    </div>
  )
}

export function LazyUploadTabs({ currentPortfolioId, proLookupEnabled }: LazyUploadTabsProps) {
  const [activeTab, setActiveTab] = useState('csv')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            {activeTab === 'csv' ? (
              <Suspense fallback={<UploadFormSkeleton />}>
                <CSVUpload 
                  portfolioId={currentPortfolioId} 
                  proLookupEnabled={proLookupEnabled} 
                />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select this tab to load the CSV upload form
              </div>
            )}
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
            {activeTab === 'apn' ? (
              <Suspense fallback={<UploadFormSkeleton />}>
                <APNForm 
                  portfolioId={currentPortfolioId} 
                  proLookupEnabled={proLookupEnabled} 
                />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select this tab to load the APN entry form
              </div>
            )}
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
            {activeTab === 'address' ? (
              <Suspense fallback={<UploadFormSkeleton />}>
                <AddressForm 
                  portfolioId={currentPortfolioId} 
                  proLookupEnabled={proLookupEnabled} 
                />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select this tab to load the address search form
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}