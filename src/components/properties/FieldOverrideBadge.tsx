"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertCircle, RotateCcw } from "lucide-react"
import type { FieldOverride } from "@/lib/supabase"

interface FieldOverrideBadgeProps {
  override: FieldOverride
  onRevert?: () => void
  showRevertButton?: boolean
}

export function FieldOverrideBadge({
  override,
  onRevert,
  showRevertButton = true,
}: FieldOverrideBadgeProps) {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            >
              <AlertCircle className="h-3 w-3" />
              Modified
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <div className="space-y-1 text-xs">
              <p className="font-medium">This value was manually edited</p>
              <p className="text-muted-foreground">
                Modified on {formatDate(override.overridden_at)}
              </p>
              <p className="text-muted-foreground">
                Original Regrid value: {String(override.original) || 'N/A'}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showRevertButton && onRevert && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onRevert}
              >
                <RotateCcw className="h-3 w-3" />
                <span className="sr-only">Revert to original</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Revert to original Regrid value</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
