'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUploadDocument } from '@/hooks/usePropertyDocuments'
import { validateDocumentFile, DOCUMENT_TYPES, formatFileSize } from '@/lib/documents'
import type { DocumentType } from '@/lib/supabase'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string
  portfolioId: string
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  propertyId,
  portfolioId,
}: DocumentUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('other')
  const [description, setDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  const uploadMutation = useUploadDocument(propertyId, portfolioId)

  // Handle file selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const validation = validateDocumentFile(file)

      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid file')
        setSelectedFile(null)
        return
      }

      setValidationError(null)
      setSelectedFile(file)

      // Auto-populate title from filename if not set
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  })

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !title) return

    // Simulate upload progress (since we don't have actual progress from the API)
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        title,
        document_type: documentType,
        description: description || undefined,
      })

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form and close
      setTimeout(() => {
        handleReset()
        onOpenChange(false)
      }, 500)
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
    }
  }

  // Reset form
  const handleReset = () => {
    setSelectedFile(null)
    setTitle('')
    setDocumentType('other')
    setDescription('')
    setUploadProgress(0)
    setValidationError(null)
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setValidationError(null)
  }

  const isUploading = uploadMutation.isPending || uploadProgress > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden">
          {/* File Upload Zone */}
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                ${validationError ? 'border-red-500 bg-red-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {isDragActive ? 'Drop file here' : 'Drag & drop file here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                PDF, PNG, JPG, JPEG (max 10MB)
              </p>
              {validationError && (
                <p className="text-xs text-red-600 mt-2">{validationError}</p>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <File className="h-10 w-10 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-medium truncate cursor-help">{selectedFile.name}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs break-words">{selectedFile.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {!isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2 w-full overflow-hidden">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., January 2024 Lease Agreement"
              disabled={isUploading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset()
                onOpenChange(false)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !title || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
