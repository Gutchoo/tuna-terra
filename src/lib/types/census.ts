import { z } from 'zod'

/**
 * Census data type definitions
 * Extracted to break circular dependency between census.ts and db.ts
 */

// Census data schema for validation
export const censusDataSchema = z.object({
  geoid: z.string(),
  year: z.number(),
  households: z.number().nullable(),
  median_income: z.number().nullable(),
  mean_income: z.number().nullable(),
  population: z.number().nullable(),
  unemployment_rate: z.number().nullable(),
  median_age: z.number().nullable(),
  age_brackets: z.object({
    '20_24': z.number(),
    '25_29': z.number(),
    '30_34': z.number(),
    '35_39': z.number(),
    '40_44': z.number(),
    '45_49': z.number(),
    '50_54': z.number(),
    '55_59': z.number(),
    '60_64': z.number(),
    '65_69': z.number(),
    '70_74': z.number(),
    '75_79': z.number(),
    '80_84': z.number(),
    '85_plus': z.number(),
  }).nullable(),
  // Housing characteristics from DP04
  total_housing_units: z.number().nullable(),
  owner_occupied_units: z.number().nullable(),
  renter_occupied_units: z.number().nullable(),
  median_rent: z.number().nullable(),
  avg_household_size_owner: z.number().nullable(),
  avg_household_size_renter: z.number().nullable(),
  // Education characteristics from S1501
  education_details: z.object({
    pop_25_34: z.number(),
    pop_35_44: z.number(),
    pop_45_64: z.number(),
    pct_bachelor_plus_25_34: z.number(),
    pct_bachelor_plus_35_44: z.number(),
    pct_bachelor_plus_45_64: z.number(),
  }).nullable(),
})

export type CensusData = z.infer<typeof censusDataSchema>
