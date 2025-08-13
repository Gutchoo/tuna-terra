'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TrashIcon } from 'lucide-react'
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
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!portfolio) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete portfolio')
      }

      onDeleteSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      onError(error instanceof Error ? error.message : 'Failed to delete portfolio')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!portfolio) return null

  const hasProperties = (portfolio.property_count || 0) > 0
  const hasMembers = (portfolio.member_count || 0) > 1 // More than just the owner

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              Are you sure you want to delete <strong>&ldquo;{portfolio.name}&rdquo;</strong>? 
              This action cannot be undone.
            </p>
            
            {hasProperties && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 font-medium text-sm">
                  ⚠️ This portfolio contains {portfolio.property_count} {portfolio.property_count === 1 ? 'property' : 'properties'}
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  All properties in this portfolio will be permanently deleted.
                </p>
              </div>
            )}

            {hasMembers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium text-sm">
                  👥 This portfolio has {portfolio.member_count} members
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  All members will lose access to this portfolio.
                </p>
              </div>
            )}

            {portfolio.is_default && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 font-medium text-sm">
                  🏠 This is your default portfolio
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  After deletion, you&apos;ll need to create a new portfolio to manage properties.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? 'Deleting...' : 'Delete Portfolio'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}