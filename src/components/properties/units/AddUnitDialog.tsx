"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Loader2 } from "lucide-react"
import type { Property } from "@/lib/supabase"
import { useCreatePropertyUnit } from "@/hooks/use-property-units"

interface AddUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property
  portfolioId: string
}

export function AddUnitDialog({
  open,
  onOpenChange,
  property,
  portfolioId,
}: AddUnitDialogProps) {
  // Simplified form - only unit name and notes
  const [unitNumber, setUnitNumber] = React.useState<string>('')
  const [notes, setNotes] = React.useState<string>('')

  const { mutate: createUnit, isPending } = useCreatePropertyUnit(property.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!unitNumber.trim()) {
      return
    }

    const unitData = {
      portfolio_id: portfolioId,
      unit_number: unitNumber.trim(),
      unit_name: null, // Deprecated field
      square_footage: null,
      tenant_name: null,
      tenant_email: null,
      tenant_phone: null,
      lease_start_date: null,
      lease_end_date: null,
      monthly_rent: null,
      security_deposit: null,
      lease_terms: null,
      is_occupied: false, // Will be auto-computed by trigger
      notes: notes.trim() || null,
    }

    createUnit(unitData, {
      onSuccess: () => {
        // Reset form
        setUnitNumber('')
        setNotes('')
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
          <DialogDescription>
            Create a new unit for {property.address}. Occupancy will be tracked automatically based on rental income.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Number/Name */}
          <div className="space-y-2">
            <Label htmlFor="unit-number" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Unit Name/Number
            </Label>
            <Input
              id="unit-number"
              placeholder="e.g., 101, Unit A, Main House, ADU 1"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Can be a number, name, or combination
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this unit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Unit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
