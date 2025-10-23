import type { Property } from '@/lib/supabase'

/**
 * Sanitized property type for client responses
 * Removes raw property_data and Regrid metadata to prevent exposing internal API structures
 */
export type SanitizedProperty = Omit<Property,
  | 'property_data'
  | 'regrid_id'
  | 'regrid_updated_at'
  | 'last_refresh_date'
> & {
  // Keep only demographics if embedded in property_data for backward compatibility
  demographics?: {
    median_income: number | null
    mean_income: number | null
    households: number | null
    population: number | null
    unemployment_rate: number | null
    median_age: number | null
    age_brackets: {
      '20_24': number
      '25_29': number
      '30_34': number
      '35_39': number
      '40_44': number
      '45_49': number
      '50_54': number
      '55_59': number
      '60_64': number
      '65_69': number
      '70_74': number
      '75_79': number
      '80_84': number
      '85_plus': number
    } | null
    total_housing_units: number | null
    owner_occupied_units: number | null
    renter_occupied_units: number | null
    median_rent: number | null
    avg_household_size_owner: number | null
    avg_household_size_renter: number | null
    education_details: {
      pop_25_34: number
      pop_35_44: number
      pop_45_64: number
      pct_bachelor_plus_25_34: number
      pct_bachelor_plus_35_44: number
      pct_bachelor_plus_45_64: number
    } | null
  } | null
}

/**
 * Sanitize a single property for client response
 * Removes raw property_data and Regrid metadata to prevent exposing API provider
 * Preserves demographics data needed by the UI
 */
export function sanitizePropertyForClient(property: Property): SanitizedProperty {
  const {
    property_data,
    regrid_id,
    regrid_updated_at,
    last_refresh_date,
    ...safeFields
  } = property

  // Extract demographics if embedded in property_data
  let demographics = null
  if (property_data && typeof property_data === 'object' && 'demographics' in property_data) {
    const embeddedDemographics = property_data.demographics as Record<string, unknown>
    demographics = {
      median_income: (embeddedDemographics.median_income as number) ?? null,
      mean_income: (embeddedDemographics.mean_income as number) ?? null,
      households: (embeddedDemographics.households as number) ?? null,
      population: (embeddedDemographics.population as number) ?? null,
      unemployment_rate: (embeddedDemographics.unemployment_rate as number) ?? null,
      median_age: (embeddedDemographics.median_age as number) ?? null,
      age_brackets: (embeddedDemographics.age_brackets as SanitizedProperty['demographics']['age_brackets']) ?? null,
      total_housing_units: (embeddedDemographics.total_housing_units as number) ?? null,
      owner_occupied_units: (embeddedDemographics.owner_occupied_units as number) ?? null,
      renter_occupied_units: (embeddedDemographics.renter_occupied_units as number) ?? null,
      median_rent: (embeddedDemographics.median_rent as number) ?? null,
      avg_household_size_owner: (embeddedDemographics.avg_household_size_owner as number) ?? null,
      avg_household_size_renter: (embeddedDemographics.avg_household_size_renter as number) ?? null,
      education_details: (embeddedDemographics.education_details as SanitizedProperty['demographics']['education_details']) ?? null,
    }
  }

  return {
    ...safeFields,
    demographics
  }
}

/**
 * Sanitize an array of properties for client response
 * Batch version of sanitizePropertyForClient
 */
export function sanitizePropertiesForClient(properties: Property[]): SanitizedProperty[] {
  return properties.map(sanitizePropertyForClient)
}
