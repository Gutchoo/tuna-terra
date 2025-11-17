'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon, CrownIcon, ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCreateProperty } from '@/hooks/use-create-property'

const formSchema = z.object({
  apn: z.string().min(1, 'APN is required'),
})

type FormData = z.infer<typeof formSchema>

interface APNFormProps {
  portfolioId: string | null
  onSuccess?: (property: unknown) => void
  onError?: (error: string) => void
  onCancel?: () => void
  isModal?: boolean
  demoMode?: boolean
}


interface DuplicateProperty {
  id: string
  address: string
  city?: string
  state?: string
  apn: string
  created_at: string
}

interface DisambiguationProperty {
  id: string
  apn: string
  address: string
  city: string
  state: string
  zip: string
  assessed_value?: number
  owner?: string
  _fullData: unknown
}


export function APNForm({ portfolioId, onSuccess, onError, onCancel, isModal = false, demoMode = false }: APNFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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
  const [multipleResults, setMultipleResults] = useState<DisambiguationProperty[] | null>(null)
  const router = useRouter()

  // React Query mutation for property creation
  const createPropertyMutation = useCreateProperty()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apn: '',
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

  // Debug: Listen for multiple results trigger (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const handleDebugMultipleResults = () => {
      // Set the APN value first
      form.setValue('apn', '2005844')

      // Show mock disambiguation data
      setTimeout(() => {
        setMultipleResults([
          {
            id: '250457',
            apn: '2005844',
            address: '4829 NORCROFT DR',
            city: 'INDIANAPOLIS',
            state: 'IN',
            zip: '46221',
            assessed_value: 150300,
            owner: 'JONES, DREW C &, MEGAN K',
            _fullData: {}
          },
          {
            id: '113684',
            apn: '2005844',
            address: '7212 LAVENHAM DR',
            city: 'PLANO',
            state: 'TX',
            zip: '75025',
            assessed_value: 392891,
            owner: 'MI CASA HOLDINGS LTD',
            _fullData: {}
          },
          {
            id: '80713',
            apn: '2005844',
            address: '307 D\'ÎLE-DE-FRANCE RUE',
            city: 'LONGUEUIL',
            state: 'QC',
            zip: 'J4H 3S4',
            assessed_value: undefined,
            owner: undefined,
            _fullData: {}
          },
          {
            id: '84294',
            apn: '2005844',
            address: '202 STILLWATER DR',
            city: 'FLAGLER BEACH',
            state: 'FL',
            zip: '32136',
            assessed_value: 182000,
            owner: 'TID SERVICES INC',
            _fullData: {}
          },
          {
            id: '3279976',
            apn: '2005844',
            address: '144 MARIAN AVE',
            city: 'FANWOOD',
            state: 'NJ',
            zip: '07023',
            assessed_value: 453100,
            owner: 'KUTCHINSKI, TODD & JENNIFER',
            _fullData: {}
          }
        ])
      }, 100)
    }

    window.addEventListener('debug-apn-multiple-results', handleDebugMultipleResults)
    return () => window.removeEventListener('debug-apn-multiple-results', handleDebugMultipleResults)
  }, [form])


  const handlePropertySelection = async (property: DisambiguationProperty) => {
    if (!portfolioId) {
      const errorMsg = 'Please select a portfolio before adding properties.'
      if (isModal && onError) {
        onError(errorMsg)
      } else {
        setSubmitError(errorMsg)
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Submit with the full property data to skip Regrid API call
      await createPropertyMutation.mutateAsync({
        portfolio_id: portfolioId,
        apn: property.apn,
        address: property.address,
        city: property.city,
        state: property.state,
        zip_code: property.zip,
        use_pro_lookup: false, // Don't make another API call
        selectedPropertyData: property._fullData, // Pass the complete data
      })

      // Success!
      if (isModal && onSuccess) {
        onSuccess({
          apn: property.apn,
          address: property.address,
        })

        // Reset form and clear disambiguation
        form.reset()
        setSubmitError(null)
        setDuplicateProperty(null)
        setMultipleResults(null)
      } else {
        setShowSuccess(true)
        setSubmitError(null)
        form.reset()
        setMultipleResults(null)

        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Property selection error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add property'

      if (isModal && onError) {
        onError(errorMessage)
      } else {
        setSubmitError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!portfolioId) {
      const errorMsg = 'Please select a portfolio before adding properties.'
      if (isModal && onError) {
        onError(errorMsg)
      } else {
        setSubmitError(errorMsg)
      }
      return
    }

    // Check for duplicates first (skip in demo mode)
    if (duplicateProperty && !demoMode) {
      const errorMsg = 'This property already exists in your portfolio'
      if (isModal && onError) {
        onError(errorMsg)
      } else {
        setSubmitError(errorMsg)
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (demoMode) {
        // Demo mode: simulate API call and return mock property data
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
        
        const mockProperty = {
          id: `demo-property-${Date.now()}`,
          apn: data.apn,
          address: `APN: ${data.apn}`,
          city: 'Demo City',
          state: 'CA',
          zip_code: '90210',
          owner: 'Demo Owner',
          year_built: 2000,
          assessed_value: 500000,
          portfolio_id: 'demo-portfolio',
          geometry: null,
          lat: null,
          lng: null
        }

        if (onSuccess) {
          onSuccess(mockProperty)

          // Reset form for next property addition (demo mode)
          form.reset()
          setSubmitError(null)
          setDuplicateProperty(null)
        }
      } else {
        // Regular mode: use the existing create property mutation
        const response = await createPropertyMutation.mutateAsync({
          portfolio_id: portfolioId,
          apn: data.apn,
          address: `APN: ${data.apn}`, // Fallback address - will be updated by Regrid API
          use_pro_lookup: true, // Always attempt pro lookup first
        })

        // Check if we got multiple results that need disambiguation
        if (response && typeof response === 'object' && 'multipleResults' in response && response.multipleResults) {
          console.log('Multiple results detected, showing disambiguation')
          setMultipleResults((response as { properties: DisambiguationProperty[] }).properties)
          setIsSubmitting(false)
          return
        }

        // Success! The mutation handles cache invalidation automatically
        if (isModal && onSuccess) {
          // Modal context: call success callback with property data then reset form
          onSuccess({
            apn: data.apn,
            address: `APN: ${data.apn}`,
          })

          // Reset form for next property addition
          form.reset()
          setSubmitError(null)
          setDuplicateProperty(null)
        } else {
          // Regular page context: show success message and clear form
          setShowSuccess(true)
          setSubmitError(null)
          form.reset()

          // Hide success message after 3 seconds
          setTimeout(() => {
            setShowSuccess(false)
          }, 3000)
        }
      }
      
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add property'
      
      // Handle limit exceeded error
      if (errorMessage.includes('limit exceeded')) {
        if (isModal && onError) {
          onError(errorMessage)
        } else {
          // Parse limit exceeded details if available
          setLimitExceeded({
            message: errorMessage,
            tier: 'free', // Could be parsed from error if needed
            used: 0,
            limit: 25,
            resetDate: new Date().toISOString()
          })
        }
        return
      }
      
      // Handle errors for modal context
      if (isModal && onError) {
        onError(errorMessage)
      } else {
        setSubmitError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
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

  // Show disambiguation UI if we have multiple results
  if (multipleResults) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="font-semibold">Multiple Properties Found</h3>
          <p className="text-sm text-muted-foreground">
            Select the property you want to add (APN: {apnValue})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {multipleResults.map((property) => (
            <Card
              key={property.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
              onClick={() => handlePropertySelection(property)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="font-semibold text-base">{property.address}</div>
                  <div className="text-sm text-muted-foreground">
                    {property.city}, {property.state} {property.zip}
                  </div>
                  {property.assessed_value && (
                    <div className="text-sm font-medium">
                      ${property.assessed_value.toLocaleString()}
                    </div>
                  )}
                  {property.owner && (
                    <div className="text-xs text-muted-foreground truncate">
                      Owner: {property.owner.length > 30 ? property.owner.substring(0, 30) + '...' : property.owner}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            Adding property...
          </div>
        )}
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
                  }}
                />
              </FormControl>
              <FormMessage />
              
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
            type="submit"
            disabled={isSubmitting || !apnValue || (!!duplicateProperty && !demoMode) || isDuplicateChecking || isRecentlyChanged}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting && <LoaderIcon className="h-4 w-4 animate-spin" />}
            {isSubmitting ? (demoMode ? 'Adding to Demo...' : 'Adding Property...') : 'Add Property'}
          </Button>
          
          {demoMode && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
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

        {submitError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

      </form>
    </Form>
  )
}