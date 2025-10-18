"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building2, User, DollarSign, Loader2 } from "lucide-react"
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
  const [activeTab, setActiveTab] = React.useState("basic")

  // Basic Info
  const [unitNumber, setUnitNumber] = React.useState<string>('')
  const [unitName, setUnitName] = React.useState<string>('')
  const [squareFootage, setSquareFootage] = React.useState<string>('')
  const [notes, setNotes] = React.useState<string>('')

  // Tenant & Lease
  const [tenantName, setTenantName] = React.useState<string>('')
  const [tenantEmail, setTenantEmail] = React.useState<string>('')
  const [tenantPhone, setTenantPhone] = React.useState<string>('')
  const [leaseStartDate, setLeaseStartDate] = React.useState<string>('')
  const [leaseEndDate, setLeaseEndDate] = React.useState<string>('')
  const [monthlyRent, setMonthlyRent] = React.useState<string>('')
  const [securityDeposit, setSecurityDeposit] = React.useState<string>('')
  const [leaseTerms, setLeaseTerms] = React.useState<string>('')
  const [isOccupied, setIsOccupied] = React.useState(false)

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
      unit_name: unitName.trim() || null,
      square_footage: squareFootage ? parseFloat(squareFootage) : null,
      tenant_name: tenantName.trim() || null,
      tenant_email: tenantEmail.trim() || null,
      tenant_phone: tenantPhone.trim() || null,
      lease_start_date: leaseStartDate || null,
      lease_end_date: leaseEndDate || null,
      monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
      security_deposit: securityDeposit ? parseFloat(securityDeposit) : null,
      lease_terms: leaseTerms.trim() || null,
      is_occupied: isOccupied,
      notes: notes.trim() || null,
    }

    createUnit(unitData, {
      onSuccess: () => {
        // Reset form
        setUnitNumber('')
        setUnitName('')
        setSquareFootage('')
        setNotes('')
        setTenantName('')
        setTenantEmail('')
        setTenantPhone('')
        setLeaseStartDate('')
        setLeaseEndDate('')
        setMonthlyRent('')
        setSecurityDeposit('')
        setLeaseTerms('')
        setIsOccupied(false)
        setActiveTab("basic")
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
          <DialogDescription>
            Create a new unit for {property.address}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="tenant">Tenant & Lease</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Unit Number */}
              <div className="space-y-2">
                <Label htmlFor="unit-number" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Unit Number *
                </Label>
                <Input
                  id="unit-number"
                  placeholder="e.g., Unit 101, ADU 1, Suite A"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  required
                />
              </div>

              {/* Unit Name */}
              <div className="space-y-2">
                <Label htmlFor="unit-name">Unit Name (Optional)</Label>
                <Input
                  id="unit-name"
                  placeholder="e.g., Garden Suite, Corner Office"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                />
              </div>

              {/* Square Footage */}
              <div className="space-y-2">
                <Label htmlFor="square-footage">Square Footage</Label>
                <Input
                  id="square-footage"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details about this unit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="tenant" className="space-y-4 mt-4">
              {/* Occupancy Status */}
              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is-occupied">Unit Occupied</Label>
                  <p className="text-xs text-muted-foreground">
                    Is this unit currently occupied by a tenant?
                  </p>
                </div>
                <Switch
                  id="is-occupied"
                  checked={isOccupied}
                  onCheckedChange={setIsOccupied}
                />
              </div>

              {/* Tenant Information */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tenant Information
                </Label>
                <div className="space-y-3">
                  <Input
                    placeholder="Tenant name"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Lease Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lease-start">Lease Start</Label>
                  <Input
                    id="lease-start"
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-end">Lease End</Label>
                  <Input
                    id="lease-end"
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Financial Terms */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Terms
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-rent" className="text-xs">
                      Monthly Rent
                    </Label>
                    <Input
                      id="monthly-rent"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security-deposit" className="text-xs">
                      Security Deposit
                    </Label>
                    <Input
                      id="security-deposit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Lease Terms */}
              <div className="space-y-2">
                <Label htmlFor="lease-terms">Lease Terms</Label>
                <Textarea
                  id="lease-terms"
                  placeholder="Additional lease details..."
                  value={leaseTerms}
                  onChange={(e) => setLeaseTerms(e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
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
