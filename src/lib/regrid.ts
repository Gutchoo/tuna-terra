import { z } from 'zod'
import { readFileSync } from 'fs'
import { join } from 'path'
import { CensusService } from './census'

const REGRID_API_BASE = 'https://app.regrid.com/api/v2'

// Test APNs with cached data to avoid API costs during development
const TEST_APN_MAPPING: Record<string, string> = {
  '0254282260000': 'regrid-test-1.json', // Original test APN
  '50183176': 'regrid-test-2.json',
  '505090290': 'regrid-test-3.json', 
  '505210810': 'regrid-test-4.json',
  '0253204080000': 'regrid-test-5.json',
  '628081041': 'regrid-test-6.json'
}

const TEST_APNS = Object.keys(TEST_APN_MAPPING)

export interface RegridProperty {
  id: string
  apn: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  centroid: {
    lat: number
    lng: number
  }
  properties: {
    owner: string
    lot_size_sqft?: number
    building_sqft?: number
    year_built?: number
    zoning?: string
    property_type?: string
    assessed_value?: number
    [key: string]: string | number | undefined
  }
  // Enhanced with demographic data
  demographics?: {
    households?: number | null
    median_income?: number | null
    mean_income?: number | null
    population?: number | null
    unemployment_rate?: number | null
  } | null
}

export interface RegridSearchResult {
  id: string
  apn: string
  address: string
  city: string
  state: string
  zip: string
  score: number
  _fullFeature?: unknown // Include the full feature data from the API response
}

const addressSchema = z.object({
  address: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional()
})

export class RegridService {
  private static apiKey = process.env.REGRID_API_KEY

  private static async makeRequest(endpoint: string, params: Record<string, string | number> = {}) {
    if (!this.apiKey) {
      throw new Error('Regrid API key is not configured')
    }

    const url = new URL(`${REGRID_API_BASE}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(url.toString(), {
      headers: {
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Regrid API Error (${response.status}): ${error}`)
    }

    return response.json()
  }

  // Search by APN with optional location filtering - returns all matches for disambiguation
  static async searchByAPNWithAllResults(apn: string, state?: string, county?: string, city?: string): Promise<RegridProperty[]> {
    try {
      // Use cached test data for development testing
      if (TEST_APNS.includes(apn) && process.env.NODE_ENV === 'development') {
        console.log(`🧪 Using cached test data for APN: ${apn}`)

        try {
          const filename = TEST_APN_MAPPING[apn]
          const testDataPath = join(process.cwd(), 'src', 'lib', 'test-data', filename)
          const testData = JSON.parse(readFileSync(testDataPath, 'utf-8'))

          // Handle the same API response structure as live API
          const features = testData?.parcels?.features || []
          if (features.length > 0) {
            console.log(`✅ Loaded cached test data for APN: ${apn}`)
            // Return all results for disambiguation
            return await Promise.all(features.map((f: unknown) => this.normalizeProperty(f as { id?: string | number; properties?: { fields?: Record<string, unknown> }; fields?: Record<string, unknown>; geometry?: unknown })))
          }
        } catch (fileError) {
          console.warn(`⚠️  Could not load test data for APN ${apn}, falling back to API:`, fileError instanceof Error ? fileError.message : String(fileError))
          // Fall through to regular API call
        }
      }

      const params: Record<string, string> = {
        parcelnumb: apn,
        token: this.apiKey!
      }

      // Add path parameter to narrow down location if provided
      if (state) {
        let path = `/us/${state.toLowerCase()}`
        if (county) {
          path += `/${county.toLowerCase().replace(/\s+/g, '-')}`
          if (city) {
            path += `/${city.toLowerCase().replace(/\s+/g, '-')}`
          }
        }
        params.path = path
        console.log(`🎯 Using location filter: ${path}`)
      }

      const data = await this.makeRequest('/parcels/apn', params)

      // Handle the new API response structure: parcels.features[]
      const features = data?.parcels?.features || []
      if (features.length > 0) {
        console.log(`🎯 Found ${features.length} parcels with APN ${apn}`)
        // Log all results for debugging
        features.forEach((feature: unknown, index: number) => {
          const f = feature as { properties?: { fields?: Record<string, unknown> } }
          const fields = f.properties?.fields || {}
          console.log(`  ${index + 1}. ${fields.address || 'No address'}, ${fields.scity || 'Unknown city'}, ${fields.state2 || 'Unknown state'} - $${fields.parval || 'N/A'}`)
        })

        // Return all normalized properties for disambiguation
        return await Promise.all(features.map((f: unknown) => this.normalizeProperty(f as { id?: string | number; properties?: { fields?: Record<string, unknown> }; fields?: Record<string, unknown>; geometry?: unknown })))
      }
      return []
    } catch (error) {
      console.error('Error searching by APN:', error)
      console.error('APN:', apn, 'State:', state)
      throw error
    }
  }

  // Search by APN with optional location filtering - returns single result (for backward compatibility)
  static async searchByAPN(apn: string, state?: string, county?: string, city?: string): Promise<RegridProperty | null> {
    const results = await this.searchByAPNWithAllResults(apn, state, county, city)
    return results.length > 0 ? results[0] : null
  }

  // Search by APN with multiple results and custom tiebreaker
  static async searchByAPNWithTiebreaker(
    apn: string,
    options?: {
      state?: string
      county?: string
      city?: string
      preferredOwner?: string
      minAssessedValue?: number
      maxAssessedValue?: number
      preferredAddress?: string
    }
  ): Promise<RegridProperty[]> {
    try {
      const params: Record<string, string> = {
        parcelnumb: apn,
        token: this.apiKey!,
        limit: '50' // Get more results for better tiebreaking
      }

      // Add path parameter if location provided
      if (options?.state) {
        let path = `/us/${options.state.toLowerCase()}`
        if (options.county) {
          path += `/${options.county.toLowerCase().replace(/\s+/g, '-')}`
          if (options.city) {
            path += `/${options.city.toLowerCase().replace(/\s+/g, '-')}`
          }
        }
        params.path = path
      }

      const data = await this.makeRequest('/parcels/apn', params)
      const features = data?.parcels?.features || []

      if (features.length === 0) {
        return []
      }

      console.log(`🔍 Found ${features.length} parcels with APN ${apn}`)

      // Convert all features to RegridProperty objects
      const properties = await Promise.all(
        features.map(async (feature: unknown) => await this.normalizeProperty(feature as { id?: string | number; properties?: { fields?: Record<string, unknown> }; fields?: Record<string, unknown>; geometry?: unknown }))
      )

      // Apply tiebreaker logic
      let filteredProperties = properties

      // Filter by owner if specified
      if (options?.preferredOwner) {
        const ownerMatches = filteredProperties.filter(p =>
          p.properties.owner?.toLowerCase().includes(options.preferredOwner!.toLowerCase())
        )
        if (ownerMatches.length > 0) {
          filteredProperties = ownerMatches
        }
      }

      // Filter by assessed value range if specified
      if (options?.minAssessedValue || options?.maxAssessedValue) {
        filteredProperties = filteredProperties.filter(p => {
          const value = p.properties.assessed_value || 0
          const minOk = !options?.minAssessedValue || value >= options.minAssessedValue
          const maxOk = !options?.maxAssessedValue || value <= options.maxAssessedValue
          return minOk && maxOk
        })
      }

      // Filter by address if specified
      if (options?.preferredAddress) {
        const addressMatches = filteredProperties.filter(p =>
          p.address.line1?.toLowerCase().includes(options.preferredAddress!.toLowerCase())
        )
        if (addressMatches.length > 0) {
          filteredProperties = addressMatches
        }
      }

      // Sort by assessed value (highest first) as final tiebreaker
      filteredProperties.sort((a, b) =>
        (b.properties.assessed_value || 0) - (a.properties.assessed_value || 0)
      )

      // Log results for debugging
      filteredProperties.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.address.line1}, ${property.address.city}, ${property.address.state} - Owner: ${property.properties.owner} - $${property.properties.assessed_value?.toLocaleString() || 'N/A'}`)
      })

      return filteredProperties
    } catch (error) {
      console.error('Error in tiebreaker search:', error)
      throw error
    }
  }

  // Search by address with autocomplete suggestions
  static async searchByAddress(
    address: string,
    city?: string,
    state?: string,
    limit: number = 10
  ): Promise<RegridSearchResult[]> {
    try {
      // Use the address directly as it already contains full formatted address
      const params: Record<string, string> = { 
        query: address,
        token: this.apiKey!
      }

      // Use the correct endpoint for address search
      const data = await this.makeRequest('/parcels/address', params)
      
      // Handle the v2 API response structure: parcels.features[]
      const features = data?.parcels?.features || []
      return features.slice(0, limit).map((feature: {
        id?: string | number
        properties?: {
          fields?: {
            parcelnumb?: string
            address?: string
            scity?: string
            state2?: string
            szip5?: string
          }
        }
      }) => {
        const fields = feature.properties?.fields || {}
        return {
          id: String(feature.id || ''),
          apn: fields.parcelnumb || '',
          address: fields.address || '',
          city: fields.scity || '',
          state: fields.state2 || '',
          zip: fields.szip5 || '',
          score: 1.0, // Default score since address endpoint doesn't provide scores
          // Include raw feature data for full property details
          _fullFeature: feature
        }
      })
    } catch (error) {
      console.error('Error searching by address:', error)
      throw error
    }
  }

  // Get detailed property data by ID
  static async getPropertyById(id: string): Promise<RegridProperty | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Regrid API key not configured')
      }
      const params = { token: this.apiKey }
      const data = await this.makeRequest(`/parcels/${id}`, params)
      
      // Handle the v2 API response structure
      if (data.parcels?.features && data.parcels.features.length > 0) {
        return await this.normalizeProperty(data.parcels.features[0])
      }
      
      return null
    } catch (error) {
      console.error('Error getting property by ID:', error)
      throw error
    }
  }

  // Validate and format address
  static validateAddress(input: { address: string; city?: string; state?: string }) {
    return addressSchema.parse(input)
  }

  // Normalize property data from different Regrid response formats
  static async normalizeProperty(rawProperty: {
    id?: string | number
    properties?: { fields?: Record<string, unknown> }
    fields?: Record<string, unknown>
    geometry?: unknown
  }): Promise<RegridProperty> {
    // Handle v2 API format: data is in rawProperty.properties.fields
    const fields = rawProperty.properties?.fields || rawProperty.fields || rawProperty.properties || rawProperty as Record<string, unknown>
    const geometry = rawProperty.geometry

    // Extract city and state for census data lookup
    const city = String((fields as Record<string, unknown>).scity || (fields as Record<string, unknown>).city || '')
    const state = String((fields as Record<string, unknown>).state2 || (fields as Record<string, unknown>).state || '')

    // Fetch demographic data if city and state are available
    let demographics = null
    if (city && state) {
      try {
        console.log(`🔍 Fetching census data for ${city}, ${state}`)
        const censusData = await CensusService.getCachedOrFetchCensusData(city, state, 2023)
        if (censusData) {
          demographics = {
            households: censusData.households,
            median_income: censusData.median_income,
            mean_income: censusData.mean_income,
            population: censusData.population,
            unemployment_rate: censusData.unemployment_rate,
          }
          console.log(`✅ Census data attached for ${city}, ${state}`)
        }
      } catch (error) {
        console.warn(`⚠️  Failed to fetch census data for ${city}, ${state}:`, error)
        // Continue without demographics - don't break property creation
      }
    }

    return {
      id: String(rawProperty.id || (fields as Record<string, unknown>).id || ''),
      apn: String((fields as Record<string, unknown>).parcelnumb || (fields as Record<string, unknown>).apn || ''),
      address: {
        line1: String((fields as Record<string, unknown>).address || ''),
        line2: '',
        city: String((fields as Record<string, unknown>).scity || (fields as Record<string, unknown>).city || ''),
        state: String((fields as Record<string, unknown>).state2 || (fields as Record<string, unknown>).state || ''),
        zip: String((fields as Record<string, unknown>).szip5 || (fields as Record<string, unknown>).zip || '')
      },
      geometry: (geometry && Object.keys(geometry).length > 0 ? geometry : {
        type: 'Polygon',
        coordinates: [] as number[][][]
      }) as { type: 'Polygon'; coordinates: number[][][] },
      centroid: {
        lat: parseFloat(String((fields as Record<string, unknown>).lat || 0)) || 0,
        lng: parseFloat(String((fields as Record<string, unknown>).lon || 0)) || 0
      },
      properties: {
        owner: String((fields as Record<string, unknown>).owner || ''),
        lot_size_sqft: parseInt(String((fields as Record<string, unknown>).ll_gissqft || '')) || undefined,
        lot_acres: parseFloat(String((fields as Record<string, unknown>).ll_gisacre || '')) || undefined,
        building_sqft: parseInt(String((fields as Record<string, unknown>).building_sqft || '')) || undefined,
        year_built: parseInt(String((fields as Record<string, unknown>).yearbuilt || '')) || undefined,
        zoning: String((fields as Record<string, unknown>).zoning || ''),
        zoning_description: String((fields as Record<string, unknown>).zoning_description || ''),
        property_type: String((fields as Record<string, unknown>).property_type || ''),
        
        // Enhanced fields for database storage
        assessed_value: parseFloat(String((fields as Record<string, unknown>).parval || '')) || undefined, // Total parcel value
        improvement_value: parseFloat(String((fields as Record<string, unknown>).improvval || '')) || undefined,
        land_value: parseFloat(String((fields as Record<string, unknown>).landval || '')) || undefined,
        last_sale_price: parseFloat(String((fields as Record<string, unknown>).saleprice || '')) || undefined,
        sale_date: String((fields as Record<string, unknown>).saledate || ''),
        county: String((fields as Record<string, unknown>).county || ''),
        qoz_status: String((fields as Record<string, unknown>).qoz || ''), // Qualified Opportunity Zone
        
        // Extended property details
        use_code: String((fields as Record<string, unknown>).usecode || ''),
        use_description: String((fields as Record<string, unknown>).usedesc || ''),
        subdivision: String((fields as Record<string, unknown>).subdivision || ''),
        num_stories: parseInt(String((fields as Record<string, unknown>).numstories || '')) || undefined,
        num_units: parseInt(String((fields as Record<string, unknown>).numunits || '')) || undefined,
        num_rooms: parseInt(String((fields as Record<string, unknown>).numrooms || '')) || undefined,
        
        // Financial & tax data
        tax_year: String((fields as Record<string, unknown>).taxyear || ''),
        parcel_value_type: String((fields as Record<string, unknown>).parvaltype || ''),
        
        // Location data
        census_tract: String((fields as Record<string, unknown>).census_tract || ''),
        census_block: String((fields as Record<string, unknown>).census_block || ''),
        qoz_tract: String((fields as Record<string, unknown>).qoz_tract || ''),
        
        // Data freshness tracking
        last_refresh_date: String((fields as Record<string, unknown>).ll_last_refresh || ''),
        regrid_updated_at: String((fields as Record<string, unknown>).ll_updated_at || ''),
        
        // Owner mailing address
        owner_mailing_address: String((fields as Record<string, unknown>).mailadd || ''),
        owner_mail_city: String((fields as Record<string, unknown>).mail_city || ''),
        owner_mail_state: String((fields as Record<string, unknown>).mail_state2 || ''),
        owner_mail_zip: String((fields as Record<string, unknown>).mail_zip || ''),
        
        qualified_opportunity_zone: String((fields as Record<string, unknown>).qoz || ''),
        // Store all raw fields for future use
        ...(fields as Record<string, string | number | undefined>)
      },
      demographics
    }
  }

  // Batch search multiple APNs
  static async batchSearchByAPNs(apns: string[], state?: string): Promise<RegridProperty[]> {
    const results = await Promise.allSettled(
      apns.map(apn => this.searchByAPN(apn, state))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<RegridProperty> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }

  // Batch search multiple addresses  
  static async batchSearchByAddresses(
    addresses: { address: string; city?: string; state?: string }[]
  ): Promise<RegridProperty[]> {
    const results: RegridProperty[] = []

    for (const addr of addresses) {
      try {
        const searchResults = await this.searchByAddress(addr.address, addr.city, addr.state, 1)
        if (searchResults.length > 0) {
          const property = await this.getPropertyById(searchResults[0].id)
          if (property) results.push(property)
        }
      } catch (error) {
        console.error(`Error searching address ${addr.address}:`, error)
      }
    }

    return results
  }
}

// Install zod if not already installed
export { z }