import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  PropertyDocument,
  DocumentUploadRequest,
  DocumentMetadataUpdate,
  DocumentWithSignedUrl,
} from '@/lib/supabase'

/**
 * Query key factory for document-related queries
 */
export const documentKeys = {
  all: ['documents'] as const,
  property: (propertyId: string) => ['documents', 'property', propertyId] as const,
  document: (documentId: string) => ['documents', 'document', documentId] as const,
}

/**
 * Fetch documents for a property
 */
async function fetchPropertyDocuments(
  propertyId: string,
  searchQuery?: string,
  documentType?: string
): Promise<{ data: PropertyDocument[]; count: number }> {
  const params = new URLSearchParams()
  if (searchQuery) params.append('search', searchQuery)
  if (documentType && documentType !== 'all') params.append('document_type', documentType)

  const response = await fetch(`/api/properties/${propertyId}/documents?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch documents')
  }

  return response.json()
}

/**
 * Fetch a single document with signed URL
 */
async function fetchDocument(
  propertyId: string,
  documentId: string
): Promise<{ data: DocumentWithSignedUrl }> {
  const response = await fetch(`/api/properties/${propertyId}/documents/${documentId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch document')
  }

  return response.json()
}

/**
 * Upload a document
 */
async function uploadDocument(
  propertyId: string,
  portfolioId: string,
  data: DocumentUploadRequest
): Promise<{ data: PropertyDocument }> {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('portfolio_id', portfolioId)
  formData.append('document_type', data.document_type)

  if (data.title) formData.append('title', data.title)
  if (data.description) formData.append('description', data.description)
  if (data.document_date) formData.append('document_date', data.document_date)
  if (data.tags) formData.append('tags', JSON.stringify(data.tags))

  const response = await fetch(`/api/properties/${propertyId}/documents`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload document')
  }

  return response.json()
}

/**
 * Update document metadata
 */
async function updateDocumentMetadata(
  propertyId: string,
  documentId: string,
  updates: DocumentMetadataUpdate
): Promise<{ data: PropertyDocument }> {
  const response = await fetch(`/api/properties/${propertyId}/documents/${documentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update document')
  }

  return response.json()
}

/**
 * Delete a document
 */
async function deleteDocument(
  propertyId: string,
  documentId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/properties/${propertyId}/documents/${documentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete document')
  }

  return response.json()
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch documents for a property
 * Note: Search filtering is handled client-side in the component for better UX
 */
export function usePropertyDocuments(
  propertyId: string,
  searchQuery?: string,
  documentType?: string
) {
  return useQuery({
    queryKey: documentKeys.property(propertyId),
    queryFn: () => fetchPropertyDocuments(propertyId),
    enabled: !!propertyId,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to fetch a single document with signed URL
 */
export function useDocument(propertyId: string, documentId: string) {
  return useQuery({
    queryKey: documentKeys.document(documentId),
    queryFn: () => fetchDocument(propertyId, documentId),
    enabled: !!propertyId && !!documentId,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to upload a document
 */
export function useUploadDocument(propertyId: string, portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DocumentUploadRequest) =>
      uploadDocument(propertyId, portfolioId, data),
    onSuccess: () => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.property(propertyId) })
      toast.success('Document uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document')
    },
  })
}

/**
 * Hook to update document metadata
 */
export function useUpdateDocument(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, updates }: { documentId: string; updates: DocumentMetadataUpdate }) =>
      updateDocumentMetadata(propertyId, documentId, updates),
    onSuccess: (_, { documentId }) => {
      // Invalidate both the list and the specific document
      queryClient.invalidateQueries({ queryKey: documentKeys.property(propertyId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.document(documentId) })
      toast.success('Document updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document')
    },
  })
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument(propertyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(propertyId, documentId),
    onSuccess: (_, documentId) => {
      // Invalidate both the list and the specific document
      queryClient.invalidateQueries({ queryKey: documentKeys.property(propertyId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.document(documentId) })
      toast.success('Document deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document')
    },
  })
}

/**
 * Hook to get a signed URL for document preview
 * This is a utility hook that fetches the document and extracts the signed URL
 */
export function useDocumentPreview(propertyId: string, documentId: string | null) {
  return useQuery({
    queryKey: documentId ? documentKeys.document(documentId) : ['documents', 'preview', null],
    queryFn: () => (documentId ? fetchDocument(propertyId, documentId) : null),
    enabled: !!propertyId && !!documentId,
    staleTime: 60000, // 1 minute (URLs are valid for 1 hour)
  })
}
