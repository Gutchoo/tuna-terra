// ============================================================================
// Document intake: the real-estate-native data pipeline. Operating statements,
// loan statements, rent rolls, and tax bills arrive as unstructured documents;
// the platform extracts fields, validates them, and posts approved values to
// the property record with the source document as provenance.
//
// Pipeline stages: Received -> Extracted -> Validated -> Posted
// ============================================================================

import type { Property } from '@/lib/supabase'

export type DocumentType =
  | 'loan-statement'
  | 'operating-statement'
  | 'rent-roll'
  | 'tax-bill'
  | 'insurance-renewal'

export type IntakeStatus = 'needs-review' | 'posted' | 'rejected'

export interface ExtractedField {
  /** Property record field this value posts to (null = informational only) */
  field: keyof Property | null
  label: string
  /** Raw text as read from the document */
  rawText: string
  /** Parsed, typed value ready to post */
  value: string | number
  /** Extraction confidence 0-1; low confidence should draw the reviewer's eye */
  confidence: number
  /** Value currently on the property record, for comparison */
  currentValue: string | number | null
}

export interface ValidationResult {
  label: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
}

/** A rendered line in the document view; styling hints for realism */
export interface DocLine {
  text: string
  indent?: number
  bold?: boolean
  rightText?: string
  separator?: boolean
  /** Marks the line an extracted field came from */
  highlight?: boolean
}

export interface IntakeDocument {
  id: string
  type: DocumentType
  title: string
  sender: string
  receivedAt: string
  receivedVia: 'email' | 'portal-download' | 'upload'
  propertyId: string
  propertyAddress: string
  periodOrDate: string
  status: IntakeStatus
  /** The document body, rendered in-app as a statement-styled view */
  lines: DocLine[]
  extractedFields: ExtractedField[]
  validations: ValidationResult[]
}

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  'loan-statement': 'Loan statement',
  'operating-statement': 'Operating statement',
  'rent-roll': 'Rent roll',
  'tax-bill': 'Property tax bill',
  'insurance-renewal': 'Insurance renewal',
}

export const RECEIVED_VIA_LABELS: Record<IntakeDocument['receivedVia'], string> = {
  email: 'Email attachment',
  'portal-download': 'Lender portal',
  upload: 'Manual upload',
}

const PLAZA_ID = 'sample-property-plaza-suites'
const PLAZA_ADDR = '1200 PLAZA DR'

// ----------------------------------------------------------------------------
// Sample inbound documents for Plaza Suites — a realistic month of paper
// ----------------------------------------------------------------------------

const LOAN_STATEMENT: IntakeDocument = {
  id: 'DOC-2026-0801',
  type: 'loan-statement',
  title: 'Commercial Loan Statement — August 2026',
  sender: 'Pacific Western Bank',
  receivedAt: '2026-08-01T08:12:00',
  receivedVia: 'portal-download',
  propertyId: PLAZA_ID,
  propertyAddress: PLAZA_ADDR,
  periodOrDate: 'Statement date 2026-08-01',
  status: 'needs-review',
  lines: [
    { text: 'PACIFIC WESTERN BANK', bold: true },
    { text: 'Commercial Real Estate Lending' },
    { text: '', separator: true },
    { text: 'Loan Number', rightText: 'CRE-4471-8802' },
    { text: 'Borrower', rightText: 'PLAZA SUITES INVESTORS LLC' },
    { text: 'Collateral', rightText: '1200 Plaza Dr, Sacramento, CA 95825' },
    { text: 'Statement Date', rightText: 'August 1, 2026' },
    { text: '', separator: true },
    { text: 'Payment Due September 1, 2026', bold: true },
    { text: 'Principal & Interest', rightText: '$11,378.09', highlight: true },
    { text: 'Escrow (taxes & insurance)', rightText: '$3,700.00' },
    { text: 'Total Payment Due', rightText: '$15,078.09', bold: true },
    { text: '', separator: true },
    { text: 'Loan Summary', bold: true },
    { text: 'Interest Rate (fixed)', rightText: '6.500%', highlight: true },
    { text: 'Principal Balance After Payment', rightText: '$1,748,905.19', highlight: true },
    { text: 'Prior Principal Balance', rightText: '$1,752,340.13' },
    { text: 'Maturity Date', rightText: 'July 1, 2033', highlight: true },
    { text: 'Escrow Balance', rightText: '$22,140.55' },
  ],
  extractedFields: [
    {
      field: 'mortgage_amount',
      label: 'Principal balance',
      rawText: '$1,748,905.19',
      value: 1_748_905,
      confidence: 0.98,
      currentValue: 1_752_340,
    },
    {
      field: 'loan_rate',
      label: 'Interest rate',
      rawText: '6.500%',
      value: 6.5,
      confidence: 0.99,
      currentValue: 6.5,
    },
    {
      field: 'loan_maturity_date',
      label: 'Maturity date',
      rawText: 'July 1, 2033',
      value: '2033-07-01',
      confidence: 0.97,
      currentValue: '2033-07-01',
    },
    {
      field: null,
      label: 'Monthly P&I payment',
      rawText: '$11,378.09',
      value: 11_378,
      confidence: 0.98,
      currentValue: 11_378,
    },
  ],
  validations: [
    {
      label: 'Balance direction',
      status: 'pass',
      detail: 'Principal decreased $3,435 vs. prior statement — consistent with a current amortizing loan',
    },
    {
      label: 'Amortization math',
      status: 'pass',
      detail: 'Payment $11,378 at 6.5%/30yr on the original $1.8M balance checks out (±$1)',
    },
    {
      label: 'Identity match',
      status: 'pass',
      detail: 'Borrower and collateral address match the property record',
    },
    {
      label: 'Statement continuity',
      status: 'pass',
      detail: 'Prior balance on this statement equals the balance currently on record',
    },
  ],
}

const TAX_BILL: IntakeDocument = {
  id: 'DOC-2026-0728',
  type: 'tax-bill',
  title: 'Secured Property Tax Bill — FY 2026-27',
  sender: 'Sacramento County Tax Collector',
  receivedAt: '2026-07-28T10:40:00',
  receivedVia: 'email',
  propertyId: PLAZA_ID,
  propertyAddress: PLAZA_ADDR,
  periodOrDate: 'Fiscal year 2026-2027',
  status: 'needs-review',
  lines: [
    { text: 'COUNTY OF SACRAMENTO', bold: true },
    { text: 'Office of the Tax Collector — Secured Tax Bill' },
    { text: '', separator: true },
    { text: 'Parcel Number', rightText: '412-260-018' },
    { text: 'Property Address', rightText: '1200 PLAZA DR, SACRAMENTO CA' },
    { text: 'Assessee', rightText: 'PLAZA SUITES INVESTORS LLC' },
    { text: '', separator: true },
    { text: 'Assessed Values (as of Jan 1, 2026)', bold: true },
    { text: 'Land', rightText: '$530,400', highlight: true },
    { text: 'Improvements', rightText: '$1,713,600', highlight: true },
    { text: 'Total Assessed Value', rightText: '$2,244,000', bold: true, highlight: true },
    { text: '', separator: true },
    { text: 'Total Tax (1.1052% + direct levies)', rightText: '$26,410.44', highlight: true },
    { text: 'First Installment (due Nov 1)', rightText: '$13,205.22' },
    { text: 'Second Installment (due Feb 1)', rightText: '$13,205.22' },
  ],
  extractedFields: [
    {
      field: 'assessed_value',
      label: 'Total assessed value',
      rawText: '$2,244,000',
      value: 2_244_000,
      confidence: 0.99,
      currentValue: 2_200_000,
    },
    {
      field: 'land_value',
      label: 'Land value',
      rawText: '$530,400',
      value: 530_400,
      confidence: 0.98,
      currentValue: 520_000,
    },
    {
      field: 'improvement_value',
      label: 'Improvement value',
      rawText: '$1,713,600',
      value: 1_713_600,
      confidence: 0.98,
      currentValue: 1_680_000,
    },
    {
      field: 'tax_year',
      label: 'Tax year',
      rawText: 'FY 2026-27',
      value: '2026',
      confidence: 0.95,
      currentValue: '2025',
    },
    {
      field: null,
      label: 'Annual tax',
      rawText: '$26,410.44',
      value: 26_410,
      confidence: 0.99,
      currentValue: 30_000,
    },
  ],
  validations: [
    {
      label: 'Parcel match',
      status: 'pass',
      detail: 'APN 412-260-018 matches the property record exactly',
    },
    {
      label: 'Components sum',
      status: 'pass',
      detail: 'Land $530,400 + improvements $1,713,600 = total $2,244,000 — bill cross-foots',
    },
    {
      label: 'Reassessment magnitude',
      status: 'pass',
      detail: '+2.0% vs. prior assessed value — consistent with the CA Prop 13 annual cap',
    },
    {
      label: 'Budget variance',
      status: 'warn',
      detail: 'Actual tax $26,410 vs. $30,000 budgeted in the operating statement — update the expense budget after posting',
    },
  ],
}

const RENT_ROLL: IntakeDocument = {
  id: 'DOC-2026-0731',
  type: 'rent-roll',
  title: 'Rent Roll — July 2026',
  sender: 'Haven Residential (property manager)',
  receivedAt: '2026-07-31T17:05:00',
  receivedVia: 'email',
  propertyId: PLAZA_ID,
  propertyAddress: PLAZA_ADDR,
  periodOrDate: 'As of 2026-07-31',
  status: 'needs-review',
  lines: [
    { text: 'HAVEN RESIDENTIAL', bold: true },
    { text: 'Rent Roll — Plaza Suites, 1200 Plaza Dr' },
    { text: 'As of July 31, 2026' },
    { text: '', separator: true },
    { text: 'Unit  Type      SF    Lease End    Rent', bold: true },
    { text: '101   1BR/1BA   650   2027-01-31   $1,150' },
    { text: '102   1BR/1BA   650   2026-11-30   $1,125' },
    { text: '103   1BR/1BA   650   2027-03-31   $1,150' },
    { text: '104   1BR/1BA   650   2026-12-31   $1,140' },
    { text: '105   1BR/1BA   650   2027-05-31   $1,150' },
    { text: '106   1BR/1BA   650   2027-02-28   $1,150' },
    { text: '107   1BR/1BA   650   2026-10-31   $1,110' },
    { text: '108   1BR/1BA   650   2027-04-30   $1,150' },
    { text: '201   2BR/1BA   900   2027-01-31   $1,450' },
    { text: '202   2BR/1BA   900   2026-09-30   $1,375' },
    { text: '203   2BR/1BA   900   2027-06-30   $1,450' },
    { text: '204   2BR/1BA   900   2026-12-31   $1,400' },
    { text: '205   2BR/1BA   900   2027-02-28   $1,450' },
    { text: '206   2BR/1BA   900   VACANT       —', highlight: true },
    { text: '207   2BR/1BA   900   2027-03-31   $1,450' },
    { text: '208   2BR/1BA   900   2026-11-30   $1,390' },
    { text: '209   2BR/1BA   900   2027-05-31   $1,450' },
    { text: '210   2BR/1BA   900   2026-08-31   $1,350', highlight: true },
    { text: '211   2BR/1BA   900   2027-04-30   $1,450' },
    { text: '212   2BR/1BA   900   2027-01-31   $1,425' },
    { text: '', separator: true },
    { text: 'Occupied 19 of 20 · Monthly scheduled rent', rightText: '$25,915', bold: true, highlight: true },
  ],
  extractedFields: [
    {
      field: 'num_units',
      label: 'Total units',
      rawText: '20 units listed',
      value: 20,
      confidence: 0.99,
      currentValue: 20,
    },
    {
      field: null,
      label: 'Occupied units',
      rawText: 'Occupied 19 of 20',
      value: 19,
      confidence: 0.97,
      currentValue: 19,
    },
    {
      field: null,
      label: 'Monthly scheduled rent',
      rawText: '$25,915',
      value: 25_915,
      confidence: 0.93,
      currentValue: 25_900,
    },
    {
      field: null,
      label: 'Nearest lease expiry',
      rawText: 'Unit 210 — 2026-08-31',
      value: '2026-08-31',
      confidence: 0.9,
      currentValue: null,
    },
  ],
  validations: [
    {
      label: 'Unit count',
      status: 'pass',
      detail: '20 rows extracted — matches the 20 units on the property record',
    },
    {
      label: 'Rent totals cross-foot',
      status: 'warn',
      detail: 'Extracted unit rents sum to $25,915; PM summary line also shows $25,915, but the billing system billed $25,900 in July — $15 variance to reconcile',
    },
    {
      label: 'Vacancy consistency',
      status: 'pass',
      detail: 'One vacant unit (206) matches 95% occupancy reported in the PM feed',
    },
    {
      label: 'Lease expiry watch',
      status: 'warn',
      detail: 'Unit 210 lease ends 2026-08-31 at $1,350 — $100 below the 2BR market rent; renewal decision due',
    },
  ],
}

const INSURANCE_RENEWAL: IntakeDocument = {
  id: 'DOC-2026-0715',
  type: 'insurance-renewal',
  title: 'Commercial Property Policy Renewal',
  sender: 'Farmers Commercial',
  receivedAt: '2026-07-15T09:22:00',
  receivedVia: 'email',
  propertyId: PLAZA_ID,
  propertyAddress: PLAZA_ADDR,
  periodOrDate: 'Policy term 2026-09-01 to 2027-09-01',
  status: 'posted',
  lines: [
    { text: 'FARMERS COMMERCIAL', bold: true },
    { text: 'Commercial Property — Renewal Offer' },
    { text: '', separator: true },
    { text: 'Named Insured', rightText: 'PLAZA SUITES INVESTORS LLC' },
    { text: 'Location', rightText: '1200 Plaza Dr, Sacramento CA' },
    { text: 'Policy Term', rightText: '09/01/2026 – 09/01/2027' },
    { text: '', separator: true },
    { text: 'Annual Premium', rightText: '$15,120.00', highlight: true },
    { text: 'Prior Term Premium', rightText: '$14,400.00' },
    { text: 'Building Limit', rightText: '$2,900,000' },
    { text: 'Deductible', rightText: '$25,000' },
  ],
  extractedFields: [
    {
      field: 'insurance_provider',
      label: 'Carrier',
      rawText: 'FARMERS COMMERCIAL',
      value: 'Farmers Commercial',
      confidence: 0.99,
      currentValue: 'Farmers Commercial',
    },
    {
      field: null,
      label: 'Annual premium',
      rawText: '$15,120.00',
      value: 15_120,
      confidence: 0.98,
      currentValue: 14_400,
    },
  ],
  validations: [
    {
      label: 'Premium change',
      status: 'warn',
      detail: '+5.0% vs. prior term — within normal renewal range; update the insurance expense line',
    },
    {
      label: 'Identity match',
      status: 'pass',
      detail: 'Named insured and location match the property record',
    },
  ],
}

const SAMPLE_DOCUMENTS: IntakeDocument[] = [
  LOAN_STATEMENT,
  RENT_ROLL,
  TAX_BILL,
  INSURANCE_RENEWAL,
]

export function getIntakeDocuments(): IntakeDocument[] {
  return SAMPLE_DOCUMENTS
}

export function getDocumentsForProperty(propertyId: string): IntakeDocument[] {
  return SAMPLE_DOCUMENTS.filter(d => d.propertyId === propertyId)
}
