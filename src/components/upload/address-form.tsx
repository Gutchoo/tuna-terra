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
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon, MapPinIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'

const formSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
  user_notes: z.string().optional(),
  insurance_provider: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddressFormProps {
  portfolioId: string | null
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



export function AddressForm({ portfolioId }: AddressFormProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

        // Look up property in Regrid
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

    setIsSubmitting(true)
    setSearchError(null)

    try {
      const response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          address: data.address,
          regrid_id: selectedProperty.id,
          user_notes: data.user_notes,
          insurance_provider: data.insurance_provider,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add property')
      }

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Submit error:', error)
      setSearchError(error instanceof Error ? error.message : 'Failed to add property')
    } finally {
      setIsSubmitting(false)
    }
  }


  if (submitSuccess) {
    return (
      <Alert>
        <CheckCircleIcon className="h-4 w-4" />
        <AlertTitle>Property Added Successfully</AlertTitle>
        <AlertDescription>
          The property has been added to your portfolio.
        </AlertDescription>
        <div className="mt-4 flex gap-4">
          <Button onClick={() => router.push(`/dashboard?portfolio_id=${portfolioId}`)}>
            View Properties
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSubmitSuccess(false)
              setSelectedProperty(null)
              setSelectedAddress('')
              setSuggestions([])
              setShowSuggestions(false)
              form.reset()
              if (inputRef.current) {
                inputRef.current.value = ''
              }
            }}
          >
            Add Another Property
          </Button>
        </div>
      </Alert>
    )
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
                Property Selected
              </CardTitle>
              <CardDescription>Review the property details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Address:</strong> {selectedProperty.address}
                {selectedProperty.city && `, ${selectedProperty.city}`}
                {selectedProperty.state && `, ${selectedProperty.state}`}
                {selectedProperty.zip && ` ${selectedProperty.zip}`}
              </div>
              {selectedProperty.apn && (
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
            </CardContent>
          </Card>
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
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Adding Property...' : 'Add Property to Portfolio'}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}