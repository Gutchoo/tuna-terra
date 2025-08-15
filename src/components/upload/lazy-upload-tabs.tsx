'use client'

import { Suspense, lazy, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UploadIcon, FileTextIcon, MapPinIcon, HelpCircleIcon } from 'lucide-react'

// Lazy load heavy upload components
const CSVUpload = lazy(() => import('./csv-upload').then(module => ({ default: module.CSVUpload })))
const APNForm = lazy(() => import('./apn-form').then(module => ({ default: module.APNForm })))
const AddressForm = lazy(() => import('./address-form').then(module => ({ default: module.AddressForm })))

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
            <div className="flex items-center gap-2">
              <CardTitle>CSV File Upload</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="p-4 max-w-sm">
                  <div className="space-y-3">
                    <p className="font-medium">Expected CSV format:</p>
                    <div className="border rounded-md bg-muted/30">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2 px-3 text-xs font-bold">apn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">123-456-789</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">456-789-012</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">789-012-345</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Just one column with &quot;apn&quot; as the header. We accept variations like &quot;parcel&quot;, &quot;parcelnumber&quot;, etc.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              Upload a CSV file containing APN data. Only APN-based files are supported.
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