'use client'

import { MoreVertical, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getFileIcon, formatDocumentDate } from '@/lib/documents'
import type { PropertyDocument } from '@/lib/supabase'

interface DocumentListItemProps {
  document: PropertyDocument
  canEdit: boolean
  onPreview: (document: PropertyDocument) => void
  onDelete: (documentId: string) => void
}

export function DocumentListItem({
  document,
  canEdit,
  onPreview,
  onDelete,
}: DocumentListItemProps) {
  const FileIcon = getFileIcon(document.file_type)

  return (
    <div
      className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
      onClick={() => onPreview(document)}
    >
      {/* File Icon */}
      <div className="flex-shrink-0">
        <div className="p-2 bg-primary/10 rounded">
          <FileIcon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* File Name */}
      <div className="flex-1 min-w-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium text-sm truncate cursor-help">
                {document.title || document.file_name}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">{document.title || document.file_name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Date */}
      <div className="flex-shrink-0 text-xs text-muted-foreground">
        {formatDocumentDate(document.uploaded_at)}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {canEdit ? (
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(document.id)
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onPreview(document)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
