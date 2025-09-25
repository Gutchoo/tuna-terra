'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeletePortfolio } from '@/hooks/use-portfolios'
import type { PortfolioWithMembership } from '@/lib/supabase'

interface DeletePortfolioDialogProps {
  portfolio: PortfolioWithMembership | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleteSuccess: () => void
  onError: (error: string) => void
}

export function DeletePortfolioDialog({
  portfolio,
  open,
  onOpenChange,
  onDeleteSuccess,
  onError
}: DeletePortfolioDialogProps) {
  const deletePortfolioMutation = useDeletePortfolio()

  const handleDeleteConfirm = async () => {
    if (!portfolio) return

    try {
      const result = await deletePortfolioMutation.mutateAsync(portfolio.id)

      // Show the message from the API if a new default was set
      if (result?.message) {
        console.log('Portfolio deletion result:', result.message)
      }

      onDeleteSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      onError(error instanceof Error ? error.message : 'Failed to delete portfolio')
    }
  }

  const isDeleting = deletePortfolioMutation.isPending

  if (!portfolio) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Portfolio</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{portfolio.name}&rdquo;?
            This action cannot be undone and will permanently delete all properties within this portfolio.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isDeleting || portfolio.is_sample}
          >
            {portfolio.is_sample ? 'Cannot Delete Sample' : isDeleting ? 'Deleting...' : 'Delete Portfolio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}