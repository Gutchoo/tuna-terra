"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Property } from "@/lib/supabase"
import { OverviewTab } from "./drawer-tabs/OverviewTab"

interface PropertyDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string | null
  portfolioId?: string | null
  property?: Property // Pass property data directly to avoid loading states
}

export function PropertyDrawer({
  open,
  onOpenChange,
  propertyId,
  portfolioId,
  property
}: PropertyDrawerProps) {
  const [activeTab, setActiveTab] = React.useState("overview")

  // Reset to overview tab when property changes
  React.useEffect(() => {
    if (propertyId) {
      setActiveTab("overview")
    }
  }, [propertyId])

  if (!propertyId) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[90%] sm:w-[85%] lg:w-[80%] xl:w-[75%] sm:max-w-none overflow-y-auto"
        side="right"
      >
        {property ? (
          <>
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="text-xl font-semibold">
                {property.address}
              </SheetTitle>
              <SheetDescription>
                {property.city}, {property.state} {property.zip_code}
              </SheetDescription>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-4">
                  <OverviewTab property={property} propertyId={propertyId} />
                </TabsContent>

                <TabsContent value="units" className="space-y-4">
                  <UnitsTabPlaceholder property={property} />
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  <IncomeTabPlaceholder propertyId={propertyId} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                  <ExpensesTabPlaceholder propertyId={propertyId} />
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <DocumentsTabPlaceholder propertyId={propertyId} />
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                  <FinancialsTabPlaceholder property={property} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <PropertyDrawerSkeleton />
        )}
      </SheetContent>
    </Sheet>
  )
}

// Placeholder components - will be replaced with actual tab implementations
function OverviewTabPlaceholder({ property }: { property: Property }) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Overview tab coming soon. This will show property snapshot, key metrics, and recent activity.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Property Details</p>
          <div className="text-sm">
            <p><span className="font-medium">Owner:</span> {property.owner || 'N/A'}</p>
            <p><span className="font-medium">APN:</span> {property.apn || 'N/A'}</p>
            <p><span className="font-medium">County:</span> {property.county || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Physical Details</p>
          <div className="text-sm">
            <p><span className="font-medium">Lot Size:</span> {property.lot_size_acres ? `${property.lot_size_acres} acres` : 'N/A'}</p>
            <p><span className="font-medium">Year Built:</span> {property.year_built || 'N/A'}</p>
            <p><span className="font-medium">Stories:</span> {property.stories || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UnitsTabPlaceholder({ property }: { property: Property }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Units tab coming soon. This property has {property.num_units || 0} units configured.
      </AlertDescription>
    </Alert>
  )
}

function IncomeTabPlaceholder({ propertyId }: { propertyId: string }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Income transactions tab coming soon. You'll be able to add and manage income here.
      </AlertDescription>
    </Alert>
  )
}

function ExpensesTabPlaceholder({ propertyId }: { propertyId: string }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Expense transactions tab coming soon. You'll be able to add and manage expenses here.
      </AlertDescription>
    </Alert>
  )
}

function DocumentsTabPlaceholder({ propertyId }: { propertyId: string }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Documents tab coming soon. You'll be able to upload and manage property documents here.
      </AlertDescription>
    </Alert>
  )
}

function FinancialsTabPlaceholder({ property }: { property: Property }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Financials tab coming soon. This will link to the existing property financial modeling dashboard.
      </AlertDescription>
    </Alert>
  )
}

function PropertyDrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b pb-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
