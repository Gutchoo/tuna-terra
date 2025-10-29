"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, AlertCircle } from "lucide-react"
import type { Property } from "@/lib/supabase"
import { useUpdatePropertyDetails } from "@/hooks/use-property-details"
import { usePortfolioRole } from "@/hooks/use-portfolio-role"
// Temporarily disabled - field override tracking
// import { FieldOverrideBadge } from "@/components/properties/FieldOverrideBadge"
import { toast } from "sonner"

interface PropertyOverviewEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property
  propertyId: string
}

export function PropertyOverviewEditModal({
  open,
  onOpenChange,
  property,
  propertyId,
}: PropertyOverviewEditModalProps) {
  const updateMutation = useUpdatePropertyDetails(propertyId)
  const { data: role, isLoading: roleLoading } = usePortfolioRole(property.portfolio_id || null)

  const isViewer = role === 'viewer'
  const canEdit = !isViewer && !roleLoading

  // Local form state
  const [address, setAddress] = React.useState(property.address || '')
  const [apn, setApn] = React.useState(property.apn || '')
  const [owner, setOwner] = React.useState(property.owner || '')
  const [purchasePrice, setPurchasePrice] = React.useState(property.purchase_price?.toString() || '')
  const [purchaseDate, setPurchaseDate] = React.useState(property.purchase_date || '')
  const [soldPrice, setSoldPrice] = React.useState(property.sold_price?.toString() || '')
  const [soldDate, setSoldDate] = React.useState(property.sold_date || '')

  // Reset form when property changes or modal opens
  React.useEffect(() => {
    if (open) {
      setAddress(property.address || '')
      setApn(property.apn || '')
      setOwner(property.owner || '')
      setPurchasePrice(property.purchase_price?.toString() || '')
      setPurchaseDate(property.purchase_date || '')
      setSoldPrice(property.sold_price?.toString() || '')
      setSoldDate(property.sold_date || '')
    }
  }, [open, property])

  const handleSave = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to edit this property')
      return
    }

    try {
      // Prepare updates
      const updates: any = {
        purchase_date: purchaseDate || null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        sold_price: soldPrice ? parseFloat(soldPrice) : null,
        sold_date: soldDate || null,
      }

      // Temporarily disabled - field override tracking
      // const fieldOverrides: Record<string, any> = {}

      // // Address override
      // if (address !== property.address) {
      //   fieldOverrides.address = {
      //     value: address,
      //     original: property.address,
      //     overridden_at: new Date().toISOString(),
      //     overridden_by: 'user', // Will be set by API based on auth
      //   }
      // }

      // // APN override
      // if (apn !== property.apn) {
      //   fieldOverrides.apn = {
      //     value: apn,
      //     original: property.apn,
      //     overridden_at: new Date().toISOString(),
      //     overridden_by: 'user',
      //   }
      // }

      // // Owner override
      // if (owner !== property.owner) {
      //   fieldOverrides.owner = {
      //     value: owner,
      //     original: property.owner,
      //     overridden_at: new Date().toISOString(),
      //     overridden_by: 'user',
      //   }
      // }

      // if (Object.keys(fieldOverrides).length > 0) {
      //   updates.fieldOverrides = fieldOverrides
      // }

      // Purchase price is handled in Financial Modeling dashboard
      // We'll show it here but not allow editing

      await updateMutation.mutateAsync(updates)
      toast.success('Property details updated successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save property details:', error)
      // Error toast is handled by the mutation
    }
  }

  // Temporarily disabled - field override tracking
  // const isFieldOverridden = (fieldName: string) => {
  //   return property.field_overrides && fieldName in property.field_overrides
  // }

  // const getFieldOverride = (fieldName: string) => {
  //   return property.field_overrides?.[fieldName]
  // }

  const hasChanges =
    address !== (property.address || '') ||
    apn !== (property.apn || '') ||
    owner !== (property.owner || '') ||
    purchaseDate !== (property.purchase_date || '') ||
    purchasePrice !== (property.purchase_price?.toString() || '') ||
    soldPrice !== (property.sold_price?.toString() || '') ||
    soldDate !== (property.sold_date || '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property Details</DialogTitle>
          <DialogDescription>
            Update key property information for this property.
          </DialogDescription>
        </DialogHeader>

        {isViewer && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have viewer access to this property. Contact the portfolio owner to request editing permissions.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            {/* Temporarily disabled - field override tracking */}
            {/* {isFieldOverridden('address') && (
              <FieldOverrideBadge
                override={getFieldOverride('address')!}
                onRevert={() => setAddress(property.address || '')}
                showRevertButton={canEdit}
              />
            )} */}
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!canEdit}
              placeholder="123 Main Street"
              className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              e.g., 123 Main Street
            </p>
          </div>

          {/* Parcel/APN */}
          <div className="space-y-2">
            <Label htmlFor="apn">Parcel / APN</Label>
            {/* Temporarily disabled - field override tracking */}
            {/* {isFieldOverridden('apn') && (
              <FieldOverrideBadge
                override={getFieldOverride('apn')!}
                onRevert={() => setApn(property.apn || '')}
                showRevertButton={canEdit}
              />
            )} */}
            <Input
              id="apn"
              value={apn}
              onChange={(e) => setApn(e.target.value)}
              disabled={!canEdit}
              placeholder="123-456-789"
              className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              e.g., 123-456-789
            </p>
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            {/* Temporarily disabled - field override tracking */}
            {/* {isFieldOverridden('owner') && (
              <FieldOverrideBadge
                override={getFieldOverride('owner')!}
                onRevert={() => setOwner(property.owner || '')}
                showRevertButton={canEdit}
              />
            )} */}
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              disabled={!canEdit}
              placeholder="John Doe"
              className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              e.g., John Doe
            </p>
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Purchase Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="purchase_price"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={!canEdit}
                className={`pl-9 ${!canEdit ? 'bg-muted cursor-not-allowed' : ''}`}
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Original purchase price of the property
            </p>
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input
              id="purchase_date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              disabled={!canEdit}
              className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Date when property was acquired
            </p>
          </div>

          {/* Disposition Price */}
          <div className="space-y-2">
            <Label htmlFor="sold_price">Disposition Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="sold_price"
                type="number"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={!canEdit}
                className={`pl-9 ${!canEdit ? 'bg-muted cursor-not-allowed' : ''}`}
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Sale price when property was disposed (leave empty if not sold)
            </p>
          </div>

          {/* Disposition Date */}
          <div className="space-y-2">
            <Label htmlFor="sold_date">Disposition Date</Label>
            <Input
              id="sold_date"
              type="date"
              value={soldDate}
              onChange={(e) => setSoldDate(e.target.value)}
              disabled={!canEdit}
              className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Date when property was sold (leave empty if not sold)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canEdit || !hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
