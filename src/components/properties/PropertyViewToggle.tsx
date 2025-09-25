'use client'

import { Button } from '@/components/ui/button'
import { LayoutGridIcon, Grid3X3Icon, MapIcon } from 'lucide-react'

type ViewMode = 'cards' | 'table' | 'map'

interface PropertyViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function PropertyViewToggle({ currentView, onViewChange }: PropertyViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted/50 border rounded-lg px-0.5">
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="h-9 px-3 my-0.5"
      >
        <LayoutGridIcon className="h-4 w-4 mr-2" />
        Cards
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-9 px-3 my-0.5"
      >
        <Grid3X3Icon className="h-4 w-4 mr-2" />
        Table
      </Button>
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('map')}
        className="h-9 px-3 my-0.5"
      >
        <MapIcon className="h-4 w-4 mr-2" />
        Map
      </Button>
    </div>
  )
}