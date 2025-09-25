'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UploadIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon, CrownIcon } from 'lucide-react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { useBulkCreateProperties } from '@/hooks/use-create-property'

interface CSVRow {
  apn?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  [key: string]: string | number | undefined
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  detectedFormat: 'apn' | 'address' | 'unknown'
  sampleData: CSVRow[]
  totalCount: number
}

interface UserLimits {
  canProceed: boolean
  remaining: number
  currentUsed: number
  limit: number
  tier: 'free' | 'pro'
  resetDate: string
}


interface CSVUploadProps {
  portfolioId: string | null
  onSuccess?: (result: unknown) => void
  onError?: (error: string) => void
  isModal?: boolean
  onProcessingStateChange?: (isProcessing: boolean) => void
}

export function CSVUpload({ portfolioId, onSuccess, onError, isModal = false, onProcessingStateChange }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  // Remove custom upload states - use React Query mutation state instead
  const [uploadResults, setUploadResults] = useState<{
    total: number
    successful: number
    failed: number
    results: unknown[]
    errors: { apn?: string; error: string; type?: string }[]
    processed?: number
    skipped?: number
    mixed?: boolean
    proLookups?: number
    basicProperties?: number
  } | null>(null)
  const [limitExceeded, setLimitExceeded] = useState<{
    message: string
    tier: string
    used: number
    limit: number
    resetDate: string
  } | null>(null)
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)
  const [debugProcessingState, setDebugProcessingState] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentProperty, setCurrentProperty] = useState<string>('')
  const [simulatedProperties, setSimulatedProperties] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const bulkCreateMutation = useBulkCreateProperties()

  // Debug event listeners for state control
  useEffect(() => {
    const handleDebugSetFileValidation = () => {
      // Set up debug file validation state
      const debugFile = new File(['apn\n123-456-789\n456-789-012\n789-012-345\n012-345-678\n345-678-901\n678-901-234\n901-234-567\n234-567-890'], 'debug-test.csv', { type: 'text/csv' })
      setFile(debugFile)
      setValidation({
        isValid: true,
        errors: [],
        detectedFormat: 'apn',
        sampleData: [
          { apn: '123-456-789' },
          { apn: '456-789-012' },
          { apn: '789-012-345' }
        ],
        totalCount: 8
      })
      setUserLimits({
        canProceed: false,
        remaining: 4,
        currentUsed: 21,
        limit: 25,
        tier: 'free',
        resetDate: new Date().toISOString()
      })
      setDebugProcessingState(false)
    }

    const handleDebugSetProcessing = () => {
      setDebugProcessingState(true)
      setSimulatedProperties(['123-456-789', '456-789-012', '789-012-345', '012-345-678', '345-678-901', '678-901-234', '901-234-567', '234-567-890'])
    }

    const handleDebugReset = () => {
      setFile(null)
      setValidation(null)
      setUploadResults(null)
      setUserLimits(null)
      setDebugProcessingState(false)
      setProgress(0)
      setCurrentProperty('')
      setSimulatedProperties([])
      bulkCreateMutation.reset()
    }

    // Only add listeners in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_TEST_DATA !== 'false') {
      window.addEventListener('debug-csv-file-validation', handleDebugSetFileValidation)
      window.addEventListener('debug-csv-processing', handleDebugSetProcessing)
      window.addEventListener('debug-csv-reset', handleDebugReset)
    }

    return () => {
      window.removeEventListener('debug-csv-file-validation', handleDebugSetFileValidation)
      window.removeEventListener('debug-csv-processing', handleDebugSetProcessing)
      window.removeEventListener('debug-csv-reset', handleDebugReset)
    }
  }, [bulkCreateMutation])

  // Notify parent when processing state changes
  useEffect(() => {
    const isProcessing = bulkCreateMutation.isPending || debugProcessingState
    onProcessingStateChange?.(isProcessing)
  }, [bulkCreateMutation.isPending, debugProcessingState, onProcessingStateChange])

  // Simulated progress algorithm
  const startProgressSimulation = (propertyAPNs: string[]) => {
    setProgress(0)
    setCurrentProperty('')
    setSimulatedProperties(propertyAPNs)

    let currentProgress = 0
    let currentIndex = 0

    const updateProgress = () => {
      // Phase 1: Fast initial progress (0-60% in 2 seconds)
      if (currentProgress < 60) {
        currentProgress += Math.random() * 8 + 2 // 2-10% increments
      }
      // Phase 2: Medium pace (60-85% in 3 seconds)
      else if (currentProgress < 85) {
        currentProgress += Math.random() * 3 + 1 // 1-4% increments
      }
      // Phase 3: Slow crawl (85-95% in variable time)
      else if (currentProgress < 95) {
        currentProgress += Math.random() * 1 + 0.5 // 0.5-1.5% increments
      }

      // Don't exceed 95% until React Query completes
      currentProgress = Math.min(currentProgress, 95)
      setProgress(currentProgress)

      // Update current property being "processed"
      if (propertyAPNs.length > 0) {
        const propertyIndex = Math.floor((currentProgress / 100) * propertyAPNs.length)
        if (propertyIndex < propertyAPNs.length && propertyIndex !== currentIndex) {
          setCurrentProperty(propertyAPNs[propertyIndex])
          currentIndex = propertyIndex
        }
      }
    }

    const interval = setInterval(updateProgress, 200) // Update every 200ms
    return interval
  }

  // Start progress simulation when upload begins
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (bulkCreateMutation.isPending || debugProcessingState) {
      // Get APNs from validation data or debug data
      const apns = validation?.sampleData?.map(row => row.apn || '').filter(Boolean) ||
                   simulatedProperties.length > 0 ? simulatedProperties :
                   ['123-456-789', '456-789-012', '789-012-345', '012-345-678', '345-678-901', '678-901-234', '901-234-567', '234-567-890']

      progressInterval = startProgressSimulation(apns)
    } else {
      // Reset progress when not processing
      setProgress(0)
      setCurrentProperty('')
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [bulkCreateMutation.isPending, debugProcessingState, validation, simulatedProperties])

  // Complete progress when React Query finishes
  useEffect(() => {
    if (bulkCreateMutation.isSuccess) {
      setProgress(100)
      setCurrentProperty('')

      // For modal context, keep processing state until modal closes
      // For non-modal context, reset after delay to show results
      if (!isModal) {
        setTimeout(() => {
          setProgress(0)
        }, 500)
      }
    }
  }, [bulkCreateMutation.isSuccess, isModal])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setValidation(null)
    setUploadResults(null)
    setUserLimits(null)
    setProgress(0)
    setCurrentProperty('')
    setSimulatedProperties([])
    bulkCreateMutation.reset()
    validateCSV(selectedFile)
  }

  const fetchUserLimits = async (propertyCount: number) => {
    if (!portfolioId) return

    setIsCheckingLimits(true)
    try {
      const response = await fetch(`/api/user/limits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: propertyCount })
      })

      if (response.ok) {
        const data = await response.json()
        setUserLimits(data)
      } else {
        console.error('Failed to fetch user limits')
      }
    } catch (error) {
      console.error('Error checking user limits:', error)
    } finally {
      setIsCheckingLimits(false)
    }
  }

  const validateCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[]
        const errors: string[] = []

        if (data.length === 0) {
          errors.push('CSV file appears to be empty')
          setValidation({ isValid: false, errors, detectedFormat: 'unknown', sampleData: [], totalCount: 0 })
          return
        }

        // Limit CSV uploads to 50 APNs to stay within Regrid's 200/minute rate limit
        if (data.length > 50) {
          errors.push(`CSV file contains ${data.length} properties. Maximum allowed is 50 properties per upload.`)
          setValidation({ isValid: false, errors, detectedFormat: 'unknown', sampleData: [], totalCount: data.length })
          return
        }

        // Check for required columns - ONLY APN format supported
        const headers = Object.keys(data[0]).map(h => h.toLowerCase())
        
        let detectedFormat: 'apn' | 'address' | 'unknown' = 'unknown'

        // Check for APN format - expanded to catch more column variations
        if (headers.some(h => 
          h.includes('apn') || 
          h.includes('parcel') || 
          h.includes('parcelnumber') || 
          h.includes('parcel_number') ||
          h === 'apn' ||
          h === 'parcel' ||
          h === 'parcelnumber' ||
          h === 'parcel_number'
        )) {
          detectedFormat = 'apn'
        }

        if (detectedFormat === 'unknown') {
          errors.push('CSV must contain an APN column. Supported column names: apn, parcel, parcelnumber, parcel_number')
        }

        // Validate data quality - only check APN format
        if (detectedFormat === 'apn') {
          const apnColumn = Object.keys(data[0]).find(key => {
            const h = key.toLowerCase()
            return h.includes('apn') || 
                   h.includes('parcel') || 
                   h.includes('parcelnumber') || 
                   h.includes('parcel_number') ||
                   h === 'apn' ||
                   h === 'parcel' ||
                   h === 'parcelnumber' ||
                   h === 'parcel_number'
          })
          
          const emptyApns = data.filter(row => !row[apnColumn!] || String(row[apnColumn!]).trim() === '')
          if (emptyApns.length > 0) {
            errors.push(`${emptyApns.length} rows have empty APN values`)
          }
        }

        const validationResult = {
          isValid: errors.length === 0,
          errors,
          detectedFormat,
          sampleData: data.slice(0, 3), // Show first 3 rows as preview
          totalCount: data.length
        }

        setValidation(validationResult)

        // If validation successful, fetch user limits for this property count
        if (validationResult.isValid && data.length > 0) {
          fetchUserLimits(data.length)
        }
      },
      error: (error) => {
        setValidation({
          isValid: false,
          errors: [`Failed to parse CSV: ${error.message}`],
          detectedFormat: 'unknown',
          sampleData: [],
          totalCount: 0
        })
      }
    })
  }

  const handleUpload = async () => {
    if (!file || !validation?.isValid) return
    if (!portfolioId) {
      alert('Please select a portfolio before uploading properties.')
      return
    }

    try {
      // Parse entire file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (parseResults) => {
          const data = parseResults.data as CSVRow[]

          // Transform data for React Query mutation
          const properties = data.map((row, index) => {
            const apnKey = Object.keys(row).find(key => {
              const h = key.toLowerCase()
              return h.includes('apn') ||
                     h.includes('parcel') ||
                     h.includes('parcelnumber') ||
                     h.includes('parcel_number') ||
                     h === 'apn' ||
                     h === 'parcel' ||
                     h === 'parcelnumber' ||
                     h === 'parcel_number'
            })

            const apnValue = row[apnKey!]

            // Determine if this property should use pro lookup
            let useProLookup = true

            // If user exceeds rate limits, use mixed processing automatically
            if (userLimits && userLimits.tier === 'free' && validation.totalCount > userLimits.remaining) {
              useProLookup = index < userLimits.remaining
            }

            return {
              apn: String(apnValue).trim(),
              address: `Property ${apnValue}`,
              portfolio_id: portfolioId,
              use_pro_lookup: useProLookup
            }
          })

          // Count pro vs basic properties for result display
          const proLookupCount = properties.filter(p => p.use_pro_lookup).length
          const basicCount = properties.length - proLookupCount

          // Set up APNs for progress simulation
          setSimulatedProperties(properties.map(p => p.apn))

          try {
            // Use React Query mutation for bulk upload
            const result = await bulkCreateMutation.mutateAsync({
              properties,
              source: 'csv'
            })

            // Enhanced result with processing info
            const uploadResult = {
              total: data.length,
              processed: properties.length,
              successful: result.created.length,
              failed: result.errors.length,
              results: result.created,
              errors: result.errors,
              proLookups: proLookupCount,
              basicProperties: basicCount,
              mixed: userLimits && userLimits.tier === 'free' && validation.totalCount > userLimits.remaining ? true : undefined
            }

            if (isModal && onSuccess) {
              // Modal context: call success callback
              onSuccess(uploadResult)
            } else {
              // Regular page context: set results for display
              setUploadResults(uploadResult)
            }

          } catch (error) {
            console.error('Bulk create error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'

            // Handle limit exceeded error
            if (errorMessage.includes('limit exceeded')) {
              setLimitExceeded({
                message: errorMessage,
                tier: 'free',
                used: 0,
                limit: 25,
                resetDate: new Date().toISOString()
              })
              return
            }

            if (isModal && onError) {
              onError(errorMessage)
            } else {
              setUploadResults({
                total: data.length,
                successful: 0,
                failed: 1,
                results: [],
                errors: [{ error: errorMessage }]
              })
            }
          }
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'

      if (isModal && onError) {
        onError(errorMessage)
      } else {
        setUploadResults({
          total: 0,
          successful: 0,
          failed: 1,
          results: [],
          errors: [{ error: errorMessage }]
        })
      }
    }
  }

  const resetUpload = () => {
    setFile(null)
    setValidation(null)
    setUploadResults(null)
    setLimitExceeded(null)
    setUserLimits(null)
    setProgress(0)
    setCurrentProperty('')
    setSimulatedProperties([])
    bulkCreateMutation.reset() // Reset React Query mutation state
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Show limit exceeded error
  if (limitExceeded) {
    const resetDate = new Date(limitExceeded.resetDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <CrownIcon className="h-4 w-4" />
          <AlertTitle>Property Lookup Limit Exceeded</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{limitExceeded.message}</p>
            <div className="bg-muted/50 p-3 rounded-md space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current Tier:</span>
                <Badge variant={limitExceeded.tier === 'pro' ? 'default' : 'secondary'}>
                  {limitExceeded.tier === 'pro' ? 'Pro Tier' : 'Free Tier'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Usage:</span>
                <span>{limitExceeded.used} / {limitExceeded.limit} lookups</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Resets:</span>
                <span>{resetDate}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button variant="outline" onClick={resetUpload} className="flex-1">
            Try Different File
          </Button>
          <Button onClick={() => router.push('/dashboard/account')} className="flex-1">
            View Account Details
          </Button>
        </div>
      </div>
    )
  }

  if (uploadResults) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircleIcon className="h-4 w-4" />
          <AlertTitle>Upload Complete</AlertTitle>
          <AlertDescription className="space-y-3">
            <div>
              Successfully processed {uploadResults.successful} of {uploadResults.processed || uploadResults.total} properties.
              {uploadResults.failed > 0 && ` ${uploadResults.failed} failed.`}
              {uploadResults.skipped && uploadResults.skipped > 0 && ` ${uploadResults.skipped} skipped.`}
            </div>

            {/* Processing Summary */}
            {uploadResults.mixed && (
              <div className="bg-muted/30 p-3 rounded-md space-y-2">
                <div className="font-medium text-sm">Processing Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {uploadResults.proLookups && uploadResults.proLookups > 0 && (
                    <div>
                      <span className="text-green-600">Pro Lookups:</span> {uploadResults.proLookups}
                    </div>
                  )}
                  {uploadResults.basicProperties && uploadResults.basicProperties > 0 && (
                    <div>
                      <span className="text-blue-600">Basic Properties:</span> {uploadResults.basicProperties}
                    </div>
                  )}
                  {uploadResults.failed > 0 && (
                    <div>
                      <span className="text-red-600">Failed:</span> {uploadResults.failed}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Smart processing applied: First {uploadResults.proLookups || 0} properties enriched with full data, remaining {uploadResults.basicProperties || 0} added as placeholders.
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => router.push(`/dashboard?portfolio_id=${portfolioId}`)} className="flex-1">
            View Properties
          </Button>
          <Button variant="outline" onClick={resetUpload} className="flex-1">
            Upload Another File
          </Button>
        </div>

        {uploadResults.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Some Properties Failed</AlertTitle>
            <AlertDescription>
              <details className="mt-2">
                <summary>View error details</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {JSON.stringify(uploadResults.errors.slice(0, 5), null, 2)}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // If in processing state or completed, show compact loading interface
  if (bulkCreateMutation.isPending || debugProcessingState || (progress > 0 && isModal)) {
    const totalCount = validation?.totalCount || simulatedProperties.length || 8
    const processedCount = Math.floor((progress / 100) * totalCount)
    const isComplete = progress >= 100

    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            {!isComplete && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            )}
            <span>
              {isComplete
                ? `Finished! ${totalCount} properties uploaded`
                : `Processing ${processedCount}/${totalCount} properties... ${Math.round(progress)}%`
              }
            </span>
          </div>
          {!isComplete && currentProperty && (
            <div className="text-sm text-muted-foreground">
              Currently processing: {currentProperty}
            </div>
          )}
          {!isComplete && !currentProperty && (
            <div className="text-sm text-muted-foreground">
              Please wait while we process your upload
            </div>
          )}
          {isComplete && (
            <div className="text-sm text-muted-foreground">
              Upload completed successfully
            </div>
          )}
          <Progress value={progress} className="w-full h-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      <div>
        <Label htmlFor="csv-file">Select File</Label>
        <div className="mt-1 relative">
          <Input
            ref={fileInputRef}
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className={file ? "hidden" : ""}
          />
          {file && (
            <div className="flex items-center justify-between p-2 border border-input rounded-md bg-background">
              <span className="text-sm text-foreground truncate">
                {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </div>

      {validation && (
        <div className="space-y-4">
          <Alert variant={validation.isValid ? 'default' : 'destructive'}>
            {!validation.isValid && (
              <XCircleIcon className="h-4 w-4" />
            )}
            <AlertTitle>
              {validation.isValid ? 'File Valid' : 'Validation Failed'}
            </AlertTitle>
            <AlertDescription>
              {validation.isValid ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Found <strong>{validation.totalCount}</strong> properties ready for upload</span>
                    <Badge variant="outline">{validation.detectedFormat.toUpperCase()}</Badge>
                  </div>
                  {isCheckingLimits && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                      Checking your rate limits...
                    </div>
                  )}
                  {userLimits && userLimits.tier === 'free' && validation.totalCount > userLimits.remaining && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Smart Processing Applied</p>
                        <p className="mb-1">You have <strong>{userLimits.remaining}</strong> lookups remaining ({userLimits.tier} tier).</p>
                        <p className="mb-2">We&apos;ll process your {validation.totalCount} properties efficiently:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>{userLimits.remaining} properties can be processed with pro lookups</li>
                          <li>Remaining {validation.totalCount - userLimits.remaining} properties will be processed without pro lookups and we will only store the APN</li>
                          <li>All {validation.totalCount} properties will be added to your portfolio</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {userLimits && (userLimits.tier === 'pro' || validation.totalCount <= userLimits.remaining) && (
                    <div className="text-sm text-green-700">
                      All {validation.totalCount} properties can be processed with pro lookups
                    </div>
                  )}
                </div>
              ) : (
                <ul className="list-disc list-inside mt-2">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>

          {validation.isValid && validation.sampleData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Data Preview</h4>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(validation.sampleData[0]).slice(0, 4).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.sampleData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).slice(0, 4).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{String(value || '')}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}


      <div className="flex gap-4">
        <Button
          onClick={handleUpload}
          disabled={!validation?.isValid || bulkCreateMutation.isPending || isCheckingLimits || debugProcessingState}
          className="flex-1"
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          {(bulkCreateMutation.isPending || debugProcessingState) ? 'Processing...' :
           isCheckingLimits ? 'Checking Limits...' :
           'Upload Properties'}
        </Button>
        {file && (
          <Button variant="outline" onClick={resetUpload}>
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}