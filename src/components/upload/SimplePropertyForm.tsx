'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useCreateProperty } from '@/hooks/use-create-property';
import { useGooglePlacesAutocomplete } from '@/hooks/use-google-places-autocomplete';
import { cn } from '@/lib/utils';

// ============================================================================
// GOOGLE PLACES API TYPES
// ============================================================================

interface PlaceAddressComponent {
  longText: string
  shortText?: string
  types: string[]
}

interface PlaceLocation {
  latitude: number
  longitude: number
}

interface PlaceStructuredFormat {
  mainText: string
  secondaryText?: string
}

interface PlaceSuggestion {
  placeId: string
  description: string
  structuredFormat?: PlaceStructuredFormat
}

interface PlaceDetailsResponse {
  place: {
    addressComponents: PlaceAddressComponent[]
    location?: PlaceLocation
  }
}

const propertySchema = z.object({
  inputMode: z.enum(['address', 'apn']),
  address: z.string().optional(),
  apn: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  county: z.string().optional(),
}).refine(
  (data) => {
    if (data.inputMode === 'address') {
      return !!data.address && data.address.trim().length > 0;
    } else {
      return !!data.apn && data.apn.trim().length > 0;
    }
  },
  {
    message: 'Either address or APN is required',
    path: ['address'],
  }
);

type PropertyFormData = z.infer<typeof propertySchema>;

interface SimplePropertyFormProps {
  portfolioId: string;
  onSuccess?: () => void;
  demoMode?: boolean;
  onDemoPropertyAdd?: (property: Partial<{
    id: string
    portfolio_id: string
    address: string
    apn?: string
    city?: string | null
    state?: string | null
    zip_code?: string | null
    lat?: number | null
    lng?: number | null
    county?: string | null
    created_at: string
  }>) => void;
}

export function SimplePropertyForm({
  portfolioId,
  onSuccess,
  demoMode = false,
  onDemoPropertyAdd,
}: SimplePropertyFormProps) {
  const [inputMode, setInputMode] = useState<'address' | 'apn'>('address');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      inputMode: 'address',
      address: '',
      apn: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  const addressValue = watch('address') || '';

  const { suggestions, isLoading: isLoadingPlaces } = useGooglePlacesAutocomplete(
    addressValue,
    inputMode === 'address' && addressValue.length >= 3,
    demoMode
  );

  const createProperty = useCreateProperty();

  const handleAddressSelect = async (placeId: string, description: string) => {
    try {
      // Fetch place details
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, demoMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data: PlaceDetailsResponse = await response.json();

      // Parse address components
      const components = data.place?.addressComponents || [];
      const streetNumber = components.find((c: PlaceAddressComponent) =>
        c.types.includes('street_number')
      )?.longText || '';
      const route = components.find((c: PlaceAddressComponent) =>
        c.types.includes('route')
      )?.longText || '';
      const city = components.find((c: PlaceAddressComponent) =>
        c.types.includes('locality')
      )?.longText || '';
      const state = components.find((c: PlaceAddressComponent) =>
        c.types.includes('administrative_area_level_1')
      )?.shortText || '';
      const zipCode = components.find((c: PlaceAddressComponent) =>
        c.types.includes('postal_code')
      )?.longText || '';

      // Extract county (administrative_area_level_2) and strip " County" suffix
      const countyRaw = components.find((c: PlaceAddressComponent) =>
        c.types.includes('administrative_area_level_2')
      )?.longText || '';
      const county = countyRaw.replace(/ County$/i, '').trim();

      // Extract coordinates from location
      const lat = data.place?.location?.latitude;
      const lng = data.place?.location?.longitude;

      // Build full address
      const fullAddress = `${streetNumber} ${route}`.trim();

      // Update form with address and geocoding data
      setValue('address', fullAddress);
      setValue('city', city);
      setValue('state', state);
      setValue('zip_code', zipCode);

      // Set geocoding fields if available
      if (lat !== undefined && lng !== undefined) {
        setValue('lat', lat);
        setValue('lng', lng);
      }
      if (county) {
        setValue('county', county);
      }

      setShowSuggestions(false);
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast.error('Failed to fetch address details');
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (demoMode && onDemoPropertyAdd) {
      // Demo mode: create property object and call demo handler
      const demoProperty = {
        id: `demo-${Date.now()}`,
        portfolio_id: portfolioId,
        address: data.inputMode === 'address' ? data.address : 'APN Property',
        apn: data.inputMode === 'apn' ? data.apn : undefined,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        lat: data.lat || null,
        lng: data.lng || null,
        county: data.county || null,
        created_at: new Date().toISOString(),
      };

      onDemoPropertyAdd(demoProperty);
      toast.success('Property added to demo portfolio');
      reset();
      if (onSuccess) onSuccess();
      return;
    }

    try {
      // Determine address (required field)
      const address = data.inputMode === 'address'
        ? data.address!
        : `APN: ${data.apn!}`;

      // Build property data
      const propertyData: {
        portfolio_id: string
        address: string
        apn?: string
        city?: string
        state?: string
        zip_code?: string
        lat?: number
        lng?: number
        county?: string
        use_pro_lookup: boolean
      } = {
        portfolio_id: portfolioId,
        address,
        use_pro_lookup: false, // No external API lookup
      };

      // Add APN if in APN mode
      if (data.inputMode === 'apn') {
        propertyData.apn = data.apn;
      }

      // Add optional location fields
      if (data.city) propertyData.city = data.city;
      if (data.state) propertyData.state = data.state;
      if (data.zip_code) propertyData.zip_code = data.zip_code;

      // Add geocoding fields
      if (data.lat !== undefined) propertyData.lat = data.lat;
      if (data.lng !== undefined) propertyData.lng = data.lng;
      if (data.county) propertyData.county = data.county;

      await createProperty.mutateAsync(propertyData);

      toast.success('Property added successfully');
      reset();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error('Error creating property:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add property');
    }
  };

  const handleInputModeChange = (mode: 'address' | 'apn') => {
    setInputMode(mode);
    setValue('inputMode', mode);
    // Clear the other input when switching modes
    if (mode === 'address') {
      setValue('apn', '');
    } else {
      setValue('address', '');
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Input Mode Selection */}
      <div className="space-y-2">
        <Label>Property Identifier</Label>
        <RadioGroup
          value={inputMode}
          onValueChange={(value) => handleInputModeChange(value as 'address' | 'apn')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="address" id="address-mode" />
            <Label htmlFor="address-mode" className="font-normal cursor-pointer">
              Address
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="apn" id="apn-mode" />
            <Label htmlFor="apn-mode" className="font-normal cursor-pointer">
              APN
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Address Input with Autocomplete */}
      {inputMode === 'address' && (
        <div className="space-y-2 relative">
          <Label htmlFor="address">
            Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Start typing an address..."
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow click on suggestion
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddressSelect(suggestion.placeId, suggestion.description);
                  }}
                >
                  <div className="font-medium">
                    {suggestion.structuredFormat?.mainText || suggestion.description}
                  </div>
                  {suggestion.structuredFormat?.secondaryText && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.structuredFormat.secondaryText}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APN Input */}
      {inputMode === 'apn' && (
        <div className="space-y-2">
          <Label htmlFor="apn">
            APN (Assessor Parcel Number) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apn"
            {...register('apn')}
            placeholder="Enter APN..."
          />
          {errors.apn && (
            <p className="text-sm text-destructive">{errors.apn.message}</p>
          )}
        </div>
      )}

      {/* Location Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="City"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="State"
            maxLength={2}
            className="uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">Zip Code</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            placeholder="Zip"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || createProperty.isPending}
        >
          {isSubmitting || createProperty.isPending ? 'Adding...' : 'Add Property'}
        </Button>
      </div>
    </form>
  );
}
