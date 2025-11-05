import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DatabaseService } from '@/lib/db'
import { deleteFile } from '@/lib/storage'

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
// GET /api/properties/[propertyId]/documents/[documentId]
// Get a single document with signed download URL
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { documentId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get document using DatabaseService
    const document = await DatabaseService.getDocument(documentId)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for download (valid for 1 hour) using server-side client
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('property-documents')
      .createSignedUrl(document.file_path, 3600)

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: signedUrlError?.message || 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...document,
        signed_url: signedUrlData.signedUrl
      }
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/properties/[propertyId]/documents/[documentId]
// Update document metadata (not the file itself)
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { documentId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Update document metadata using DatabaseService
    const document = await DatabaseService.updateDocument(documentId, {
      title: body.title,
      description: body.description,
      document_type: body.document_type,
      tags: body.tags
    })

    return NextResponse.json({ data: document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update document' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/properties/[propertyId]/documents/[documentId]
// Delete a document (soft delete from database, remove from storage)
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { documentId } = await params
    const supabase = await createServerSupabaseClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get document first to access file_path
    const document = await DatabaseService.getDocument(documentId)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete from storage first
    const deleteResult = await deleteFile(document.file_path)

    if (!deleteResult.success) {
      console.warn('Failed to delete file from storage:', deleteResult.error)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (soft delete)
    await DatabaseService.deleteDocument(documentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    )
  }
}
