'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  FileText,
  Users,
  Landmark,
} from 'lucide-react';
import { InlineEditField } from './InlineEditField';
import type { Property } from '@/lib/supabase';

interface PropertyOverviewSectionProps {
  property: Property;
  canEdit: boolean;
  onPropertyUpdate: (propertyId: string, updates: Partial<Property>) => Promise<void>;
}

export function PropertyOverviewSection({
  property,
  canEdit,
  onPropertyUpdate,
}: PropertyOverviewSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return 'Not set';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const formatPercentage = (value: string | number | null | undefined) => {
    if (!value) return 'Not set';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Not set';
    return `${numValue}%`;
  };

  const formatDate = (value: string | number | null | undefined) => {
    if (!value) return 'Not set';
    const strValue = typeof value === 'number' ? value.toString() : value;

    // Extract date parts from YYYY-MM-DD format to avoid timezone issues
    const dateParts = strValue.split('T')[0].split('-');
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      // Create date in local timezone, not UTC
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return 'Invalid date';
  };

  const handleFieldSave = async (field: string, value: string) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Convert value based on field type
      let convertedValue: string | number | null = value;

      if (['mortgage_amount', 'loan_rate', 'purchase_price', 'last_sale_price'].includes(field)) {
        convertedValue = value ? parseFloat(value) : null;
      }

      await onPropertyUpdate(property.id, { [field]: convertedValue || null });
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Overview - Combined Location, Parcel & Owner */}
      <Card className="group">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Address */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Address</p>
            <p className="text-sm">{property.address || 'N/A'}</p>
          </div>

          {/* City, State, ZIP in compact grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">City</p>
              <p className="text-sm">{property.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">State</p>
              <p className="text-sm">{property.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">ZIP</p>
              <p className="text-sm">{property.zip_code || 'N/A'}</p>
            </div>
          </div>

          {/* County and APN in two columns */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            {property.county && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">County</p>
                <p className="text-sm">{property.county}</p>
              </div>
            )}
            {property.apn && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Parcel (APN)</p>
                <p className="text-sm font-mono">{property.apn}</p>
              </div>
            )}
          </div>

          {/* Owner - Editable */}
          <div className="pt-2 border-t">
            <InlineEditField
              label="Owner of Record"
              value={property.owner}
              onSave={(value) => handleFieldSave('owner', value)}
              canEdit={canEdit}
              placeholder="Add owner name"
            />
            {property.owner_mailing_address && (
              <p className="text-xs text-muted-foreground mt-1 ml-0">
                {property.owner_mailing_address}
              </p>
            )}
          </div>

          {/* Management - Editable */}
          <div className="pt-2 border-t space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Management</p>
            <InlineEditField
              label="Insurance Provider"
              value={property.insurance_provider}
              onSave={(value) => handleFieldSave('insurance_provider', value)}
              canEdit={canEdit}
              placeholder="Add insurance company"
            />
            <InlineEditField
              label="Property Management Company"
              value={property.management_company}
              onSave={(value) => handleFieldSave('management_company', value)}
              canEdit={canEdit}
              placeholder="Add management company"
            />
          </div>

          {/* Purchase & Sale Information - Editable */}
          <div className="pt-2 border-t space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purchase & Sale</p>
            <div className="grid grid-cols-2 gap-3">
              <InlineEditField
                label="Purchase Date"
                value={property.purchase_date}
                onSave={(value) => handleFieldSave('purchase_date', value)}
                canEdit={canEdit}
                type="date"
                placeholder="Add purchase date"
                formatDisplay={formatDate}
              />
              <InlineEditField
                label="Purchase Price"
                value={property.purchase_price}
                onSave={(value) => handleFieldSave('purchase_price', value)}
                canEdit={canEdit}
                type="number"
                placeholder="Add purchase price"
                formatDisplay={formatCurrency}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InlineEditField
                label="Sale Date"
                value={property.sale_date}
                onSave={(value) => handleFieldSave('sale_date', value)}
                canEdit={canEdit}
                type="date"
                placeholder="Add sale date"
                formatDisplay={formatDate}
              />
              <InlineEditField
                label="Sale Price"
                value={property.last_sale_price}
                onSave={(value) => handleFieldSave('last_sale_price', value)}
                canEdit={canEdit}
                type="number"
                placeholder="Add sale price"
                formatDisplay={formatCurrency}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Debt Information */}
      <Card className="group">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Debt & Financing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InlineEditField
            label="Mortgage Amount"
            value={property.mortgage_amount}
            onSave={(value) => handleFieldSave('mortgage_amount', value)}
            canEdit={canEdit}
            type="number"
            placeholder="Add mortgage amount"
            formatDisplay={formatCurrency}
          />
          <InlineEditField
            label="Lender Name"
            value={property.lender_name}
            onSave={(value) => handleFieldSave('lender_name', value)}
            canEdit={canEdit}
            placeholder="Add lender name"
          />
          <InlineEditField
            label="Interest Rate"
            value={property.loan_rate}
            onSave={(value) => handleFieldSave('loan_rate', value)}
            canEdit={canEdit}
            type="number"
            placeholder="Add interest rate"
            formatDisplay={formatPercentage}
          />
          <InlineEditField
            label="Loan Maturity Date"
            value={property.loan_maturity_date}
            onSave={(value) => handleFieldSave('loan_maturity_date', value)}
            canEdit={canEdit}
            type="date"
            placeholder="Add maturity date"
            formatDisplay={formatDate}
          />
        </CardContent>
      </Card>

      {/* Use & Zoning (Read-only) */}
      {(property.use_description || property.zoning) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Use & Zoning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {property.use_description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Property Use</p>
                <p className="text-sm">{property.use_description}</p>
              </div>
            )}
            {property.zoning && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Zoning</p>
                <p className="text-sm">{property.zoning}</p>
                {property.zoning_description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{property.zoning_description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
