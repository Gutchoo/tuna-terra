'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'
import { useCreateProperty } from '@/hooks/use-create-property'

const formSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
})

type FormData = z.infer<typeof formSchema>

interface AddressFormProps {
  portfolioId: string | null
  onSuccess?: (property: unknown) => void
  onError?: (error: string) => void
  onCancel?: () => void
  isModal?: boolean
  demoMode?: boolean
}

interface AddressSuggestion {
  placeId: string
  description: string
  structuredFormat: {
    mainText: string
    secondaryText: string
  }
}




export function AddressForm({ portfolioId, onSuccess, onError, onCancel, isModal = false, demoMode = false }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
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
    },
  })

  const searchPlaces = useCallback(async (input: string) => {
      if (input.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      // Demo mode still uses real Google Places API for authentic experience
      // Only the property creation is mocked, not the address search

      try {
        const response = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, demoMode })
        })

        if (!response.ok) {
          throw new Error('Failed to search addresses')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(data.suggestions && data.suggestions.length > 0)
      } catch (error) {
        console.error('Places search error:', error)
        setSuggestions([])
        setShowSuggestions(false)
      }
  }, [demoMode])

  // Create a stable debounced function that properly captures the current searchPlaces
  const searchPlacesDebounced = useMemo(
    () => debounce((input: string) => {
      searchPlaces(input)
    }, 500),
    [searchPlaces]
  )

  const handleAddressChange = (value: string) => {
    form.setValue('address', value)
    searchPlacesDebounced(value)
  }

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    if (!portfolioId) {
      const errorMsg = 'Please select a portfolio before adding properties.'
      if (isModal && onError) {
        onError(errorMsg)
      } else {
        setSubmitError(errorMsg)
      }
      return
    }

    setShowSuggestions(false)
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Get place details using our server-side API
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: suggestion.placeId, demoMode })
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

        if (inputRef.current) {
          inputRef.current.value = formattedAddress
        }

        // Parse address components from Google Places data
        let parsedCity = ''
        let parsedState = ''
        let parsedZip = ''
        let streetNumber = ''
        let route = ''

        if (place.addressComponents) {
          for (const component of place.addressComponents) {
            const types = component.types || []
            
            // Extract street number
            if (types.includes('street_number')) {
              streetNumber = component.longText
            }
            
            // Extract route (street name)
            if (types.includes('route')) {
              route = component.longText
            }
            
            // Extract city
            if (types.includes('locality')) {
              parsedCity = component.longText
            } else if (types.includes('administrative_area_level_3') && !parsedCity) {
              parsedCity = component.longText
            }
            
            // Extract state
            if (types.includes('administrative_area_level_1')) {
              parsedState = component.shortText // Use short text for state abbreviation
            }
            
            // Extract zip code
            if (types.includes('postal_code')) {
              parsedZip = component.longText
            }
          }
        }

        // Build street address from components
        const streetAddress = [streetNumber, route].filter(Boolean).join(' ')

        if (demoMode) {
          // Demo mode: use real Google Places data but skip database creation
          // Simulate some processing delay for realism
          await new Promise(resolve => setTimeout(resolve, 800))
          
          const demoProperty = {
            id: `demo-property-${Date.now()}`,
            address: streetAddress || formattedAddress,
            city: parsedCity || 'Unknown City',
            state: parsedState || 'Unknown State', 
            zip_code: parsedZip || 'Unknown ZIP',
            owner: 'Property Owner',
            year_built: 2010,
            assessed_value: 500000,
            portfolio_id: 'demo-portfolio',
            geometry: place.geometry || null,
            lat: place.geometry?.location?.lat || null,
            lng: place.geometry?.location?.lng || null
          }

          if (onSuccess) {
            onSuccess(demoProperty)

            // Reset form and state for next property addition (demo mode)
            form.reset()
            setSuggestions([])
            setShowSuggestions(false)
            setSubmitError(null)
            if (inputRef.current) {
              inputRef.current.value = ''
            }
          }
        } else {
          // Regular mode: create the property in database
          const propertyData = {
            portfolio_id: portfolioId,
            address: streetAddress || formattedAddress, // Use street address if available, fallback to full address
            city: parsedCity || undefined,
            state: parsedState || undefined,
            zip_code: parsedZip || undefined,
            use_pro_lookup: true, // Always attempt pro lookup first
          }

          // Create the property - the API will handle Regrid lookup internally
          await createPropertyMutation.mutateAsync(propertyData)
        }

        // Success! Handle based on context (only for non-demo mode)
        if (!demoMode) {
          if (isModal && onSuccess) {
            // Modal context: call success callback with property data then reset form
            onSuccess({
              address: streetAddress || formattedAddress,
              city: parsedCity,
              state: parsedState,
              zip_code: parsedZip,
            })

            // Reset form and state for next property addition
            form.reset()
            setSuggestions([])
            setShowSuggestions(false)
            setSubmitError(null)
            if (inputRef.current) {
              inputRef.current.value = ''
            }
          } else {
            // Regular page context: show success message and clear form
            setShowSuccess(true)
            setSubmitError(null)
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
          }
        }
      } else {
        throw new Error('Failed to get place details')
      }
    } catch (error) {
      console.error('Address property creation error:', error)
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




  return (
    <Form {...form}>
      <div className="space-y-6">
        
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
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
              
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

        {submitError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}


        {isSubmitting && (
          <Alert>
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <AlertTitle>{demoMode ? 'Adding to Demo...' : 'Adding Property...'}</AlertTitle>
            <AlertDescription>
              {demoMode 
                ? 'Adding property to your demo portfolio.'
                : 'Looking up property details and adding to your portfolio.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Demo mode cancel button */}
        {demoMode && onCancel && !isSubmitting && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Form>
  )
}