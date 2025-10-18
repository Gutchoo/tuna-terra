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
import { MoreVertical, Edit, Trash2, User, Calendar, DollarSign } from "lucide-react"
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${unit.unit_number}?\n\nThis will not delete associated transactions.`)) {
      deleteUnit(unit.id)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Unit Header */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-base font-semibold truncate">
                {unit.unit_number}
              </h4>
              {unit.unit_name && (
                <span className="text-sm text-muted-foreground truncate">
                  ({unit.unit_name})
                </span>
              )}
              <Badge
                variant={unit.is_occupied ? "default" : "secondary"}
                className={unit.is_occupied ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
              >
                {unit.is_occupied ? "Occupied" : "Vacant"}
              </Badge>
            </div>

            {/* Unit Details */}
            <div className="space-y-2 text-sm">
              {/* Tenant Info */}
              {unit.tenant_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">{unit.tenant_name}</span>
                </div>
              )}

              {/* Lease Dates */}
              {unit.lease_end_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    Lease ends {formatDate(unit.lease_end_date)}
                  </span>
                </div>
              )}

              {/* Monthly Rent */}
              {unit.monthly_rent && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(unit.monthly_rent)}/mo</span>
                </div>
              )}

              {/* Square Footage */}
              {unit.square_footage && (
                <div className="text-xs text-muted-foreground">
                  {unit.square_footage.toLocaleString()} sq ft
                </div>
              )}
            </div>
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
