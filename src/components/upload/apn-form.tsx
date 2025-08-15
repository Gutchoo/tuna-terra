'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, CheckCircleIcon, AlertCircleIcon, LoaderIcon, CrownIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCreateProperty } from '@/hooks/use-create-property'

const formSchema = z.object({
  apn: z.string().min(1, 'APN is required'),
  user_notes: z.string().optional(),
  insurance_provider: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface APNFormProps {
  portfolioId: string | null
  proLookupEnabled: boolean
}

interface PropertyPreview {
  id: string
  apn: string
  address: string
  city: string
  state: string
  zip_code: string
  owner: string
  lot_size_sqft?: number
  assessed_value?: number
}

interface DuplicateProperty {
  id: string
  address: string
  city?: string
  state?: string
  apn: string
  created_at: string
}


export function APNForm({ portfolioId, proLookupEnabled }: APNFormProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [propertyPreview, setPropertyPreview] = useState<PropertyPreview | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false)
  const [duplicateProperty, setDuplicateProperty] = useState<DuplicateProperty | null>(null)
  const [isRecentlyChanged, setIsRecentlyChanged] = useState(false)
  const [limitExceeded, setLimitExceeded] = useState<{
    message: string
    tier: string
    used: number
    limit: number
    resetDate: string
  } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  
  // React Query mutation for property creation
  const createPropertyMutation = useCreateProperty()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apn: '',
      user_notes: '',
      insurance_provider: '',
    },
  })

  // Watch the APN field for reactive updates
  const apnValue = form.watch('apn')

  // Debounced duplicate checking with timing control
  useEffect(() => {
    // Set recently changed flag whenever APN changes
    setIsRecentlyChanged(true)
    setDuplicateProperty(null) // Clear previous results
    
    const checkForDuplicate = async (apn: string) => {
      if (!apn || apn.length < 3) {
        setDuplicateProperty(null)
        setIsDuplicateChecking(false)
        setIsRecentlyChanged(false)
        return
      }

      setIsDuplicateChecking(true)
      try {
        const response = await fetch(`/api/user-properties/check-apn?apn=${encodeURIComponent(apn)}&portfolio_id=${portfolioId}`)
        const data = await response.json()

        if (response.ok && data.exists) {
          setDuplicateProperty(data.property)
        } else {
          setDuplicateProperty(null)
        }
      } catch (error) {
        console.error('Duplicate check error:', error)
        // Fail silently - don't block user if duplicate check fails
        setDuplicateProperty(null)
      } finally {
        setIsDuplicateChecking(false)
        setIsRecentlyChanged(false) // Allow button to be enabled after check completes
      }
    }

    const timeoutId = setTimeout(() => {
      checkForDuplicate(apnValue)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [apnValue, portfolioId])

  const handleSearch = async () => {
    const apn = form.getValues('apn')

    if (!apn) {
      setSearchError('Please enter an APN')
      return
    }

    // Prevent search if duplicate is found
    if (duplicateProperty) {
      setSearchError('This property already exists in your portfolio')
      return
    }

    // In basic mode, skip the Regrid search and create a basic property preview
    if (!proLookupEnabled) {
      setPropertyPreview({
        id: '', // No Regrid ID in basic mode
        apn: apn,
        address: `APN: ${apn}`, // Basic address display
        city: '',
        state: '',
        zip_code: '',
        owner: 'N/A',
        lot_size_sqft: undefined,
        assessed_value: undefined,
      })
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setPropertyPreview(null)

    try {
      const response = await fetch(`/api/properties/search?apn=${encodeURIComponent(apn)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      if (data.results && data.results.length > 0) {
        const property = data.results[0]
        setPropertyPreview({
          id: property.id,
          apn: property.apn,
          address: property.address?.line1 || 'Address not available',
          city: property.address?.city || '',
          state: property.address?.state || '',
          zip_code: property.address?.zip || '',
          owner: property.properties?.owner || 'Owner not available',
          lot_size_sqft: property.properties?.lot_size_sqft,
          assessed_value: property.properties?.assessed_value,
        })
      } else {
        setSearchError('No property found with this APN')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Failed to search property')
    } finally {
      setIsSearching(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!propertyPreview) {
      setSearchError('Please search for a property first')
      return
    }
    if (!portfolioId) {
      setSearchError('Please select a portfolio before adding properties.')
      return
    }

    try {
      await createPropertyMutation.mutateAsync({
        portfolio_id: portfolioId,
        apn: data.apn,
        address: proLookupEnabled ? propertyPreview.address : `APN: ${data.apn}`,
        city: propertyPreview.city,
        state: propertyPreview.state,
        zip_code: propertyPreview.zip_code,
        regrid_id: proLookupEnabled ? propertyPreview.id : undefined,
        user_notes: data.user_notes,
        insurance_provider: data.insurance_provider,
        use_pro_lookup: proLookupEnabled,
      })

      // Success! The mutation handles cache invalidation automatically
      // Show success message and clear form, but stay on page
      setShowSuccess(true)
      setPropertyPreview(null)
      setSearchError(null)
      form.reset()
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add property'
      
      // Handle limit exceeded error
      if (errorMessage.includes('limit exceeded')) {
        // Parse limit exceeded details if available
        setLimitExceeded({
          message: errorMessage,
          tier: 'free', // Could be parsed from error if needed
          used: 0,
          limit: 25,
          resetDate: new Date().toISOString()
        })
        return
      }
      
      // Special handling for duplicate property errors
      if (errorMessage.includes('already exists in your portfolio')) {
        setSearchError('This property is already in your portfolio. Please search for a different APN.')
        setPropertyPreview(null)
      } else {
        setSearchError(errorMessage)
      }
    }
  }

  // Show limit exceeded error
  if (limitExceeded) {
    const resetDate = new Date(limitExceeded.resetDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <CrownIcon className="h-4 w-4" />
          <AlertTitle>Property Lookup Limit Exceeded</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{limitExceeded.message}</p>
            <div className="bg-muted/50 p-3 rounded-md space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current Tier:</span>
                <Badge variant={limitExceeded.tier === 'pro' ? 'default' : 'secondary'}>
                  {limitExceeded.tier === 'pro' ? 'Pro Tier' : 'Free Tier'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Usage:</span>
                <span>{limitExceeded.used} / {limitExceeded.limit} lookups</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Resets:</span>
                <span>{resetDate}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setLimitExceeded(null)
              setPropertyPreview(null)
              setSearchError(null)
              form.reset()
            }}
            className="flex-1"
          >
            Try Again
          </Button>
          <Button onClick={() => router.push('/dashboard/account')} className="flex-1">
            View Account Details
          </Button>
        </div>
      </div>
    )
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="apn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessor Parcel Number (APN)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 123-456-789-000"
                  onChange={(e) => {
                    field.onChange(e)
                    setPropertyPreview(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (apnValue && !isSearching) {
                        handleSearch()
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              
              {/* Basic Mode Message */}
              {!proLookupEnabled && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
                    Basic Mode
                  </Badge>
                  <span className="text-sm text-amber-600">Only APN data will be stored. Enable Pro Lookup for detailed property information.</span>
                </div>
              )}
              
              {/* Duplicate property warning */}
              {duplicateProperty && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Property Already Exists
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>This APN is already in your portfolio:</p>
                        <p className="font-medium">
                          {duplicateProperty.address}
                          {duplicateProperty.city && `, ${duplicateProperty.city}`}
                          {duplicateProperty.state && `, ${duplicateProperty.state}`}
                        </p>
                        <p className="text-xs mt-1">
                          Added on {new Date(duplicateProperty.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Duplicate checking indicator */}
              {isDuplicateChecking && apnValue && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                  Checking for duplicates...
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching || !apnValue || !!duplicateProperty || isDuplicateChecking || isRecentlyChanged}
            className="flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
{isSearching ? 'Searching...' : (proLookupEnabled ? 'Search Property' : 'Use APN')}
          </Button>
        </div>

        {showSuccess && (
          <Alert>
            <CheckCircleIcon className="h-4 w-4" />
            <AlertTitle>Property Added Successfully</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>The property has been added to your portfolio. You can add another property or view your properties.</p>
              <Button 
                onClick={() => router.push(`/dashboard?portfolio_id=${portfolioId}`)}
                disabled={createPropertyMutation.isPending}
              >
                View Properties
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {searchError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {propertyPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {proLookupEnabled ? 'Property Found' : 'Property Ready to Add'}
              </CardTitle>
              <CardDescription>
                {proLookupEnabled 
                  ? 'Review the property details below' 
                  : 'Basic property information - no detailed data will be fetched'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>APN:</strong> {propertyPreview.apn}
              </div>
              {proLookupEnabled ? (
                <>
                  <div>
                    <strong>Address:</strong> {propertyPreview.address}
                    {propertyPreview.city && `, ${propertyPreview.city}`}
                    {propertyPreview.state && `, ${propertyPreview.state}`}
                    {propertyPreview.zip_code && ` ${propertyPreview.zip_code}`}
                  </div>
                  <div>
                    <strong>Owner:</strong> {propertyPreview.owner}
                  </div>
                  {propertyPreview.lot_size_sqft && (
                    <div>
                      <strong>Lot Size:</strong> {propertyPreview.lot_size_sqft.toLocaleString()} sq ft
                    </div>
                  )}
                  {propertyPreview.assessed_value && (
                    <div>
                      <strong>Assessed Value:</strong> ${propertyPreview.assessed_value.toLocaleString()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-sm">
                  This property will be saved with basic information only. 
                  Enable Pro Lookup to fetch detailed property data including address, owner, and financial information.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Basic Mode Message */}
        {propertyPreview && !proLookupEnabled && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
                Basic Mode
              </Badge>
              Storage Information
            </AlertTitle>
            <AlertDescription>
              Only APN data will be stored. Enable Pro Lookup for detailed property information.
            </AlertDescription>
          </Alert>
        )}

        {propertyPreview && (
          <>
            <FormField
              control={form.control}
              name="user_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about this property..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insurance_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. State Farm, Allstate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createPropertyMutation.isPending}
              className="w-full"
            >
              {createPropertyMutation.isPending ? 'Adding Property...' : 'Add Property to Portfolio'}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}