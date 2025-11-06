'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'
import { BuildingIcon } from 'lucide-react'

// Lazy import upload forms
import dynamic from 'next/dynamic'

const CSVUpload = dynamic(() => import('@/components/upload/csv-upload').then(mod => ({ default: mod.CSVUpload })), {
  loading: () => <div className="animate-pulse h-32 bg-muted rounded" />
})

const SimplePropertyForm = dynamic(() => import('@/components/upload/SimplePropertyForm').then(mod => ({ default: mod.SimplePropertyForm })), {
  loading: () => <div className="animate-pulse h-32 bg-muted rounded" />
})

interface AddPropertiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: string | null
  onCreatePortfolio?: () => void
}

export function AddPropertiesModal({
  open,
  onOpenChange,
  portfolioId,
  onCreatePortfolio
}: AddPropertiesModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single')
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      setActiveTab('single')
      setIsProcessing(false)
    }
  }, [open])

  const handleSuccess = async () => {
    // Invalidate properties cache for real-time updates
    if (portfolioId) {
      await queryClient.invalidateQueries({
        queryKey: ['properties', portfolioId]
      })
      await queryClient.invalidateQueries({
        queryKey: ['user-properties']
      })
    }
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
    }, 250)
  }

  const handleError = (error: string) => {
    toast.error('Upload failed', {
      description: error
    })
  }

  // Check if this is the virtual sample portfolio
  if (portfolioId && isVirtualSamplePortfolio(portfolioId)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[clamp(400px,90vw,520px)] max-w-none p-fluid-md">
          <DialogHeader>
            <DialogTitle>Add Property</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[clamp(400px,90vw,600px)] max-w-none max-h-[90vh] overflow-y-auto p-fluid-md">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'csv')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Property</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-6">
            <SimplePropertyForm
              portfolioId={portfolioId!}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="csv" className="mt-6">
            <CSVUpload
              portfolioId={portfolioId}
              onSuccess={handleCsvSuccess}
              onError={handleError}
              isModal={true}
              onProcessingStateChange={setIsProcessing}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
