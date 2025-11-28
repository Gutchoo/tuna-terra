import { z } from 'zod'
import { DatabaseService } from './db'
import { censusDataSchema, type CensusData } from './types/census'

const CENSUS_API_BASE = 'https://api.census.gov/data'
const DEFAULT_YEAR = 2023

// Census API variables for S1901 (Income and Poverty) table
const S1901_VARIABLES = {
  households: 'S1901_C01_001E',
  median_household_income: 'S1901_C01_012E', 
  mean_household_income: 'S1901_C01_013E',
}

// Census API variables for S0101 (Age and Sex) table
const S0101_VARIABLES = {
  total_population: 'S0101_C01_001E',
  median_age: 'S0101_C01_032E',
  // Age brackets
  '20_24': 'S0101_C01_006E',
  '25_29': 'S0101_C01_007E',
  '30_34': 'S0101_C01_008E',
  '35_39': 'S0101_C01_009E',
  '40_44': 'S0101_C01_010E',
  '45_49': 'S0101_C01_011E',
  '50_54': 'S0101_C01_012E',
  '55_59': 'S0101_C01_013E',
  '60_64': 'S0101_C01_014E',
  '65_69': 'S0101_C01_015E',
  '70_74': 'S0101_C01_016E',
  '75_79': 'S0101_C01_017E',
  '80_84': 'S0101_C01_018E',
  '85_plus': 'S0101_C01_019E',
}

// Census API variables for DP04 (Housing) table
const DP04_VARIABLES = {
  total_housing_units: 'DP04_0001E',
  owner_occupied_units: 'DP04_0046E',
  renter_occupied_units: 'DP04_0047E',
  median_rent: 'DP04_0134E',
  avg_household_size_owner: 'DP04_0048E',  // Fixed: was DP04_0089E
  avg_household_size_renter: 'DP04_0049E', // Fixed: was DP04_0090E
}

// Census API variables for S1501 (Education) table
const S1501_VARIABLES = {
  // Population counts by age group - FIXED variable codes
  pop_25_34: 'S1501_C01_016E',  // Fixed: was S1501_C01_008E
  pop_35_44: 'S1501_C01_019E',  // Fixed: was S1501_C01_011E
  pop_45_64: 'S1501_C01_022E',  // Fixed: was S1501_C01_014E
  // Percentage with bachelor's degree or higher by age group - FIXED variable codes
  pct_bachelor_plus_25_34: 'S1501_C02_018E',  // Fixed: was S1501_C02_009E
  pct_bachelor_plus_35_44: 'S1501_C02_021E',  // Fixed: was S1501_C02_012E
  pct_bachelor_plus_45_64: 'S1501_C02_024E',  // Fixed: was S1501_C02_015E
}

// Note: censusDataSchema and CensusData type now imported from ./types/census
// to break circular dependency between census.ts and db.ts

// Census API response structure (array format)
// interface CensusApiResponse {
//   0: string[] // Headers
//   1: string[] // Data row
// }

export class CensusService {
  private static apiKey = process.env.DATA_CENSUS_API_KEY

  private static validateApiKey() {
    if (!this.apiKey) {
      throw new Error('Census API key is not configured. Set DATA_CENSUS_API_KEY in your environment.')
    }
  }

  /**
   * Find place GEOID from the places table using city and state
   */
  static async findPlaceGeoid(city: string, state: string): Promise<string | null> {
    try {
      // Normalize city name for matching
      const normalizedCity = city.toLowerCase().trim()
      const normalizedState = state.toUpperCase().trim()
      
      // Query the places table for matching city and state
      const place = await DatabaseService.findPlaceByCity(normalizedCity, normalizedState)
      return place?.geoid || null
    } catch (error) {
      console.error('Error finding place GEOID:', error)
      return null
    }
  }

  /**
   * Fetch demographic data from Census.gov API for a specific place and year
   * Makes four API calls: S1901 (income), S0101 (population/age), DP04 (housing), S1501 (education)
   */
  static async fetchCensusData(geoid: string, year: number = DEFAULT_YEAR): Promise<CensusData | null> {
    this.validateApiKey()
    
    try {
      // Construct UCGID (Uniform Census Geographic Identifier) for place
      const ucgid = `1600000US${geoid}`
      
      console.log(`🔍 Fetching Census data for GEOID ${geoid} (${year})...`)

      // Fetch all data in parallel for better performance
      const [s1901Data, s0101Data, dp04Data, s1501Data] = await Promise.all([
        this.fetchS1901Data(ucgid, year),      // Income and households
        this.fetchS0101Data(ucgid, year),      // Population and age
        this.fetchDP04Data(ucgid, year),       // Housing characteristics
        this.fetchS1501Data(ucgid, year),      // Education statistics
      ])
      
      // If core data (S1901 or S0101) fails, return null
      // Housing and education data are optional - we'll continue if they fail
      if (!s1901Data || !s0101Data) {
        console.warn(`Failed to fetch core Census data for GEOID ${geoid}`)
        return null
      }

      // Merge data from all tables
      const censusData: CensusData = {
        geoid,
        year,
        // From S1901 (core data)
        households: s1901Data.households,
        median_income: s1901Data.median_income,
        mean_income: s1901Data.mean_income,
        // From S0101 (core data)
        population: s0101Data.population,
        median_age: s0101Data.median_age,
        age_brackets: s0101Data.age_brackets,
        // From DP04 (housing - optional)
        total_housing_units: dp04Data?.total_housing_units || null,
        owner_occupied_units: dp04Data?.owner_occupied_units || null,
        renter_occupied_units: dp04Data?.renter_occupied_units || null,
        median_rent: dp04Data?.median_rent || null,
        avg_household_size_owner: dp04Data?.avg_household_size_owner || null,
        avg_household_size_renter: dp04Data?.avg_household_size_renter || null,
        // From S1501 (education - optional)
        education_details: s1501Data || null,
        // Still not available - would need different table
        unemployment_rate: null,
      }

      console.log(`✅ Census data fetched for ${s1901Data.name || s0101Data.name}:`, censusData)
      return censusDataSchema.parse(censusData)

    } catch (error) {
      console.error(`Error fetching Census data for GEOID ${geoid}:`, error)
      return null
    }
  }

  /**
   * Fetch S1901 (Income and Poverty) data
   */
  private static async fetchS1901Data(ucgid: string, year: number): Promise<{
    households: number | null
    median_income: number | null
    mean_income: number | null
    name: string | null
  } | null> {
    try {
      const url = new URL(`${CENSUS_API_BASE}/${year}/acs/acs5/subject`)
      url.searchParams.set('get', `NAME,${Object.values(S1901_VARIABLES).join(',')}`)
      url.searchParams.set('ucgid', ucgid)
      url.searchParams.set('key', this.apiKey!)

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CRE-Portfolio-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`S1901 API Error (${response.status})`)
      }

      const data = await response.json() as string[][]
      if (!Array.isArray(data) || data.length < 2) {
        return null
      }

      const [headers, values] = data
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]))

      return {
        households: this.parseIntValue(record[S1901_VARIABLES.households]),
        median_income: this.parseIntValue(record[S1901_VARIABLES.median_household_income]),
        mean_income: this.parseIntValue(record[S1901_VARIABLES.mean_household_income]),
        name: record.NAME
      }
    } catch (error) {
      console.error('Error fetching S1901 data:', error)
      return null
    }
  }

  /**
   * Fetch S0101 (Age and Sex) data
   */
  private static async fetchS0101Data(ucgid: string, year: number): Promise<{
    population: number | null
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
    name: string | null
  } | null> {
    try {
      const url = new URL(`${CENSUS_API_BASE}/${year}/acs/acs5/subject`)
      url.searchParams.set('get', `NAME,${Object.values(S0101_VARIABLES).join(',')}`)
      url.searchParams.set('ucgid', ucgid)
      url.searchParams.set('key', this.apiKey!)

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CRE-Portfolio-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`S0101 API Error (${response.status})`)
      }

      const data = await response.json() as string[][]
      if (!Array.isArray(data) || data.length < 2) {
        return null
      }

      const [headers, values] = data
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]))

      // Parse age brackets
      const ageBrackets = {
        '20_24': this.parseIntValue(record[S0101_VARIABLES['20_24']]) || 0,
        '25_29': this.parseIntValue(record[S0101_VARIABLES['25_29']]) || 0,
        '30_34': this.parseIntValue(record[S0101_VARIABLES['30_34']]) || 0,
        '35_39': this.parseIntValue(record[S0101_VARIABLES['35_39']]) || 0,
        '40_44': this.parseIntValue(record[S0101_VARIABLES['40_44']]) || 0,
        '45_49': this.parseIntValue(record[S0101_VARIABLES['45_49']]) || 0,
        '50_54': this.parseIntValue(record[S0101_VARIABLES['50_54']]) || 0,
        '55_59': this.parseIntValue(record[S0101_VARIABLES['55_59']]) || 0,
        '60_64': this.parseIntValue(record[S0101_VARIABLES['60_64']]) || 0,
        '65_69': this.parseIntValue(record[S0101_VARIABLES['65_69']]) || 0,
        '70_74': this.parseIntValue(record[S0101_VARIABLES['70_74']]) || 0,
        '75_79': this.parseIntValue(record[S0101_VARIABLES['75_79']]) || 0,
        '80_84': this.parseIntValue(record[S0101_VARIABLES['80_84']]) || 0,
        '85_plus': this.parseIntValue(record[S0101_VARIABLES['85_plus']]) || 0,
      }

      return {
        population: this.parseIntValue(record[S0101_VARIABLES.total_population]),
        median_age: this.parseFloatValue(record[S0101_VARIABLES.median_age]),
        age_brackets: ageBrackets,
        name: record.NAME
      }
    } catch (error) {
      console.error('Error fetching S0101 data:', error)
      return null
    }
  }

  /**
   * Fetch DP04 (Housing) data
   */
  private static async fetchDP04Data(ucgid: string, year: number): Promise<{
    total_housing_units: number | null
    owner_occupied_units: number | null
    renter_occupied_units: number | null
    median_rent: number | null
    avg_household_size_owner: number | null
    avg_household_size_renter: number | null
    name: string | null
  } | null> {
    try {
      const url = new URL(`${CENSUS_API_BASE}/${year}/acs/acs5/profile`)
      url.searchParams.set('get', `NAME,${Object.values(DP04_VARIABLES).join(',')}`)
      url.searchParams.set('ucgid', ucgid)
      url.searchParams.set('key', this.apiKey!)

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CRE-Portfolio-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`DP04 API Error (${response.status})`)
      }

      const data = await response.json() as string[][]
      if (!Array.isArray(data) || data.length < 2) {
        return null
      }

      const [headers, values] = data
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]))

      return {
        total_housing_units: this.parseIntValue(record[DP04_VARIABLES.total_housing_units]),
        owner_occupied_units: this.parseIntValue(record[DP04_VARIABLES.owner_occupied_units]),
        renter_occupied_units: this.parseIntValue(record[DP04_VARIABLES.renter_occupied_units]),
        median_rent: this.parseIntValue(record[DP04_VARIABLES.median_rent]),
        avg_household_size_owner: this.parseFloatValue(record[DP04_VARIABLES.avg_household_size_owner]),
        avg_household_size_renter: this.parseFloatValue(record[DP04_VARIABLES.avg_household_size_renter]),
        name: record.NAME
      }
    } catch (error) {
      console.error('Error fetching DP04 data:', error)
      return null
    }
  }

  /**
   * Fetch S1501 (Education) data
   */
  private static async fetchS1501Data(ucgid: string, year: number): Promise<{
    pop_25_34: number
    pop_35_44: number
    pop_45_64: number
    pct_bachelor_plus_25_34: number
    pct_bachelor_plus_35_44: number
    pct_bachelor_plus_45_64: number
  } | null> {
    try {
      const url = new URL(`${CENSUS_API_BASE}/${year}/acs/acs5/subject`)
      url.searchParams.set('get', `NAME,${Object.values(S1501_VARIABLES).join(',')}`)
      url.searchParams.set('ucgid', ucgid)
      url.searchParams.set('key', this.apiKey!)

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CRE-Portfolio-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`S1501 API Error (${response.status})`)
      }

      const data = await response.json() as string[][]
      if (!Array.isArray(data) || data.length < 2) {
        return null
      }

      const [headers, values] = data
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]))

      // Parse education data - all values should default to 0 if parsing fails
      return {
        pop_25_34: this.parseIntValue(record[S1501_VARIABLES.pop_25_34]) || 0,
        pop_35_44: this.parseIntValue(record[S1501_VARIABLES.pop_35_44]) || 0,
        pop_45_64: this.parseIntValue(record[S1501_VARIABLES.pop_45_64]) || 0,
        pct_bachelor_plus_25_34: this.parseFloatValue(record[S1501_VARIABLES.pct_bachelor_plus_25_34]) || 0,
        pct_bachelor_plus_35_44: this.parseFloatValue(record[S1501_VARIABLES.pct_bachelor_plus_35_44]) || 0,
        pct_bachelor_plus_45_64: this.parseFloatValue(record[S1501_VARIABLES.pct_bachelor_plus_45_64]) || 0,
      }
    } catch (error) {
      console.error('Error fetching S1501 data:', error)
      return null
    }
  }

  /**
   * Cache Census data in the database
   */
  static async cacheCensusData(censusData: CensusData): Promise<void> {
    try {
      await DatabaseService.storeCensusData(censusData)
      console.log(`💾 Cached Census data for GEOID ${censusData.geoid} (${censusData.year})`)
    } catch (error) {
      console.error('Error caching Census data:', error)
      // Don't throw - caching failures shouldn't break the main flow
    }
  }

  /**
   * Get cached Census data or fetch from API if not available
   * This is the main entry point for getting Census data
   */
  static async getCachedOrFetchCensusData(
    city: string, 
    state: string, 
    year: number = DEFAULT_YEAR
  ): Promise<CensusData | null> {
    try {
      // Step 1: Find the place GEOID
      const geoid = await this.findPlaceGeoid(city, state)
      if (!geoid) {
        console.warn(`Place not found: ${city}, ${state}`)
        return null
      }

      // Step 2: Check cache first
      const cachedData = await DatabaseService.getCachedCensusData(geoid, year)
      if (cachedData) {
        // Check if cached data has new fields (housing and education)
        // If any are null/missing, we need to re-fetch to get complete data
        const hasNewFields = (
          cachedData.total_housing_units !== null && 
          cachedData.total_housing_units !== undefined &&
          cachedData.education_details !== null && 
          cachedData.education_details !== undefined
        )
        
        // Debug logging (temporary)
        console.log(`Debug: ${city}, ${state} - housing_units: ${cachedData.total_housing_units}, education: ${cachedData.education_details}, hasNewFields: ${hasNewFields}`)
        
        if (hasNewFields) {
          console.log(`📋 Using cached Census data for ${city}, ${state}`)
          return cachedData
        } else {
          console.log(`🔄 Cache incomplete - refreshing Census data for ${city}, ${state} (missing new fields)`)
          // Continue to fetch fresh data to update the cache
        }
      } else {
        console.log(`🔄 Cache miss - fetching Census data for ${city}, ${state}`)
      }

      // Step 3: Fetch from API if not cached or incomplete
      const freshData = await this.fetchCensusData(geoid, year)
      
      if (freshData) {
        // Step 4: Cache the fresh data
        await this.cacheCensusData(freshData)
        return freshData
      }

      return null
    } catch (error) {
      console.error(`Error getting Census data for ${city}, ${state}:`, error)
      return null
    }
  }

  /**
   * Parse Census API integer values, handling special null codes
   * Census uses specific codes for missing/invalid data:
   * -888888888 or -888888888.0 → missing (return null)
   * -999999999 → not applicable (return null)  
   * -333333333 → too few sample observations (return null)
   */
  private static parseIntValue(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null
    }

    try {
      const numValue = parseFloat(value)
      
      // Handle Census null codes
      if (numValue === -888888888 || 
          numValue === -888888888.0 || 
          numValue === -999999999 || 
          numValue === -333333333) {
        return null
      }

      return Math.round(numValue)
    } catch {
      return null
    }
  }

  /**
   * Parse Census API float values, handling special null codes
   * Similar to parseIntValue but preserves decimal places for values like median age
   */
  private static parseFloatValue(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null
    }

    try {
      const numValue = parseFloat(value)
      
      // Handle Census null codes
      if (numValue === -888888888 || 
          numValue === -888888888.0 || 
          numValue === -999999999 || 
          numValue === -333333333) {
        return null
      }

      return numValue
    } catch {
      return null
    }
  }

  /**
   * Get available years for Census data (helper method)
   */
  static getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear()
    const startYear = 2010 // ACS 5-year estimates start from 2009, but we'll use 2010
    const endYear = currentYear - 2 // Census data typically lags 2 years
    
    const years: number[] = []
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  /**
   * Validate city and state inputs
   */
  static validateLocation(city: string, state: string): { city: string; state: string } {
    const citySchema = z.string().min(1, 'City is required').trim()
    const stateSchema = z.string().min(2).max(2, 'State must be 2 characters').trim()

    return {
      city: citySchema.parse(city),
      state: stateSchema.parse(state).toUpperCase()
    }
  }
}

// Re-export types for backward compatibility
export { censusDataSchema, type CensusData } from './types/census'