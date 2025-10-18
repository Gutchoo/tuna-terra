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
import { ChevronDown, Calendar, DollarSign, Loader2, User } from "lucide-react"
import type { Property, ExpenseCategory, RecurrenceFrequency } from "@/lib/supabase"
import { useCreateExpenseTransaction } from "@/hooks/use-expense-transactions"
import { UnitSelector } from "../transactions/UnitSelector"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property
  portfolioId: string
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'repairs_maintenance', label: 'Repairs & Maintenance' },
  { value: 'property_taxes', label: 'Property Taxes' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'hoa_fees', label: 'HOA Fees' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'legal_fees', label: 'Legal Fees' },
  { value: 'accounting_fees', label: 'Accounting Fees' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'capital_expenditure', label: 'Capital Expenditure' },
  { value: 'other_expense', label: 'Other Expense' },
]

const RECURRENCE_FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-annual' },
  { value: 'annual', label: 'Annual' },
]

export function AddExpenseDialog({
  open,
  onOpenChange,
  property,
  portfolioId,
}: AddExpenseDialogProps) {
  const [transactionDate, setTransactionDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [amount, setAmount] = React.useState<string>('')
  const [category, setCategory] = React.useState<ExpenseCategory>('repairs_maintenance')
  const [description, setDescription] = React.useState<string>('')
  const [transactionType, setTransactionType] = React.useState<'actual' | 'projected'>('actual')
  const [unitId, setUnitId] = React.useState<string | null>(null)
  const [vendorName, setVendorName] = React.useState<string>('')
  const [vendorContact, setVendorContact] = React.useState<string>('')
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

  const { mutate: createExpense, isPending } = useCreateExpenseTransaction(property.id)

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
      vendor_name: vendorName.trim() || null,
      vendor_contact: vendorContact.trim() || null,
      notes: notes.trim() || null,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    }

    createExpense(transactionData, {
      onSuccess: () => {
        // Reset form but keep it on current form (not method selection)
        setAmount('')
        setDescription('')
        setVendorName('')
        setVendorContact('')
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
          <DialogTitle>Add Expense Transaction</DialogTitle>
          <DialogDescription>
            Record expense paid for {property.address}
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
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
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
              placeholder="e.g., Plumbing repair - Unit 101"
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
                <SelectItem value="actual">Actual (Paid)</SelectItem>
                <SelectItem value="projected">Projected (Expected)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Vendor Information (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name" className="text-xs">
                  Vendor Name
                </Label>
                <Input
                  id="vendor-name"
                  placeholder="ABC Plumbing"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-contact" className="text-xs">
                  Contact
                </Label>
                <Input
                  id="vendor-contact"
                  placeholder="555-1234"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                />
              </div>
            </div>
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
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
