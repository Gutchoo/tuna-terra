'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'
import { useCreateProperty } from '@/hooks/use-create-property'

const formSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
  user_notes: z.string().optional(),
  insurance_provider: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddressFormProps {
  portfolioId: string | null
  proLookupEnabled: boolean
  onProLookupChange?: (enabled: boolean) => void
}

interface AddressSuggestion {
  placeId: string
  description: string
  structuredFormat: {
    mainText: string
    secondaryText: string
  }
}

interface PropertyDetails {
  id: string
  apn: string
  address: string
  city: string
  state: string
  zip: string
  owner: string
  lot_size_sqft?: number
  assessed_value?: number
  property_type?: string
}



export function AddressForm({ portfolioId, proLookupEnabled }: AddressFormProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // React Query mutation for property creation
  const createPropertyMutation = useCreateProperty()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      user_notes: '',
      insurance_provider: '',
    },
  })

  const searchPlaces = useCallback(async (input: string) => {
      if (input.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsSearching(true)
      setSearchError(null)

      try {
        const response = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        })

        if (!response.ok) {
          throw new Error('Failed to search addresses')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Places search error:', error)
        setSearchError('Failed to search addresses')
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
  }, [])

  const searchPlacesDebounced = useCallback(debounce(searchPlaces, 500), []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddressChange = (value: string) => {
    form.setValue('address', value)
    setSelectedProperty(null)
    setSelectedAddress('')
    searchPlacesDebounced(value)
  }

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setShowSuggestions(false)
    setIsLookingUp(true)
    setSearchError(null)
    setSelectedProperty(null)

    try {
      // Get place details using our server-side API
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: suggestion.placeId })
      })

      if (!response.ok) {
        throw new Error('Failed to get place details')
      }

      const data = await response.json()
      const place = data.place

      if (place) {
        // Update form with selected address
        const formattedAddress = place.formattedAddress || suggestion.description
        form.setValue('address', formattedAddress)
        setSelectedAddress(formattedAddress)

        if (inputRef.current) {
          inputRef.current.value = formattedAddress
        }

        // In basic mode, skip Regrid lookup and create basic property
        if (!proLookupEnabled) {
          setSelectedProperty({
            id: '', // No Regrid ID in basic mode
            apn: 'N/A',
            address: formattedAddress,
            city: '',
            state: '',
            zip: '',
            owner: 'N/A',
            lot_size_sqft: undefined,
            assessed_value: undefined,
            property_type: undefined,
          })
          setIsLookingUp(false)
          return
        }

        // Look up property in Regrid (Pro mode)
        try {
          const propertyResponse = await fetch('/api/properties/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: formattedAddress
            })
          })

          const propertyData = await propertyResponse.json()

          if (!propertyResponse.ok) {
            if (propertyResponse.status === 404) {
              setSearchError('Property not found in tax records. This address may not exist in our database.')
            } else {
              throw new Error(propertyData.error || 'Failed to lookup property')
            }
            setIsLookingUp(false)
            return
          }

          const property = propertyData.property
          setSelectedProperty({
            id: property.id,
            apn: property.apn,
            address: `${property.address.line1}${property.address.line2 ? `, ${property.address.line2}` : ''}`,
            city: property.address.city,
            state: property.address.state,
            zip: property.address.zip,
            owner: property.properties?.owner || 'Owner not available',
            lot_size_sqft: property.properties?.lot_size_sqft,
            assessed_value: property.properties?.assessed_value,
            property_type: property.properties?.property_type,
          })
        } catch (error) {
          console.error('Property lookup error:', error)
          setSearchError(error instanceof Error ? error.message : 'Failed to lookup property')
        }
      } else {
        setSearchError('Failed to get place details')
      }
    } catch (error) {
      console.error('Place details error:', error)
      setSearchError('Failed to get place details')
    } finally {
      setIsLookingUp(false)
    }
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSubmit = async (data: FormData) => {
    if (!selectedProperty) {
      setSearchError('Please select a valid address to continue')
      return
    }
    if (!portfolioId) {
      setSearchError('Please select a portfolio before adding properties.')
      return
    }

    try {
      await createPropertyMutation.mutateAsync({
        portfolio_id: portfolioId,
        address: data.address,
        regrid_id: proLookupEnabled ? selectedProperty.id : undefined,
        apn: selectedProperty.apn !== 'N/A' ? selectedProperty.apn : undefined,
        user_notes: data.user_notes,
        insurance_provider: data.insurance_provider,
        use_pro_lookup: proLookupEnabled,
      })

      // Success! Show success message and clear form but stay on page
      setShowSuccess(true)
      setSelectedProperty(null)
      setSearchError(null)
      setSelectedAddress('')
      setSuggestions([])
      setShowSuggestions(false)
      form.reset()
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Submit error:', error)
      setSearchError(error instanceof Error ? error.message : 'Failed to add property')
    }
  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="relative" ref={suggestionRef}>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    ref={inputRef}
                    placeholder="Start typing an address..."
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                
                {/* Basic Mode Message */}
                {!proLookupEnabled && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 flex-shrink-0">
                      Basic Mode
                    </Badge>
                    <span className="text-sm text-amber-600">Only address data will be stored. Enable Pro Lookup for detailed property information.</span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Address Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
              {isSearching && (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  Searching addresses...
                </div>
              )}
              
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                >
                  <div className="font-medium">{suggestion.structuredFormat.mainText}</div>
                  <div className="text-sm text-muted-foreground">
                    {suggestion.structuredFormat.secondaryText}
                  </div>
                </button>
              ))}
            </div>
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

        {searchError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {isLookingUp && (
          <Alert>
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <AlertTitle>Looking Up Property</AlertTitle>
            <AlertDescription>Searching for this property in tax records...</AlertDescription>
          </Alert>
        )}

        {selectedAddress && !isLookingUp && !selectedProperty && !searchError && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Address Selected</AlertTitle>
            <AlertDescription>
              Selected: {selectedAddress}
              <br />
              Property lookup in progress...
            </AlertDescription>
          </Alert>
        )}

        {selectedProperty && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                {proLookupEnabled ? 'Property Selected' : 'Address Ready to Add'}
              </CardTitle>
              <CardDescription>
                {proLookupEnabled 
                  ? 'Review the property details below' 
                  : 'Basic address information - no detailed property data will be fetched'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Address:</strong> {selectedProperty.address}
                {selectedProperty.city && `, ${selectedProperty.city}`}
                {selectedProperty.state && `, ${selectedProperty.state}`}
                {selectedProperty.zip && ` ${selectedProperty.zip}`}
              </div>
              {proLookupEnabled ? (
                <>
                  {selectedProperty.apn && selectedProperty.apn !== 'N/A' && (
                    <div>
                      <strong>APN:</strong> {selectedProperty.apn}
                    </div>
                  )}
                  <div>
                    <strong>Owner:</strong> {selectedProperty.owner}
                  </div>
                  {selectedProperty.property_type && (
                    <div>
                      <strong>Property Type:</strong> {selectedProperty.property_type}
                    </div>
                  )}
                  {selectedProperty.lot_size_sqft && (
                    <div>
                      <strong>Lot Size:</strong> {selectedProperty.lot_size_sqft.toLocaleString()} sq ft
                    </div>
                  )}
                  {selectedProperty.assessed_value && (
                    <div>
                      <strong>Assessed Value:</strong> ${selectedProperty.assessed_value.toLocaleString()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-sm">
                  This address will be saved with basic information only. 
                  Enable Pro Lookup to fetch detailed property data including APN, owner, and financial information.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Basic Mode Message */}
        {selectedProperty && !proLookupEnabled && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
                Basic Mode
              </Badge>
              Storage Information
            </AlertTitle>
            <AlertDescription>
              Only address data will be stored. Enable Pro Lookup for detailed property information.
            </AlertDescription>
          </Alert>
        )}

        {selectedProperty && (
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