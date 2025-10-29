"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, FileText } from "lucide-react"
import type { PropertyUnit } from "@/lib/supabase"
import { useDeletePropertyUnit } from "@/hooks/use-property-units"
import { useCanEditPortfolio } from "@/hooks/use-portfolio-role"

interface UnitCardProps {
  unit: PropertyUnit
  portfolioId: string
  onEdit?: (unit: PropertyUnit) => void
}

export function UnitCard({
  unit,
  portfolioId,
  onEdit,
}: UnitCardProps) {
  const { canEdit } = useCanEditPortfolio(portfolioId)
  const { mutate: deleteUnit, isPending: isDeleting } = useDeletePropertyUnit(unit.property_id)

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${unit.unit_number}?\n\nThis will not delete associated transactions.`)) {
      deleteUnit(unit.id)
    }
  }

  // Truncate notes to first 100 characters
  const notesPreview = unit.notes
    ? unit.notes.length > 100
      ? unit.notes.slice(0, 100) + '...'
      : unit.notes
    : null

  return (
    <Card className={unit.is_occupied ? "border-l-4 border-l-green-500" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Unit Header */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-semibold truncate">
                {unit.unit_number}
              </h4>
              <Badge
                variant={unit.is_occupied ? "default" : "secondary"}
                className={unit.is_occupied ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
              >
                {unit.is_occupied ? "Occupied" : "Vacant"}
              </Badge>
            </div>

            {/* Notes Preview */}
            {notesPreview && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{notesPreview}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(unit)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
