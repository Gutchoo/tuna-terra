import type { PortfolioWithMembership, Property } from '@/lib/supabase'

// Virtual sample portfolio that appears for all users
export const VIRTUAL_SAMPLE_PORTFOLIO: PortfolioWithMembership = {
  id: 'sample-portfolio-virtual',
  name: 'Explore Sample Data',
  description: 'This sample portfolio showcases our comprehensive real estate platform capabilities. Create your own portfolios to start managing your property data with our advanced tools and features.',
  owner_id: 'virtual-sample-owner',
  is_default: false,
  is_sample: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  membership_role: 'viewer', // Users can only view, not edit
  member_count: 1,
  property_count: 1, // UC Berkeley sample property
}

// Virtual sample property - UC Berkeley from real Regrid API data
export const VIRTUAL_SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'sample-property-uc-berkeley',
    user_id: 'virtual-sample-owner',
    regrid_id: '14200',
    apn: '57-2042-4-10',
    address: '2594 HEARST AVE',
    city: 'BERKELEY',
    state: 'CA',
    zip_code: '94709',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.25515, 37.8760845],
          [-122.255121, 37.8758175],
          [-122.2551205, 37.8758125],
          [-122.2551015, 37.87565],
          [-122.2641485, 37.8745175],
          [-122.264251, 37.874466],
          [-122.264354, 37.874428],
          [-122.264434, 37.874354],
          [-122.26453, 37.87432],
          [-122.2646455, 37.8742815],
          [-122.266107, 37.8741055],
          [-122.2656195, 37.8697135],
          [-122.2656635, 37.869594],
          [-122.2660715, 37.868844],
          [-122.266069, 37.868734],
          [-122.2657665, 37.8680975],
          [-122.2657185, 37.868052],
          [-122.2656725, 37.8680155],
          [-122.265579, 37.868008],
          [-122.261644, 37.868507],
          [-122.261332, 37.868503],
          [-122.2602375, 37.868656],
          [-122.2602505, 37.8687015],
          [-122.2583835, 37.8689405],
          [-122.258382, 37.8688855],
          [-122.2524165, 37.8696665],
          [-122.2524725, 37.8699675],
          [-122.252608, 37.870359],
          [-122.252717, 37.870568],
          [-122.25278, 37.8708145],
          [-122.2527875, 37.8711345],
          [-122.25273, 37.871556],
          [-122.252476, 37.8715215],
          [-122.252503, 37.871258],
          [-122.252492, 37.871171],
          [-122.2524665, 37.8709565],
          [-122.2523875, 37.870699],
          [-122.252197, 37.8702745],
          [-122.252098, 37.869958],
          [-122.252048, 37.8696815],
          [-122.2520265, 37.869288],
          [-122.250835, 37.8694445],
          [-122.2508705, 37.8696355],
          [-122.250905, 37.869846],
          [-122.2504805, 37.869907],
          [-122.2504305, 37.869853],
          [-122.2504075, 37.869826],
          [-122.250391, 37.869792],
          [-122.250376, 37.869752],
          [-122.2503575, 37.869703],
          [-122.250354, 37.8696845],
          [-122.250333, 37.8696065],
          [-122.250308, 37.869504],
          [-122.249961, 37.8695495],
          [-122.2499095, 37.869569],
          [-122.2498705, 37.8696155],
          [-122.249833, 37.8700185],
          [-122.2498145, 37.8701795],
          [-122.249394, 37.8703475],
          [-122.249061, 37.8704125],
          [-122.2487865, 37.870602],
          [-122.2485555, 37.870722],
          [-122.248202, 37.870854],
          [-122.2477955, 37.8711045],
          [-122.2476635, 37.8711595],
          [-122.2476475, 37.871081],
          [-122.247565, 37.870663],
          [-122.2475235, 37.8704525],
          [-122.2469845, 37.8704275],
          [-122.2468195, 37.8704195],
          [-122.2464965, 37.870309],
          [-122.2464895, 37.870303],
          [-122.2464465, 37.870259],
          [-122.246426, 37.870239],
          [-122.246162, 37.8699855],
          [-122.24616, 37.869983],
          [-122.246128, 37.8699955],
          [-122.246091, 37.870007],
          [-122.246078, 37.870012],
          [-122.2460075, 37.869968],
          [-122.246, 37.8699295],
          [-122.2459975, 37.869916],
          [-122.245259, 37.869979],
          [-122.245199, 37.869984],
          [-122.245198, 37.869984],
          [-122.24571, 37.8745725],
          [-122.245879, 37.8760855],
          [-122.2464695, 37.8813745],
          [-122.246484, 37.8813725],
          [-122.247069, 37.8812975],
          [-122.247309, 37.8812665],
          [-122.247594, 37.88123],
          [-122.247884, 37.8811925],
          [-122.248126, 37.8811605],
          [-122.2483625, 37.8811305],
          [-122.2487685, 37.881079],
          [-122.249185, 37.8810245],
          [-122.2493235, 37.881011],
          [-122.249788, 37.8809435],
          [-122.2502545, 37.880886],
          [-122.250394, 37.880868],
          [-122.2507015, 37.880828],
          [-122.250866, 37.880807],
          [-122.251028, 37.880786],
          [-122.251189, 37.880765],
          [-122.2513355, 37.8807455],
          [-122.251503, 37.880724],
          [-122.251669, 37.880703],
          [-122.2518245, 37.8806825],
          [-122.252113, 37.8806455],
          [-122.2524565, 37.8806],
          [-122.2525035, 37.8805935],
          [-122.253051, 37.880523],
          [-122.2536245, 37.8804485],
          [-122.2551015, 37.8802555],
          [-122.255074, 37.879975],
          [-122.2550585, 37.8798265],
          [-122.255031, 37.879548],
          [-122.25501, 37.8793185],
          [-122.2549755, 37.8789715],
          [-122.2549415, 37.8786245],
          [-122.2554255, 37.8785645],
          [-122.255402, 37.878395],
          [-122.2553325, 37.8784035],
          [-122.255297, 37.8780605],
          [-122.2552685, 37.877787],
          [-122.255259, 37.87774],
          [-122.2553305, 37.877715],
          [-122.255323, 37.8776455],
          [-122.255313, 37.877552],
          [-122.255282, 37.8772695],
          [-122.255245, 37.876946],
          [-122.2552275, 37.876789],
          [-122.255194, 37.876489],
          [-122.25515, 37.8760845]
        ]
      ]
    },
    lat: 37.873888,
    lng: -122.254496,
    
    // Rich property data from Regrid API
    year_built: 1920,
    owner: 'REGENTS OF THE UNIVERSITY OF CALIFORNIA',
    last_sale_price: null,
    sale_date: null,
    county: 'alameda',
    qoz_status: 'No',
    improvement_value: 0,
    land_value: 0,
    assessed_value: 0,
    
    // Extended property details
    use_code: '0300',
    use_description: null,
    zoning: 'R-5H',
    zoning_description: 'High Density Residential And Hillside Overlay',
    num_stories: 0,
    num_units: 0,
    num_rooms: 0,
    subdivision: null,
    lot_size_acres: 407.0038,
    lot_size_sqft: 17729455,
    
    // Financial & tax data
    tax_year: null,
    parcel_value_type: 'ASSESSED',
    
    // Location data
    census_tract: '06001982100',
    census_block: '060019821001001',
    qoz_tract: null,
    
    // Data freshness tracking
    last_refresh_date: '2025-07-08',
    regrid_updated_at: '2025-08-11 08:46:12 -0400',
    
    // Owner mailing address
    owner_mailing_address: '1111 FRANKLIN ST',
    owner_mail_city: 'OAKLAND',
    owner_mail_state: 'CA',
    owner_mail_zip: '94607-5201',
    
    // Stored property data (full Regrid response for reference)
    property_data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.25515, 37.8760845],
            [-122.255121, 37.8758175],
            // Truncated for brevity - full coordinates available
            [-122.25515, 37.8760845]
          ]
        ]
      },
      properties: {
        headline: '2594 Hearst Ave',
        path: '/us/ca/alameda/berkeley/14200',
        fields: {
          ogc_fid: 14200,
          geoid: '06001',
          parcelnumb: '57-2042-4-10',
          parcelnumb_no_formatting: '572042410',
          alt_parcelnumb1: '057 204200410',
          usecode: '0300',
          zoning: 'R-5H',
          zoning_description: 'High Density Residential And Hillside Overlay',
          yearbuilt: 1920,
          parvaltype: 'ASSESSED',
          owner: 'REGENTS OF THE UNIVERSITY OF CALIFORNIA',
          mailadd: '1111 FRANKLIN ST',
          address: '2594 HEARST AVE',
          scity: 'BERKELEY',
          state2: 'CA',
          szip5: '94709',
          lat: '37.873888',
          lon: '-122.254496',
          qoz: 'No',
          census_tract: '06001982100',
          ll_gisacre: 407.0038,
          ll_gissqft: 17729455,
          ll_uuid: '177dc861-03a4-477f-bdf2-63dc4a338cb2'
        }
      }
    },
    
    // User fields
    user_notes: null,
    tags: null,
    insurance_provider: null,
    maintenance_history: null,
    is_sample: true,
    portfolio_id: 'sample-portfolio-virtual',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

// Check if a portfolio ID is the virtual sample portfolio
export function isVirtualSamplePortfolio(portfolioId: string): boolean {
  return portfolioId === VIRTUAL_SAMPLE_PORTFOLIO.id
}

// Get the virtual sample portfolio
export function getVirtualSamplePortfolio(): PortfolioWithMembership {
  return VIRTUAL_SAMPLE_PORTFOLIO
}

// Get the virtual sample properties
export function getVirtualSampleProperties(): Property[] {
  return VIRTUAL_SAMPLE_PROPERTIES
}

// Check if a property is a virtual sample property
export function isVirtualSampleProperty(propertyId: string): boolean {
  return propertyId.startsWith('sample-property-')
}