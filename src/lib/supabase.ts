import { createBrowserClient } from '@supabase/ssr'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for use in client components)
export const createClient = () => {
  // Ensure environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Note: createServerSupabaseClient is deprecated - use local implementations in API routes instead
// This is kept for backwards compatibility but should not be used in new code
export const createServerSupabaseClient = () => {
  throw new Error('createServerSupabaseClient from lib/supabase is deprecated. Use local createServerClient implementations in API routes instead.')
}

// Import census types
import type { CensusDemographics } from '@/hooks/useCensusData'

// Database types
export type Property = {
  id: string
  user_id: string  // UUID from auth.users
  regrid_id: string | null // Regrid property ID for reference
  apn: string | null
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  geometry: Record<string, unknown> | null // GeoJSON polygon
  lat: number | null
  lng: number | null
  
  // Rich property data from Regrid API
  year_built: number | null
  owner: string | null
  last_sale_price: number | null
  sale_date: string | null // ISO date string
  county: string | null
  qoz_status: string | null // Qualified Opportunity Zone status
  improvement_value: number | null
  land_value: number | null
  assessed_value: number | null
  
  // Extended property details
  use_code: string | null // Property use code
  use_description: string | null // Use description  
  zoning: string | null // Zoning code
  zoning_description: string | null // Full zoning description
  num_stories: number | null // Number of stories
  num_units: number | null // Number of units
  num_rooms: number | null // Number of rooms
  subdivision: string | null // Subdivision name
  lot_size_acres: number | null // Lot size in acres
  lot_size_sqft: number | null // Lot size in square feet
  
  // Financial & tax data
  tax_year: string | null // Tax assessment year
  parcel_value_type: string | null // Type of parcel value
  purchase_price: number | null // User-entered purchase price for financial modeling

  // Location data
  census_tract: string | null // Census tract identifier
  census_block: string | null // Census block identifier
  qoz_tract: string | null // QOZ tract number
  
  // Data freshness tracking
  last_refresh_date: string | null // When Regrid data was last refreshed (ISO date)
  regrid_updated_at: string | null // When Regrid last updated the data (ISO datetime)
  
  // Owner mailing address
  owner_mailing_address: string | null // Owner's mailing address
  owner_mail_city: string | null // Owner's mailing city
  owner_mail_state: string | null // Owner's mailing state
  owner_mail_zip: string | null // Owner's mailing zip
  
  property_data: Record<string, unknown> | null // Regrid response data
  user_notes: string | null
  tags: string[] | null
  insurance_provider: string | null
  maintenance_history: string | null
  is_sample: boolean // Whether this is a sample property for demonstration
  portfolio_id: string | null // Portfolio this property belongs to
  created_at: string
  updated_at: string
}

// Enhanced property type with demographics data (client-side only)
export interface PropertyWithDemographics extends Property {
  demographics?: CensusDemographics | null
}

// Portfolio-related types
export interface Portfolio {
  id: string
  name: string
  description: string | null
  owner_id: string
  is_default: boolean
  is_sample: boolean // Whether this is a sample portfolio for demonstration
  created_at: string
  updated_at: string
}

export interface PortfolioMembership {
  id: string
  portfolio_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  created_at: string
}

export interface PortfolioInvitation {
  id: string
  portfolio_id: string
  email: string
  role: 'editor' | 'viewer'
  invited_by: string
  invitation_token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

// Extended portfolio with membership info
export interface PortfolioWithMembership extends Portfolio {
  membership_role?: 'owner' | 'editor' | 'viewer'
  member_count?: number
  property_count?: number
}

// Portfolio member info for display
export interface PortfolioMember {
  id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  user: {
    id: string
    email: string
    name: string
    avatar_url: string | null
  }
}

// User limits and tier types
export interface UserLimits {
  id?: string
  user_id: string
  tier: 'free' | 'pro'
  property_lookups_used: number
  property_lookups_limit: number
  total_lookups_lifetime: number
  reset_date: string
  created_at?: string
  updated_at?: string
  join_date?: string
  can_proceed?: boolean
}

export type Profile = {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// Property financials type for financial modeling data
export interface PropertyFinancials {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string

  // Income Data (30-year arrays)
  potential_rental_income: number[]
  other_income: number[]
  vacancy_rates: number[]
  rental_income_growth_rate: number | null
  default_vacancy_rate: number | null

  // Operating Expenses (30-year arrays)
  operating_expenses: number[]
  operating_expense_type: 'percentage' | 'dollar' | ''
  property_taxes: number[]
  insurance: number[]
  maintenance: number[]
  property_management: number[]
  utilities: number[]
  other_expenses: number[]
  default_operating_expense_rate: number | null

  // Financing
  financing_type: 'dscr' | 'ltv' | 'cash' | ''
  loan_amount: number | null
  interest_rate: number | null
  loan_term_years: number | null
  amortization_years: number | null
  payments_per_year: number
  loan_costs: number | null
  loan_cost_type: 'percentage' | 'dollar' | ''
  target_dscr: number | null
  target_ltv: number | null

  // Tax & Depreciation
  property_type: 'residential' | 'commercial' | 'industrial' | ''
  land_percentage: number | null
  improvements_percentage: number | null
  ordinary_income_tax_rate: number | null
  capital_gains_tax_rate: number | null
  depreciation_recapture_rate: number | null

  // Exit Strategy
  hold_period_years: number | null
  disposition_price_type: 'dollar' | 'caprate' | ''
  disposition_price: number | null
  disposition_cap_rate: number | null
  cost_of_sale_type: 'percentage' | 'dollar' | ''
  cost_of_sale_amount: number | null
  cost_of_sale_percentage: number | null

  created_at: string
  updated_at: string
}

// ============================================================================
// INCOME & EXPENSE MANAGEMENT TYPES (v2.0)
// ============================================================================

// Property Unit - Individual units within properties
export interface PropertyUnit {
  id: string
  property_id: string
  portfolio_id: string
  user_id: string

  // Unit Information
  unit_number: string
  unit_name: string | null
  square_footage: number | null

  // Tenant Information
  tenant_name: string | null
  tenant_email: string | null
  tenant_phone: string | null

  // Lease Terms
  lease_start_date: string | null
  lease_end_date: string | null
  monthly_rent: number | null
  security_deposit: number | null
  lease_terms: string | null

  // Status
  is_occupied: boolean
  is_active: boolean

  // Metadata
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

  // Transaction Details
  transaction_date: string
  amount: number
  category: IncomeCategory
  description: string

  // Transaction Type
  transaction_type: 'actual' | 'projected'

  // Recurring Income
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency | null
  recurrence_start_date: string | null
  recurrence_end_date: string | null
  parent_transaction_id: string | null

  // Metadata
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

  // Transaction Details
  transaction_date: string
  amount: number
  category: ExpenseCategory
  description: string

  // Transaction Type
  transaction_type: 'actual' | 'projected'

  // Recurring Expenses
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency | null
  recurrence_start_date: string | null
  recurrence_end_date: string | null
  parent_transaction_id: string | null

  // Vendor Information
  vendor_name: string | null
  vendor_contact: string | null

  // Metadata
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

  // Link to Transactions (optional)
  income_transaction_id: string | null
  expense_transaction_id: string | null

  // File Information
  file_name: string
  file_path: string
  file_size_bytes: number
  file_type: string
  storage_bucket: string

  // Document Classification
  document_type: DocumentType
  document_category: string | null

  // Metadata
  title: string | null
  description: string | null
  tags: string[] | null

  // Document Properties
  document_date: string | null
  expiration_date: string | null

  // OCR/AI Processing (future enhancement)
  ocr_text: string | null
  ai_extracted_data: Record<string, unknown> | null

  // Status
  is_processed: boolean
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'

  // Timestamps
  uploaded_at: string
  created_at: string
  updated_at: string
}

// ============================================================================
// ENUMS & TYPE ALIASES
// ============================================================================

// Income Categories
export type IncomeCategory =
  | 'rental_income'
  | 'parking_income'
  | 'storage_income'
  | 'pet_fees'
  | 'late_fees'
  | 'utility_reimbursement'
  | 'laundry_income'
  | 'other_income'

// Expense Categories
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

// Document Types
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

// Recurrence Frequency
export type RecurrenceFrequency =
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'

// ============================================================================
// REPORT TYPES
// ============================================================================

// Profit & Loss Report
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

// Cash Flow Report
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

// Unit Performance Report
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

// Database schema type
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      property_stats: {
        Row: {
          user_id: string
          total_properties: number
          states_count: number
          cities_count: number
          avg_latitude: number
          avg_longitude: number
        }
      }
    }
    Functions: {
      search_properties_by_address: {
        Args: {
          search_term: string
          user_id_param: string
        }
        Returns: {
          id: string
          address: string
          city: string
          state: string
          zip_code: string
        }[]
      }
    }
  }
}