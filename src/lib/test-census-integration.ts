/**
 * Test script to verify Census integration with Regrid data
 * This file can be run manually to test the integration
 * Usage: npx tsx src/lib/test-census-integration.ts
 */
import { RegridService } from './regrid'
import { CensusService } from './census'
import { DatabaseService } from './db'

async function testCensusIntegration() {
  console.log('🧪 Testing Census Integration with Regrid Data\n')

  try {
    // Test 1: Direct Census service lookup
    console.log('=== Test 1: Direct Census Service ===')
    const testCity = 'COLTON' // From regrid-test-1.json
    const testState = 'CA'
    
    console.log(`Testing direct census lookup for ${testCity}, ${testState}...`)
    const censusData = await CensusService.getCachedOrFetchCensusData(testCity, testState)
    
    if (censusData) {
      console.log('✅ Census data retrieved:', {
        geoid: censusData.geoid,
        year: censusData.year,
        households: censusData.households,
        median_income: censusData.median_income,
        mean_income: censusData.mean_income
      })
    } else {
      console.log('❌ No census data found for', testCity, testState)
    }

    // Test 2: Integrated Regrid + Census lookup
    console.log('\n=== Test 2: Integrated Regrid + Census ===')
    const testAPN = '0254282260000' // From regrid-test-1.json (Colton, CA)
    
    console.log(`Testing integrated lookup for APN: ${testAPN}...`)
    const property = await RegridService.searchByAPN(testAPN)
    
    if (property) {
      console.log('✅ Property retrieved:', {
        id: property.id,
        apn: property.apn,
        city: property.address.city,
        state: property.address.state,
        address: property.address.line1
      })
      
      if (property.demographics) {
        console.log('✅ Demographics attached:', {
          households: property.demographics.households,
          median_income: property.demographics.median_income,
          mean_income: property.demographics.mean_income
        })
      } else {
        console.log('⚠️  No demographics data attached to property')
      }
    } else {
      console.log('❌ No property found for APN:', testAPN)
    }

    // Test 3: Database place lookup
    console.log('\n=== Test 3: Database Place Lookup ===')
    console.log(`Testing place lookup for ${testCity}, ${testState}...`)
    
    const place = await DatabaseService.findPlaceByCity(testCity.toLowerCase(), testState)
    if (place) {
      console.log('✅ Place found:', {
        geoid: place.geoid,
        name: place.name,
        state_abbr: place.state_abbr
      })
      
      // Test cached census data
      const cachedData = await DatabaseService.getCachedCensusData(place.geoid, 2023)
      if (cachedData) {
        console.log('✅ Cached census data found:', {
          households: cachedData.households,
          median_income: cachedData.median_income
        })
      } else {
        console.log('ℹ️  No cached census data (expected on first run)')
      }
    } else {
      console.log('❌ Place not found in database')
    }

    console.log('\n🎉 Census integration test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Export for programmatic use
export { testCensusIntegration }

// Run directly if this file is executed
if (require.main === module) {
  testCensusIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error)
      process.exit(1)
    })
}