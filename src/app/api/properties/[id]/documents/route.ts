import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DatabaseService } from '@/lib/db'
import { validateDocumentFile } from '@/lib/documents'
import { sanitizeFilename } from '@/lib/storage'

async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// ============================================================================
// GET /api/properties/[propertyId]/documents
// List documents for a property
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const unit_id = searchParams.get('unit_id')
    const document_type = searchParams.get('document_type')
    const transaction_id = searchParams.get('transaction_id')
    const is_active = searchParams.get('is_active')

    const filters: {
      unit_id?: string
      document_type?: string
      transaction_id?: string
      is_active?: boolean
    } = {}

    if (unit_id) filters.unit_id = unit_id
    if (document_type) filters.document_type = document_type
    if (transaction_id) filters.transaction_id = transaction_id
    if (is_active !== null) filters.is_active = is_active === 'true'

    // Get documents using DatabaseService
    const documents = await DatabaseService.getPropertyDocuments(propertyId, filters)

    return NextResponse.json({
      data: documents,
      count: documents.length
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/properties/[propertyId]/documents
// Upload a new document
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const portfolio_id = formData.get('portfolio_id') as string
    const document_type = formData.get('document_type') as string
    const title = formData.get('title') as string
    const unit_id = formData.get('unit_id') as string | null
    const transaction_id = formData.get('transaction_id') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'file is required' },
        { status: 400 }
      )
    }

    if (!portfolio_id) {
      return NextResponse.json(
        { error: 'portfolio_id is required' },
        { status: 400 }
      )
    }

    if (!document_type) {
      return NextResponse.json(
        { error: 'document_type is required' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateDocumentFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate storage path with sanitized filename
    const unitPath = unit_id || 'property-level'
    const documentId = crypto.randomUUID()
    const sanitizedFileName = sanitizeFilename(file.name)
    const filePath = `${portfolio_id}/${propertyId}/${unitPath}/${documentId}/${sanitizedFileName}`

    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to Supabase Storage using server-side client
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Use the actual path returned by Supabase Storage
    const actualStoragePath = uploadData.path
    console.log(`Document uploaded successfully:`, {
      originalFileName: file.name,
      sanitizedFileName,
      expectedPath: filePath,
      actualPath: actualStoragePath,
      documentId
    })

    // Create document record in database
    const document = await DatabaseService.createDocument({
      property_id: propertyId,
      portfolio_id,
      unit_id: unit_id || undefined,
      income_transaction_id: transaction_id || undefined,
      expense_transaction_id: undefined,
      document_type,
      title,
      description: description || undefined,
      file_name: file.name,
      file_path: actualStoragePath,
      file_size_bytes: file.size,
      file_type: file.type,
      tags
    })

    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
