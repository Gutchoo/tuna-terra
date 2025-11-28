'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Property } from '@/lib/supabase'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface PropertyMapCardProps {
  property: Property
}

export function PropertyMapCard({ property }: PropertyMapCardProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return
    if (!property.lat || !property.lng) return

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [property.lng, property.lat],
      zoom: 16,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add marker for property location
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([property.lng, property.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <p class="font-semibold">${property.address}</p>
            <p class="text-sm text-gray-600">${property.city}, ${property.state}</p>
          </div>`
        )
      )
      .addTo(map.current)

    // If property has geometry, draw the boundary
    if (property.geometry && map.current) {
      map.current.on('load', () => {
        if (!map.current || !property.geometry) return

        // Add property boundary as a polygon
        map.current.addSource('property-boundary', {
          type: 'geojson',
          data: property.geometry as unknown as GeoJSON.GeoJSON,
        })

        // Add fill layer
        map.current.addLayer({
          id: 'property-fill',
          type: 'fill',
          source: 'property-boundary',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2,
          },
        })

        // Add outline layer
        map.current.addLayer({
          id: 'property-outline',
          type: 'line',
          source: 'property-boundary',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2,
          },
        })
      })
    }

    // Cleanup on unmount
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [property])

  const toggleFullscreen = () => {
    if (!mapContainer.current) return

    if (!document.fullscreenElement) {
      mapContainer.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (!property.lat || !property.lng) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">
              Location coordinates not available for this property
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Property Location & Boundaries</CardTitle>
        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          <Maximize2 className="h-4 w-4 mr-2" />
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </CardHeader>
      <CardContent>
        <div
          ref={mapContainer}
          className="h-[400px] rounded-lg overflow-hidden border"
        />
      </CardContent>
    </Card>
  )
}
