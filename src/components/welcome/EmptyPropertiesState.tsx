'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, FileTextIcon, MapPinIcon } from 'lucide-react'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

type UploadMethod = 'csv' | 'apn' | 'address'

interface EmptyPropertiesStateProps {
  portfolioId?: string | null
  onAddProperties?: (method: UploadMethod) => void
}

interface MethodOption {
  id: UploadMethod
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  example: string
}

const uploadMethods: MethodOption[] = [
  {
    id: 'csv',
    title: 'CSV Upload',
    description: 'Upload multiple properties from a CSV file',
    icon: Sheet,
    example: 'Bulk import from spreadsheet'
  },
  {
    id: 'apn',
    title: 'APN Search',
    description: 'Enter an Assessor Parcel Number',
    icon: FileTextIcon,
    example: '123-456-789'
  },
  {
    id: 'address',
    title: 'Address Search',
    description: 'Search by street address',
    icon: MapPinIcon,
    example: '123 Main St, Anytown, USA'
  }
]

export function EmptyPropertiesState({ portfolioId, onAddProperties }: EmptyPropertiesStateProps) {
  // Safety check: this component should not be used for virtual sample portfolio
  if (portfolioId && isVirtualSamplePortfolio(portfolioId)) {
    return null
  }

  const handleMethodSelect = (method: UploadMethod) => {
    if (onAddProperties) {
      onAddProperties(method)
    } else {
      // Fallback to legacy page-based upload with method parameter
      const currentPortfolioParam = portfolioId ? `?portfolio_id=${portfolioId}` : ''
      window.location.href = `/upload${currentPortfolioParam}&method=${method}`
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 text-center">
      {/* Header Section */}
      <div className="mb-12">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Add your first property
          </h1>
          
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Choose how you&apos;d like to get started. Upload properties and get comprehensive 
            data including ownership, financials, and zoning information.
          </p>
        </div>
      </div>

      {/* Method Cards */}
      <div className="w-full max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {uploadMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card 
                key={method.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 group"
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {method.id === 'csv' ? 'Bulk' : 'Single'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{method.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {method.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        e.g. {method.example}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}