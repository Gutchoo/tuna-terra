#!/usr/bin/env tsx

import { RegridService } from '@/lib/regrid'
import fs from 'fs'
import path from 'path'

// Curated property data for demo experience
interface CuratedProperty {
  apn: string
  name: string
  description: string
  type: 'office' | 'tech' | 'entertainment' | 'industrial' | 'aviation'
  city: string
  state: string
}

const CURATED_PROPERTIES: CuratedProperty[] = [
  {
    apn: '1008350041',
    name: 'Empire State Building',
    description: 'The world\'s most famous office tower in the heart of Manhattan',
    type: 'office',
    city: 'New York',
    state: 'NY'
  },
  {
    apn: '3720009',
    name: 'Salesforce Tower',
    description: 'San Francisco\'s tallest skyscraper and tech industry landmark',
    type: 'office',
    city: 'San Francisco',
    state: 'CA'
  },
  {
    apn: '2443022009',
    name: 'Disney Headquarters',
    description: 'The Walt Disney Company\'s corporate headquarters in Burbank',
    type: 'entertainment',
    city: 'Burbank',
    state: 'CA'
  },
  {
    apn: '31606062',
    name: 'Apple Visitor Center',
    description: 'Apple Park\'s stunning visitor center showcasing innovation',
    type: 'tech',
    city: 'Cupertino',
    state: 'CA'
  },
  {
    apn: '17162160090000',
    name: 'Willis Tower',
    description: 'Chicago\'s iconic skyscraper, formerly known as Sears Tower',
    type: 'office',
    city: 'Chicago',
    state: 'IL'
  },
  {
    apn: '292257',
    name: 'Tesla Gigafactory',
    description: 'Tesla\'s massive electric vehicle and battery manufacturing facility',
    type: 'industrial',
    city: 'Austin',
    state: 'TX'
  },
  {
    apn: '1012830021',
    name: 'Chase Headquarters',
    description: 'JPMorgan Chase\'s corporate headquarters building',
    type: 'office',
    city: 'New York',
    state: 'NY'
  },
  {
    apn: '28041000100200',
    name: 'Boeing Everett Factory',
    description: 'The world\'s largest building by volume, manufacturing Boeing aircraft',
    type: 'aviation',
    city: 'Everett',
    state: 'WA'
  }
]

async function fetchPropertyData() {
  console.log('🚀 Starting to fetch Regrid data for curated demo properties...')

  const results: unknown[] = []
  let successCount = 0
  let errorCount = 0

  for (const property of CURATED_PROPERTIES) {
    console.log(`\n📍 Fetching data for ${property.name} (APN: ${property.apn})`)

    try {
      const regridData = await RegridService.searchByAPN(property.apn, property.state)

      if (regridData) {
        console.log(`✅ Successfully fetched data for ${property.name}`)
        console.log(`   Address: ${regridData.address.line1}, ${regridData.address.city}, ${regridData.address.state}`)
        console.log(`   Owner: ${regridData.properties.owner}`)
        console.log(`   Assessed Value: $${regridData.properties.assessed_value?.toLocaleString() || 'N/A'}`)

        // Add our curated metadata to the result
        const enrichedProperty = {
          ...regridData,
          curatedMetadata: {
            name: property.name,
            description: property.description,
            type: property.type
          }
        }

        results.push(enrichedProperty)
        successCount++
      } else {
        console.log(`❌ No data found for ${property.name}`)
        errorCount++
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Error fetching ${property.name}:`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Successful: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log(`   Total: ${CURATED_PROPERTIES.length}`)

  if (results.length > 0) {
    // Save the results to a JSON file
    const outputPath = path.join(process.cwd(), 'src', 'data', 'curated-demo-properties-raw.json')

    // Ensure the data directory exists
    const dataDir = path.dirname(outputPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`\n💾 Raw data saved to: ${outputPath}`)

    // Also create a TypeScript version
    await createTypeScriptFile(results)
  } else {
    console.log('\n❌ No data to save - all requests failed')
  }
}

// Define type for the property structure we expect from Regrid
interface RegridPropertyData {
  id?: string
  apn?: string
  address?: { line1?: string; city?: string; state?: string; zip?: string }
  owner?: { name?: string }
  assessment?: { value?: number; year?: string; land?: number; improvement?: number }
  sale?: { amount?: number; date?: string }
  geo?: { county?: string }
  zoning?: { code?: string; description?: string }
  building?: { yearBuilt?: number; stories?: number; units?: number; rooms?: number; area?: number }
  land?: { acres?: number; sqft?: number }
  parcel?: { apn?: string; subdivision?: string }
  financial?: { taxYear?: string; valueType?: string }
  location?: { censusTract?: string; censusBlock?: string; qozTract?: string }
  geometry?: unknown
  centroid?: { lat?: number; lng?: number }
  properties?: Record<string, unknown>
  curatedMetadata?: {
    name?: string
    companyName?: string
    marketValue?: string
    category?: string
    description?: string
    type?: string
  }
}

async function createTypeScriptFile(properties: unknown[]) {
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'curated-demo-properties.ts')

  let tsContent = `// Auto-generated curated demo properties from Regrid API
// Generated on: ${new Date().toISOString()}

import type { Property } from '@/lib/supabase'

export interface CuratedDemoProperty extends Omit<Property, 'id' | 'user_id' | 'portfolio_id' | 'created_at' | 'updated_at'> {
  curatedMetadata: {
    name: string
    description: string
    type: 'office' | 'tech' | 'entertainment' | 'industrial' | 'aviation'
  }
}

export const CURATED_DEMO_PROPERTIES: CuratedDemoProperty[] = [
`

  properties.forEach((property, index) => {
    const p = property as RegridPropertyData
    const metadata = p.curatedMetadata

    // Convert the property to match our Property interface structure
    const propertyData = {
      // Basic identifiers (will be overwritten when added to demo)
      regrid_id: p.id || '',
      apn: p.apn || '',
      address: p.address?.line1 || '',
      city: p.address?.city || '',
      state: p.address?.state || '',
      zip_code: p.address?.zip || '',

      // Geometry and location
      geometry: p.geometry || null,
      lat: p.centroid?.lat || null,
      lng: p.centroid?.lng || null,

      // Property details from Regrid
      year_built: p.properties?.year_built || null,
      owner: p.properties?.owner || '',
      last_sale_price: p.properties?.last_sale_price || null,
      sale_date: p.properties?.sale_date || null,
      county: p.properties?.county || '',
      qoz_status: p.properties?.qoz_status || 'No',
      improvement_value: p.properties?.improvement_value || null,
      land_value: p.properties?.land_value || null,
      assessed_value: p.properties?.assessed_value || null,

      // Extended property details
      use_code: p.properties?.use_code || null,
      use_description: p.properties?.use_description || null,
      zoning: p.properties?.zoning || null,
      zoning_description: p.properties?.zoning_description || null,
      num_stories: p.properties?.num_stories || null,
      num_units: p.properties?.num_units || null,
      num_rooms: p.properties?.num_rooms || null,
      subdivision: p.properties?.subdivision || null,
      lot_size_acres: p.properties?.lot_acres || null,
      lot_size_sqft: p.properties?.lot_size_sqft || null,

      // Financial & tax data
      tax_year: p.properties?.tax_year || null,
      parcel_value_type: p.properties?.parcel_value_type || null,

      // Location data
      census_tract: p.properties?.census_tract || null,
      census_block: p.properties?.census_block || null,
      qoz_tract: p.properties?.qoz_tract || null,

      // Data freshness tracking
      last_refresh_date: p.properties?.last_refresh_date || null,
      regrid_updated_at: p.properties?.regrid_updated_at || null,

      // Owner mailing address
      owner_mailing_address: p.properties?.owner_mailing_address || null,
      owner_mail_city: p.properties?.owner_mail_city || null,
      owner_mail_state: p.properties?.owner_mail_state || null,
      owner_mail_zip: p.properties?.owner_mail_zip || null,

      // User fields (will be overwritten)
      user_notes: null,
      tags: null,
      insurance_provider: null,
      maintenance_history: null,
      is_sample: false, // These will be demo properties, not sample

      // Store full property data for reference
      property_data: property,

      // Curated metadata
      curatedMetadata: metadata
    }

    tsContent += `  {
    // Curated metadata
    curatedMetadata: {
      name: '${metadata?.name?.replace(/'/g, "\\'") || ''}',
      description: '${metadata?.description?.replace(/'/g, "\\'") || ''}',
      type: '${metadata?.type || ''}'
    },

    // Basic identifiers
    regrid_id: '${propertyData.regrid_id}',
    apn: '${propertyData.apn}',
    address: '${propertyData.address}',
    city: '${propertyData.city}',
    state: '${propertyData.state}',
    zip_code: '${propertyData.zip_code}',

    // Geometry and location
    geometry: ${JSON.stringify(propertyData.geometry, null, 6)},
    lat: ${propertyData.lat},
    lng: ${propertyData.lng},

    // Property details
    year_built: ${propertyData.year_built},
    owner: '${String(propertyData.owner || '').replace(/'/g, "\\'")}',
    last_sale_price: ${propertyData.last_sale_price},
    sale_date: ${propertyData.sale_date ? `'${propertyData.sale_date}'` : 'null'},
    county: '${propertyData.county}',
    qoz_status: '${propertyData.qoz_status}',
    improvement_value: ${propertyData.improvement_value},
    land_value: ${propertyData.land_value},
    assessed_value: ${propertyData.assessed_value},

    // Extended details
    use_code: ${propertyData.use_code ? `'${propertyData.use_code}'` : 'null'},
    use_description: ${propertyData.use_description ? `'${String(propertyData.use_description).replace(/'/g, "\\'")}'` : 'null'},
    zoning: ${propertyData.zoning ? `'${propertyData.zoning}'` : 'null'},
    zoning_description: ${propertyData.zoning_description ? `'${String(propertyData.zoning_description).replace(/'/g, "\\'")}'` : 'null'},
    num_stories: ${propertyData.num_stories},
    num_units: ${propertyData.num_units},
    num_rooms: ${propertyData.num_rooms},
    subdivision: ${propertyData.subdivision ? `'${propertyData.subdivision}'` : 'null'},
    lot_size_acres: ${propertyData.lot_size_acres},
    lot_size_sqft: ${propertyData.lot_size_sqft},

    // Financial & tax data
    tax_year: ${propertyData.tax_year ? `'${propertyData.tax_year}'` : 'null'},
    parcel_value_type: ${propertyData.parcel_value_type ? `'${propertyData.parcel_value_type}'` : 'null'},

    // Location data
    census_tract: ${propertyData.census_tract ? `'${propertyData.census_tract}'` : 'null'},
    census_block: ${propertyData.census_block ? `'${propertyData.census_block}'` : 'null'},
    qoz_tract: ${propertyData.qoz_tract ? `'${propertyData.qoz_tract}'` : 'null'},

    // Data freshness
    last_refresh_date: ${propertyData.last_refresh_date ? `'${propertyData.last_refresh_date}'` : 'null'},
    regrid_updated_at: ${propertyData.regrid_updated_at ? `'${propertyData.regrid_updated_at}'` : 'null'},

    // Owner mailing
    owner_mailing_address: ${propertyData.owner_mailing_address ? `'${String(propertyData.owner_mailing_address).replace(/'/g, "\\'")}'` : 'null'},
    owner_mail_city: ${propertyData.owner_mail_city ? `'${propertyData.owner_mail_city}'` : 'null'},
    owner_mail_state: ${propertyData.owner_mail_state ? `'${propertyData.owner_mail_state}'` : 'null'},
    owner_mail_zip: ${propertyData.owner_mail_zip ? `'${propertyData.owner_mail_zip}'` : 'null'},

    // User fields
    user_notes: null,
    tags: null,
    insurance_provider: null,
    maintenance_history: null,
    is_sample: false,

    // Store full property data
    property_data: ${JSON.stringify(propertyData.property_data, null, 6)}
  }`

    if (index < properties.length - 1) {
      tsContent += ',\n'
    }
  })

  tsContent += `
]

// Helper functions
export function getCuratedDemoProperty(apn: string): CuratedDemoProperty | undefined {
  return CURATED_DEMO_PROPERTIES.find(property => property.apn === apn)
}

export function getCuratedDemoPropertiesByType(type: CuratedDemoProperty['curatedMetadata']['type']): CuratedDemoProperty[] {
  return CURATED_DEMO_PROPERTIES.filter(property => property.curatedMetadata.type === type)
}
`

  fs.writeFileSync(outputPath, tsContent)
  console.log(`\n📝 TypeScript file created: ${outputPath}`)
}

// Run the script
if (require.main === module) {
  fetchPropertyData().catch(console.error)
}

export { fetchPropertyData }