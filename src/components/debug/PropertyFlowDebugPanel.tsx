'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, FileText, Sheet, MapPin, CheckCircle, ChevronDown, ChevronUp, CrownIcon, Settings, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function PropertyFlowDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'failure' | null>>({
    apn: null,
    csv: null,
    address: null
  })
  const queryClient = useQueryClient()

  // Only show in development when test data is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DATA === 'false') {
    return null
  }

  const simulateApnSuccess = async () => {
    setTestResults(prev => ({ ...prev, apn: 'success' }))

    // Show success toast matching real APN flow
    toast.success('Property added successfully!', {
      description: '1234 Main Street, Berkeley, CA has been added to your portfolio'
    })

    // Invalidate queries like the real flow
    await queryClient.invalidateQueries({ queryKey: ['properties'] })
    await queryClient.invalidateQueries({ queryKey: ['user-properties'] })
  }

  const simulateCsvSuccess = async () => {
    setTestResults(prev => ({ ...prev, csv: 'success' }))

    // Show success toast matching real CSV flow
    toast.success('CSV upload completed!', {
      description: '3/3 properties uploaded successfully'
    })

    // Invalidate queries like the real flow
    await queryClient.invalidateQueries({ queryKey: ['properties'] })
    await queryClient.invalidateQueries({ queryKey: ['user-properties'] })
  }

  const simulateAddressSuccess = async () => {
    setTestResults(prev => ({ ...prev, address: 'success' }))

    // Show success toast matching real address flow
    toast.success('Property added successfully!', {
      description: '1600 Amphitheatre Parkway, Mountain View, CA has been added to your portfolio'
    })

    // Invalidate queries like the real flow
    await queryClient.invalidateQueries({ queryKey: ['properties'] })
    await queryClient.invalidateQueries({ queryKey: ['user-properties'] })
  }

  const simulateApnFailure = () => {
    setTestResults(prev => ({ ...prev, apn: 'failure' }))

    toast.error('Upload failed', {
      description: 'APN not found or invalid format'
    })
  }

  const simulateCsvFailure = () => {
    setTestResults(prev => ({ ...prev, csv: 'failure' }))

    toast.error('Upload failed', {
      description: 'Invalid CSV format or missing APN column'
    })
  }

  const simulateCsvRateLimit = () => {
    setTestResults(prev => ({ ...prev, csv: 'failure' }))

    // Simulate the exact rate limit error message from the CSV upload
    toast.error('Property Lookup Limit Exceeded', {
      description: 'You have reached your property lookup limit. Used 25 of 25 lookups for Free Tier. Limit resets monthly.',
      duration: 8000, // Longer duration for rate limit errors
      action: {
        label: 'View Account',
        onClick: () => console.log('Navigate to account page')
      }
    })
  }

  const openRealCsvModal = () => {
    // Trigger the actual Add Properties Modal with CSV method
    const event = new CustomEvent('debug-open-csv-modal', {
      detail: { method: 'csv' }
    })
    window.dispatchEvent(event)
  }

  const closeRealModal = () => {
    // Trigger closing the actual modal
    const event = new CustomEvent('debug-close-modal')
    window.dispatchEvent(event)
  }

  const triggerFileValidationState = () => {
    // First open the modal, then set file validation state
    openRealCsvModal()
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('debug-csv-file-validation'))
    }, 100)
  }

  const triggerProcessingState = () => {
    // First ensure modal is open with validation data, then trigger processing
    openRealCsvModal()
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('debug-csv-file-validation'))
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('debug-csv-processing'))
      }, 50)
    }, 100)
  }

  const resetCsvState = () => {
    // Reset the CSV component state
    window.dispatchEvent(new CustomEvent('debug-csv-reset'))
  }

  const simulateAddressFailure = () => {
    setTestResults(prev => ({ ...prev, address: 'failure' }))

    toast.error('Upload failed', {
      description: 'Address not found or unable to resolve location'
    })
  }

  const resetResults = () => {
    setTestResults({ apn: null, csv: null, address: null })
    toast.info('Debug results cleared')
  }

  const getStatusBadge = (status: 'success' | 'failure' | null) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">Success</Badge>
      case 'failure':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Not Tested</Badge>
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between text-blue-700">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Property Flow Debug Panel (Dev Only)
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-medium text-blue-700 mb-2">
              Test Property Addition Success States:
            </div>
            <Badge variant="outline" className="text-xs">
              Simulates successful property additions without API calls
            </Badge>
          </div>

          {/* APN Flow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">APN Flow</span>
              </div>
              {getStatusBadge(testResults.apn)}
            </div>
            <div className="flex gap-1">
              <Button
                onClick={simulateApnSuccess}
                size="sm"
                variant="default"
                className="flex-1 h-7 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Success
              </Button>
              <Button
                onClick={simulateApnFailure}
                size="sm"
                variant="destructive"
                className="flex-1 h-7 text-xs"
              >
                Failure
              </Button>
            </div>
          </div>

          {/* CSV Flow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sheet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">CSV Flow</span>
              </div>
              {getStatusBadge(testResults.csv)}
            </div>
            <div className="space-y-1">
              <div className="flex gap-1">
                <Button
                  onClick={simulateCsvSuccess}
                  size="sm"
                  variant="default"
                  className="flex-1 h-7 text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Success
                </Button>
                <Button
                  onClick={simulateCsvFailure}
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-7 text-xs"
                >
                  Failure
                </Button>
              </div>
              <Button
                onClick={simulateCsvRateLimit}
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <CrownIcon className="h-3 w-3 mr-1" />
                Rate Limit Exceeded
              </Button>
            </div>
          </div>

          {/* Address Flow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Address Flow</span>
              </div>
              {getStatusBadge(testResults.address)}
            </div>
            <div className="flex gap-1">
              <Button
                onClick={simulateAddressSuccess}
                size="sm"
                variant="default"
                className="flex-1 h-7 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Success
              </Button>
              <Button
                onClick={simulateAddressFailure}
                size="sm"
                variant="destructive"
                className="flex-1 h-7 text-xs"
              >
                Failure
              </Button>
            </div>
          </div>

          {/* Real CSV Modal State Control */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Real CSV Modal States</span>
            </div>
            <div className="space-y-1">
              <div className="flex gap-1">
                <Button
                  onClick={triggerFileValidationState}
                  size="sm"
                  variant="default"
                  className="flex-1 h-7 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  File Validation
                </Button>
                <Button
                  onClick={triggerProcessingState}
                  size="sm"
                  variant="default"
                  className="flex-1 h-7 text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Processing
                </Button>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={resetCsvState}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                >
                  Reset CSV
                </Button>
                <Button
                  onClick={closeRealModal}
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-7 text-xs"
                >
                  Close Modal
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetResults}
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs"
          >
            Clear Results
          </Button>

          <div className="text-xs text-blue-600 space-y-1">
            <div>Simulates the exact toast messages and cache invalidation that occur in real property addition flows.</div>
            <div className="font-medium">Perfect for testing property addition UX!</div>
            <div>Check the properties list to see cache invalidation in action.</div>
            <div className="font-medium text-orange-600">Rate Limit button shows what users see when they exceed their lookup quota!</div>
            <div className="font-medium text-purple-600">Modal controls let you test different CSV upload states!</div>
          </div>
        </CardContent>
      )}

    </Card>
  )
}