"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  AlertCircle,
  Calendar,
  Pencil,
  MapPin,
  Hash,
  User,
  Building2,
} from "lucide-react"
import { usePropertyOverview } from "@/hooks/use-property-overview"
import { PropertyOverviewEditModal } from "@/components/properties/PropertyOverviewEditModal"
import type { Property } from "@/lib/supabase"

interface OverviewTabProps {
  property: Property
  propertyId: string
}

export function OverviewTab({ property, propertyId }: OverviewTabProps) {
  const { data: overviewData, isLoading, error } = usePropertyOverview(propertyId)
  const [editModalOpen, setEditModalOpen] = React.useState(false)

  if (isLoading) {
    return <OverviewSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load property overview. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!overviewData) {
    return null
  }

  const { metrics, recentTransactions } = overviewData

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-0">
            <CardTitle className="text-sm font-medium">Income YTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalIncomeYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-0">
            <CardTitle className="text-sm font-medium">Expenses YTD</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalExpensesYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-0">
            <CardTitle className="text-sm font-medium">NOI YTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.noiYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net operating income
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-0">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.documentCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.unitCount > 0 ? `${metrics.unitCount} units` : 'Property-level'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Overview Card */}
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-0">
          <CardTitle className="text-base">Property Overview</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditModalOpen(true)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Address */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </div>
              <div className="text-sm pl-6">
                <p className="font-medium">{property.address || 'N/A'}</p>
                <p className="text-muted-foreground">
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
            </div>

            {/* Parcel/APN */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Parcel / APN</span>
              </div>
              <div className="text-sm pl-6 font-mono">
                {property.apn || 'N/A'}
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Owner</span>
              </div>
              <div className="text-sm pl-6">
                {property.owner || 'N/A'}
              </div>
            </div>

            {/* Purchase Price / Purchase Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Purchase Price / Purchase Date</span>
              </div>
              <div className="text-sm pl-6 font-medium">
                {property.purchase_price ? formatCurrency(property.purchase_price) : 'N/A'} / {property.purchase_date ? formatDate(property.purchase_date) : 'No date'}
              </div>
            </div>

            {/* Disposition Price / Disposition Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Disposition Price / Disposition Date</span>
              </div>
              <div className="text-sm pl-6 font-medium">
                {property.sold_price ? formatCurrency(property.sold_price) : 'N/A'} / {property.sold_date ? formatDate(property.sold_date) : 'No date'}
              </div>
            </div>

            {/* Assessed Value */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Assessed Value</span>
              </div>
              <div className="text-sm pl-6 font-semibold">
                {property.assessed_value ? formatCurrency(property.assessed_value) : 'N/A'}
              </div>
            </div>

            {/* Lot Size */}
            {property.lot_size_acres && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Lot Size</span>
                </div>
                <div className="text-sm pl-6">
                  {Number(property.lot_size_acres).toFixed(2)} acres
                </div>
              </div>
            )}

            {/* Use Description */}
            {property.use_description && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Use Description</span>
                </div>
                <div className="text-sm pl-6">{property.use_description}</div>
              </div>
            )}

            {/* Zoning */}
            {property.zoning && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Zoning</span>
                </div>
                <div className="text-sm pl-6">{property.zoning}</div>
              </div>
            )}

            {/* Number of Units */}
            {property.num_units && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Units</span>
                </div>
                <div className="text-sm pl-6">{property.num_units}</div>
              </div>
            )}

            {/* County */}
            {property.county && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>County</span>
                </div>
                <div className="text-sm pl-6">{property.county}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Overview Edit Modal */}
      <PropertyOverviewEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        property={property}
        propertyId={propertyId}
      />

      {/* Recent Activity */}
      <Card className="py-4">
        <CardHeader className="pt-0">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recent transactions</p>
              <p className="text-xs mt-1">Income and expenses will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={`${transaction.type}-${transaction.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {formatCategoryLabel(transaction.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
