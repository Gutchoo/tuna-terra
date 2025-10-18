# Product Requirements Document: Property Income & Expense Management System

**Version:** 2.0
**Date:** October 17, 2025
**Status:** Draft
**Focus:** Backend Architecture & Database Design

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Goals & Objectives](#goals--objectives)
4. [Database Schema Design](#database-schema-design)
5. [API Endpoints](#api-endpoints)
6. [Data Models & Relationships](#data-models--relationships)
7. [Business Logic & Rules](#business-logic--rules)
8. [Security & Permissions](#security--permissions)
9. [File Storage Architecture](#file-storage-architecture)
10. [Migration Strategy](#migration-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

This PRD defines the backend architecture for TunaTerra's next major version, which transforms the application from a property tracking tool into a comprehensive property management system. Users will be able to:

- **Add and track actual income and expenses** (historical and projected)
- **Manage property units** (individual units within multi-unit properties)
- **Store and organize documents** (invoices, policies, photos, etc.)
- **Generate financial reports** (P&L statements, cash flow tracking, monthly/annual rollups)

This system will enable granular financial tracking at both property and unit levels while maintaining backwards compatibility with the existing `property_financials` table for financial modeling projections.

---

## Current State Analysis

### Existing Tables (Relevant to This PRD)

**`properties`** - Core property data with 30+ Regrid API fields
- Primary key: `id` (uuid)
- Foreign keys: `user_id`, `portfolio_id`
- Key fields: `address`, `city`, `state`, `apn`, `num_units`, `purchase_price`
- RLS: Enforced via portfolio membership

**`property_financials`** - Financial modeling projections (v1.0 system)
- Stores forward-looking assumptions and projections
- Uses JSONB arrays for multi-year projections
- Focuses on pro forma analysis, not actual transactions
- **Status:** Will remain for now, may deprecate later

**`portfolios`** - Portfolio organization with sharing
- Supports multi-user collaboration via `portfolio_memberships`

**`portfolio_memberships`** - Role-based access control
- Roles: `owner`, `editor`, `viewer`
- RLS policies enforce permissions across all related tables

### Current Limitations

1. No actual income/expense transaction tracking
2. No unit-level financial granularity
3. No document storage system
4. No historical data capture
5. Financial modeling disconnected from actual operations

---

## Goals & Objectives

### Primary Goals

1. **Enable actual transaction tracking** - Replace spreadsheet-based property accounting
2. **Support unit-level management** - Allow granular tracking for multi-unit properties
3. **Provide document organization** - Centralize property-related files and receipts
4. **Generate actionable reports** - Monthly P&L, annual summaries, cash flow tracking

### Success Metrics

- Users can track 100% of property income and expenses within the app
- Multi-unit property owners can manage unit-level financials without external tools
- Document retrieval time < 2 seconds
- Report generation time < 5 seconds for properties with 1000+ transactions

---

## Database Schema Design

### 1. `property_units` Table

Stores individual units within properties (e.g., apartments, ADUs, office suites).

```sql
CREATE TABLE property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unit Information
  unit_number TEXT NOT NULL, -- "Unit 101", "ADU 1", "Suite A"
  unit_name TEXT, -- Optional friendly name
  square_footage NUMERIC(10, 2),

  -- Tenant Information
  tenant_name TEXT,
  tenant_email TEXT,
  tenant_phone TEXT,

  -- Lease Terms
  lease_start_date DATE,
  lease_end_date DATE,
  monthly_rent NUMERIC(12, 2),
  security_deposit NUMERIC(12, 2),
  lease_terms TEXT, -- Additional notes

  -- Status
  is_occupied BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true, -- For soft deletion

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(property_id, unit_number),
  CHECK (monthly_rent >= 0),
  CHECK (security_deposit >= 0),
  CHECK (square_footage >= 0)
);

-- Indexes
CREATE INDEX idx_property_units_property_id ON property_units(property_id);
CREATE INDEX idx_property_units_portfolio_id ON property_units(portfolio_id);
CREATE INDEX idx_property_units_is_active ON property_units(is_active);
CREATE INDEX idx_property_units_lease_dates ON property_units(lease_start_date, lease_end_date);
```

### 2. `income_transactions` Table

Stores all income entries (actual, historical, and projected).

```sql
CREATE TABLE income_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE, -- NULL for property-level

  -- Transaction Details
  transaction_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL, -- See INCOME_CATEGORIES enum
  description TEXT NOT NULL,

  -- Transaction Type
  transaction_type TEXT NOT NULL DEFAULT 'actual', -- 'actual', 'projected'

  -- Recurring Income
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT, -- 'monthly', 'quarterly', 'annual', etc.
  recurrence_start_date DATE,
  recurrence_end_date DATE,
  parent_transaction_id UUID REFERENCES income_transactions(id) ON DELETE SET NULL,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CHECK (amount > 0),
  CHECK (transaction_type IN ('actual', 'projected')),
  CHECK (category IN (
    'rental_income',
    'parking_income',
    'storage_income',
    'pet_fees',
    'late_fees',
    'utility_reimbursement',
    'laundry_income',
    'other_income'
  )),
  CHECK (
    (is_recurring = false) OR
    (is_recurring = true AND recurrence_frequency IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_income_transactions_property_id ON income_transactions(property_id);
CREATE INDEX idx_income_transactions_portfolio_id ON income_transactions(portfolio_id);
CREATE INDEX idx_income_transactions_unit_id ON income_transactions(unit_id);
CREATE INDEX idx_income_transactions_date ON income_transactions(transaction_date);
CREATE INDEX idx_income_transactions_category ON income_transactions(category);
CREATE INDEX idx_income_transactions_type ON income_transactions(transaction_type);
CREATE INDEX idx_income_transactions_recurring ON income_transactions(is_recurring);
CREATE INDEX idx_income_transactions_parent ON income_transactions(parent_transaction_id);
```

### 3. `expense_transactions` Table

Stores all expense entries (actual, historical, and projected).

```sql
CREATE TABLE expense_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE, -- NULL for property-level

  -- Transaction Details
  transaction_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL, -- See EXPENSE_CATEGORIES enum
  description TEXT NOT NULL,

  -- Transaction Type
  transaction_type TEXT NOT NULL DEFAULT 'actual', -- 'actual', 'projected'

  -- Recurring Expenses
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT, -- 'monthly', 'quarterly', 'annual', etc.
  recurrence_start_date DATE,
  recurrence_end_date DATE,
  parent_transaction_id UUID REFERENCES expense_transactions(id) ON DELETE SET NULL,

  -- Vendor Information
  vendor_name TEXT,
  vendor_contact TEXT,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CHECK (amount > 0),
  CHECK (transaction_type IN ('actual', 'projected')),
  CHECK (category IN (
    'repairs_maintenance',
    'property_taxes',
    'insurance',
    'utilities',
    'property_management',
    'hoa_fees',
    'landscaping',
    'pest_control',
    'cleaning',
    'legal_fees',
    'accounting_fees',
    'advertising',
    'capital_expenditure',
    'other_expense'
  )),
  CHECK (
    (is_recurring = false) OR
    (is_recurring = true AND recurrence_frequency IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_expense_transactions_property_id ON expense_transactions(property_id);
CREATE INDEX idx_expense_transactions_portfolio_id ON expense_transactions(portfolio_id);
CREATE INDEX idx_expense_transactions_unit_id ON expense_transactions(unit_id);
CREATE INDEX idx_expense_transactions_date ON expense_transactions(transaction_date);
CREATE INDEX idx_expense_transactions_category ON expense_transactions(category);
CREATE INDEX idx_expense_transactions_type ON expense_transactions(transaction_type);
CREATE INDEX idx_expense_transactions_recurring ON expense_transactions(is_recurring);
CREATE INDEX idx_expense_transactions_parent ON expense_transactions(parent_transaction_id);
```

### 4. `property_documents` Table

Stores metadata for files uploaded to Supabase Storage.

```sql
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE, -- NULL for property-level

  -- Link to Transactions (optional)
  income_transaction_id UUID REFERENCES income_transactions(id) ON DELETE SET NULL,
  expense_transaction_id UUID REFERENCES expense_transactions(id) ON DELETE SET NULL,

  -- File Information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage
  file_size_bytes BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  storage_bucket TEXT NOT NULL DEFAULT 'property-documents',

  -- Document Classification
  document_type TEXT NOT NULL, -- See DOCUMENT_TYPES enum
  document_category TEXT, -- Secondary classification

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[],

  -- Document Properties
  document_date DATE, -- Date on document (e.g., invoice date)
  expiration_date DATE, -- For insurance policies, leases, etc.

  -- OCR/AI Processing (future enhancement)
  ocr_text TEXT,
  ai_extracted_data JSONB,

  -- Status
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CHECK (file_size_bytes > 0),
  CHECK (document_type IN (
    'invoice',
    'receipt',
    'work_order',
    'insurance_policy',
    'tax_document',
    'lease_agreement',
    'inspection_report',
    'property_photo',
    'floor_plan',
    'other'
  )),
  CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Indexes
CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX idx_property_documents_portfolio_id ON property_documents(portfolio_id);
CREATE INDEX idx_property_documents_unit_id ON property_documents(unit_id);
CREATE INDEX idx_property_documents_income_tx ON property_documents(income_transaction_id);
CREATE INDEX idx_property_documents_expense_tx ON property_documents(expense_transaction_id);
CREATE INDEX idx_property_documents_type ON property_documents(document_type);
CREATE INDEX idx_property_documents_expiration ON property_documents(expiration_date);
CREATE INDEX idx_property_documents_file_path ON property_documents(file_path);
```

### 5. Supporting Enums/Types

```sql
-- Income Categories
CREATE TYPE income_category AS ENUM (
  'rental_income',
  'parking_income',
  'storage_income',
  'pet_fees',
  'late_fees',
  'utility_reimbursement',
  'laundry_income',
  'other_income'
);

-- Expense Categories
CREATE TYPE expense_category AS ENUM (
  'repairs_maintenance',
  'property_taxes',
  'insurance',
  'utilities',
  'property_management',
  'hoa_fees',
  'landscaping',
  'pest_control',
  'cleaning',
  'legal_fees',
  'accounting_fees',
  'advertising',
  'capital_expenditure',
  'other_expense'
);

-- Document Types
CREATE TYPE document_type AS ENUM (
  'invoice',
  'receipt',
  'work_order',
  'insurance_policy',
  'tax_document',
  'lease_agreement',
  'inspection_report',
  'property_photo',
  'floor_plan',
  'other'
);

-- Recurrence Frequency
CREATE TYPE recurrence_frequency AS ENUM (
  'weekly',
  'bi_weekly',
  'monthly',
  'quarterly',
  'semi_annual',
  'annual'
);

-- Transaction Type
CREATE TYPE transaction_type AS ENUM (
  'actual',
  'projected'
);
```

### 6. Database Functions

#### Auto-generate Recurring Transactions

```sql
CREATE OR REPLACE FUNCTION generate_recurring_income_transactions(
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 year'
)
RETURNS TABLE (
  transaction_id UUID,
  property_id UUID,
  amount NUMERIC,
  transaction_date DATE
) AS $$
BEGIN
  -- Generate recurring income transactions based on recurrence rules
  -- This function will be called by a scheduled job or on-demand
  RETURN QUERY
  WITH RECURSIVE recurring_dates AS (
    SELECT
      i.id,
      i.property_id,
      i.portfolio_id,
      i.user_id,
      i.unit_id,
      i.amount,
      i.category,
      i.description,
      i.recurrence_start_date AS transaction_date,
      i.recurrence_end_date,
      i.recurrence_frequency
    FROM income_transactions i
    WHERE i.is_recurring = true
      AND i.recurrence_start_date <= p_end_date
      AND (i.recurrence_end_date IS NULL OR i.recurrence_end_date >= CURRENT_DATE)

    UNION ALL

    SELECT
      rd.id,
      rd.property_id,
      rd.portfolio_id,
      rd.user_id,
      rd.unit_id,
      rd.amount,
      rd.category,
      rd.description,
      CASE rd.recurrence_frequency
        WHEN 'weekly' THEN rd.transaction_date + INTERVAL '1 week'
        WHEN 'bi_weekly' THEN rd.transaction_date + INTERVAL '2 weeks'
        WHEN 'monthly' THEN rd.transaction_date + INTERVAL '1 month'
        WHEN 'quarterly' THEN rd.transaction_date + INTERVAL '3 months'
        WHEN 'semi_annual' THEN rd.transaction_date + INTERVAL '6 months'
        WHEN 'annual' THEN rd.transaction_date + INTERVAL '1 year'
      END AS transaction_date,
      rd.recurrence_end_date,
      rd.recurrence_frequency
    FROM recurring_dates rd
    WHERE rd.transaction_date < p_end_date
      AND (rd.recurrence_end_date IS NULL OR rd.transaction_date < rd.recurrence_end_date)
  )
  INSERT INTO income_transactions (
    property_id,
    portfolio_id,
    user_id,
    unit_id,
    transaction_date,
    amount,
    category,
    description,
    transaction_type,
    parent_transaction_id
  )
  SELECT
    rd.property_id,
    rd.portfolio_id,
    rd.user_id,
    rd.unit_id,
    rd.transaction_date,
    rd.amount,
    rd.category,
    rd.description,
    'projected'::TEXT,
    rd.id
  FROM recurring_dates rd
  WHERE rd.transaction_date > CURRENT_DATE
  ON CONFLICT DO NOTHING
  RETURNING id, property_id, amount, transaction_date;
END;
$$ LANGUAGE plpgsql;

-- Similar function for expenses
CREATE OR REPLACE FUNCTION generate_recurring_expense_transactions(
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 year'
)
RETURNS TABLE (
  transaction_id UUID,
  property_id UUID,
  amount NUMERIC,
  transaction_date DATE
) AS $$
BEGIN
  -- Implementation similar to income function
  -- [Omitted for brevity - follows same pattern]
END;
$$ LANGUAGE plpgsql;
```

#### Calculate Property NOI

```sql
CREATE OR REPLACE FUNCTION calculate_property_noi(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_income NUMERIC,
  total_expenses NUMERIC,
  noi NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(income.total, 0) AS total_income,
    COALESCE(expenses.total, 0) AS total_expenses,
    COALESCE(income.total, 0) - COALESCE(expenses.total, 0) AS noi
  FROM (
    SELECT SUM(amount) AS total
    FROM income_transactions
    WHERE property_id = p_property_id
      AND transaction_date >= p_start_date
      AND transaction_date <= p_end_date
      AND transaction_type = 'actual'
  ) income
  CROSS JOIN (
    SELECT SUM(amount) AS total
    FROM expense_transactions
    WHERE property_id = p_property_id
      AND transaction_date >= p_start_date
      AND transaction_date <= p_end_date
      AND transaction_type = 'actual'
  ) expenses;
END;
$$ LANGUAGE plpgsql;
```

#### Calculate Unit-Level Financials

```sql
CREATE OR REPLACE FUNCTION calculate_unit_financials(
  p_unit_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  unit_id UUID,
  unit_number TEXT,
  total_income NUMERIC,
  total_expenses NUMERIC,
  net_income NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.unit_number,
    COALESCE(income.total, 0) AS total_income,
    COALESCE(expenses.total, 0) AS total_expenses,
    COALESCE(income.total, 0) - COALESCE(expenses.total, 0) AS net_income
  FROM property_units u
  LEFT JOIN (
    SELECT SUM(amount) AS total
    FROM income_transactions
    WHERE unit_id = p_unit_id
      AND transaction_date >= p_start_date
      AND transaction_date <= p_end_date
      AND transaction_type = 'actual'
  ) income ON true
  LEFT JOIN (
    SELECT SUM(amount) AS total
    FROM expense_transactions
    WHERE unit_id = p_unit_id
      AND transaction_date >= p_start_date
      AND transaction_date <= p_end_date
      AND transaction_type = 'actual'
  ) expenses ON true
  WHERE u.id = p_unit_id;
END;
$$ LANGUAGE plpgsql;
```

### 7. Triggers

```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_units_updated_at
  BEFORE UPDATE ON property_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_transactions_updated_at
  BEFORE UPDATE ON income_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_transactions_updated_at
  BEFORE UPDATE ON expense_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_documents_updated_at
  BEFORE UPDATE ON property_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## API Endpoints

### Units Management

#### `POST /api/properties/[propertyId]/units`
Create a new unit for a property.

**Request Body:**
```typescript
{
  unit_number: string
  unit_name?: string
  square_footage?: number
  tenant_name?: string
  tenant_email?: string
  tenant_phone?: string
  lease_start_date?: string // ISO date
  lease_end_date?: string // ISO date
  monthly_rent?: number
  security_deposit?: number
  lease_terms?: string
  notes?: string
}
```

**Response:**
```typescript
{
  data: PropertyUnit
  error?: string
}
```

#### `GET /api/properties/[propertyId]/units`
List all units for a property.

**Query Params:**
- `is_active` (boolean) - Filter by active status
- `is_occupied` (boolean) - Filter by occupancy status

**Response:**
```typescript
{
  data: PropertyUnit[]
  error?: string
}
```

#### `GET /api/properties/[propertyId]/units/[unitId]`
Get a single unit.

**Response:**
```typescript
{
  data: PropertyUnit
  error?: string
}
```

#### `PATCH /api/properties/[propertyId]/units/[unitId]`
Update a unit.

**Request Body:** (Partial PropertyUnit)

**Response:**
```typescript
{
  data: PropertyUnit
  error?: string
}
```

#### `DELETE /api/properties/[propertyId]/units/[unitId]`
Delete a unit (soft delete - sets `is_active = false`).

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

---

### Income Transactions

#### `POST /api/properties/[propertyId]/income`
Create a new income transaction.

**Request Body:**
```typescript
{
  unit_id?: string // Optional - null for property-level
  transaction_date: string // ISO date
  amount: number
  category: IncomeCategory
  description: string
  transaction_type: 'actual' | 'projected'
  is_recurring?: boolean
  recurrence_frequency?: RecurrenceFrequency
  recurrence_start_date?: string
  recurrence_end_date?: string
  notes?: string
  tags?: string[]
  document_ids?: string[] // Attach existing documents
}
```

**Response:**
```typescript
{
  data: IncomeTransaction
  error?: string
}
```

#### `GET /api/properties/[propertyId]/income`
List income transactions for a property.

**Query Params:**
- `unit_id` (uuid) - Filter by unit
- `start_date` (ISO date) - Filter by date range
- `end_date` (ISO date)
- `category` (string) - Filter by category
- `transaction_type` (string) - Filter by type
- `is_recurring` (boolean) - Filter recurring only
- `limit` (number) - Pagination limit
- `offset` (number) - Pagination offset

**Response:**
```typescript
{
  data: IncomeTransaction[]
  total_count: number
  error?: string
}
```

#### `GET /api/properties/[propertyId]/income/[transactionId]`
Get a single income transaction.

**Response:**
```typescript
{
  data: IncomeTransaction & {
    documents: PropertyDocument[]
  }
  error?: string
}
```

#### `PATCH /api/properties/[propertyId]/income/[transactionId]`
Update an income transaction.

**Request Body:** (Partial IncomeTransaction)

**Response:**
```typescript
{
  data: IncomeTransaction
  error?: string
}
```

#### `DELETE /api/properties/[propertyId]/income/[transactionId]`
Delete an income transaction.

**Query Params:**
- `delete_recurring` (boolean) - If true, delete all child recurring transactions

**Response:**
```typescript
{
  success: boolean
  deleted_count: number
  error?: string
}
```

---

### Expense Transactions

#### `POST /api/properties/[propertyId]/expenses`
Create a new expense transaction.

**Request Body:**
```typescript
{
  unit_id?: string // Optional - null for property-level
  transaction_date: string // ISO date
  amount: number
  category: ExpenseCategory
  description: string
  transaction_type: 'actual' | 'projected'
  is_recurring?: boolean
  recurrence_frequency?: RecurrenceFrequency
  recurrence_start_date?: string
  recurrence_end_date?: string
  vendor_name?: string
  vendor_contact?: string
  notes?: string
  tags?: string[]
  document_ids?: string[] // Attach existing documents
}
```

**Response:**
```typescript
{
  data: ExpenseTransaction
  error?: string
}
```

#### `GET /api/properties/[propertyId]/expenses`
List expense transactions for a property.

**Query Params:** (Same as income endpoints)

**Response:**
```typescript
{
  data: ExpenseTransaction[]
  total_count: number
  error?: string
}
```

#### `GET /api/properties/[propertyId]/expenses/[transactionId]`
Get a single expense transaction.

**Response:**
```typescript
{
  data: ExpenseTransaction & {
    documents: PropertyDocument[]
  }
  error?: string
}
```

#### `PATCH /api/properties/[propertyId]/expenses/[transactionId]`
Update an expense transaction.

**Request Body:** (Partial ExpenseTransaction)

**Response:**
```typescript
{
  data: ExpenseTransaction
  error?: string
}
```

#### `DELETE /api/properties/[propertyId]/expenses/[transactionId]`
Delete an expense transaction.

**Query Params:**
- `delete_recurring` (boolean) - If true, delete all child recurring transactions

**Response:**
```typescript
{
  success: boolean
  deleted_count: number
  error?: string
}
```

---

### Document Management

#### `POST /api/properties/[propertyId]/documents/upload`
Upload a document and create metadata entry.

**Request:** `multipart/form-data`
- `file` - File to upload
- `metadata` - JSON string with:
  ```typescript
  {
    unit_id?: string
    income_transaction_id?: string
    expense_transaction_id?: string
    document_type: DocumentType
    document_category?: string
    title?: string
    description?: string
    tags?: string[]
    document_date?: string
    expiration_date?: string
  }
  ```

**Response:**
```typescript
{
  data: PropertyDocument
  error?: string
}
```

**File Restrictions:**
- Max file size: 50MB per file
- Allowed types: PDF, images (PNG, JPG, JPEG), documents (DOCX, XLSX)

#### `GET /api/properties/[propertyId]/documents`
List documents for a property.

**Query Params:**
- `unit_id` (uuid) - Filter by unit
- `document_type` (string) - Filter by type
- `income_transaction_id` (uuid) - Filter by income transaction
- `expense_transaction_id` (uuid) - Filter by expense transaction
- `expiring_before` (ISO date) - Find expiring documents
- `limit` (number)
- `offset` (number)

**Response:**
```typescript
{
  data: PropertyDocument[]
  total_count: number
  error?: string
}
```

#### `GET /api/properties/[propertyId]/documents/[documentId]`
Get document metadata.

**Response:**
```typescript
{
  data: PropertyDocument
  error?: string
}
```

#### `GET /api/properties/[propertyId]/documents/[documentId]/download`
Download the actual file.

**Response:** File stream with appropriate headers

#### `PATCH /api/properties/[propertyId]/documents/[documentId]`
Update document metadata.

**Request Body:**
```typescript
{
  title?: string
  description?: string
  tags?: string[]
  document_type?: DocumentType
  document_category?: string
  document_date?: string
  expiration_date?: string
}
```

**Response:**
```typescript
{
  data: PropertyDocument
  error?: string
}
```

#### `DELETE /api/properties/[propertyId]/documents/[documentId]`
Delete a document (removes from storage and database).

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

---

### Financial Reports

#### `GET /api/properties/[propertyId]/reports/profit-loss`
Generate P&L statement for a property.

**Query Params:**
- `start_date` (ISO date) - Required
- `end_date` (ISO date) - Required
- `unit_id` (uuid) - Optional - filter by unit
- `group_by` (string) - 'month' | 'quarter' | 'year'

**Response:**
```typescript
{
  data: {
    period: {
      start_date: string
      end_date: string
    }
    income: {
      by_category: Record<IncomeCategory, number>
      total: number
    }
    expenses: {
      by_category: Record<ExpenseCategory, number>
      total: number
    }
    noi: number
    units?: Array<{
      unit_id: string
      unit_number: string
      income: number
      expenses: number
      net_income: number
    }>
  }
  error?: string
}
```

#### `GET /api/properties/[propertyId]/reports/cash-flow`
Generate cash flow report.

**Query Params:**
- `start_date` (ISO date)
- `end_date` (ISO date)
- `group_by` (string) - 'month' | 'quarter' | 'year'

**Response:**
```typescript
{
  data: {
    periods: Array<{
      period_start: string
      period_end: string
      income: number
      expenses: number
      net_cash_flow: number
    }>
    total_income: number
    total_expenses: number
    total_net_cash_flow: number
  }
  error?: string
}
```

#### `GET /api/properties/[propertyId]/reports/unit-performance`
Compare performance across units.

**Query Params:**
- `start_date` (ISO date)
- `end_date` (ISO date)

**Response:**
```typescript
{
  data: {
    property_total: {
      income: number
      expenses: number
      noi: number
    }
    units: Array<{
      unit_id: string
      unit_number: string
      unit_name?: string
      square_footage?: number
      monthly_rent?: number
      income: number
      expenses: number
      noi: number
      noi_per_sqft?: number
      occupancy_rate?: number
    }>
  }
  error?: string
}
```

#### `GET /api/portfolios/[portfolioId]/reports/summary`
Portfolio-level summary across all properties.

**Query Params:**
- `start_date` (ISO date)
- `end_date` (ISO date)

**Response:**
```typescript
{
  data: {
    portfolio_id: string
    portfolio_name: string
    period: {
      start_date: string
      end_date: string
    }
    properties: Array<{
      property_id: string
      address: string
      income: number
      expenses: number
      noi: number
      num_units: number
    }>
    totals: {
      total_income: number
      total_expenses: number
      total_noi: number
      total_properties: number
      total_units: number
    }
  }
  error?: string
}
```

---

## Data Models & Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│   portfolios    │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│   properties    │◄──────────────────────┐
└────────┬────────┘                       │
         │                                │
         │ 1:N                            │
         │                                │
┌────────▼────────┐                       │
│ property_units  │                       │
└────────┬────────┘                       │
         │                                │
         │                                │
         │                                │
         ├───────────────┬────────────────┤
         │ 1:N           │ 1:N            │ 1:N
         │               │                │
┌────────▼─────────┐ ┌──▼──────────────┐ │
│income_transactions│ │expense_transactions│
└────────┬─────────┘ └──┬──────────────┘ │
         │               │                │
         │ 1:N           │ 1:N            │ 1:N
         │               │                │
         └───────────────┴────────────────┤
                         │                │
                    ┌────▼────────────┐   │
                    │property_documents│───┘
                    └─────────────────┘
```

### Key Relationships

1. **Portfolio → Properties** (1:N)
   - One portfolio contains many properties
   - Properties can be moved between portfolios (via API)

2. **Property → Units** (1:N)
   - One property can have multiple units
   - Property without units has NULL unit_id in transactions

3. **Property/Unit → Transactions** (1:N)
   - Transactions can be at property-level (unit_id = NULL)
   - Or at unit-level (unit_id = UUID)

4. **Transactions → Documents** (N:M via property_documents)
   - One transaction can have multiple documents
   - One document can relate to multiple transactions (e.g., invoice covering multiple properties)

5. **Recurring Transactions** (Parent-Child)
   - Parent transaction defines recurrence rule
   - Child transactions auto-generated with `parent_transaction_id` reference

---

## Business Logic & Rules

### Transaction Rules

1. **Date Validation**
   - `transaction_date` cannot be in the future for `transaction_type = 'actual'`
   - `transaction_date` can be in the future for `transaction_type = 'projected'`

2. **Recurring Transaction Logic**
   - When creating a recurring transaction, immediately generate 12 months of projected transactions
   - Background job runs daily to generate transactions up to 12 months ahead
   - Parent transaction cannot be deleted if child transactions exist (must delete children first or cascade)

3. **Unit Assignment**
   - If property has units, user must select unit or explicitly choose "Property-level"
   - If property has no units, all transactions are automatically property-level

4. **Amount Validation**
   - All amounts must be positive numbers (no negative transactions)
   - Use separate income/expense tables rather than positive/negative amounts

### Document Rules

1. **File Storage**
   - Files stored in Supabase Storage bucket: `property-documents`
   - Path structure: `{portfolio_id}/{property_id}/{unit_id}/{document_id}/{filename}`
   - If unit_id is NULL: `{portfolio_id}/{property_id}/property-level/{document_id}/{filename}`

2. **Document Linking**
   - Documents can be uploaded independently (no transaction link)
   - Documents can be attached during transaction creation
   - Documents can be linked to transactions after upload via PATCH endpoint

3. **Expiration Tracking**
   - System should send notifications when documents are expiring (future enhancement)
   - Expired documents marked visually in UI

### Aggregation Rules

1. **Property-Level Totals**
   - Sum of all unit-level transactions + property-level transactions
   - Property with no units: Only property-level transactions

2. **NOI Calculation**
   - NOI = Total Income - Total Operating Expenses
   - Excludes capital expenditures from NOI
   - Includes only `transaction_type = 'actual'` by default

3. **Report Period**
   - Reports default to current calendar year
   - Support custom date ranges
   - Handle partial periods correctly (e.g., property purchased mid-year)

---

## Security & Permissions

### Row Level Security (RLS) Policies

All tables must have RLS enabled with the following policies:

#### `property_units`

```sql
-- SELECT: Users can view units in portfolios they have access to
CREATE POLICY "Users can view units in accessible portfolios"
ON property_units FOR SELECT
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Owners and editors can create units
CREATE POLICY "Owners and editors can create units"
ON property_units FOR INSERT
WITH CHECK (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners and editors can update units
CREATE POLICY "Owners and editors can update units"
ON property_units FOR UPDATE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- DELETE: Only owners can delete units
CREATE POLICY "Only owners can delete units"
ON property_units FOR DELETE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);
```

#### `income_transactions` & `expense_transactions`

```sql
-- SELECT: Users can view transactions in accessible portfolios
CREATE POLICY "Users can view transactions in accessible portfolios"
ON income_transactions FOR SELECT
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Owners and editors can create transactions
CREATE POLICY "Owners and editors can create transactions"
ON income_transactions FOR INSERT
WITH CHECK (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners and editors can update transactions
CREATE POLICY "Owners and editors can update transactions"
ON income_transactions FOR UPDATE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- DELETE: Only owners can delete transactions
CREATE POLICY "Only owners can delete transactions"
ON income_transactions FOR DELETE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Repeat similar policies for expense_transactions
```

#### `property_documents`

```sql
-- SELECT: Users can view documents in accessible portfolios
CREATE POLICY "Users can view documents in accessible portfolios"
ON property_documents FOR SELECT
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Owners and editors can upload documents
CREATE POLICY "Owners and editors can upload documents"
ON property_documents FOR INSERT
WITH CHECK (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners and editors can update document metadata
CREATE POLICY "Owners and editors can update documents"
ON property_documents FOR UPDATE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- DELETE: Only owners can delete documents
CREATE POLICY "Only owners can delete documents"
ON property_documents FOR DELETE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);
```

### Supabase Storage Bucket Policies

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', false);

-- Allow authenticated users to upload to their portfolio folders
CREATE POLICY "Users can upload documents to accessible portfolios"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT portfolio_id::text FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- Allow users to read documents from accessible portfolios
CREATE POLICY "Users can view documents from accessible portfolios"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT portfolio_id::text FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- Allow owners to delete documents
CREATE POLICY "Owners can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT portfolio_id::text FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);
```

---

## File Storage Architecture

### Supabase Storage Structure

```
property-documents/
├── {portfolio_id}/
│   ├── {property_id}/
│   │   ├── property-level/
│   │   │   ├── {document_id}/
│   │   │   │   └── original_filename.pdf
│   │   └── {unit_id}/
│   │       ├── {document_id}/
│   │       │   └── original_filename.jpg
```

### File Naming Convention

- Original filename preserved in storage
- `file_path` in database stores full path
- `file_name` in database stores original filename for display

### File Processing Pipeline

1. **Upload** → Validate file type and size
2. **Store** → Save to Supabase Storage
3. **Metadata** → Create entry in `property_documents` table
4. **Link** → Associate with transaction if applicable
5. **Process** (Future) → OCR extraction, AI categorization

### Supported File Types

- **Images:** PNG, JPG, JPEG, WEBP
- **Documents:** PDF, DOCX, XLSX, CSV
- **Size Limit:** 50MB per file

---

## Migration Strategy

### Phase 1: Database Setup (Week 1)

1. Create all new tables with proper indexes and constraints
2. Set up RLS policies for all tables
3. Create database functions for calculations and recurring transactions
4. Set up Supabase Storage bucket with policies
5. Create database migration files

### Phase 2: Backend API Development (Weeks 2-3)

1. Implement Unit Management API endpoints
2. Implement Income Transaction API endpoints
3. Implement Expense Transaction API endpoints
4. Implement Document Management API endpoints
5. Implement Financial Report API endpoints
6. Write comprehensive API tests

### Phase 3: Data Services Layer (Week 4)

1. Create `UnitService` class in `/src/lib/services/units.ts`
2. Create `TransactionService` class in `/src/lib/services/transactions.ts`
3. Create `DocumentService` class in `/src/lib/services/documents.ts`
4. Create `ReportService` class in `/src/lib/services/reports.ts`
5. Add TypeScript types to `/src/lib/supabase.ts`

### Phase 4: Testing & Documentation (Week 5)

1. Integration testing for all API endpoints
2. Performance testing for report generation
3. Security audit of RLS policies
4. API documentation generation
5. Database documentation

### Backwards Compatibility

- **`property_financials` table remains unchanged** during migration
- New system runs in parallel
- Future decision point: Keep both systems or deprecate financials table
- If deprecation decided: Create migration script to convert financials data to transactions

---

## Performance Considerations

### Indexing Strategy

All foreign keys and frequently queried columns are indexed:

- `property_id`, `portfolio_id`, `user_id`, `unit_id` on all tables
- `transaction_date` on transaction tables (for date range queries)
- `category` on transaction tables (for category filtering)
- `is_recurring` on transaction tables (for recurring transaction jobs)
- `expiration_date` on documents table (for expiring document queries)

### Query Optimization

1. **Aggregation Queries**
   - Use materialized views for frequently accessed reports (future)
   - Implement caching for complex calculations
   - Consider monthly pre-aggregation tables for historical data

2. **Pagination**
   - All list endpoints support limit/offset pagination
   - Default limit: 50 items
   - Maximum limit: 1000 items

3. **Report Generation**
   - Cache report results for 5 minutes
   - Use database functions for complex calculations
   - Consider background job processing for large reports (>1000 transactions)

### Caching Strategy

1. **API Response Caching**
   - Use Next.js edge caching for GET requests
   - Cache-Control headers: 5 minutes for reports, 1 minute for lists

2. **Database Caching**
   - Postgres query cache handles repeated queries
   - Consider Redis for frequently accessed aggregations (future)

---

## Future Enhancements

### Phase 2 Features (Not in Initial Backend)

1. **AI-Powered Document Processing**
   - OCR text extraction from invoices/receipts
   - Auto-categorization of expenses
   - Auto-filling of transaction details from images

2. **Budget Management**
   - Set monthly/annual budgets by category
   - Budget vs actual comparisons
   - Alerts when approaching budget limits

3. **Tenant Management**
   - Separate tenant portal
   - Tenant communication system
   - Maintenance request tracking

4. **Automated Reminders**
   - Lease expiration notifications
   - Insurance policy renewal reminders
   - Recurring expense due date alerts

5. **Bank Integration**
   - Plaid integration for automatic transaction import
   - Bank account reconciliation
   - Auto-matching of transactions

6. **Tax Reporting**
   - Schedule E report generation
   - Depreciation schedules
   - Capital gains calculations

7. **Multi-Year Projections**
   - Extend transaction system to support multi-year projections
   - Link actual data to financial modeling assumptions
   - Auto-populate financial models from historical data

---

## Appendix: TypeScript Type Definitions

```typescript
// Property Unit
export interface PropertyUnit {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string
  unit_number: string
  unit_name: string | null
  square_footage: number | null
  tenant_name: string | null
  tenant_email: string | null
  tenant_phone: string | null
  lease_start_date: string | null
  lease_end_date: string | null
  monthly_rent: number | null
  security_deposit: number | null
  lease_terms: string | null
  is_occupied: boolean
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// Income Transaction
export interface IncomeTransaction {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string
  unit_id: string | null
  transaction_date: string
  amount: number
  category: IncomeCategory
  description: string
  transaction_type: 'actual' | 'projected'
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency | null
  recurrence_start_date: string | null
  recurrence_end_date: string | null
  parent_transaction_id: string | null
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

// Expense Transaction
export interface ExpenseTransaction {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string
  unit_id: string | null
  transaction_date: string
  amount: number
  category: ExpenseCategory
  description: string
  transaction_type: 'actual' | 'projected'
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency | null
  recurrence_start_date: string | null
  recurrence_end_date: string | null
  parent_transaction_id: string | null
  vendor_name: string | null
  vendor_contact: string | null
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

// Property Document
export interface PropertyDocument {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string
  unit_id: string | null
  income_transaction_id: string | null
  expense_transaction_id: string | null
  file_name: string
  file_path: string
  file_size_bytes: number
  file_type: string
  storage_bucket: string
  document_type: DocumentType
  document_category: string | null
  title: string | null
  description: string | null
  tags: string[] | null
  document_date: string | null
  expiration_date: string | null
  ocr_text: string | null
  ai_extracted_data: Record<string, any> | null
  is_processed: boolean
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  uploaded_at: string
  created_at: string
  updated_at: string
}

// Enums
export type IncomeCategory =
  | 'rental_income'
  | 'parking_income'
  | 'storage_income'
  | 'pet_fees'
  | 'late_fees'
  | 'utility_reimbursement'
  | 'laundry_income'
  | 'other_income'

export type ExpenseCategory =
  | 'repairs_maintenance'
  | 'property_taxes'
  | 'insurance'
  | 'utilities'
  | 'property_management'
  | 'hoa_fees'
  | 'landscaping'
  | 'pest_control'
  | 'cleaning'
  | 'legal_fees'
  | 'accounting_fees'
  | 'advertising'
  | 'capital_expenditure'
  | 'other_expense'

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'work_order'
  | 'insurance_policy'
  | 'tax_document'
  | 'lease_agreement'
  | 'inspection_report'
  | 'property_photo'
  | 'floor_plan'
  | 'other'

export type RecurrenceFrequency =
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'

// Report Types
export interface ProfitLossReport {
  period: {
    start_date: string
    end_date: string
  }
  income: {
    by_category: Record<IncomeCategory, number>
    total: number
  }
  expenses: {
    by_category: Record<ExpenseCategory, number>
    total: number
  }
  noi: number
  units?: Array<{
    unit_id: string
    unit_number: string
    income: number
    expenses: number
    net_income: number
  }>
}

export interface CashFlowReport {
  periods: Array<{
    period_start: string
    period_end: string
    income: number
    expenses: number
    net_cash_flow: number
  }>
  total_income: number
  total_expenses: number
  total_net_cash_flow: number
}

export interface UnitPerformanceReport {
  property_total: {
    income: number
    expenses: number
    noi: number
  }
  units: Array<{
    unit_id: string
    unit_number: string
    unit_name: string | null
    square_footage: number | null
    monthly_rent: number | null
    income: number
    expenses: number
    noi: number
    noi_per_sqft: number | null
    occupancy_rate: number | null
  }>
}
```

---

## Summary

This PRD defines a comprehensive backend system for property income and expense management with the following key features:

**Database:**
- 4 new tables: `property_units`, `income_transactions`, `expense_transactions`, `property_documents`
- Proper RLS policies matching existing portfolio permission system
- Database functions for calculations and recurring transaction generation
- Supabase Storage integration for document files

**API:**
- 25+ RESTful endpoints covering CRUD operations and reporting
- Consistent error handling and response formats
- Query parameter support for filtering and pagination
- File upload endpoints with validation

**Features:**
- Unit-level and property-level financial tracking
- Actual and projected transactions with recurring support
- Document management with transaction linking
- Financial reporting (P&L, cash flow, unit performance)

**Security:**
- Row-level security policies on all tables
- Storage bucket policies for file access
- Role-based permissions (owner/editor/viewer)
- Proper foreign key cascades and constraints

The system is designed for scalability, maintainability, and future AI/automation enhancements while maintaining backwards compatibility with the existing `property_financials` table.
