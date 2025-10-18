-- ============================================================================
-- Migration: Property Income & Expense Management System
-- Description: Adds comprehensive income/expense tracking, unit management,
--              document storage, and financial reporting capabilities
-- Date: 2025-10-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: POSTGRESQL ENUMS
-- ============================================================================

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

-- Processing Status
CREATE TYPE processing_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: property_units
-- Description: Stores individual units within properties (apartments, ADUs, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unit Information
  unit_number TEXT NOT NULL,
  unit_name TEXT,
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
  lease_terms TEXT,

  -- Status
  is_occupied BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(property_id, unit_number),
  CHECK (monthly_rent >= 0 OR monthly_rent IS NULL),
  CHECK (security_deposit >= 0 OR security_deposit IS NULL),
  CHECK (square_footage >= 0 OR square_footage IS NULL)
);

-- ----------------------------------------------------------------------------
-- Table: income_transactions
-- Description: Stores all income entries (actual, historical, and projected)
-- ----------------------------------------------------------------------------
CREATE TABLE income_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Transaction Type
  transaction_type TEXT NOT NULL DEFAULT 'actual',

  -- Recurring Income
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
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

-- ----------------------------------------------------------------------------
-- Table: expense_transactions
-- Description: Stores all expense entries (actual, historical, and projected)
-- ----------------------------------------------------------------------------
CREATE TABLE expense_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Transaction Type
  transaction_type TEXT NOT NULL DEFAULT 'actual',

  -- Recurring Expenses
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
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

-- ----------------------------------------------------------------------------
-- Table: property_documents
-- Description: Stores metadata for files uploaded to Supabase Storage
-- ----------------------------------------------------------------------------
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE CASCADE,

  -- Link to Transactions (optional)
  income_transaction_id UUID REFERENCES income_transactions(id) ON DELETE SET NULL,
  expense_transaction_id UUID REFERENCES expense_transactions(id) ON DELETE SET NULL,

  -- File Information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size_bytes BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'property-documents',

  -- Document Classification
  document_type TEXT NOT NULL,
  document_category TEXT,

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[],

  -- Document Properties
  document_date DATE,
  expiration_date DATE,

  -- OCR/AI Processing (future enhancement)
  ocr_text TEXT,
  ai_extracted_data JSONB,

  -- Status
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending',

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

-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================

-- property_units indexes
CREATE INDEX idx_property_units_property_id ON property_units(property_id);
CREATE INDEX idx_property_units_portfolio_id ON property_units(portfolio_id);
CREATE INDEX idx_property_units_is_active ON property_units(is_active);
CREATE INDEX idx_property_units_lease_dates ON property_units(lease_start_date, lease_end_date);

-- income_transactions indexes
CREATE INDEX idx_income_transactions_property_id ON income_transactions(property_id);
CREATE INDEX idx_income_transactions_portfolio_id ON income_transactions(portfolio_id);
CREATE INDEX idx_income_transactions_unit_id ON income_transactions(unit_id);
CREATE INDEX idx_income_transactions_date ON income_transactions(transaction_date);
CREATE INDEX idx_income_transactions_category ON income_transactions(category);
CREATE INDEX idx_income_transactions_type ON income_transactions(transaction_type);
CREATE INDEX idx_income_transactions_recurring ON income_transactions(is_recurring);
CREATE INDEX idx_income_transactions_parent ON income_transactions(parent_transaction_id);

-- expense_transactions indexes
CREATE INDEX idx_expense_transactions_property_id ON expense_transactions(property_id);
CREATE INDEX idx_expense_transactions_portfolio_id ON expense_transactions(portfolio_id);
CREATE INDEX idx_expense_transactions_unit_id ON expense_transactions(unit_id);
CREATE INDEX idx_expense_transactions_date ON expense_transactions(transaction_date);
CREATE INDEX idx_expense_transactions_category ON expense_transactions(category);
CREATE INDEX idx_expense_transactions_type ON expense_transactions(transaction_type);
CREATE INDEX idx_expense_transactions_recurring ON expense_transactions(is_recurring);
CREATE INDEX idx_expense_transactions_parent ON expense_transactions(parent_transaction_id);

-- property_documents indexes
CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX idx_property_documents_portfolio_id ON property_documents(portfolio_id);
CREATE INDEX idx_property_documents_unit_id ON property_documents(unit_id);
CREATE INDEX idx_property_documents_income_tx ON property_documents(income_transaction_id);
CREATE INDEX idx_property_documents_expense_tx ON property_documents(expense_transaction_id);
CREATE INDEX idx_property_documents_type ON property_documents(document_type);
CREATE INDEX idx_property_documents_expiration ON property_documents(expiration_date);
CREATE INDEX idx_property_documents_file_path ON property_documents(file_path);

-- ============================================================================
-- SECTION 4: DATABASE FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: calculate_property_noi
-- Description: Calculate Net Operating Income for a property within date range
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Function: calculate_unit_financials
-- Description: Calculate financial metrics for a specific unit within date range
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Function: generate_recurring_income_transactions
-- Description: Auto-generate recurring income transactions up to specified date
-- ----------------------------------------------------------------------------
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
    'projected',
    rd.id
  FROM recurring_dates rd
  WHERE rd.transaction_date > CURRENT_DATE
  ON CONFLICT DO NOTHING
  RETURNING id, property_id, amount, transaction_date;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: generate_recurring_expense_transactions
-- Description: Auto-generate recurring expense transactions up to specified date
-- ----------------------------------------------------------------------------
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
  RETURN QUERY
  WITH RECURSIVE recurring_dates AS (
    SELECT
      e.id,
      e.property_id,
      e.portfolio_id,
      e.user_id,
      e.unit_id,
      e.amount,
      e.category,
      e.description,
      e.vendor_name,
      e.vendor_contact,
      e.recurrence_start_date AS transaction_date,
      e.recurrence_end_date,
      e.recurrence_frequency
    FROM expense_transactions e
    WHERE e.is_recurring = true
      AND e.recurrence_start_date <= p_end_date
      AND (e.recurrence_end_date IS NULL OR e.recurrence_end_date >= CURRENT_DATE)

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
      rd.vendor_name,
      rd.vendor_contact,
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
  INSERT INTO expense_transactions (
    property_id,
    portfolio_id,
    user_id,
    unit_id,
    transaction_date,
    amount,
    category,
    description,
    transaction_type,
    vendor_name,
    vendor_contact,
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
    'projected',
    rd.vendor_name,
    rd.vendor_contact,
    rd.id
  FROM recurring_dates rd
  WHERE rd.transaction_date > CURRENT_DATE
  ON CONFLICT DO NOTHING
  RETURNING id, property_id, amount, transaction_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
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

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies: property_units
-- ----------------------------------------------------------------------------

-- SELECT: Users can view units in accessible portfolios
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

-- ----------------------------------------------------------------------------
-- RLS Policies: income_transactions
-- ----------------------------------------------------------------------------

-- SELECT: Users can view transactions in accessible portfolios
CREATE POLICY "Users can view income transactions in accessible portfolios"
ON income_transactions FOR SELECT
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Owners and editors can create transactions
CREATE POLICY "Owners and editors can create income transactions"
ON income_transactions FOR INSERT
WITH CHECK (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners and editors can update transactions
CREATE POLICY "Owners and editors can update income transactions"
ON income_transactions FOR UPDATE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- DELETE: Only owners can delete transactions
CREATE POLICY "Only owners can delete income transactions"
ON income_transactions FOR DELETE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- ----------------------------------------------------------------------------
-- RLS Policies: expense_transactions
-- ----------------------------------------------------------------------------

-- SELECT: Users can view transactions in accessible portfolios
CREATE POLICY "Users can view expense transactions in accessible portfolios"
ON expense_transactions FOR SELECT
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM user_accessible_portfolios
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Owners and editors can create transactions
CREATE POLICY "Owners and editors can create expense transactions"
ON expense_transactions FOR INSERT
WITH CHECK (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners and editors can update transactions
CREATE POLICY "Owners and editors can update expense transactions"
ON expense_transactions FOR UPDATE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
);

-- DELETE: Only owners can delete transactions
CREATE POLICY "Only owners can delete expense transactions"
ON expense_transactions FOR DELETE
USING (
  portfolio_id IN (
    SELECT portfolio_id FROM portfolio_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- ----------------------------------------------------------------------------
-- RLS Policies: property_documents
-- ----------------------------------------------------------------------------

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

-- ============================================================================
-- SECTION 7: STORAGE BUCKET POLICIES
-- ============================================================================

-- Note: Storage bucket creation and policies should be handled via Supabase Dashboard
-- or separate storage migration due to storage.buckets table access requirements.
-- The following is reference SQL for documentation purposes:

/*
-- Create storage bucket (execute via Supabase Dashboard or supabase CLI)
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
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
