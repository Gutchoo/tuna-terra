import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DatabaseService } from '@/lib/db'
import { getSignedUrl, deleteFile } from '@/lib/storage'

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

    console.log(`Attempting to retrieve document:`, {
      documentId,
      fileName: document.file_name,
      filePath: document.file_path,
      fileType: document.file_type
    })

    // Generate signed URL for download (valid for 1 hour)
    const signedUrlResult = await getSignedUrl(document.file_path, 3600)

    if (!signedUrlResult.url || signedUrlResult.error) {
      return NextResponse.json(
        { error: signedUrlResult.error || 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...document,
        signed_url: signedUrlResult.url
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

    console.log('[DELETE API] Starting document deletion:', {
      documentId,
      fileName: document.file_name,
      filePath: document.file_path,
      propertyId: document.property_id,
      portfolioId: document.portfolio_id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    // Delete from storage first - pass authenticated server client for RLS policy compliance
    const deleteResult = await deleteFile(document.file_path, supabase)

    if (!deleteResult.success) {
      console.error('[DELETE API] Storage deletion failed, aborting database deletion:', {
        documentId,
        filePath: document.file_path,
        error: deleteResult.error,
        timestamp: new Date().toISOString()
      })

      // FAIL THE REQUEST - do not delete from database if storage deletion fails
      return NextResponse.json(
        {
          error: `Failed to delete file from storage: ${deleteResult.error}`,
          details: 'The database record has not been modified. Please check storage bucket permissions and RLS policies.'
        },
        { status: 500 }
      )
    }

    console.log('[DELETE API] Storage deletion successful, proceeding with database deletion:', {
      documentId,
      filePath: document.file_path,
      timestamp: new Date().toISOString()
    })

    // Delete from database (soft delete)
    await DatabaseService.deleteDocument(documentId)

    console.log('[DELETE API] Document deletion complete:', {
      documentId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    )
  }
}
