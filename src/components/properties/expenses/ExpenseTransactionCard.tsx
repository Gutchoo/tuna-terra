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
import { MoreVertical, Edit, Trash2, Repeat, Building2, ChevronDown, ChevronUp, User } from "lucide-react"
import type { ExpenseTransaction } from "@/lib/supabase"
import { CategoryBadge } from "../transactions/CategoryBadge"
import { useDeleteExpenseTransaction } from "@/hooks/use-expense-transactions"
import { useCanEditPortfolio } from "@/hooks/use-portfolio-role"

interface ExpenseTransactionCardProps {
  transaction: ExpenseTransaction & {
    property_units?: {
      unit_number: string
      unit_name: string | null
    } | null
  }
  portfolioId: string
  onEdit?: (transaction: ExpenseTransaction) => void
}

export function ExpenseTransactionCard({
  transaction,
  portfolioId,
  onEdit,
}: ExpenseTransactionCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const { canEdit } = useCanEditPortfolio(portfolioId)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpenseTransaction(transaction.property_id)

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
    if (confirm(`Are you sure you want to delete this expense transaction?\n\nAmount: ${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}`)) {
      deleteExpense({
        transactionId: transaction.id,
        deleteRecurring: transaction.is_recurring && confirm('This is a recurring transaction. Delete all future occurrences?'),
      })
    }
  }

  const hasDetails = transaction.notes || transaction.vendor_name || (transaction.tags && transaction.tags.length > 0)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Main Info */}
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{transaction.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.transaction_date)}
                  </span>
                  <CategoryBadge category={transaction.category} variant="outline" />
                  {transaction.transaction_type === 'projected' && (
                    <Badge variant="outline" className="text-xs">
                      Projected
                    </Badge>
                  )}
                  {transaction.is_recurring && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      Recurring
                    </Badge>
                  )}
                  {transaction.property_units && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {transaction.property_units.unit_number}
                    </Badge>
                  )}
                  {transaction.vendor_name && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {transaction.vendor_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {hasDetails && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show details
                    </>
                  )}
                </Button>
                {expanded && (
                  <div className="mt-2 space-y-2 text-sm">
                    {transaction.vendor_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vendor:</p>
                        <p className="text-xs">
                          {transaction.vendor_name}
                          {transaction.vendor_contact && ` - ${transaction.vendor_contact}`}
                        </p>
                      </div>
                    )}
                    {transaction.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                        <p className="text-xs">{transaction.notes}</p>
                      </div>
                    )}
                    {transaction.tags && transaction.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {transaction.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount and Actions */}
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-base font-semibold text-red-600 tabular-nums">
                -{formatCurrency(transaction.amount)}
              </p>
            </div>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
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
        </div>
      </CardContent>
    </Card>
  )
}
