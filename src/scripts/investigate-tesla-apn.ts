#!/usr/bin/env tsx

import { RegridService } from '@/lib/regrid'

interface RegridProperty {
  address: {
    line1?: string
    city: string
    state: string
    zip: string
  }
  properties: {
    owner: string
    assessed_value?: number
    lot_size_sqft?: number
    use_description?: string
  }
}

async function investigateTeslaAPN() {
  console.log('🔍 Investigating Tesla Gigafactory APN: 292257\n')

  try {
    // Search without location filter (what we got before)
    console.log('1. Searching without location filter...')
    const allResults = await RegridService.searchByAPNWithTiebreaker('292257')

    if (allResults.length > 0) {
      console.log(`Found ${allResults.length} total parcels:\n`)
      allResults.forEach((property: RegridProperty, index: number) => {
        console.log(`${index + 1}. ${property.address.line1 || 'No address'}`)
        console.log(`   ${property.address.city}, ${property.address.state} ${property.address.zip}`)
        console.log(`   Owner: ${property.properties.owner}`)
        console.log(`   Assessed Value: $${property.properties.assessed_value?.toLocaleString() || 'N/A'}`)
        console.log(`   Lot Size: ${property.properties.lot_size_sqft?.toLocaleString() || 'N/A'} sqft`)
        console.log('')
      })
    }

    // Search with Texas location filter
    console.log('\n2. Searching with Texas location filter...')
    const texasResults = await RegridService.searchByAPNWithTiebreaker('292257', {
      state: 'TX'
    })

    if (texasResults.length > 0) {
      console.log(`Found ${texasResults.length} Texas parcels:\n`)
      texasResults.forEach((property: RegridProperty, index: number) => {
        console.log(`${index + 1}. ${property.address.line1 || 'No address'}`)
        console.log(`   ${property.address.city}, ${property.address.state} ${property.address.zip}`)
        console.log(`   Owner: ${property.properties.owner}`)
        console.log(`   Assessed Value: $${property.properties.assessed_value?.toLocaleString() || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('No results found in Texas')
    }

    // Search with Tesla-specific tiebreakers
    console.log('\n3. Searching with Tesla-specific tiebreakers...')
    const teslaResults = await RegridService.searchByAPNWithTiebreaker('292257', {
      state: 'TX',
      preferredOwner: 'tesla',
      minAssessedValue: 1000000 // At least $1M for a gigafactory
    })

    if (teslaResults.length > 0) {
      console.log(`Found ${teslaResults.length} Tesla-like parcels:\n`)
      teslaResults.forEach((property: RegridProperty, index: number) => {
        console.log(`${index + 1}. ${property.address.line1 || 'No address'}`)
        console.log(`   ${property.address.city}, ${property.address.state} ${property.address.zip}`)
        console.log(`   Owner: ${property.properties.owner}`)
        console.log(`   Assessed Value: $${property.properties.assessed_value?.toLocaleString() || 'N/A'}`)
        console.log(`   Use Description: ${property.properties.use_description || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('No Tesla-specific results found')
    }

    // Try specific Austin/Travis county search
    console.log('\n4. Searching in Austin/Travis County specifically...')
    const austinResults = await RegridService.searchByAPNWithTiebreaker('292257', {
      state: 'TX',
      city: 'austin'
    })

    if (austinResults.length > 0) {
      console.log(`Found ${austinResults.length} Austin parcels:\n`)
      austinResults.forEach((property: RegridProperty, index: number) => {
        console.log(`${index + 1}. ${property.address.line1 || 'No address'}`)
        console.log(`   ${property.address.city}, ${property.address.state} ${property.address.zip}`)
        console.log(`   Owner: ${property.properties.owner}`)
        console.log(`   Assessed Value: $${property.properties.assessed_value?.toLocaleString() || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('No results found in Austin')
    }

  } catch (error) {
    console.error('Error during investigation:', error)
  }
}

// Run the investigation
if (require.main === module) {
  investigateTeslaAPN().catch(console.error)
}

export { investigateTeslaAPN }