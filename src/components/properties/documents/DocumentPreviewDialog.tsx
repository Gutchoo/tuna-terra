'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDocumentPreview } from '@/hooks/usePropertyDocuments'
import {
  getFileIcon,
  getDocumentTypeLabel,
  formatFileSize,
  formatDocumentDate,
  isImageFile,
  isPdfFile,
} from '@/lib/documents'
import type { PropertyDocument } from '@/lib/supabase'

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: PropertyDocument | null
  propertyId: string
  canEdit: boolean
  onDelete: (documentId: string) => void
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  propertyId,
  canEdit,
  onDelete,
}: DocumentPreviewDialogProps) {
  const [imageZoom, setImageZoom] = useState(75)

  const { data, isLoading, error } = useDocumentPreview(
    propertyId,
    document?.id || null
  )

  // Reset zoom when document changes
  useEffect(() => {
    setImageZoom(75)
  }, [document?.id])

  if (!document) return null

  const FileIcon = getFileIcon(document.file_type)
  const typeLabel = getDocumentTypeLabel(document.document_type)
  const isImage = isImageFile(document.file_type)
  const isPdf = isPdfFile(document.file_type)
  const signedUrl = data?.data?.signed_url

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank')
    }
  }

  const handleDelete = () => {
    onDelete(document.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0" showCloseButton={true}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileIcon className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {document.title || document.file_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDocumentDate(document.uploaded_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mr-10">
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>

            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-red-600">Failed to load document preview</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </div>
          )}

          {signedUrl && !isLoading && !error && (
            <>
              {/* PDF Preview */}
              {isPdf && (
                <iframe
                  src={signedUrl}
                  className="w-full h-full"
                  title={document.title || document.file_name}
                />
              )}

              {/* Image Preview */}
              {isImage && (
                <div className="flex items-center justify-center p-8 h-full">
                  <img
                    src={signedUrl}
                    alt={document.title || document.file_name}
                    style={{
                      width: `${imageZoom}%`,
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Unsupported File Type */}
              {!isPdf && !isImage && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <FileIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Description */}
        {document.description && (
          <div className="p-4 border-t bg-white dark:bg-gray-950">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Description:</span> {document.description}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
