'use client'

import { Suspense, lazy, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadIcon, PlusIcon } from 'lucide-react'

// Lazy load upload components
const CSVUpload = lazy(() => import('./csv-upload').then(module => ({ default: module.CSVUpload })))
const SimplePropertyForm = lazy(() => import('./SimplePropertyForm').then(module => ({ default: module.SimplePropertyForm })))

interface LazyUploadTabsProps {
  currentPortfolioId: string | null
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

export function LazyUploadTabs({ currentPortfolioId }: LazyUploadTabsProps) {
  const [activeTab, setActiveTab] = useState('single')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single" className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Single Property
        </TabsTrigger>
        <TabsTrigger value="csv" className="flex items-center gap-2">
          <UploadIcon className="h-4 w-4" />
          CSV Upload
        </TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Single Property</CardTitle>
            <CardDescription>
              Enter property details manually with Google Places autocomplete assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'single' ? (
              <Suspense fallback={<UploadFormSkeleton />}>
                <SimplePropertyForm
                  portfolioId={currentPortfolioId!}
                />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select this tab to add a single property
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="csv" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>CSV File Upload</CardTitle>
            <CardDescription>
              Upload a CSV file with address or APN data for bulk property import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'csv' ? (
              <Suspense fallback={<UploadFormSkeleton />}>
                <CSVUpload
                  portfolioId={currentPortfolioId}
                />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select this tab to upload a CSV file
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
