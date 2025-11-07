import { createClient } from '@/lib/supabase'

// ============================================================================
// CONSTANTS
// ============================================================================

export const STORAGE_BUCKET = 'property-documents'

// Maximum file size: 10MB (matches bucket configuration)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types (matches bucket configuration)
export const ALLOWED_FILE_TYPES = {
  // Images
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],

  // Documents
  'application/pdf': ['.pdf'],
} as const

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UploadResult {
  success: boolean
  filePath?: string
  fileUrl?: string
  error?: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate file size and type
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  const allowedTypes = Object.keys(ALLOWED_FILE_TYPES)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: PDF, PNG, JPG, JPEG`
    }
  }

  return { valid: true }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove special characters and replace spaces with underscores
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

// ============================================================================
// STORAGE PATH GENERATION
// ============================================================================

/**
 * Generate storage path for a document
 * Path structure: {portfolio_id}/{property_id}/{unit_id or 'property-level'}/{document_id}/{filename}
 */
export function generateStoragePath(
  portfolioId: string,
  propertyId: string,
  documentId: string,
  filename: string,
  unitId?: string
): string {
  const sanitizedFilename = sanitizeFilename(filename)
  const unitPath = unitId || 'property-level'

  return `${portfolioId}/${propertyId}/${unitPath}/${documentId}/${sanitizedFilename}`
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  filePath: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    const supabase = createClient()

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    return {
      success: true,
      filePath: data.path,
      fileUrl: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  pathGenerator: (file: File, index: number) => string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => {
    const filePath = pathGenerator(file, index)
    return uploadFile(file, filePath)
  })

  return Promise.all(uploadPromises)
}

// ============================================================================
// FILE DOWNLOAD
// ============================================================================

/**
 * Get signed URL for private file download
 * Valid for 1 hour by default
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl }
  } catch (error) {
    console.error('Get signed URL error:', error)
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Download file as blob
 */
export async function downloadFile(
  filePath: string
): Promise<{ blob: Blob | null; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath)

    if (error) {
      console.error('Download error:', error)
      return { blob: null, error: error.message }
    }

    return { blob: data }
  } catch (error) {
    console.error('Download file error:', error)
    return {
      blob: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// FILE DELETION
// ============================================================================

/**
 * Delete a file from storage
 *
 * @param filePath - The path to the file in storage
 * @param supabaseClient - Optional authenticated Supabase client (for server-side operations)
 *                         If not provided, creates a new browser client (for client-side operations)
 */
export async function deleteFile(
  filePath: string,
  supabaseClient?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[STORAGE] Attempting to delete file:', {
      bucket: STORAGE_BUCKET,
      filePath,
      authenticated: !!supabaseClient,
      timestamp: new Date().toISOString()
    })

    // Use provided authenticated client or create new browser client
    const supabase = supabaseClient || createClient()

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('[STORAGE] Delete failed:', {
        filePath,
        bucket: STORAGE_BUCKET,
        authenticated: !!supabaseClient,
        errorMessage: error.message,
        errorCode: (error as any).statusCode,
        errorDetails: error,
        timestamp: new Date().toISOString()
      })
      return { success: false, error: error.message }
    }

    console.log('[STORAGE] Delete successful:', {
      filePath,
      bucket: STORAGE_BUCKET,
      authenticated: !!supabaseClient,
      data,
      timestamp: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    console.error('[STORAGE] Delete file exception:', {
      filePath,
      bucket: STORAGE_BUCKET,
      authenticated: !!supabaseClient,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(
  filePaths: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths)

    if (error) {
      console.error('Bulk delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete files error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get file type category from MIME type
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'document' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document'
  return 'unknown'
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Generate unique document ID
 */
export function generateDocumentId(): string {
  return crypto.randomUUID()
}
