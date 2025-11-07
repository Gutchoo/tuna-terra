"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Calendar, DollarSign, Loader2 } from "lucide-react"
import type { Property, IncomeCategory, RecurrenceFrequency } from "@/lib/supabase"
import { useCreateIncomeTransaction } from "@/hooks/use-income-transactions"
import { UnitSelector } from "../transactions/UnitSelector"

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property
  portfolioId: string
}

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'rental_income', label: 'Rental Income' },
  { value: 'parking_income', label: 'Parking Income' },
  { value: 'storage_income', label: 'Storage Income' },
  { value: 'pet_fees', label: 'Pet Fees' },
  { value: 'late_fees', label: 'Late Fees' },
  { value: 'utility_reimbursement', label: 'Utility Reimbursement' },
  { value: 'laundry_income', label: 'Laundry Income' },
  { value: 'other_income', label: 'Other Income' },
]

const RECURRENCE_FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-annual' },
  { value: 'annual', label: 'Annual' },
]

export function AddIncomeDialog({
  open,
  onOpenChange,
  property,
  portfolioId,
}: AddIncomeDialogProps) {
  const [transactionDate, setTransactionDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [amount, setAmount] = React.useState<string>('')
  const [category, setCategory] = React.useState<IncomeCategory>('rental_income')
  const [description, setDescription] = React.useState<string>('')
  const [transactionType, setTransactionType] = React.useState<'actual' | 'projected'>('actual')
  const [unitId, setUnitId] = React.useState<string | null>(null)
  const [notes, setNotes] = React.useState<string>('')
  const [tags, setTags] = React.useState<string>('')

  // Recurring transaction fields
  const [isRecurring, setIsRecurring] = React.useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = React.useState<RecurrenceFrequency>('monthly')
  const [recurrenceStartDate, setRecurrenceStartDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState<string>('')

  const [recurringOpen, setRecurringOpen] = React.useState(false)

  const { mutate: createIncome, isPending } = useCreateIncomeTransaction(property.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      return
    }
    if (!description.trim()) {
      return
    }

    const transactionData = {
      portfolio_id: portfolioId,
      unit_id: unitId,
      transaction_date: transactionDate,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      transaction_type: transactionType,
      is_recurring: isRecurring,
      recurrence_frequency: isRecurring ? recurrenceFrequency : null,
      recurrence_start_date: isRecurring ? recurrenceStartDate : null,
      recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      notes: notes.trim() || null,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    }

    createIncome(transactionData, {
      onSuccess: () => {
        // Reset form but keep it on current form (not method selection)
        setAmount('')
        setDescription('')
        setNotes('')
        setTags('')
        setIsRecurring(false)
        setRecurrenceEndDate('')
        // Keep date, category, type, and unit as-is for quick batch entry
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Income Transaction</DialogTitle>
          <DialogDescription>
            Record income received for {property.address}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Assignment - Smart component that auto-hides for single-unit properties */}
          <UnitSelector
            property={property}
            value={unitId}
            onChange={setUnitId}
            includePropertyLevel={true}
          />

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transaction-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="transaction-date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as IncomeCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Monthly rent - Unit 101"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Transaction Type</Label>
            <Select value={transactionType} onValueChange={(value) => setTransactionType(value as 'actual' | 'projected')}>
              <SelectTrigger id="transaction-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actual">Actual (Received)</SelectItem>
                <SelectItem value="projected">Projected (Expected)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Transaction Section */}
          <Collapsible open={recurringOpen} onOpenChange={setRecurringOpen}>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="is-recurring" className="cursor-pointer">
                  Make this recurring
                </Label>
              </div>
              {isRecurring && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${recurringOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>

            {isRecurring && (
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={recurrenceFrequency} onValueChange={(value) => setRecurrenceFrequency(value as RecurrenceFrequency)}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-start">Start Date</Label>
                    <Input
                      id="recurrence-start"
                      type="date"
                      value={recurrenceStartDate}
                      onChange={(e) => setRecurrenceStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurrence-end">End Date (Optional)</Label>
                    <Input
                      id="recurrence-end"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
