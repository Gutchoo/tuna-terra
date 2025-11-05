'use client'

import { MoreVertical, Download, Trash2, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getFileIcon, getDocumentTypeLabel, formatFileSize, formatDocumentDate } from '@/lib/documents'
import type { PropertyDocument } from '@/lib/supabase'

interface DocumentCardProps {
  document: PropertyDocument
  canEdit: boolean
  onPreview: (document: PropertyDocument) => void
  onDelete: (documentId: string) => void
}

export function DocumentCard({
  document,
  canEdit,
  onPreview,
  onDelete,
}: DocumentCardProps) {
  const FileIcon = getFileIcon(document.file_type)
  const typeLabel = getDocumentTypeLabel(document.document_type)

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <div
        className="p-4 space-y-3"
        onClick={() => onPreview(document)}
      >
        {/* Icon and Actions Header */}
        <div className="flex items-start justify-between">
          <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
            <FileIcon className="h-8 w-8 text-primary" />
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onPreview(document)
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  // Trigger download
                  window.open(`/api/properties/${document.property_id}/documents/${document.id}`, '_blank')
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(document.id)
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Document Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
            {document.title || document.file_name}
          </h4>

          {/* Type Badge */}
          <Badge variant="secondary" className="text-xs">
            {typeLabel}
          </Badge>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDocumentDate(document.uploaded_at)}</span>
            <span>{formatFileSize(document.file_size_bytes)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
