'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Property } from '@/lib/supabase'
import { MapOverlayTable } from './MapOverlayTable'

interface FullScreenMapViewProps {
  properties: Property[]
  selectedPropertyId: string | null
  onPropertySelect: (id: string) => void
  onPropertiesChange: (properties: Property[]) => void
  onError: (error: string) => void
}

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''


export function FullScreenMapView({
  properties,
  selectedPropertyId,
  onPropertySelect,
  onPropertiesChange,
  onError
}: FullScreenMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshingPropertyId, setRefreshingPropertyId] = useState<string | null>(null)
  const [eventHandlersSet, setEventHandlersSet] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)

  // Memoized map center calculation - only recalculates when properties with coordinates change
  const mapCenter = useMemo((): [number, number] => {
    const propertiesWithCoords = properties.filter(p => p.lat && p.lng)
    
    if (propertiesWithCoords.length === 0) {
      // Default to center of US if no coordinates
      return [-98.5795, 39.8283]
    }
    
    if (propertiesWithCoords.length === 1) {
      return [propertiesWithCoords[0].lng!, propertiesWithCoords[0].lat!]
    }
    
    // Calculate centroid of all properties
    const avgLng = propertiesWithCoords.reduce((sum, p) => sum + p.lng!, 0) / propertiesWithCoords.length
    const avgLat = propertiesWithCoords.reduce((sum, p) => sum + p.lat!, 0) / propertiesWithCoords.length
    
    return [avgLng, avgLat]
  }, [properties])

  // Transform properties to GeoJSON format
  const createGeoJSONData = useCallback(() => {
    const features = properties
      .filter(property => property.geometry && property.lat && property.lng)
      .map(property => ({
        type: 'Feature' as const,
        geometry: property.geometry as unknown as GeoJSON.Geometry,
        properties: {
          // Basic info
          id: property.id,
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zip_code,
          apn: property.apn,
          county: property.county,
          lat: property.lat,
          lng: property.lng,
          
          // Owner info
          owner: property.owner,
          owner_mailing_address: property.owner_mailing_address,
          owner_mail_city: property.owner_mail_city,
          owner_mail_state: property.owner_mail_state,
          owner_mail_zip: property.owner_mail_zip,
          
          // Property details
          year_built: property.year_built,
          num_stories: property.num_stories,
          num_units: property.num_units,
          num_rooms: property.num_rooms,
          subdivision: property.subdivision,
          lot_size_acres: property.lot_size_acres,
          lot_size_sqft: property.lot_size_sqft,
          
          // Use and zoning
          use_code: property.use_code,
          use_description: property.use_description,
          zoning: property.zoning,
          zoning_description: property.zoning_description,
          
          // Financial data
          assessed_value: property.assessed_value,
          land_value: property.land_value,
          improvement_value: property.improvement_value,
          last_sale_price: property.last_sale_price,
          sale_date: property.sale_date,
          tax_year: property.tax_year,
          parcel_value_type: property.parcel_value_type,
          
          // Location data
          census_tract: property.census_tract,
          census_block: property.census_block,
          qoz_status: property.qoz_status,
          qoz_tract: property.qoz_tract,
          
          // User data
          user_notes: property.user_notes,
          tags: property.tags,
          insurance_provider: property.insurance_provider,
          maintenance_history: property.maintenance_history,
          
          // Timestamps
          created_at: property.created_at,
          updated_at: property.updated_at,
          last_refresh_date: property.last_refresh_date,
          
          // Selection state
          isSelected: selectedPropertyId === property.id
        }
      }))

    return {
      type: 'FeatureCollection' as const,
      features
    }
  }, [properties, selectedPropertyId])

  // Center map on specific property
  const centerOnProperty = useCallback((propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    console.log('centerOnProperty called:', { propertyId, property: property ? { id: property.id, address: property.address, lat: property.lat, lng: property.lng } : null })
    if (property && property.lat && property.lng && map.current) {
      console.log('Flying to property:', { center: [property.lng, property.lat], zoom: 16 })
      map.current.flyTo({
        center: [property.lng, property.lat],
        zoom: 16,
        duration: 1500
      })
    }
  }, [properties])

  // Set up property interaction event handlers (only once)
  const setupPropertyEventHandlers = () => {
    if (!map.current || eventHandlersSet) return

    // Track hovered property ID
    let hoveredPropertyId: string | null = null

    // Add hover effect
    map.current.on('mouseenter', 'property-fills', (e) => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer'
        
        if (e.features && e.features[0]) {
          hoveredPropertyId = e.features[0].properties?.id || null
          if (hoveredPropertyId) {
            // Show hover outline for this property
            map.current.setFilter('property-outlines-hover', ['==', 'id', hoveredPropertyId])
          }
        }
      }
    })

    map.current.on('mouseleave', 'property-fills', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
        
        // Hide hover outline
        map.current.setFilter('property-outlines-hover', ['==', 'id', ''])
        hoveredPropertyId = null
      }
    })

    // Add click handler for property selection and popup
    map.current.on('click', 'property-fills', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0]
        const props = feature.properties
        const propertyId = props?.id
        
        if (propertyId) {
          // Select property (this will update the table)
          onPropertySelect(propertyId)
          
          // Remove existing popups
          const existingPopups = document.querySelectorAll('.mapboxgl-popup')
          existingPopups.forEach(popup => popup.remove())

          if (e.lngLat && map.current) {
            // Format lot size values
            const lotSqft = props.lot_size_sqft ? props.lot_size_sqft.toLocaleString() : 'N/A'
            const lotAcres = props.lot_size_acres ? props.lot_size_acres.toFixed(2) : 'N/A'

            new mapboxgl.Popup({ 
              closeButton: true, 
              closeOnClick: true,
              maxWidth: '300px'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; min-width: 250px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                    ${props.address || 'Property Details'}
                  </h3>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 500; color: #374151;">APN:</span>
                      <span style="color: #6b7280; font-family: monospace; font-size: 14px;">${props.apn || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 500; color: #374151;">Owner:</span>
                      <span style="color: #6b7280; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${props.owner || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 500; color: #374151;">Lot Size (Sq Ft):</span>
                      <span style="color: #6b7280; font-family: monospace;">${lotSqft}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 500; color: #374151;">Lot Size (Acres):</span>
                      <span style="color: #6b7280; font-family: monospace;">${lotAcres}</span>
                    </div>
                  </div>
                </div>
              `)
              .addTo(map.current)
          }
        }
      }
    })

    setEventHandlersSet(true)
  }

  // Initialize map once - prevent reinitialization when properties change
  useEffect(() => {
    if (!mapContainer.current || map.current || mapInitialized) return

    if (!mapboxgl.accessToken) {
      setError('Mapbox access token is not configured')
      setIsLoading(false)
      return
    }

    try {
      const [centerLng, centerLat] = mapCenter
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Default to satellite view for property parcels
        center: [centerLng, centerLat],
        zoom: properties.length > 0 ? 12 : 4,
        antialias: true
      })
      
      setMapInitialized(true)

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')


      map.current.on('load', () => {
        setIsLoading(false)
        addPropertyLayers()
        setupPropertyEventHandlers()
      })

      // Re-add property layers when style changes
      map.current.on('styledata', () => {
        // Only re-add layers if the style has fully loaded and we have properties
        if (map.current && map.current.isStyleLoaded() && properties.length > 0) {
          // Small delay to ensure style is fully loaded
          setTimeout(() => {
            addPropertyLayers()
          }, 100)
        }
      })

      map.current.on('error', (e) => {
        console.error('Mapbox GL error:', e)
        setError('Failed to load map')
        setIsLoading(false)
      })

    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to initialize map')
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapInitialized(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only initialize once - never recreate map

  // Add property layers to map
  const addPropertyLayers = () => {
    if (!map.current) return

    const geoJsonData = createGeoJSONData()
    
    if (geoJsonData.features.length === 0) {
      return // No properties with geometry data
    }

    // Add or update property polygons source
    if (map.current.getSource('properties')) {
      // Update existing source
      const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource
      source.setData(geoJsonData)
    } else {
      // Add new source
      map.current.addSource('properties', {
        type: 'geojson',
        data: geoJsonData
      })
    }

    // Add fill layer for property polygons (transparent fill for click detection)
    if (!map.current.getLayer('property-fills')) {
      map.current.addLayer({
        id: 'property-fills',
        type: 'fill',
        source: 'properties',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        }
      })
    }

    // Add outline layer for property polygons
    if (!map.current.getLayer('property-outlines')) {
      map.current.addLayer({
        id: 'property-outlines',
        type: 'line',
        source: 'properties',
        paint: {
          'line-color': [
            'case',
            ['get', 'isSelected'], '#1d4ed8', // Darker blue for selected outlines
            '#FFD700' // Bright yellow for unselected outlines
          ],
          'line-width': 2
        }
      })
    }

    // Add hover outline layer
    if (!map.current.getLayer('property-outlines-hover')) {
      map.current.addLayer({
        id: 'property-outlines-hover',
        type: 'line',
        source: 'properties',
        paint: {
          'line-color': '#3B82F6', // Blue hover color
          'line-width': 3
        },
        filter: ['==', 'id', ''] // Initially show nothing
      })
    }


    // Note: Bounds fitting is now handled in the portfolio switching effect
    // to provide smooth transitions between portfolios
  }

  // Update property layers when selection changes
  useEffect(() => {
    if (!map.current || !map.current.getSource('properties')) return

    const geoJsonData = createGeoJSONData()
    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource
    source.setData(geoJsonData)
  }, [selectedPropertyId, properties, createGeoJSONData])

  // Center on property when selectedPropertyId changes from table
  useEffect(() => {
    console.log('selectedPropertyId changed:', selectedPropertyId)
    if (selectedPropertyId) {
      centerOnProperty(selectedPropertyId)
    }
  }, [selectedPropertyId, centerOnProperty])

  // Handle portfolio switching - adjust map view when properties change significantly
  useEffect(() => {
    if (!map.current || !mapInitialized || properties.length === 0) return

    // Don't auto-fit bounds if user has selected a specific property (let them stay focused on it)
    if (selectedPropertyId) {
      console.log('Skipping fitBounds because property is selected:', selectedPropertyId)
      return
    }

    // If this is the first time we have properties, or if we switched to a very different location,
    // gently adjust the map view without destroying it
    const propertiesWithCoords = properties.filter(p => p.lat && p.lng)

    if (propertiesWithCoords.length > 0) {
      // Calculate bounds for current properties
      const coordinates = propertiesWithCoords.flatMap(p => [p.lng!, p.lat!])

      if (coordinates.length >= 2) {
        const bounds = new mapboxgl.LngLatBounds()
        for (let i = 0; i < coordinates.length; i += 2) {
          bounds.extend([coordinates[i], coordinates[i + 1]])
        }

        console.log('Fitting bounds to show all properties')
        // Smoothly transition to show all properties in new portfolio
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000 // Smooth transition instead of instant jump
        })
      }
    }
  }, [properties, mapInitialized, selectedPropertyId])

  // Handle property refresh
  const handleRefreshProperty = async (property: Property) => {
    if (!property.apn) {
      onError('Cannot refresh property: No APN available')
      return
    }

    setRefreshingPropertyId(property.id)

    try {
      const response = await fetch(`/api/user-properties/${property.id}/refresh`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh property')
      }

      const result = await response.json()
      
      // Update the property in the list
      const updatedProperties = properties.map(p => 
        p.id === property.id ? result.property : p
      )
      onPropertiesChange(updatedProperties)

    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to refresh property data')
    } finally {
      setRefreshingPropertyId(null)
    }
  }

  // Handle property delete
  const handleDeleteProperty = async (property: Property) => {
    try {
      const response = await fetch(`/api/user-properties/${property.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete property')
      }

      // Remove the property from the list
      const updatedProperties = properties.filter(p => p.id !== property.id)
      onPropertiesChange(updatedProperties)

      // Clear selection if this property was selected
      if (selectedPropertyId === property.id) {
        onPropertySelect('')
      }

    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to delete property')
    }
  }

  if (properties.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No properties to display</h3>
          <p className="text-muted-foreground">
            Add properties to see them visualized on the map
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-destructive/10">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-destructive">Map Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className={`h-full w-full rounded-lg border overflow-hidden ${error ? 'hidden' : ''}`}
      />

      {/* Overlay Table */}
      {!error && (
        <MapOverlayTable
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={onPropertySelect}
          onDeleteProperty={handleDeleteProperty}
        />
      )}
    </div>
  )
}