'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  isModal?: boolean
}

interface AddressSuggestion {
  placeId: string
  description: string
  structuredFormat: {
    mainText: string
    secondaryText: string
  }
}




export function AddressForm({ portfolioId, onSuccess, onError, isModal = false }: AddressFormProps) {
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
        setSuggestions([])
        setShowSuggestions(false)
      }
  }, [])

  const searchPlacesDebounced = useCallback(debounce(searchPlaces, 500), []) // eslint-disable-line react-hooks/exhaustive-deps

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

        if (inputRef.current) {
          inputRef.current.value = formattedAddress
        }

        // Directly create the property with the address
        const propertyData = {
          portfolio_id: portfolioId,
          address: formattedAddress,
          use_pro_lookup: true, // Always attempt pro lookup first
        }

        // Create the property - the API will handle Regrid lookup internally
        await createPropertyMutation.mutateAsync(propertyData)

        // Success! Handle based on context
        if (isModal && onSuccess) {
          // Modal context: call success callback with property data
          onSuccess({
            address: formattedAddress,
          })
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
            <AlertTitle>Adding Property...</AlertTitle>
            <AlertDescription>
              Looking up property details and adding to your portfolio.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Form>
  )
}