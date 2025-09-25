'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  FileTextIcon,
  MapPinIcon,
  ArrowLeftIcon,
  HelpCircleIcon,
  BuildingIcon
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

// Lazy import upload forms
import dynamic from 'next/dynamic'

const CSVUpload = dynamic(() => import('@/components/upload/csv-upload').then(mod => ({ default: mod.CSVUpload })), {
  loading: () => <div className="animate-pulse h-32 bg-muted rounded" />
})

const APNForm = dynamic(() => import('@/components/upload/apn-form').then(mod => ({ default: mod.APNForm })), {
  loading: () => <div className="animate-pulse h-32 bg-muted rounded" />
})

const AddressForm = dynamic(() => import('@/components/upload/address-form').then(mod => ({ default: mod.AddressForm })), {
  loading: () => <div className="animate-pulse h-32 bg-muted rounded" />
})

type UploadMethod = 'csv' | 'apn' | 'address'

interface PropertyData {
  address?: string
  apn?: string
  [key: string]: unknown
}

interface AddPropertiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: string | null
  initialMethod?: UploadMethod
  onCreatePortfolio?: () => void
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
    description: 'Upload multiple properties from CSV',
    icon: Sheet,
    example: 'properties.csv with APNs'
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

export function AddPropertiesModal({
  open,
  onOpenChange,
  portfolioId,
  initialMethod,
  onCreatePortfolio
}: AddPropertiesModalProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'form' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<UploadMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      if (initialMethod) {
        // Skip method selection and go directly to form
        setCurrentStep('form')
        setSelectedMethod(initialMethod)
      } else {
        // Normal flow - start with method selection
        setCurrentStep('method')
        setSelectedMethod(null)
      }
    }
  }, [open, initialMethod])

  const handleMethodSelect = (method: UploadMethod) => {
    setSelectedMethod(method)
    setCurrentStep('form')
  }

  const handleBack = () => {
    if (currentStep === 'form') {
      if (initialMethod) {
        // If we started with a specific method, close the modal instead of going back to method selection
        onOpenChange(false)
      } else {
        // Normal flow - go back to method selection
        setCurrentStep('method')
        setSelectedMethod(null)
      }
    } else if (currentStep === 'success') {
      if (initialMethod) {
        setCurrentStep('form')
        setSelectedMethod(initialMethod)
      } else {
        setCurrentStep('method')
        setSelectedMethod(null)
      }
    }
  }

  const handleSuccess = async (property: PropertyData) => {
    // Show success toast
    toast.success('Property added successfully!', {
      description: `${property.address || property.apn} has been added to your portfolio`
    })

    // Invalidate properties cache for real-time updates
    if (portfolioId) {
      await queryClient.invalidateQueries({
        queryKey: ['properties', portfolioId]
      })
      await queryClient.invalidateQueries({
        queryKey: ['user-properties']
      })
    }

    // Always reset to the current form to allow continuous property addition
    setCurrentStep('form')
    setSelectedMethod(selectedMethod) // Keep current method (APN/Address)
  }

  const handleCsvSuccess = async (result: unknown) => {
    // Invalidate properties cache for real-time updates
    if (portfolioId) {
      await queryClient.invalidateQueries({
        queryKey: ['properties', portfolioId]
      })
      await queryClient.invalidateQueries({
        queryKey: ['user-properties']
      })
    }

    // For CSV uploads: brief delay then close modal (clean completion)
    setTimeout(() => {
      onOpenChange(false)
    }, 250) // 0.25 second delay after 100% completion
  }

  const handleError = (error: string) => {
    toast.error('Upload failed', {
      description: error
    })
  }

  // Type-safe wrappers for forms that expect unknown
  const handleApnSuccess = async (property: unknown) => {
    await handleSuccess(property as PropertyData)
  }

  const handleAddressSuccess = async (property: unknown) => {
    await handleSuccess(property as PropertyData)
  }

  const renderMethodSelection = () => {
    // Check if this is the virtual sample portfolio
    if (portfolioId && isVirtualSamplePortfolio(portfolioId)) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-6 bg-muted/50 border border-border rounded-lg">
              <p className="text-base text-muted-foreground mb-6">
                This is a demo. Properties cannot be added. Create your own portfolio to start adding your own properties.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    onCreatePortfolio?.()
                  }}
                  className="flex items-center gap-2"
                >
                  <BuildingIcon className="h-4 w-4" />
                  Create Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-fluid-md">
        <div className="text-center space-y-fluid-sm">
          <h3 className="text-fluid-lg font-semibold">Add Property</h3>
          <p className="text-fluid-sm text-muted-foreground">
            Choose how you&apos;d like to add properties
          </p>
        </div>

        <div className="space-y-fluid-xs">
          {uploadMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card 
                key={method.id}
                className="cursor-pointer hover:shadow-sm transition-all duration-200 hover:border-primary/30"
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-fluid-sm">
                  <div className="flex items-start gap-fluid-sm">
                    <div className="p-2 bg-primary/5 rounded-md flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{method.title}</h4>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                          {method.id === 'csv' ? 'Bulk' : 'Single'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
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
    )
  }

  const renderForm = () => {
    if (!selectedMethod) return null

    const method = uploadMethods.find(m => m.id === selectedMethod)
    if (!method) return null

    const Icon = method.icon

    return (
      <div className="space-y-fluid-md">
        <div className="flex items-center gap-fluid-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-1 w-fluid-sm h-fluid-sm flex-shrink-0"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-fluid-sm min-w-0 flex-1">
            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="text-fluid-lg font-semibold truncate">{method.title}</h3>
            {selectedMethod === 'csv' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="p-4 max-w-sm">
                  <div className="space-y-3">
                    <p className="font-medium">Expected CSV format:</p>
                    <div className="border rounded-md bg-muted/30">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2 px-3 text-xs font-bold">apn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">123-456-789</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">456-789-012</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1 px-3 text-xs">789-012-345</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Just one column with &quot;apn&quot; as the header. We accept variations like &quot;parcel&quot;, &quot;parcelnumber&quot;, etc.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <Separator />

        {selectedMethod === 'csv' && !isProcessing && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              We only accept CSV files with one column of parcel numbers (APNs). The column header should be &quot;apn&quot;, &quot;parcel&quot;, or similar.
            </p>
          </div>
        )}

        <div className="min-h-[200px]">
          {selectedMethod === 'csv' && (
            <CSVUpload
              portfolioId={portfolioId}
              onSuccess={handleCsvSuccess}
              onError={handleError}
              isModal={true}
              onProcessingStateChange={setIsProcessing}
            />
          )}
          {selectedMethod === 'apn' && (
            <APNForm
              portfolioId={portfolioId}
              onSuccess={handleApnSuccess}
              onError={handleError}
              isModal={true}
            />
          )}
          {selectedMethod === 'address' && (
            <AddressForm
              portfolioId={portfolioId}
              onSuccess={handleAddressSuccess}
              onError={handleError}
              isModal={true}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[clamp(400px,90vw,520px)] max-w-none max-h-[90vh] overflow-y-auto p-fluid-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Add Property Modal</DialogTitle>
        </DialogHeader>

        {currentStep === 'method' && renderMethodSelection()}
        {currentStep === 'form' && renderForm()}
      </DialogContent>
    </Dialog>
  )
}