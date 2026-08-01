'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Landmark,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { InlineEditField } from './InlineEditField';
import { InlineEditTextarea } from './InlineEditTextarea';
import { DatePickerField } from './DatePickerField';
import type { Property } from '@/lib/supabase';

interface PropertyOverviewSectionProps {
  property: Property;
  canEdit: boolean;
  isEditMode?: boolean;
  editedValues?: Partial<Property>;
  onFieldChange?: (field: string, value: string | number | null) => void;
  onEditModeChange?: (editMode: boolean) => void;
  onSaveAll?: () => Promise<void>;
  onCancelEdit?: () => void;
  isSaving?: boolean;
}

export function PropertyOverviewSection({
  property,
  canEdit,
  isEditMode = false,
  editedValues = {},
  onFieldChange,
  onEditModeChange,
  onSaveAll,
  onCancelEdit,
  isSaving = false,
}: PropertyOverviewSectionProps) {

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

  const handleFieldChange = (field: string, value: string) => {
    if (!onFieldChange) return;

    // Convert value based on field type
    let convertedValue: string | number | null = value;

    if (['mortgage_amount', 'loan_rate', 'purchase_price', 'last_sale_price', 'sale_price'].includes(field)) {
      convertedValue = value ? parseFloat(value) : null;
    }

    onFieldChange(field, convertedValue || null);
  };

  // Get the current value (edited value if available, otherwise property value)
  // Type narrowing to ensure only primitive types are returned for editable fields
  const getCurrentValue = (field: keyof Property): string | number | null | undefined => {
    const value = editedValues.hasOwnProperty(field) ? editedValues[field] : property[field];

    // Filter out complex types (arrays, objects, booleans) and only return primitives
    if (typeof value === 'string' || typeof value === 'number' || value === null || value === undefined) {
      return value;
    }

    // For any other type (boolean, array, object), return null as fallback
    return null;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) return null;
    return value.toLocaleString();
  };

  const formatAcres = (value: number | null | undefined) => {
    if (value == null) return null;
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} acres`;
  };

  // Read-only assessor data rows, grouped for the Parcel Data card; empty values are skipped
  const parcelDataGroups: Array<{ heading: string; rows: Array<{ label: string; value: string | null }> }> = [
    {
      heading: 'Valuation',
      rows: [
        { label: 'Assessed Value', value: property.assessed_value ? formatCurrency(property.assessed_value) : null },
        { label: 'Land Value', value: property.land_value ? formatCurrency(property.land_value) : null },
        { label: 'Improvement Value', value: property.improvement_value ? formatCurrency(property.improvement_value) : null },
        { label: 'Tax Year', value: property.tax_year || null },
      ],
    },
    {
      heading: 'Building',
      rows: [
        { label: 'Year Built', value: property.year_built ? String(property.year_built) : null },
        { label: 'Stories', value: property.num_stories ? formatNumber(property.num_stories) : null },
        { label: 'Units', value: property.num_units ? formatNumber(property.num_units) : null },
        { label: 'Rooms', value: property.num_rooms ? formatNumber(property.num_rooms) : null },
      ],
    },
    {
      heading: 'Land & Zoning',
      rows: [
        { label: 'Lot Size', value: formatAcres(property.lot_size_acres) || (property.lot_size_sqft ? `${formatNumber(property.lot_size_sqft)} sqft` : null) },
        { label: 'Zoning', value: property.zoning || null },
        { label: 'Zoning Description', value: property.zoning_description || null },
        { label: 'Land Use', value: property.use_description || property.use_code || null },
        { label: 'Subdivision', value: property.subdivision || null },
      ],
    },
    {
      heading: 'Location',
      rows: [
        { label: 'County', value: property.county || null },
        { label: 'Census Tract', value: property.census_tract || null },
        { label: 'Opportunity Zone', value: property.qoz_status === 'Yes' ? `Yes${property.qoz_tract ? ` (${property.qoz_tract})` : ''}` : null },
      ],
    },
    {
      heading: 'Last Recorded Sale',
      rows: [
        { label: 'Sale Price', value: property.last_sale_price ? formatCurrency(property.last_sale_price) : null },
        { label: 'Sale Date', value: property.sale_date ? formatDate(property.sale_date) : null },
      ],
    },
    {
      heading: 'Owner Mailing Address',
      rows: [
        {
          label: 'Address',
          value: property.owner_mailing_address
            ? [property.owner_mailing_address, property.owner_mail_city, property.owner_mail_state, property.owner_mail_zip].filter(Boolean).join(', ')
            : null,
        },
      ],
    },
  ]
    .map(group => ({ ...group, rows: group.rows.filter(row => row.value) }))
    .filter(group => group.rows.length > 0);

  return (
    <div className="space-y-3">
      {/* Overview - Combined Location, Parcel & Owner */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </CardTitle>
            {/* Edit/Save/Cancel buttons */}
            {canEdit && (
              <div className="flex gap-2">
                {!isEditMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditModeChange?.(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCancelEdit}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onSaveAll}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save All'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Address - Editable */}
          <InlineEditField
            label="Address"
            value={getCurrentValue('address')}
            onChange={(value) => handleFieldChange('address', value)}
            isEditMode={isEditMode}
            canEdit={canEdit}
            placeholder="Add address"
          />

          {/* City, State, ZIP - Editable */}
          <div className="grid grid-cols-3 gap-3">
            <InlineEditField
              label="City"
              value={getCurrentValue('city')}
              onChange={(value) => handleFieldChange('city', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add city"
            />
            <InlineEditField
              label="State"
              value={getCurrentValue('state')}
              onChange={(value) => handleFieldChange('state', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add state"
            />
            <InlineEditField
              label="ZIP"
              value={getCurrentValue('zip_code')}
              onChange={(value) => handleFieldChange('zip_code', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add ZIP"
            />
          </div>

          {/* Owner and APN - Editable */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <InlineEditField
              label="Owner of Record"
              value={getCurrentValue('owner')}
              onChange={(value) => handleFieldChange('owner', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add owner name"
            />
            <InlineEditField
              label="Parcel (APN)"
              value={getCurrentValue('apn')}
              onChange={(value) => handleFieldChange('apn', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add APN"
            />
          </div>

          {/* Management & Transactions - Horizontal Layout with Vertical Separators */}
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Management & Transactions</p>

            {/* Mobile: Vertical Stack, Desktop: Horizontal with Separators */}
            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-6">

              {/* Management Column */}
              <div className="space-y-3">
                <InlineEditField
                  label="Insurance Provider"
                  value={getCurrentValue('insurance_provider')}
                  onChange={(value) => handleFieldChange('insurance_provider', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  placeholder="Add insurance company"
                />
                <InlineEditField
                  label="Property Management"
                  value={getCurrentValue('management_company')}
                  onChange={(value) => handleFieldChange('management_company', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  placeholder="Add management company"
                />
              </div>

              {/* Separator - Horizontal on mobile, Vertical on desktop */}
              <Separator className="md:hidden" />
              <Separator orientation="vertical" className="hidden md:block h-auto" />

              {/* Purchase Column */}
              <div className="space-y-3">
                <DatePickerField
                  label="Purchase Date"
                  value={getCurrentValue('purchase_date')}
                  onChange={(value) => handleFieldChange('purchase_date', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  placeholder="Add purchase date"
                  formatDisplay={formatDate}
                />
                <InlineEditField
                  label="Purchase Price"
                  value={getCurrentValue('purchase_price')}
                  onChange={(value) => handleFieldChange('purchase_price', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  type="number"
                  placeholder="Add purchase price"
                  formatDisplay={formatCurrency}
                />
              </div>

              {/* Separator - Horizontal on mobile, Vertical on desktop */}
              <Separator className="md:hidden" />
              <Separator orientation="vertical" className="hidden md:block h-auto" />

              {/* Sale Column */}
              <div className="space-y-3">
                <DatePickerField
                  label="Sale Date"
                  value={getCurrentValue('sale_date')}
                  onChange={(value) => handleFieldChange('sale_date', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  placeholder="Add sale date"
                  formatDisplay={formatDate}
                />
                <InlineEditField
                  label="Sale Price"
                  value={getCurrentValue('sale_price')}
                  onChange={(value) => handleFieldChange('sale_price', value)}
                  isEditMode={isEditMode}
                  canEdit={canEdit}
                  type="number"
                  placeholder="Add sale price"
                  formatDisplay={formatCurrency}
                />
              </div>

            </div>
          </div>

          {/* Notes Section */}
          <div className="pt-2 border-t">
            <InlineEditTextarea
              label="Notes"
              value={getCurrentValue('user_notes') as string | null | undefined}
              onChange={(value) => handleFieldChange('user_notes', value)}
              isEditMode={isEditMode}
              canEdit={canEdit}
              placeholder="Add notes about this property..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Parcel Data - read-only county assessor record */}
      {parcelDataGroups.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                Parcel Data
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">
                County records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {parcelDataGroups.map((group, index) => (
              <div key={group.heading}>
                {index > 0 && <Separator className="mb-4" />}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {group.heading}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                  {group.rows.map(row => (
                    <div key={row.label} className="min-w-0">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium break-words">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Editable Debt Information - Disabled until mortgage payment calculations are implemented */}
      {/* <Card className="group">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Debt & Financing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InlineEditField
            label="Mortgage Amount"
            value={getCurrentValue('mortgage_amount')}
            onChange={(value) => handleFieldChange('mortgage_amount', value)}
            isEditMode={isEditMode}
            canEdit={canEdit}
            type="number"
            placeholder="Add mortgage amount"
            formatDisplay={formatCurrency}
          />
          <InlineEditField
            label="Lender Name"
            value={getCurrentValue('lender_name')}
            onChange={(value) => handleFieldChange('lender_name', value)}
            isEditMode={isEditMode}
            canEdit={canEdit}
            placeholder="Add lender name"
          />
          <InlineEditField
            label="Interest Rate"
            value={getCurrentValue('loan_rate')}
            onChange={(value) => handleFieldChange('loan_rate', value)}
            isEditMode={isEditMode}
            canEdit={canEdit}
            type="number"
            placeholder="Add interest rate"
            formatDisplay={formatPercentage}
          />
          <DatePickerField
            label="Loan Maturity Date"
            value={getCurrentValue('loan_maturity_date')}
            onChange={(value) => handleFieldChange('loan_maturity_date', value)}
            isEditMode={isEditMode}
            canEdit={canEdit}
            placeholder="Add maturity date"
            formatDisplay={formatDate}
          />
        </CardContent>
      </Card> */}

    </div>
  );
}
