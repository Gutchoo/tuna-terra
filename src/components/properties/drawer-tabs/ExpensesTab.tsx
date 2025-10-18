"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle, TrendingDown } from "lucide-react"
import type { Property } from "@/lib/supabase"
import { useExpenseTransactions } from "@/hooks/use-expense-transactions"
import { useCanEditPortfolio } from "@/hooks/use-portfolio-role"
import { ExpenseTransactionCard } from "../expenses/ExpenseTransactionCard"
import { AddExpenseDialog } from "../expenses/AddExpenseDialog"

interface ExpensesTabProps {
  property: Property
  propertyId: string
}

export function ExpensesTab({ property, propertyId }: ExpensesTabProps) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const { canEdit } = useCanEditPortfolio(property.portfolio_id)

  const { data: transactionsResponse, isLoading, error } = useExpenseTransactions(propertyId)

  const transactions = transactionsResponse?.data || []

  if (isLoading) {
    return <ExpensesTabSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load expense transactions. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expense Transactions</h3>
          <p className="text-sm text-muted-foreground">
            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No expense transactions yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Start tracking expenses for this property by adding your first transaction.
          </p>
          {canEdit && (
            <Button onClick={() => setAddDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Expense
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <ExpenseTransactionCard
              key={transaction.id}
              transaction={transaction}
              portfolioId={property.portfolio_id!}
            />
          ))}
        </div>
      )}

      {/* Add Expense Dialog */}
      {canEdit && property.portfolio_id && (
        <AddExpenseDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          property={property}
          portfolioId={property.portfolio_id}
        />
      )}
    </div>
  )
}

function ExpensesTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
