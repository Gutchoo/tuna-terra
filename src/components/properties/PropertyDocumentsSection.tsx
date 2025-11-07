'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileText,
  Upload,
  Search,
  Filter,
  Loader2,
} from 'lucide-react'
import { usePropertyDocuments, useDeleteDocument } from '@/hooks/usePropertyDocuments'
import { DocumentUploadDialog } from './documents/DocumentUploadDialog'
import { DocumentListItem } from './documents/DocumentListItem'
import { DocumentPreviewDialog } from './documents/DocumentPreviewDialog'
import { FILE_TYPE_FILTERS, type FileTypeFilter } from '@/lib/documents'
import type { PropertyDocument } from '@/lib/supabase'
import { isDemoProperty } from '@/contexts/DemoContext'
import { isVirtualSampleProperty } from '@/lib/sample-portfolio'

interface PropertyDocumentsSectionProps {
  propertyId: string
  portfolioId: string
  canEdit: boolean
}

export function PropertyDocumentsSection({
  propertyId,
  portfolioId,
  canEdit,
}: PropertyDocumentsSectionProps) {
  // Always call hooks before any early returns
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFileType, setSelectedFileType] = useState<FileTypeFilter>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<PropertyDocument | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  // Fetch all documents once - search and file type filtering handled client-side
  const { data, isLoading, error } = usePropertyDocuments(propertyId)

  const deleteMutation = useDeleteDocument(propertyId)

  const documents = data?.data || []
  const hasDocuments = documents.length > 0

  // Client-side filtering for search and file type
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.title?.toLowerCase().includes(query) ||
          doc.file_name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      )
    }

    // Filter by file type
    if (selectedFileType !== 'all') {
      filtered = filtered.filter((doc) => {
        if (selectedFileType === 'pdf') {
          return doc.file_type === 'application/pdf'
        } else if (selectedFileType === 'image') {
          return doc.file_type.startsWith('image/')
        }
        return true
      })
    }

    return filtered
  }, [documents, searchQuery, selectedFileType])

  // Check if this is a demo or virtual sample property - documents not supported
  if (isDemoProperty(propertyId) || isVirtualSampleProperty(propertyId)) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </h3>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Document Center Not Available</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Document storage is not available for demo properties. Sign up to create your own portfolio and upload documents for your properties.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await deleteMutation.mutateAsync(documentToDelete)
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
          {hasDocuments && (
            <span className="text-xs font-normal text-muted-foreground">
              ({filteredDocuments.length})
            </span>
          )}
        </h3>
        {canEdit && (
          <Button onClick={() => setUploadDialogOpen(true)} size="sm" className="mr-6">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      {hasDocuments && (
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedFileType} onValueChange={(v) => setSelectedFileType(v as FileTypeFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_FILTERS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Documents Grid/List or Empty State */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-red-600">Failed to load documents</p>
              <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !hasDocuments && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-semibold mb-1">No documents yet</h4>
              <p className="text-xs text-muted-foreground mb-3 max-w-sm">
                Upload PDFs, images, and other files related to this property.
              </p>
              {canEdit && (
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && hasDocuments && filteredDocuments.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No documents match your search</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && filteredDocuments.length > 0 && (
          <div className="space-y-1">
            {filteredDocuments.map((document) => (
              <DocumentListItem
                key={document.id}
                document={document}
                canEdit={canEdit}
                onPreview={setPreviewDocument}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-0.5">Supported file types:</p>
            <p>PDF, PNG, JPG, JPEG (max 10MB per file)</p>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        propertyId={propertyId}
        portfolioId={portfolioId}
      />

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        document={previewDocument}
        propertyId={propertyId}
        canEdit={canEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
