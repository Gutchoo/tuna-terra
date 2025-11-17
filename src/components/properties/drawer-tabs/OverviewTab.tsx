"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Building2,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Hash
} from "lucide-react"
import { usePropertyOverview } from "@/hooks/use-property-overview"
import type { Property } from "@/lib/supabase"

interface OverviewTabProps {
  property: Property
  propertyId: string
}

export function OverviewTab({ property, propertyId }: OverviewTabProps) {
  const { data: overviewData, isLoading, error } = usePropertyOverview(propertyId)

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income YTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalIncomeYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses YTD</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.totalExpensesYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NOI YTD</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.noiYTD >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.noiYTD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net operating income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
              <div className="text-sm pl-6">
                <p>{property.address || 'N/A'}</p>
                <p>{property.city}, {property.state} {property.zip_code}</p>
                <p className="text-muted-foreground">{property.county} County</p>
              </div>
            </div>

            {/* Owner */}
            {property.owner && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Owner</span>
                </div>
                <div className="text-sm pl-6">
                  <p>{property.owner}</p>
                  {property.owner_mailing_address && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {property.owner_mailing_address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* APN */}
            {property.apn && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>APN</span>
                </div>
                <div className="text-sm pl-6 font-mono">
                  {property.apn}
                </div>
              </div>
            )}

            {/* Physical Details */}
            {(property.lot_size_acres || property.year_built || property.num_stories) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Physical Details</span>
                </div>
                <div className="text-sm pl-6 space-y-0.5">
                  {property.lot_size_acres && (
                    <p>Lot: {Number(property.lot_size_acres).toFixed(2)} acres</p>
                  )}
                  {property.year_built && (
                    <p>Built: {property.year_built}</p>
                  )}
                  {property.num_stories && (
                    <p>Stories: {property.num_stories}</p>
                  )}
                </div>
              </div>
            )}

            {/* Valuation */}
            {property.assessed_value && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Assessed Value</span>
                </div>
                <div className="text-sm pl-6">
                  <p className="font-semibold">{formatCurrency(property.assessed_value)}</p>
                  {property.improvement_value && property.land_value && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p>Improvements: {formatCurrency(property.improvement_value)}</p>
                      <p>Land: {formatCurrency(property.land_value)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Use & Zoning */}
            {(property.use_description || property.zoning) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Use & Zoning</span>
                </div>
                <div className="text-sm pl-6 space-y-0.5">
                  {property.use_description && (
                    <p>{property.use_description}</p>
                  )}
                  {property.zoning && (
                    <p className="text-muted-foreground">{property.zoning}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
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
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
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
                  <div className={`text-sm font-semibold tabular-nums ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
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
