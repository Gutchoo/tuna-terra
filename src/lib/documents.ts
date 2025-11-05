import {
  FileText,
  Receipt,
  FileImage,
  Building,
  Shield,
  FileCheck,
  Camera,
  File,
  type LucideIcon,
} from 'lucide-react'

/**
 * Document type definitions matching database schema
 */
export const DOCUMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'work_order', label: 'Work Order' },
  { value: 'insurance_policy', label: 'Insurance Policy' },
  { value: 'tax_document', label: 'Tax Document' },
  { value: 'lease_agreement', label: 'Lease Agreement' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'property_photo', label: 'Property Photo' },
  { value: 'floor_plan', label: 'Floor Plan' },
  { value: 'other', label: 'Other' },
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]['value']

/**
 * File type filters for document display
 */
export const FILE_TYPE_FILTERS = [
  { value: 'all', label: 'All Files' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'image', label: 'Images' },
] as const

export type FileTypeFilter = (typeof FILE_TYPE_FILTERS)[number]['value']

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
} as const

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const MAX_FILE_SIZE_MB = 10

/**
 * Get the appropriate icon for a file type
 */
export function getFileIcon(fileType: string): LucideIcon {
  if (fileType.startsWith('image/')) {
    return FileImage
  }
  if (fileType === 'application/pdf') {
    return FileText
  }
  return File
}

/**
 * Get the appropriate icon for a document type
 */
export function getDocumentTypeIcon(documentType: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    invoice: Receipt,
    receipt: Receipt,
    work_order: FileCheck,
    insurance_policy: Shield,
    tax_document: FileText,
    lease_agreement: Building,
    inspection_report: FileCheck,
    property_photo: Camera,
    floor_plan: FileImage,
    other: File,
  }
  return iconMap[documentType] || File
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Validate a file for upload
 */
export function validateDocumentFile(
  file: File
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = Object.keys(SUPPORTED_FILE_TYPES)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Please upload PDF, PNG, or JPEG files.`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`,
    }
  }

  return { valid: true }
}

/**
 * Generate storage path for a document
 * Format: {portfolio_id}/{property_id}/{timestamp}-{filename}
 */
export function generateDocumentPath(
  portfolioId: string,
  propertyId: string,
  filename: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${portfolioId}/${propertyId}/${timestamp}-${sanitizedFilename}`
}

/**
 * Get label for document type
 */
export function getDocumentTypeLabel(type: string): string {
  const docType = DOCUMENT_TYPES.find((t) => t.value === type)
  return docType?.label || 'Other'
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : ''
}

/**
 * Check if file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/')
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(fileType: string): boolean {
  return fileType === 'application/pdf'
}

/**
 * Format date for display
 */
export function formatDocumentDate(date: string | null): string {
  if (!date) return 'N/A'

  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}
