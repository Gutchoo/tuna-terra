'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { Property } from '@/lib/supabase'

interface EditPropertyDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property
}

export function EditPropertyDetailsModal({
  open,
  onOpenChange,
  property,
}: EditPropertyDetailsModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    owner: property.owner || '',
    purchase_price: property.purchase_price || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['user-properties'] })
      await queryClient.invalidateQueries({ queryKey: ['property', property.id] })

      toast.success('Property updated successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error('Failed to update property')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property Details</DialogTitle>
          <DialogDescription>
            Update property information. Changes will be saved to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Owner */}
          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Owner name"
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase-price">Purchase Price</Label>
            <Input
              id="purchase-price"
              type="number"
              value={formData.purchase_price || ''}
              onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || null })}
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
