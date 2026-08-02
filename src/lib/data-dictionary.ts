// ============================================================================
// Data dictionary: the reference catalog for every field the platform
// maintains — type, source system, update cadence, and lineage. This is the
// artifact a reference-data team publishes so downstream consumers know
// exactly what each field means and where it came from.
// ============================================================================

export type FieldSource = 'county-assessor' | 'geocoding' | 'user-entered' | 'derived'

export interface DataDictionaryEntry {
  field: string
  label: string
  dataType: 'string' | 'number' | 'currency' | 'date' | 'boolean' | 'geometry'
  source: FieldSource
  /** Upstream system + field the value is normalized from */
  lineage: string
  /** How the value gets refreshed */
  updateCadence: string
  /** Governance notes: validation rules, known caveats */
  notes?: string
  category: 'identity' | 'location' | 'valuation' | 'building' | 'ownership' | 'transaction' | 'user'
}

export const SOURCE_LABELS: Record<FieldSource, string> = {
  'county-assessor': 'County assessor (via Regrid)',
  'geocoding': 'Google Places geocoding',
  'user-entered': 'User entered',
  'derived': 'Derived / computed',
}

export const DATA_DICTIONARY: DataDictionaryEntry[] = [
  // Identity
  {
    field: 'apn',
    label: 'Parcel Number (APN)',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid parcels.features[].properties.fields.parcelnumb — dashes stripped on intake',
    updateCadence: 'On create + each refresh',
    notes: 'Unique only within a county. Intake requires state; disambiguation flow resolves multi-county collisions.',
    category: 'identity',
  },
  {
    field: 'regrid_id',
    label: 'Vendor Parcel ID',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid properties.ll_uuid — the vendor\'s stable parcel identifier',
    updateCadence: 'On create + each refresh',
    notes: 'll_uuid is documented stable across vendor data refreshes; the integer feature.id is not and is never stored.',
    category: 'identity',
  },
  // Location
  {
    field: 'address',
    label: 'Situs Address',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.address, falling back to user input when no county match',
    updateCadence: 'On create + each refresh',
    category: 'location',
  },
  {
    field: 'lat',
    label: 'Latitude / Longitude',
    dataType: 'number',
    source: 'county-assessor',
    lineage: 'Regrid fields.lat/lon (parcel centroid); Google Places geometry as fallback for unenriched records',
    updateCadence: 'On create + each refresh',
    notes: 'Centroid of parcel polygon, not the building footprint.',
    category: 'location',
  },
  {
    field: 'geometry',
    label: 'Parcel Boundary',
    dataType: 'geometry',
    source: 'county-assessor',
    lineage: 'Regrid features[].geometry — GeoJSON Polygon/MultiPolygon, WGS 84',
    updateCadence: 'On create + each refresh',
    category: 'location',
  },
  {
    field: 'county',
    label: 'County',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.county; Google administrative_area_level_2 as fallback',
    updateCadence: 'On create + each refresh',
    category: 'location',
  },
  {
    field: 'census_tract',
    label: 'Census Tract',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.census_tract (2020 tract GEOID)',
    updateCadence: 'On create + each refresh',
    category: 'location',
  },
  {
    field: 'qoz_status',
    label: 'Opportunity Zone',
    dataType: 'boolean',
    source: 'county-assessor',
    lineage: 'Regrid fields.qoz + qoz_tract (IRS-designated QOZ tracts)',
    updateCadence: 'On create + each refresh',
    category: 'location',
  },
  // Valuation
  {
    field: 'assessed_value',
    label: 'Assessed Value',
    dataType: 'currency',
    source: 'county-assessor',
    lineage: 'Regrid fields.parval — total parcel value from the county tax roll',
    updateCadence: 'Annual reassessment; captured on refresh',
    notes: 'Assessment basis varies by state (market vs. acquisition value). Moves >±15% are flagged for steward review.',
    category: 'valuation',
  },
  {
    field: 'land_value',
    label: 'Land Value',
    dataType: 'currency',
    source: 'county-assessor',
    lineage: 'Regrid fields.landval',
    updateCadence: 'Annual reassessment; captured on refresh',
    category: 'valuation',
  },
  {
    field: 'improvement_value',
    label: 'Improvement Value',
    dataType: 'currency',
    source: 'county-assessor',
    lineage: 'Regrid fields.improvval',
    updateCadence: 'Annual reassessment; captured on refresh',
    category: 'valuation',
  },
  {
    field: 'tax_year',
    label: 'Tax Year',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.taxyear',
    updateCadence: 'Annual roll-forward',
    notes: 'Roll-forward alone is not a lifecycle event; stewards typically dismiss unpaired tax-year changes.',
    category: 'valuation',
  },
  // Building
  {
    field: 'year_built',
    label: 'Year Built',
    dataType: 'number',
    source: 'county-assessor',
    lineage: 'Regrid fields.yearbuilt',
    updateCadence: 'On create + each refresh',
    category: 'building',
  },
  {
    field: 'lot_size_acres',
    label: 'Lot Size',
    dataType: 'number',
    source: 'county-assessor',
    lineage: 'Regrid fields.ll_gisacre / ll_gissqft — GIS-computed from parcel geometry',
    updateCadence: 'On create + each refresh',
    notes: 'GIS-derived, may differ from deed acreage.',
    category: 'building',
  },
  {
    field: 'zoning',
    label: 'Zoning',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.zoning + zoning_description (municipal zoning code)',
    updateCadence: 'On create + each refresh',
    category: 'building',
  },
  {
    field: 'use_description',
    label: 'Land Use',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.usedesc + usecode (county land-use classification)',
    updateCadence: 'On create + each refresh',
    category: 'building',
  },
  // Ownership
  {
    field: 'owner',
    label: 'Owner of Record',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.owner — deed holder per the county roll',
    updateCadence: 'On create + each refresh; changes surface as lifecycle events',
    notes: 'Entity names are as-recorded (LLCs, trusts). Unrelated-name transfers are flagged for deed verification.',
    category: 'ownership',
  },
  {
    field: 'owner_mailing_address',
    label: 'Owner Mailing Address',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Regrid fields.mailadd + mail_city/mail_state2/mail_zip',
    updateCadence: 'On create + each refresh',
    category: 'ownership',
  },
  // Transaction
  {
    field: 'last_sale_price',
    label: 'Last Sale Price',
    dataType: 'currency',
    source: 'county-assessor',
    lineage: 'Regrid fields.saleprice (most recent recorded transaction)',
    updateCadence: 'On refresh; changes surface as lifecycle events',
    notes: 'Corroboration check expects a paired sale-date change; lone price changes may be corrections.',
    category: 'transaction',
  },
  {
    field: 'sale_date',
    label: 'Last Sale Date',
    dataType: 'date',
    source: 'county-assessor',
    lineage: 'Regrid fields.saledate',
    updateCadence: 'On refresh; changes surface as lifecycle events',
    category: 'transaction',
  },
  // User-entered
  {
    field: 'purchase_price',
    label: 'Purchase Price',
    dataType: 'currency',
    source: 'user-entered',
    lineage: 'Entered by portfolio editors in the property record',
    updateCadence: 'Manual',
    notes: 'Internal acquisition data — never overwritten by feed refreshes.',
    category: 'user',
  },
  {
    field: 'user_notes',
    label: 'Notes',
    dataType: 'string',
    source: 'user-entered',
    lineage: 'Entered by portfolio editors',
    updateCadence: 'Manual',
    category: 'user',
  },
  // Derived / governance
  {
    field: 'last_refresh_date',
    label: 'Last Verified',
    dataType: 'date',
    source: 'derived',
    lineage: 'Set by the platform on each successful county refresh',
    updateCadence: 'Each refresh',
    notes: 'Drives freshness classification: records unverified for 12+ months are flagged stale.',
    category: 'identity',
  },
  {
    field: 'property_data',
    label: 'Raw Vendor Record',
    dataType: 'string',
    source: 'county-assessor',
    lineage: 'Full normalized Regrid response retained verbatim for lineage and re-processing',
    updateCadence: 'Each refresh',
    notes: 'Source-of-truth payload behind all normalized county fields.',
    category: 'identity',
  },
]

export const CATEGORY_LABELS: Record<DataDictionaryEntry['category'], string> = {
  identity: 'Identity & Governance',
  location: 'Location',
  valuation: 'Valuation & Tax',
  building: 'Building & Land',
  ownership: 'Ownership',
  transaction: 'Transactions',
  user: 'User-Entered',
}
