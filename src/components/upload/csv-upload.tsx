'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UploadIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon } from 'lucide-react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { useBulkCreateProperties } from '@/hooks/use-create-property'

interface CSVRow {
  address?: string
  apn?: string
  city?: string
  state?: string
  zip?: string
  zip_code?: string
  [key: string]: string | number | undefined
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  sampleData: CSVRow[]
  totalCount: number
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
  const [uploadResults, setUploadResults] = useState<{
    total: number
    successful: number
    failed: number
    results: unknown[]
    errors: { address?: string; apn?: string; error: string }[]
  } | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentProperty, setCurrentProperty] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const bulkCreateMutation = useBulkCreateProperties()

  // Notify parent when processing state changes
  useEffect(() => {
    const isProcessing = bulkCreateMutation.isPending
    onProcessingStateChange?.(isProcessing)
  }, [bulkCreateMutation.isPending, onProcessingStateChange])

  // Progress simulation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (bulkCreateMutation.isPending) {
      setProgress(0)
      let currentProgress = 0

      progressInterval = setInterval(() => {
        if (currentProgress < 60) {
          currentProgress += Math.random() * 8 + 2
        } else if (currentProgress < 85) {
          currentProgress += Math.random() * 3 + 1
        } else if (currentProgress < 95) {
          currentProgress += Math.random() * 1 + 0.5
        }
        currentProgress = Math.min(currentProgress, 95)
        setProgress(currentProgress)
      }, 200)
    } else {
      setProgress(0)
      setCurrentProperty('')
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [bulkCreateMutation.isPending])

  // Complete progress when finished
  useEffect(() => {
    if (bulkCreateMutation.isSuccess) {
      setProgress(100)
      setCurrentProperty('')

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
    setProgress(0)
    setCurrentProperty('')
    bulkCreateMutation.reset()
    validateCSV(selectedFile)
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
          setValidation({ isValid: false, errors, sampleData: [], totalCount: 0 })
          return
        }

        // Check for required columns
        const headers = Object.keys(data[0]).map(h => h.toLowerCase())

        const hasAddress = headers.some(h => h === 'address' || h.includes('address'))
        const hasAPN = headers.some(h => h === 'apn' || h.includes('parcel'))

        if (!hasAddress && !hasAPN) {
          errors.push('CSV must contain either an "address" or "apn" column')
        }

        // Validate that each row has at least address OR APN
        const invalidRows = data.filter((row, index) => {
          const addressKey = Object.keys(row).find(k => k.toLowerCase() === 'address' || k.toLowerCase().includes('address'))
          const apnKey = Object.keys(row).find(k => k.toLowerCase() === 'apn' || k.toLowerCase().includes('parcel'))

          const hasAddressValue = addressKey && row[addressKey] && String(row[addressKey]).trim() !== ''
          const hasAPNValue = apnKey && row[apnKey] && String(row[apnKey]).trim() !== ''

          return !hasAddressValue && !hasAPNValue
        })

        if (invalidRows.length > 0) {
          errors.push(`${invalidRows.length} rows are missing both address and APN`)
        }

        const validationResult = {
          isValid: errors.length === 0,
          errors,
          sampleData: data.slice(0, 3),
          totalCount: data.length
        }

        setValidation(validationResult)
      },
      error: (error) => {
        setValidation({
          isValid: false,
          errors: [`Failed to parse CSV: ${error.message}`],
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
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (parseResults) => {
          const data = parseResults.data as CSVRow[]

          // Transform data for bulk creation
          const properties = data.map((row) => {
            // Find column keys (case-insensitive)
            const addressKey = Object.keys(row).find(k => k.toLowerCase() === 'address' || k.toLowerCase().includes('address'))
            const apnKey = Object.keys(row).find(k => k.toLowerCase() === 'apn' || k.toLowerCase().includes('parcel'))
            const cityKey = Object.keys(row).find(k => k.toLowerCase() === 'city')
            const stateKey = Object.keys(row).find(k => k.toLowerCase() === 'state')
            const zipKey = Object.keys(row).find(k => k.toLowerCase() === 'zip' || k.toLowerCase() === 'zip_code')

            const addressValue = addressKey ? String(row[addressKey]).trim() : ''
            const apnValue = apnKey ? String(row[apnKey]).trim() : ''
            const cityValue = cityKey ? String(row[cityKey]).trim() : ''
            const stateValue = stateKey ? String(row[stateKey]).trim() : ''
            const zipValue = zipKey ? String(row[zipKey]).trim() : ''

            // Build property object
            const property: any = {
              portfolio_id: portfolioId,
              use_pro_lookup: false, // No external API lookups
            }

            // Set address or APN-based placeholder
            if (addressValue) {
              property.address = addressValue
            } else if (apnValue) {
              property.address = `APN: ${apnValue}`
              property.apn = apnValue
            }

            // Add optional location fields
            if (apnValue && !property.apn) property.apn = apnValue
            if (cityValue) property.city = cityValue
            if (stateValue) property.state = stateValue
            if (zipValue) property.zip_code = zipValue

            return property
          })

          try {
            const result = await bulkCreateMutation.mutateAsync({
              properties,
              source: 'csv'
            })

            const uploadResult = {
              total: data.length,
              successful: result.created.length,
              failed: result.errors.length,
              results: result.created,
              errors: result.errors,
            }

            if (isModal && onSuccess) {
              onSuccess(uploadResult)
            } else {
              setUploadResults(uploadResult)
            }

          } catch (error) {
            console.error('Bulk create error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'

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
    setProgress(0)
    setCurrentProperty('')
    bulkCreateMutation.reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (uploadResults) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircleIcon className="h-4 w-4" />
          <AlertTitle>Upload Complete</AlertTitle>
          <AlertDescription className="space-y-3">
            <div>
              Successfully processed {uploadResults.successful} of {uploadResults.total} properties.
              {uploadResults.failed > 0 && ` ${uploadResults.failed} failed.`}
            </div>
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

  // Processing state
  if (bulkCreateMutation.isPending || (progress > 0 && isModal)) {
    const totalCount = validation?.totalCount || 0
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
          {!isComplete && (
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
        <Label htmlFor="csv-file">Select CSV File</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          CSV must include either <strong>address</strong> or <strong>apn</strong> column. Optional: city, state, zip
        </p>
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
                  </div>
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
                      {Object.keys(validation.sampleData[0]).slice(0, 5).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.sampleData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).slice(0, 5).map((value, cellIndex) => (
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
          disabled={!validation?.isValid || bulkCreateMutation.isPending}
          className="flex-1"
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          {bulkCreateMutation.isPending ? 'Processing...' : 'Upload Properties'}
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
