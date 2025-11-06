// Auto-generated curated demo properties from Regrid API
// Generated on: 2025-09-23T04:26:54.226Z

import type { Property } from '@/lib/supabase'

export interface CuratedDemoProperty extends Omit<Property, 'id' | 'user_id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'purchase_price' | 'purchase_date' | 'management_company' | 'mortgage_amount' | 'user_notes' | 'tags' | 'insurance_provider' | 'maintenance_history' | 'lender_name' | 'loan_rate' | 'loan_maturity_date'> {
  curatedMetadata: {
    name: string
    description: string
    type: 'office' | 'tech' | 'entertainment' | 'industrial' | 'aviation'
  }
}

export const CURATED_DEMO_PROPERTIES: CuratedDemoProperty[] = [
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Empire State Building',
      description: 'The world\'s most famous office tower in the heart of Manhattan',
      type: 'office'
    },

    // Basic identifiers
    regrid_id: '401173',
    apn: '1008350041',
    address: '338 5 AVENUE',
    city: 'NEW YORK',
    state: 'NY',
    zip_code: '10118',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -73.9863305,
                        40.748717
                  ],
                  [
                        -73.9865545,
                        40.7488105
                  ],
                  [
                        -73.986732,
                        40.748566
                  ],
                  [
                        -73.985141,
                        40.7479025
                  ],
                  [
                        -73.984778,
                        40.7484025
                  ],
                  [
                        -73.986145,
                        40.7489725
                  ],
                  [
                        -73.9863305,
                        40.748717
                  ]
            ]
      ]
},
    lat: 40.748453,
    lng: -73.985709,

    // Property details
    year_built: 1931,
    owner: 'ESRT EMPIRE STATE BUILDING, L.L.C.',
    last_sale_price: 49739616,
    sale_date: '2019-04-03',
    county: 'new-york',
    qoz_status: 'No',
    improvement_value: null,
    land_value: 220000000,
    assessed_value: 1074685000,

    // Extended details
    use_code: '05',
    use_description: null,
    zoning: 'C6-4.5',
    zoning_description: 'General Central Commercial',
    num_stories: 102,
    num_units: 513,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 2.22732,
    lot_size_sqft: 97024,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'MARKET',

    // Location data
    census_tract: '36061007600',
    census_block: '360610076001001',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2025-04-29',
    regrid_updated_at: '2025-09-15 15:15:28 -0400',

    // Owner mailing
    owner_mailing_address: '111 WEST 33RD STREET 12T',
    owner_mail_city: 'NEW YORK',
    owner_mail_state: 'NY',
    owner_mail_zip: '10120',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "401173",
      "apn": "1008350041",
      "address": {
            "line1": "338 5 AVENUE",
            "line2": "",
            "city": "NEW YORK",
            "state": "NY",
            "zip": "10118"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -73.9863305,
                              40.748717
                        ],
                        [
                              -73.9865545,
                              40.7488105
                        ],
                        [
                              -73.986732,
                              40.748566
                        ],
                        [
                              -73.985141,
                              40.7479025
                        ],
                        [
                              -73.984778,
                              40.7484025
                        ],
                        [
                              -73.986145,
                              40.7489725
                        ],
                        [
                              -73.9863305,
                              40.748717
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 40.748453,
            "lng": -73.985709
      },
      "properties": {
            "owner": "ESRT EMPIRE STATE BUILDING, L.L.C.",
            "lot_size_sqft": 97024,
            "lot_acres": 2.22732,
            "year_built": 1931,
            "zoning": "C6-4.5",
            "zoning_description": "General Central Commercial",
            "property_type": "",
            "assessed_value": 1074685000,
            "land_value": 220000000,
            "last_sale_price": 49739616,
            "sale_date": "2019-04-03",
            "county": "new-york",
            "qoz_status": "No",
            "use_code": "05",
            "use_description": "",
            "subdivision": "",
            "num_stories": 102,
            "num_units": 513,
            "tax_year": "2025",
            "parcel_value_type": "MARKET",
            "census_tract": "36061007600",
            "census_block": "360610076001001",
            "qoz_tract": "",
            "last_refresh_date": "2025-04-29",
            "regrid_updated_at": "2025-09-15 15:15:28 -0400",
            "owner_mailing_address": "111 WEST 33RD STREET 12T",
            "owner_mail_city": "NEW YORK",
            "owner_mail_state": "NY",
            "owner_mail_zip": "10120",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 401173,
            "geoid": "36061",
            "parcelnumb": "1008350041",
            "parcelnumb_no_formatting": "1008350041",
            "usecode": "05",
            "structno": 1,
            "yearbuilt": 1931,
            "numstories": 102,
            "numunits": 513,
            "parvaltype": "MARKET",
            "landval": 220000000,
            "parval": 1074685000,
            "saleprice": 49739616,
            "saledate": "2019-04-03",
            "taxyear": "2025",
            "owntype": "P",
            "mailadd": "111 WEST 33RD STREET 12T",
            "careof": "ESRT EMPIRE STATE BUILDING LL",
            "mail_city": "NEW YORK",
            "mail_state2": "NY",
            "mail_zip": "10120",
            "original_mailing_address": "{\"mailadd\":\"111 WEST 33RD STREET 12T\",\"mail_city\":\"NEW YORK\",\"mail_state2\":\"NY\",\"mail_zip\":\"10120\"}",
            "address": "338 5 AVENUE",
            "saddno": "338",
            "saddstr": "5",
            "saddsttyp": "AVENUE",
            "scity": "NEW YORK",
            "original_address": "{\"address\":\"338 5 AVENUE\",\"saddno\":\"338\",\"saddstr\":\"5 AVENUE\",\"scity\":\"NEW YORK\",\"szip\":\"10118\"}",
            "city": "manhattan",
            "state2": "NY",
            "szip": "10118",
            "szip5": "10118",
            "address_source": "county",
            "block": "835",
            "lot": "41",
            "lat": "40.748453",
            "lon": "-73.985709",
            "qoz": "No",
            "census_blockgroup": "360610076001",
            "census_zcta": "10001",
            "ll_last_refresh": "2025-04-29",
            "sqft": 91351,
            "ll_gisacre": 2.22732,
            "ll_gissqft": 97024,
            "path": "/us/ny/new-york/manhattan/401173",
            "ll_stable_id": "geometry",
            "ll_uuid": "64330692-0619-4943-b8d5-1fb0a699bf7a",
            "ll_updated_at": "2025-09-15 15:15:28 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Empire State Building",
            "description": "The world's most famous office tower in the heart of Manhattan",
            "type": "office"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Salesforce Tower',
      description: 'San Francisco\'s tallest skyscraper and tech industry landmark',
      type: 'office'
    },

    // Basic identifiers
    regrid_id: '136644',
    apn: '3720009',
    address: '415 MISSION ST',
    city: 'SAN FRANCISCO',
    state: 'CA',
    zip_code: '94105',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -122.39736,
                        37.789769
                  ],
                  [
                        -122.396913,
                        37.789411
                  ],
                  [
                        -122.396241,
                        37.789942
                  ],
                  [
                        -122.3966885,
                        37.7902995
                  ],
                  [
                        -122.39736,
                        37.789769
                  ]
            ]
      ]
},
    lat: 37.789855,
    lng: -122.396801,

    // Property details
    year_built: 2018,
    owner: 'TRANSBAY TOWER LLC',
    last_sale_price: 191816197,
    sale_date: '2013-03-26',
    county: 'san-francisco',
    qoz_status: 'No',
    improvement_value: 1680242604,
    land_value: 231576507,
    assessed_value: 1913672794,

    // Extended details
    use_code: null,
    use_description: null,
    zoning: 'C-3-O(SD -1000-S-2',
    zoning_description: 'Commercial Downtown Office Special Development',
    num_stories: 63,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 1.15316,
    lot_size_sqft: 50233,

    // Financial & tax data
    tax_year: '2024',
    parcel_value_type: 'ASSESSED',

    // Location data
    census_tract: '06075061501',
    census_block: '060750615011004',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2024-09-24',
    regrid_updated_at: '2025-09-15 14:23:07 -0400',

    // Owner mailing
    owner_mailing_address: '4 EMBARCADERO LBBY LVL 1',
    owner_mail_city: 'SAN FRANCISCO',
    owner_mail_state: 'CA',
    owner_mail_zip: '94111',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "136644",
      "apn": "3720009",
      "address": {
            "line1": "415 MISSION ST",
            "line2": "",
            "city": "SAN FRANCISCO",
            "state": "CA",
            "zip": "94105"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -122.39736,
                              37.789769
                        ],
                        [
                              -122.396913,
                              37.789411
                        ],
                        [
                              -122.396241,
                              37.789942
                        ],
                        [
                              -122.3966885,
                              37.7902995
                        ],
                        [
                              -122.39736,
                              37.789769
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 37.789855,
            "lng": -122.396801
      },
      "properties": {
            "owner": "TRANSBAY TOWER LLC",
            "lot_size_sqft": 50233,
            "lot_acres": 1.15316,
            "year_built": 2018,
            "zoning": "C-3-O(SD -1000-S-2",
            "zoning_description": "Commercial Downtown Office Special Development",
            "property_type": "",
            "assessed_value": 1913672794,
            "improvement_value": 1680242604,
            "land_value": 231576507,
            "last_sale_price": 191816197,
            "sale_date": "2013-03-26",
            "county": "san-francisco",
            "qoz_status": "No",
            "use_code": "",
            "use_description": "",
            "subdivision": "",
            "num_stories": 63,
            "tax_year": "2024",
            "parcel_value_type": "ASSESSED",
            "census_tract": "06075061501",
            "census_block": "060750615011004",
            "qoz_tract": "",
            "last_refresh_date": "2024-09-24",
            "regrid_updated_at": "2025-09-15 14:23:07 -0400",
            "owner_mailing_address": "4 EMBARCADERO LBBY LVL 1",
            "owner_mail_city": "SAN FRANCISCO",
            "owner_mail_state": "CA",
            "owner_mail_zip": "94111",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 136644,
            "geoid": "06075",
            "parcelnumb": "3720009",
            "parcelnumb_no_formatting": "3720009",
            "alt_parcelnumb1": "3720009",
            "yearbuilt": 2018,
            "numstories": 63,
            "numunits": 0,
            "numrooms": 0,
            "parvaltype": "ASSESSED",
            "improvval": 1680242604,
            "landval": 231576507,
            "parval": 1913672794,
            "saleprice": 191816197,
            "saledate": "2013-03-26",
            "taxyear": "2024",
            "unmodified_owner": "TRANSBAY TOWER LLC",
            "mailadd": "4 EMBARCADERO LBBY LVL 1",
            "careof": "MICHAEL YI",
            "mail_city": "SAN FRANCISCO",
            "mail_state2": "CA",
            "mail_zip": "94111",
            "original_mailing_address": "{\"mailadd\":\"4 EMBARCADERO LBBY LVL 1\",\"mail_city\":\"SAN FRANCISCO\",\"mail_state2\":\"CA\",\"mail_zip\":\"94111\"}",
            "address": "415 MISSION ST",
            "saddno": "415",
            "saddstr": "MISSION",
            "saddsttyp": "ST",
            "scity": "SAN FRANCISCO",
            "original_address": "{\"address\":\" 0415 MISSION ST\",\"saddno\":\"101\",\"saddstr\":\"01ST\",\"saddsttyp\":\"ST\",\"sunit\":\" \",\"scity\":\"SAN FRANCISCO\"}",
            "city": "downtown-northeast-neighborhoods-treasure-island",
            "state2": "CA",
            "szip": "94105-2533",
            "szip5": "94105",
            "address_source": "county;cass",
            "book": "J626",
            "page": "918",
            "block": "3720",
            "lot": "9",
            "neighborhood_code": "09B",
            "lat": "37.789855",
            "lon": "-122.396801",
            "qoz": "No",
            "census_blockgroup": "060750615011",
            "census_zcta": "94105",
            "ll_last_refresh": "2024-09-24",
            "recrdareano": 1420430,
            "ll_gisacre": 1.15316,
            "ll_gissqft": 50233,
            "reviseddate": "2021-06-04",
            "path": "/us/ca/san-francisco/downtown-northeast-neighborhoods-treasure-island/136644",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "18a4b8df-4593-4cce-b59b-0897d3865466",
            "ll_updated_at": "2025-09-15 14:23:07 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Salesforce Tower",
            "description": "San Francisco's tallest skyscraper and tech industry landmark",
            "type": "office"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Disney Headquarters',
      description: 'The Walt Disney Company\'s corporate headquarters in Burbank',
      type: 'entertainment'
    },

    // Basic identifiers
    regrid_id: '242995',
    apn: '2443-022-009',
    address: '500 S BUENA VISTA ST',
    city: 'BURBANK',
    state: 'CA',
    zip_code: '91521',

    // Geometry and location
    geometry: {
      "type": "MultiPolygon",
      "coordinates": [
            [
                  [
                        [
                              -118.3258005,
                              34.154253
                        ],
                        [
                              -118.3257225,
                              34.1541685
                        ],
                        [
                              -118.323989,
                              34.154568
                        ],
                        [
                              -118.3237875,
                              34.1545945
                        ],
                        [
                              -118.3233175,
                              34.1549085
                        ],
                        [
                              -118.3222065,
                              34.1556635
                        ],
                        [
                              -118.3221955,
                              34.155671
                        ],
                        [
                              -118.322145,
                              34.155705
                        ],
                        [
                              -118.322101,
                              34.155735
                        ],
                        [
                              -118.3223105,
                              34.156112
                        ],
                        [
                              -118.322314,
                              34.156112
                        ],
                        [
                              -118.3223865,
                              34.1561015
                        ],
                        [
                              -118.3225255,
                              34.1560815
                        ],
                        [
                              -118.322755,
                              34.1560365
                        ],
                        [
                              -118.3230635,
                              34.155949
                        ],
                        [
                              -118.3231625,
                              34.155905
                        ],
                        [
                              -118.323316,
                              34.155836
                        ],
                        [
                              -118.3233905,
                              34.155803
                        ],
                        [
                              -118.3234615,
                              34.1557705
                        ],
                        [
                              -118.3235985,
                              34.1557005
                        ],
                        [
                              -118.323732,
                              34.1556255
                        ],
                        [
                              -118.3237965,
                              34.155585
                        ],
                        [
                              -118.3238605,
                              34.1555445
                        ],
                        [
                              -118.3258005,
                              34.154253
                        ]
                  ]
            ],
            [
                  [
                        [
                              -118.324084,
                              34.1558505
                        ],
                        [
                              -118.323984,
                              34.1559085
                        ],
                        [
                              -118.323933,
                              34.155936
                        ],
                        [
                              -118.323856,
                              34.1559755
                        ],
                        [
                              -118.323778,
                              34.156014
                        ],
                        [
                              -118.3237235,
                              34.156039
                        ],
                        [
                              -118.3236705,
                              34.156063
                        ],
                        [
                              -118.3236165,
                              34.1560855
                        ],
                        [
                              -118.3235345,
                              34.156119
                        ],
                        [
                              -118.323451,
                              34.15615
                        ],
                        [
                              -118.323397,
                              34.15617
                        ],
                        [
                              -118.323312,
                              34.156198
                        ],
                        [
                              -118.323227,
                              34.156225
                        ],
                        [
                              -118.3231405,
                              34.156249
                        ],
                        [
                              -118.3230535,
                              34.156272
                        ],
                        [
                              -118.3229655,
                              34.1562925
                        ],
                        [
                              -118.3228765,
                              34.1563115
                        ],
                        [
                              -118.322718,
                              34.15634
                        ],
                        [
                              -118.322558,
                              34.156363
                        ],
                        [
                              -118.3225415,
                              34.156379
                        ],
                        [
                              -118.3225385,
                              34.1563995
                        ],
                        [
                              -118.32277,
                              34.1568745
                        ],
                        [
                              -118.3232665,
                              34.157893
                        ],
                        [
                              -118.3234465,
                              34.1582735
                        ],
                        [
                              -118.3239925,
                              34.1594065
                        ],
                        [
                              -118.323996,
                              34.1594145
                        ],
                        [
                              -118.3240025,
                              34.1594215
                        ],
                        [
                              -118.324011,
                              34.1594275
                        ],
                        [
                              -118.3240225,
                              34.1594315
                        ],
                        [
                              -118.324031,
                              34.1594345
                        ],
                        [
                              -118.3240425,
                              34.159435
                        ],
                        [
                              -118.3240525,
                              34.159435
                        ],
                        [
                              -118.3240625,
                              34.159432
                        ],
                        [
                              -118.325307,
                              34.1590205
                        ],
                        [
                              -118.325657,
                              34.1589025
                        ],
                        [
                              -118.3262265,
                              34.158712
                        ],
                        [
                              -118.32689,
                              34.158489
                        ],
                        [
                              -118.3277,
                              34.1582175
                        ],
                        [
                              -118.3277945,
                              34.1581855
                        ],
                        [
                              -118.327836,
                              34.158171
                        ],
                        [
                              -118.327838,
                              34.1581695
                        ],
                        [
                              -118.32784,
                              34.1581685
                        ],
                        [
                              -118.3278425,
                              34.158167
                        ],
                        [
                              -118.327845,
                              34.158166
                        ],
                        [
                              -118.327846,
                              34.158164
                        ],
                        [
                              -118.327847,
                              34.158163
                        ],
                        [
                              -118.3278485,
                              34.158162
                        ],
                        [
                              -118.3278495,
                              34.158161
                        ],
                        [
                              -118.327851,
                              34.15816
                        ],
                        [
                              -118.327852,
                              34.1581585
                        ],
                        [
                              -118.327853,
                              34.1581575
                        ],
                        [
                              -118.3278545,
                              34.158156
                        ],
                        [
                              -118.3278555,
                              34.158155
                        ],
                        [
                              -118.3278565,
                              34.1581535
                        ],
                        [
                              -118.3278575,
                              34.1581525
                        ],
                        [
                              -118.3278585,
                              34.158151
                        ],
                        [
                              -118.3278595,
                              34.15815
                        ],
                        [
                              -118.3278605,
                              34.1581485
                        ],
                        [
                              -118.327862,
                              34.1581475
                        ],
                        [
                              -118.3278625,
                              34.158146
                        ],
                        [
                              -118.3278635,
                              34.1581445
                        ],
                        [
                              -118.3278645,
                              34.1581435
                        ],
                        [
                              -118.3278655,
                              34.158142
                        ],
                        [
                              -118.3278665,
                              34.1581405
                        ],
                        [
                              -118.327867,
                              34.1581395
                        ],
                        [
                              -118.327868,
                              34.158138
                        ],
                        [
                              -118.327869,
                              34.1581365
                        ],
                        [
                              -118.3278695,
                              34.158135
                        ],
                        [
                              -118.3278705,
                              34.1581335
                        ],
                        [
                              -118.327871,
                              34.158132
                        ],
                        [
                              -118.327872,
                              34.158131
                        ],
                        [
                              -118.3278725,
                              34.1581295
                        ],
                        [
                              -118.327875,
                              34.1581135
                        ],
                        [
                              -118.3278735,
                              34.1580975
                        ],
                        [
                              -118.3278645,
                              34.1580795
                        ],
                        [
                              -118.3278625,
                              34.1580745
                        ],
                        [
                              -118.3277935,
                              34.1579345
                        ],
                        [
                              -118.327767,
                              34.157881
                        ],
                        [
                              -118.3268145,
                              34.155946
                        ],
                        [
                              -118.3267685,
                              34.155962
                        ],
                        [
                              -118.3265555,
                              34.1555295
                        ],
                        [
                              -118.326471,
                              34.155321
                        ],
                        [
                              -118.3265015,
                              34.1553105
                        ],
                        [
                              -118.326101,
                              34.1544965
                        ],
                        [
                              -118.3260875,
                              34.154484
                        ],
                        [
                              -118.326069,
                              34.154478
                        ],
                        [
                              -118.3260545,
                              34.154478
                        ],
                        [
                              -118.326041,
                              34.154482
                        ],
                        [
                              -118.3258995,
                              34.1545815
                        ],
                        [
                              -118.32508,
                              34.1551275
                        ],
                        [
                              -118.3245445,
                              34.1555225
                        ],
                        [
                              -118.3245015,
                              34.155558
                        ],
                        [
                              -118.3244355,
                              34.1556105
                        ],
                        [
                              -118.3243685,
                              34.155662
                        ],
                        [
                              -118.3242995,
                              34.155711
                        ],
                        [
                              -118.32423,
                              34.1557595
                        ],
                        [
                              -118.324182,
                              34.1557905
                        ],
                        [
                              -118.324084,
                              34.1558505
                        ]
                  ]
            ]
      ]
},
    lat: 34.156873,
    lng: -118.325028,

    // Property details
    year_built: 1938,
    owner: 'DISNEY,WALT PRODUCTIONS INC',
    last_sale_price: null,
    sale_date: null,
    county: 'los-angeles',
    qoz_status: 'No',
    improvement_value: 494918190,
    land_value: 11644187,
    assessed_value: 506562377,

    // Extended details
    use_code: '6530',
    use_description: 'Recreational - Athletic & Amusement Facilities',
    zoning: 'PD',
    zoning_description: 'Planned Development',
    num_stories: 1,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 42.78993,
    lot_size_sqft: 1863968,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'GROSS ASSESSED',

    // Location data
    census_tract: '06037311700',
    census_block: '060373117006011',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2025-06-10',
    regrid_updated_at: '2025-09-15 14:21:32 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX 313',
    owner_mail_city: 'GLENDALE',
    owner_mail_state: 'CA',
    owner_mail_zip: '91209-0313',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "242995",
      "apn": "2443-022-009",
      "address": {
            "line1": "500 S BUENA VISTA ST",
            "line2": "",
            "city": "BURBANK",
            "state": "CA",
            "zip": "91521"
      },
      "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                  [
                        [
                              [
                                    -118.3258005,
                                    34.154253
                              ],
                              [
                                    -118.3257225,
                                    34.1541685
                              ],
                              [
                                    -118.323989,
                                    34.154568
                              ],
                              [
                                    -118.3237875,
                                    34.1545945
                              ],
                              [
                                    -118.3233175,
                                    34.1549085
                              ],
                              [
                                    -118.3222065,
                                    34.1556635
                              ],
                              [
                                    -118.3221955,
                                    34.155671
                              ],
                              [
                                    -118.322145,
                                    34.155705
                              ],
                              [
                                    -118.322101,
                                    34.155735
                              ],
                              [
                                    -118.3223105,
                                    34.156112
                              ],
                              [
                                    -118.322314,
                                    34.156112
                              ],
                              [
                                    -118.3223865,
                                    34.1561015
                              ],
                              [
                                    -118.3225255,
                                    34.1560815
                              ],
                              [
                                    -118.322755,
                                    34.1560365
                              ],
                              [
                                    -118.3230635,
                                    34.155949
                              ],
                              [
                                    -118.3231625,
                                    34.155905
                              ],
                              [
                                    -118.323316,
                                    34.155836
                              ],
                              [
                                    -118.3233905,
                                    34.155803
                              ],
                              [
                                    -118.3234615,
                                    34.1557705
                              ],
                              [
                                    -118.3235985,
                                    34.1557005
                              ],
                              [
                                    -118.323732,
                                    34.1556255
                              ],
                              [
                                    -118.3237965,
                                    34.155585
                              ],
                              [
                                    -118.3238605,
                                    34.1555445
                              ],
                              [
                                    -118.3258005,
                                    34.154253
                              ]
                        ]
                  ],
                  [
                        [
                              [
                                    -118.324084,
                                    34.1558505
                              ],
                              [
                                    -118.323984,
                                    34.1559085
                              ],
                              [
                                    -118.323933,
                                    34.155936
                              ],
                              [
                                    -118.323856,
                                    34.1559755
                              ],
                              [
                                    -118.323778,
                                    34.156014
                              ],
                              [
                                    -118.3237235,
                                    34.156039
                              ],
                              [
                                    -118.3236705,
                                    34.156063
                              ],
                              [
                                    -118.3236165,
                                    34.1560855
                              ],
                              [
                                    -118.3235345,
                                    34.156119
                              ],
                              [
                                    -118.323451,
                                    34.15615
                              ],
                              [
                                    -118.323397,
                                    34.15617
                              ],
                              [
                                    -118.323312,
                                    34.156198
                              ],
                              [
                                    -118.323227,
                                    34.156225
                              ],
                              [
                                    -118.3231405,
                                    34.156249
                              ],
                              [
                                    -118.3230535,
                                    34.156272
                              ],
                              [
                                    -118.3229655,
                                    34.1562925
                              ],
                              [
                                    -118.3228765,
                                    34.1563115
                              ],
                              [
                                    -118.322718,
                                    34.15634
                              ],
                              [
                                    -118.322558,
                                    34.156363
                              ],
                              [
                                    -118.3225415,
                                    34.156379
                              ],
                              [
                                    -118.3225385,
                                    34.1563995
                              ],
                              [
                                    -118.32277,
                                    34.1568745
                              ],
                              [
                                    -118.3232665,
                                    34.157893
                              ],
                              [
                                    -118.3234465,
                                    34.1582735
                              ],
                              [
                                    -118.3239925,
                                    34.1594065
                              ],
                              [
                                    -118.323996,
                                    34.1594145
                              ],
                              [
                                    -118.3240025,
                                    34.1594215
                              ],
                              [
                                    -118.324011,
                                    34.1594275
                              ],
                              [
                                    -118.3240225,
                                    34.1594315
                              ],
                              [
                                    -118.324031,
                                    34.1594345
                              ],
                              [
                                    -118.3240425,
                                    34.159435
                              ],
                              [
                                    -118.3240525,
                                    34.159435
                              ],
                              [
                                    -118.3240625,
                                    34.159432
                              ],
                              [
                                    -118.325307,
                                    34.1590205
                              ],
                              [
                                    -118.325657,
                                    34.1589025
                              ],
                              [
                                    -118.3262265,
                                    34.158712
                              ],
                              [
                                    -118.32689,
                                    34.158489
                              ],
                              [
                                    -118.3277,
                                    34.1582175
                              ],
                              [
                                    -118.3277945,
                                    34.1581855
                              ],
                              [
                                    -118.327836,
                                    34.158171
                              ],
                              [
                                    -118.327838,
                                    34.1581695
                              ],
                              [
                                    -118.32784,
                                    34.1581685
                              ],
                              [
                                    -118.3278425,
                                    34.158167
                              ],
                              [
                                    -118.327845,
                                    34.158166
                              ],
                              [
                                    -118.327846,
                                    34.158164
                              ],
                              [
                                    -118.327847,
                                    34.158163
                              ],
                              [
                                    -118.3278485,
                                    34.158162
                              ],
                              [
                                    -118.3278495,
                                    34.158161
                              ],
                              [
                                    -118.327851,
                                    34.15816
                              ],
                              [
                                    -118.327852,
                                    34.1581585
                              ],
                              [
                                    -118.327853,
                                    34.1581575
                              ],
                              [
                                    -118.3278545,
                                    34.158156
                              ],
                              [
                                    -118.3278555,
                                    34.158155
                              ],
                              [
                                    -118.3278565,
                                    34.1581535
                              ],
                              [
                                    -118.3278575,
                                    34.1581525
                              ],
                              [
                                    -118.3278585,
                                    34.158151
                              ],
                              [
                                    -118.3278595,
                                    34.15815
                              ],
                              [
                                    -118.3278605,
                                    34.1581485
                              ],
                              [
                                    -118.327862,
                                    34.1581475
                              ],
                              [
                                    -118.3278625,
                                    34.158146
                              ],
                              [
                                    -118.3278635,
                                    34.1581445
                              ],
                              [
                                    -118.3278645,
                                    34.1581435
                              ],
                              [
                                    -118.3278655,
                                    34.158142
                              ],
                              [
                                    -118.3278665,
                                    34.1581405
                              ],
                              [
                                    -118.327867,
                                    34.1581395
                              ],
                              [
                                    -118.327868,
                                    34.158138
                              ],
                              [
                                    -118.327869,
                                    34.1581365
                              ],
                              [
                                    -118.3278695,
                                    34.158135
                              ],
                              [
                                    -118.3278705,
                                    34.1581335
                              ],
                              [
                                    -118.327871,
                                    34.158132
                              ],
                              [
                                    -118.327872,
                                    34.158131
                              ],
                              [
                                    -118.3278725,
                                    34.1581295
                              ],
                              [
                                    -118.327875,
                                    34.1581135
                              ],
                              [
                                    -118.3278735,
                                    34.1580975
                              ],
                              [
                                    -118.3278645,
                                    34.1580795
                              ],
                              [
                                    -118.3278625,
                                    34.1580745
                              ],
                              [
                                    -118.3277935,
                                    34.1579345
                              ],
                              [
                                    -118.327767,
                                    34.157881
                              ],
                              [
                                    -118.3268145,
                                    34.155946
                              ],
                              [
                                    -118.3267685,
                                    34.155962
                              ],
                              [
                                    -118.3265555,
                                    34.1555295
                              ],
                              [
                                    -118.326471,
                                    34.155321
                              ],
                              [
                                    -118.3265015,
                                    34.1553105
                              ],
                              [
                                    -118.326101,
                                    34.1544965
                              ],
                              [
                                    -118.3260875,
                                    34.154484
                              ],
                              [
                                    -118.326069,
                                    34.154478
                              ],
                              [
                                    -118.3260545,
                                    34.154478
                              ],
                              [
                                    -118.326041,
                                    34.154482
                              ],
                              [
                                    -118.3258995,
                                    34.1545815
                              ],
                              [
                                    -118.32508,
                                    34.1551275
                              ],
                              [
                                    -118.3245445,
                                    34.1555225
                              ],
                              [
                                    -118.3245015,
                                    34.155558
                              ],
                              [
                                    -118.3244355,
                                    34.1556105
                              ],
                              [
                                    -118.3243685,
                                    34.155662
                              ],
                              [
                                    -118.3242995,
                                    34.155711
                              ],
                              [
                                    -118.32423,
                                    34.1557595
                              ],
                              [
                                    -118.324182,
                                    34.1557905
                              ],
                              [
                                    -118.324084,
                                    34.1558505
                              ]
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 34.156873,
            "lng": -118.325028
      },
      "properties": {
            "owner": "DISNEY,WALT PRODUCTIONS INC",
            "lot_size_sqft": 1863968,
            "lot_acres": 42.78993,
            "year_built": 1938,
            "zoning": "PD",
            "zoning_description": "Planned Development",
            "property_type": "",
            "assessed_value": 506562377,
            "improvement_value": 494918190,
            "land_value": 11644187,
            "sale_date": "",
            "county": "los-angeles",
            "qoz_status": "No",
            "use_code": "6530",
            "use_description": "Recreational - Athletic & Amusement Facilities",
            "subdivision": "",
            "num_stories": 1,
            "tax_year": "2025",
            "parcel_value_type": "GROSS ASSESSED",
            "census_tract": "06037311700",
            "census_block": "060373117006011",
            "qoz_tract": "",
            "last_refresh_date": "2025-06-10",
            "regrid_updated_at": "2025-09-15 14:21:32 -0400",
            "owner_mailing_address": "PO BOX 313",
            "owner_mail_city": "GLENDALE",
            "owner_mail_state": "CA",
            "owner_mail_zip": "91209-0313",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 242995,
            "geoid": "06037",
            "parcelnumb": "2443-022-009",
            "parcelnumb_no_formatting": "2443022009",
            "usecode": "6530",
            "usedesc": "Recreational - Athletic & Amusement Facilities",
            "yearbuilt": 1938,
            "numstories": 1,
            "numunits": 0,
            "parvaltype": "GROSS ASSESSED",
            "improvval": 494918190,
            "landval": 11644187,
            "parval": 506562377,
            "taxyear": "2025",
            "mailadd": "PO BOX 313",
            "mail_address2": "0",
            "mail_addno": "313",
            "mail_addstr": "PO BOX",
            "mail_city": "GLENDALE",
            "mail_state2": "CA",
            "mail_zip": "91209-0313",
            "original_mailing_address": "{\"mailadd\":\"00000 PO BOX 313\",\"mail_addno\":\"00000\",\"mail_addstr\":\"PO BOX 313\",\"mail_city\":\"GLENDALE\",\"mail_state2\":\"CA\",\"mail_zip\":\"912090000\"}",
            "address": "500 S BUENA VISTA ST",
            "saddno": "500",
            "saddpref": "S",
            "saddstr": "BUENA VISTA",
            "saddsttyp": "ST",
            "scity": "BURBANK",
            "original_address": "{\"address\":\"00500 S BUENA VISTA ST\",\"saddno\":\"00500\",\"saddpref\":\"S\",\"saddstr\":\"BUENA VISTA ST\",\"scity\":\"BURBANK\",\"szip\":\"915210000\"}",
            "city": "san-fernando-valley",
            "state2": "CA",
            "szip": "91521-0001",
            "szip5": "91521",
            "address_source": "county;cass",
            "legaldesc": "M R 43-47-59 LAND DESC IN DOC 1866538, 990930 POR OF BLK 66",
            "lat": "34.156873",
            "lon": "-118.325028",
            "qoz": "No",
            "census_blockgroup": "060373117006",
            "census_zcta": "91505",
            "ll_last_refresh": "2025-06-10",
            "recrdareano": 12800,
            "ll_gisacre": 42.78993,
            "ll_gissqft": 1863968,
            "plss_township": "001N",
            "plss_section": "Section 00",
            "plss_range": "014W",
            "path": "/us/ca/los-angeles/san-fernando-valley/242995",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "38c37221-6732-4bb1-95d7-26b4c2414599",
            "ll_updated_at": "2025-09-15 14:21:32 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Disney Headquarters",
            "description": "The Walt Disney Company's corporate headquarters in Burbank",
            "type": "entertainment"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Apple Visitor Center',
      description: 'Apple Park\'s stunning visitor center showcasing innovation',
      type: 'tech'
    },

    // Basic identifiers
    regrid_id: '8392',
    apn: '31606062',
    address: '10600 N TANTAU AV',
    city: 'CUPERTINO',
    state: 'CA',
    zip_code: '95014',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -122.0046855,
                        37.3336935
                  ],
                  [
                        -122.004687,
                        37.333872
                  ],
                  [
                        -122.0046885,
                        37.3340695
                  ],
                  [
                        -122.005293,
                        37.3340685
                  ],
                  [
                        -122.0053175,
                        37.3339345
                  ],
                  [
                        -122.0053345,
                        37.333868
                  ],
                  [
                        -122.005355,
                        37.3338025
                  ],
                  [
                        -122.0053785,
                        37.3337375
                  ],
                  [
                        -122.005405,
                        37.333673
                  ],
                  [
                        -122.0054345,
                        37.3336095
                  ],
                  [
                        -122.005467,
                        37.333547
                  ],
                  [
                        -122.0055025,
                        37.3334855
                  ],
                  [
                        -122.005561,
                        37.333381
                  ],
                  [
                        -122.0055865,
                        37.3333275
                  ],
                  [
                        -122.0056095,
                        37.3332735
                  ],
                  [
                        -122.0056305,
                        37.3332185
                  ],
                  [
                        -122.005649,
                        37.3331635
                  ],
                  [
                        -122.0056645,
                        37.3331075
                  ],
                  [
                        -122.0056905,
                        37.332986
                  ],
                  [
                        -122.005699,
                        37.3329245
                  ],
                  [
                        -122.0057045,
                        37.332863
                  ],
                  [
                        -122.0057075,
                        37.332801
                  ],
                  [
                        -122.0057075,
                        37.332781
                  ],
                  [
                        -122.0057125,
                        37.3325175
                  ],
                  [
                        -122.0057125,
                        37.332508
                  ],
                  [
                        -122.005712,
                        37.332503
                  ],
                  [
                        -122.0057115,
                        37.3324985
                  ],
                  [
                        -122.0057105,
                        37.3324935
                  ],
                  [
                        -122.0057095,
                        37.3324885
                  ],
                  [
                        -122.005708,
                        37.332484
                  ],
                  [
                        -122.0057065,
                        37.3324795
                  ],
                  [
                        -122.005705,
                        37.3324745
                  ],
                  [
                        -122.005703,
                        37.33247
                  ],
                  [
                        -122.005701,
                        37.3324655
                  ],
                  [
                        -122.0056985,
                        37.332461
                  ],
                  [
                        -122.005696,
                        37.3324565
                  ],
                  [
                        -122.0056935,
                        37.332452
                  ],
                  [
                        -122.0056905,
                        37.332448
                  ],
                  [
                        -122.0056875,
                        37.332444
                  ],
                  [
                        -122.005684,
                        37.3324395
                  ],
                  [
                        -122.0056805,
                        37.3324355
                  ],
                  [
                        -122.005677,
                        37.332432
                  ],
                  [
                        -122.005673,
                        37.332428
                  ],
                  [
                        -122.005669,
                        37.3324245
                  ],
                  [
                        -122.005665,
                        37.332421
                  ],
                  [
                        -122.005661,
                        37.3324175
                  ],
                  [
                        -122.0056565,
                        37.332414
                  ],
                  [
                        -122.005652,
                        37.332411
                  ],
                  [
                        -122.005647,
                        37.3324075
                  ],
                  [
                        -122.0056425,
                        37.332405
                  ],
                  [
                        -122.0056375,
                        37.332402
                  ],
                  [
                        -122.0056325,
                        37.3323995
                  ],
                  [
                        -122.005627,
                        37.332397
                  ],
                  [
                        -122.005622,
                        37.3323945
                  ],
                  [
                        -122.0056165,
                        37.3323925
                  ],
                  [
                        -122.005611,
                        37.33239
                  ],
                  [
                        -122.0056055,
                        37.3323885
                  ],
                  [
                        -122.0055995,
                        37.3323865
                  ],
                  [
                        -122.005594,
                        37.332385
                  ],
                  [
                        -122.005588,
                        37.3323835
                  ],
                  [
                        -122.005582,
                        37.3323825
                  ],
                  [
                        -122.0055765,
                        37.332381
                  ],
                  [
                        -122.0055705,
                        37.3323805
                  ],
                  [
                        -122.0055645,
                        37.3323795
                  ],
                  [
                        -122.0055585,
                        37.332379
                  ],
                  [
                        -122.0055525,
                        37.3323785
                  ],
                  [
                        -122.005546,
                        37.3323785
                  ],
                  [
                        -122.00554,
                        37.332378
                  ],
                  [
                        -122.0046735,
                        37.3323695
                  ],
                  [
                        -122.004676,
                        37.3326275
                  ],
                  [
                        -122.004677,
                        37.332783
                  ],
                  [
                        -122.0046775,
                        37.3328065
                  ],
                  [
                        -122.004679,
                        37.332985
                  ],
                  [
                        -122.00468,
                        37.3331095
                  ],
                  [
                        -122.0046805,
                        37.3331635
                  ],
                  [
                        -122.004682,
                        37.333342
                  ],
                  [
                        -122.0046835,
                        37.3335205
                  ],
                  [
                        -122.0046855,
                        37.3336935
                  ]
            ]
      ]
},
    lat: 37.333143,
    lng: -122.005134,

    // Property details
    year_built: 2017,
    owner: 'CAMPUS HOLDINGS INC',
    last_sale_price: null,
    sale_date: '2013-10-15',
    county: 'santa-clara',
    qoz_status: 'No',
    improvement_value: 15880527,
    land_value: 18748497,
    assessed_value: 34629024,

    // Extended details
    use_code: '58',
    use_description: 'Retail Uses',
    zoning: 'P(MP',
    zoning_description: 'Planned Development Industrial Park',
    num_stories: 2,
    num_units: 1,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 3.62907,
    lot_size_sqft: 158086,

    // Financial & tax data
    tax_year: null,
    parcel_value_type: 'ASSESSED',

    // Location data
    census_tract: '06085508102',
    census_block: '060855081021020',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2024-12-17',
    regrid_updated_at: '2025-09-15 14:26:02 -0400',

    // Owner mailing
    owner_mailing_address: '1 INFINITE LOOP',
    owner_mail_city: 'CUPERTINO',
    owner_mail_state: 'CA',
    owner_mail_zip: '95032',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "8392",
      "apn": "31606062",
      "address": {
            "line1": "10600 N TANTAU AV",
            "line2": "",
            "city": "CUPERTINO",
            "state": "CA",
            "zip": "95014"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -122.0046855,
                              37.3336935
                        ],
                        [
                              -122.004687,
                              37.333872
                        ],
                        [
                              -122.0046885,
                              37.3340695
                        ],
                        [
                              -122.005293,
                              37.3340685
                        ],
                        [
                              -122.0053175,
                              37.3339345
                        ],
                        [
                              -122.0053345,
                              37.333868
                        ],
                        [
                              -122.005355,
                              37.3338025
                        ],
                        [
                              -122.0053785,
                              37.3337375
                        ],
                        [
                              -122.005405,
                              37.333673
                        ],
                        [
                              -122.0054345,
                              37.3336095
                        ],
                        [
                              -122.005467,
                              37.333547
                        ],
                        [
                              -122.0055025,
                              37.3334855
                        ],
                        [
                              -122.005561,
                              37.333381
                        ],
                        [
                              -122.0055865,
                              37.3333275
                        ],
                        [
                              -122.0056095,
                              37.3332735
                        ],
                        [
                              -122.0056305,
                              37.3332185
                        ],
                        [
                              -122.005649,
                              37.3331635
                        ],
                        [
                              -122.0056645,
                              37.3331075
                        ],
                        [
                              -122.0056905,
                              37.332986
                        ],
                        [
                              -122.005699,
                              37.3329245
                        ],
                        [
                              -122.0057045,
                              37.332863
                        ],
                        [
                              -122.0057075,
                              37.332801
                        ],
                        [
                              -122.0057075,
                              37.332781
                        ],
                        [
                              -122.0057125,
                              37.3325175
                        ],
                        [
                              -122.0057125,
                              37.332508
                        ],
                        [
                              -122.005712,
                              37.332503
                        ],
                        [
                              -122.0057115,
                              37.3324985
                        ],
                        [
                              -122.0057105,
                              37.3324935
                        ],
                        [
                              -122.0057095,
                              37.3324885
                        ],
                        [
                              -122.005708,
                              37.332484
                        ],
                        [
                              -122.0057065,
                              37.3324795
                        ],
                        [
                              -122.005705,
                              37.3324745
                        ],
                        [
                              -122.005703,
                              37.33247
                        ],
                        [
                              -122.005701,
                              37.3324655
                        ],
                        [
                              -122.0056985,
                              37.332461
                        ],
                        [
                              -122.005696,
                              37.3324565
                        ],
                        [
                              -122.0056935,
                              37.332452
                        ],
                        [
                              -122.0056905,
                              37.332448
                        ],
                        [
                              -122.0056875,
                              37.332444
                        ],
                        [
                              -122.005684,
                              37.3324395
                        ],
                        [
                              -122.0056805,
                              37.3324355
                        ],
                        [
                              -122.005677,
                              37.332432
                        ],
                        [
                              -122.005673,
                              37.332428
                        ],
                        [
                              -122.005669,
                              37.3324245
                        ],
                        [
                              -122.005665,
                              37.332421
                        ],
                        [
                              -122.005661,
                              37.3324175
                        ],
                        [
                              -122.0056565,
                              37.332414
                        ],
                        [
                              -122.005652,
                              37.332411
                        ],
                        [
                              -122.005647,
                              37.3324075
                        ],
                        [
                              -122.0056425,
                              37.332405
                        ],
                        [
                              -122.0056375,
                              37.332402
                        ],
                        [
                              -122.0056325,
                              37.3323995
                        ],
                        [
                              -122.005627,
                              37.332397
                        ],
                        [
                              -122.005622,
                              37.3323945
                        ],
                        [
                              -122.0056165,
                              37.3323925
                        ],
                        [
                              -122.005611,
                              37.33239
                        ],
                        [
                              -122.0056055,
                              37.3323885
                        ],
                        [
                              -122.0055995,
                              37.3323865
                        ],
                        [
                              -122.005594,
                              37.332385
                        ],
                        [
                              -122.005588,
                              37.3323835
                        ],
                        [
                              -122.005582,
                              37.3323825
                        ],
                        [
                              -122.0055765,
                              37.332381
                        ],
                        [
                              -122.0055705,
                              37.3323805
                        ],
                        [
                              -122.0055645,
                              37.3323795
                        ],
                        [
                              -122.0055585,
                              37.332379
                        ],
                        [
                              -122.0055525,
                              37.3323785
                        ],
                        [
                              -122.005546,
                              37.3323785
                        ],
                        [
                              -122.00554,
                              37.332378
                        ],
                        [
                              -122.0046735,
                              37.3323695
                        ],
                        [
                              -122.004676,
                              37.3326275
                        ],
                        [
                              -122.004677,
                              37.332783
                        ],
                        [
                              -122.0046775,
                              37.3328065
                        ],
                        [
                              -122.004679,
                              37.332985
                        ],
                        [
                              -122.00468,
                              37.3331095
                        ],
                        [
                              -122.0046805,
                              37.3331635
                        ],
                        [
                              -122.004682,
                              37.333342
                        ],
                        [
                              -122.0046835,
                              37.3335205
                        ],
                        [
                              -122.0046855,
                              37.3336935
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 37.333143,
            "lng": -122.005134
      },
      "properties": {
            "owner": "CAMPUS HOLDINGS INC",
            "lot_size_sqft": 158086,
            "lot_acres": 3.62907,
            "year_built": 2017,
            "zoning": "P(MP",
            "zoning_description": "Planned Development Industrial Park",
            "property_type": "",
            "assessed_value": 34629024,
            "improvement_value": 15880527,
            "land_value": 18748497,
            "sale_date": "2013-10-15",
            "county": "santa-clara",
            "qoz_status": "No",
            "use_code": "58",
            "use_description": "Retail Uses",
            "subdivision": "",
            "num_stories": 2,
            "num_units": 1,
            "tax_year": "",
            "parcel_value_type": "ASSESSED",
            "census_tract": "06085508102",
            "census_block": "060855081021020",
            "qoz_tract": "",
            "last_refresh_date": "2024-12-17",
            "regrid_updated_at": "2025-09-15 14:26:02 -0400",
            "owner_mailing_address": "1 INFINITE LOOP",
            "owner_mail_city": "CUPERTINO",
            "owner_mail_state": "CA",
            "owner_mail_zip": "95032",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 8392,
            "geoid": "06085",
            "parcelnumb": "31606062",
            "parcelnumb_no_formatting": "31606062",
            "usecode": "58",
            "usedesc": "Retail Uses",
            "yearbuilt": 2017,
            "numstories": 2,
            "numunits": 1,
            "parvaltype": "ASSESSED",
            "improvval": 15880527,
            "landval": 18748497,
            "parval": 34629024,
            "saledate": "2013-10-15",
            "unmodified_owner": "CAMPUS HOLDINGS INC",
            "mailadd": "1 INFINITE LOOP",
            "careof": "APPLE INC., MS:104-2TX, TAX DEPT",
            "mail_city": "CUPERTINO",
            "mail_state2": "CA",
            "mail_zip": "95032",
            "original_mailing_address": "{\"mailadd\":\"1 INFINITE LOOP\",\"mail_city\":\"CUPERTINO\",\"mail_state2\":\"CA\",\"mail_zip\":\"95032\"}",
            "address": "10600 N TANTAU AV",
            "saddno": "10600",
            "saddpref": "N",
            "saddstr": "TANTAU",
            "saddsttyp": "AV",
            "scity": "CUPERTINO",
            "original_address": "{\"address\":\"10600 N TANTAU AV\",\"saddno\":\"10600\",\"saddpref\":\"N\",\"saddstr\":\"TANTAU\",\"saddsttyp\":\"AV\",\"scity\":\"CUPERTINO\",\"szip\":\"95014\"}",
            "city": "san-jose",
            "state2": "CA",
            "szip": "95014",
            "szip5": "95014",
            "address_source": "county",
            "lat": "37.333143",
            "lon": "-122.005134",
            "qoz": "No",
            "census_blockgroup": "060855081021",
            "census_zcta": "95014",
            "ll_last_refresh": "2024-12-17",
            "gisacre": 3.58,
            "sqft": 155945,
            "ll_gisacre": 3.62907,
            "ll_gissqft": 158086,
            "plss_township": "007S",
            "plss_section": "Section 00",
            "plss_range": "001W",
            "path": "/us/ca/santa-clara/san-jose/8392",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "0654fd82-1e13-49ba-a58d-afefc919cbe3",
            "ll_updated_at": "2025-09-15 14:26:02 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Apple Visitor Center",
            "description": "Apple Park's stunning visitor center showcasing innovation",
            "type": "tech"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Willis Tower',
      description: 'Chicago\'s iconic skyscraper, formerly known as Sears Tower',
      type: 'office'
    },

    // Basic identifiers
    regrid_id: '1357189',
    apn: '17162160090000',
    address: '233 S WACKER DR',
    city: 'CHICAGO',
    state: 'IL',
    zip_code: '60606',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -87.6357285,
                        41.8781815
                  ],
                  [
                        -87.6353585,
                        41.878186
                  ],
                  [
                        -87.6353705,
                        41.878641
                  ],
                  [
                        -87.635387,
                        41.8792745
                  ],
                  [
                        -87.635755,
                        41.87927
                  ],
                  [
                        -87.635939,
                        41.879268
                  ],
                  [
                        -87.636578,
                        41.87926
                  ],
                  [
                        -87.636567,
                        41.878806
                  ],
                  [
                        -87.6365625,
                        41.878626
                  ],
                  [
                        -87.636561,
                        41.8785695
                  ],
                  [
                        -87.6365595,
                        41.8785125
                  ],
                  [
                        -87.6365585,
                        41.8784555
                  ],
                  [
                        -87.636557,
                        41.878399
                  ],
                  [
                        -87.636554,
                        41.878285
                  ],
                  [
                        -87.6365525,
                        41.878228
                  ],
                  [
                        -87.6365515,
                        41.8781715
                  ],
                  [
                        -87.6361355,
                        41.8781765
                  ],
                  [
                        -87.636099,
                        41.878177
                  ],
                  [
                        -87.6359135,
                        41.8781795
                  ],
                  [
                        -87.6357285,
                        41.8781815
                  ]
            ]
      ]
},
    lat: 41.878723,
    lng: -87.635969,

    // Property details
    year_built: 1970,
    owner: 'PROPERTY TAX',
    last_sale_price: 275611000,
    sale_date: '2015-06-11',
    county: 'cook',
    qoz_status: 'No',
    improvement_value: 237590366,
    land_value: 15209500,
    assessed_value: 252799866,

    // Extended details
    use_code: '591',
    use_description: null,
    zoning: 'DC-16',
    zoning_description: 'Downtown Core District',
    num_stories: 99,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 2.95457,
    lot_size_sqft: 128704,

    // Financial & tax data
    tax_year: '2023',
    parcel_value_type: 'ASSESSED',

    // Location data
    census_tract: '17031839100',
    census_block: '170318391002008',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2024-07-30',
    regrid_updated_at: '2025-09-15 14:49:33 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX A3879',
    owner_mail_city: 'CHICAGO',
    owner_mail_state: 'IL',
    owner_mail_zip: '60690-3879',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "1357189",
      "apn": "17162160090000",
      "address": {
            "line1": "233 S WACKER DR",
            "line2": "",
            "city": "CHICAGO",
            "state": "IL",
            "zip": "60606"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -87.6357285,
                              41.8781815
                        ],
                        [
                              -87.6353585,
                              41.878186
                        ],
                        [
                              -87.6353705,
                              41.878641
                        ],
                        [
                              -87.635387,
                              41.8792745
                        ],
                        [
                              -87.635755,
                              41.87927
                        ],
                        [
                              -87.635939,
                              41.879268
                        ],
                        [
                              -87.636578,
                              41.87926
                        ],
                        [
                              -87.636567,
                              41.878806
                        ],
                        [
                              -87.6365625,
                              41.878626
                        ],
                        [
                              -87.636561,
                              41.8785695
                        ],
                        [
                              -87.6365595,
                              41.8785125
                        ],
                        [
                              -87.6365585,
                              41.8784555
                        ],
                        [
                              -87.636557,
                              41.878399
                        ],
                        [
                              -87.636554,
                              41.878285
                        ],
                        [
                              -87.6365525,
                              41.878228
                        ],
                        [
                              -87.6365515,
                              41.8781715
                        ],
                        [
                              -87.6361355,
                              41.8781765
                        ],
                        [
                              -87.636099,
                              41.878177
                        ],
                        [
                              -87.6359135,
                              41.8781795
                        ],
                        [
                              -87.6357285,
                              41.8781815
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 41.878723,
            "lng": -87.635969
      },
      "properties": {
            "owner": "PROPERTY TAX",
            "lot_size_sqft": 128704,
            "lot_acres": 2.95457,
            "year_built": 1970,
            "zoning": "DC-16",
            "zoning_description": "Downtown Core District",
            "property_type": "",
            "assessed_value": 252799866,
            "improvement_value": 237590366,
            "land_value": 15209500,
            "last_sale_price": 275611000,
            "sale_date": "2015-06-11",
            "county": "cook",
            "qoz_status": "No",
            "use_code": "591",
            "use_description": "",
            "subdivision": "",
            "num_stories": 99,
            "tax_year": "2023",
            "parcel_value_type": "ASSESSED",
            "census_tract": "17031839100",
            "census_block": "170318391002008",
            "qoz_tract": "",
            "last_refresh_date": "2024-07-30",
            "regrid_updated_at": "2025-09-15 14:49:33 -0400",
            "owner_mailing_address": "PO BOX A3879",
            "owner_mail_city": "CHICAGO",
            "owner_mail_state": "IL",
            "owner_mail_zip": "60690-3879",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 1357189,
            "geoid": "17031",
            "parcelnumb": "17162160090000",
            "parcelnumb_no_formatting": "17162160090000",
            "alt_parcelnumb1": "1716216009",
            "alt_parcelnumb2": "17-16-216-009-0000",
            "usecode": "591",
            "yearbuilt": 1970,
            "numstories": 99,
            "parvaltype": "ASSESSED",
            "improvval": 237590366,
            "landval": 15209500,
            "parval": 252799866,
            "saleprice": 275611000,
            "saledate": "2015-06-11",
            "taxyear": "2023",
            "unmodified_owner": "PROPERTY TAX",
            "previous_owner": "UNKNOWN",
            "mailadd": "PO BOX A3879",
            "mail_addno": "A3879",
            "mail_addstr": "PO BOX",
            "mail_city": "CHICAGO",
            "mail_state2": "IL",
            "mail_zip": "60690-3879",
            "original_mailing_address": "{\"mailadd\":\"P O BOX A-3879\",\"mail_city\":\"CHICAGO\",\"mail_state2\":\"IL\",\"mail_zip\":\"60690\"}",
            "address": "233 S WACKER DR",
            "saddno": "233",
            "saddpref": "S",
            "saddstr": "WACKER",
            "saddsttyp": "DR",
            "scity": "CHICAGO",
            "original_address": "{\"address\":\"233 S WACKER DR\",\"saddno\":\"233\",\"saddpref\":\"S\",\"saddstr\":\"WACKER\",\"saddsttyp\":\"DR\",\"scity\":\"CHICAGO\",\"szip\":\"60606\"}",
            "city": "chicago",
            "state2": "IL",
            "szip": "60606-7147",
            "szip5": "60606",
            "address_source": "county;cass",
            "neighborhood_code": "76010",
            "lat": "41.878723",
            "lon": "-87.635969",
            "qoz": "No",
            "census_blockgroup": "170318391002",
            "census_zcta": "60606",
            "ll_last_refresh": "2024-07-30",
            "recrdareano": 0,
            "sqft": 128079,
            "ll_gisacre": 2.95457,
            "ll_gissqft": 128704,
            "plss_township": "039N",
            "plss_section": "Section 16",
            "plss_range": "014E",
            "reviseddate": "2023-02-28",
            "path": "/us/il/cook/chicago/1357189",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "6a1a8957-a752-4bb6-b4bf-aa583eaf56c4",
            "ll_updated_at": "2025-09-15 14:49:33 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Willis Tower",
            "description": "Chicago's iconic skyscraper, formerly known as Sears Tower",
            "type": "office"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Tesla Gigafactory',
      description: 'Tesla\'s massive electric vehicle and battery manufacturing facility',
      type: 'industrial'
    },

    // Basic identifiers
    regrid_id: '398700',
    apn: '292257',
    address: '13101 Tesla RD',
    city: 'AUSTIN',
    state: 'TX',
    zip_code: '78617',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -97.6017235,
                        30.252255
                  ],
                  [
                        -97.6018025,
                        30.2521035
                  ],
                  [
                        -97.6020065,
                        30.252183
                  ],
                  [
                        -97.60212,
                        30.2522275
                  ],
                  [
                        -97.6020405,
                        30.2523805
                  ],
                  [
                        -97.6031535,
                        30.2528795
                  ],
                  [
                        -97.6034515,
                        30.2530135
                  ],
                  [
                        -97.604741,
                        30.250966
                  ],
                  [
                        -97.6048115,
                        30.2506735
                  ],
                  [
                        -97.604618,
                        30.250576
                  ],
                  [
                        -97.604464,
                        30.250498
                  ],
                  [
                        -97.604693,
                        30.250123
                  ],
                  [
                        -97.605103,
                        30.249453
                  ],
                  [
                        -97.604757,
                        30.2492785
                  ],
                  [
                        -97.6058015,
                        30.247977
                  ],
                  [
                        -97.6060515,
                        30.248103
                  ],
                  [
                        -97.606896,
                        30.246887
                  ],
                  [
                        -97.6102435,
                        30.2425635
                  ],
                  [
                        -97.6128035,
                        30.238539
                  ],
                  [
                        -97.613725,
                        30.237091
                  ],
                  [
                        -97.6144055,
                        30.236021
                  ],
                  [
                        -97.6147955,
                        30.2351785
                  ],
                  [
                        -97.615701,
                        30.2332235
                  ],
                  [
                        -97.616783,
                        30.2308875
                  ],
                  [
                        -97.618606,
                        30.228304
                  ],
                  [
                        -97.6176815,
                        30.2278255
                  ],
                  [
                        -97.6174685,
                        30.2278745
                  ],
                  [
                        -97.6165245,
                        30.2293645
                  ],
                  [
                        -97.6165105,
                        30.229358
                  ],
                  [
                        -97.6155665,
                        30.2308465
                  ],
                  [
                        -97.6155115,
                        30.23082
                  ],
                  [
                        -97.6154925,
                        30.2308115
                  ],
                  [
                        -97.616422,
                        30.2293185
                  ],
                  [
                        -97.616436,
                        30.2293245
                  ],
                  [
                        -97.617356,
                        30.22782
                  ],
                  [
                        -97.617492,
                        30.227686
                  ],
                  [
                        -97.617538,
                        30.227616
                  ],
                  [
                        -97.6176945,
                        30.2276965
                  ],
                  [
                        -97.618673,
                        30.228201
                  ],
                  [
                        -97.6188085,
                        30.2280035
                  ],
                  [
                        -97.6191245,
                        30.228167
                  ],
                  [
                        -97.61982,
                        30.227177
                  ],
                  [
                        -97.619968,
                        30.2269605
                  ],
                  [
                        -97.6201095,
                        30.2267405
                  ],
                  [
                        -97.620296,
                        30.2264275
                  ],
                  [
                        -97.6204695,
                        30.2262755
                  ],
                  [
                        -97.620524,
                        30.226224
                  ],
                  [
                        -97.620573,
                        30.2261695
                  ],
                  [
                        -97.6206175,
                        30.2261115
                  ],
                  [
                        -97.6206565,
                        30.226051
                  ],
                  [
                        -97.62069,
                        30.225988
                  ],
                  [
                        -97.620776,
                        30.2257995
                  ],
                  [
                        -97.6208565,
                        30.225609
                  ],
                  [
                        -97.6209315,
                        30.2254165
                  ],
                  [
                        -97.6210005,
                        30.225223
                  ],
                  [
                        -97.621063,
                        30.2250275
                  ],
                  [
                        -97.62112,
                        30.2248305
                  ],
                  [
                        -97.62114,
                        30.224747
                  ],
                  [
                        -97.621154,
                        30.2246625
                  ],
                  [
                        -97.621162,
                        30.224577
                  ],
                  [
                        -97.6211645,
                        30.2244915
                  ],
                  [
                        -97.6211625,
                        30.2240495
                  ],
                  [
                        -97.6212555,
                        30.223901
                  ],
                  [
                        -97.621661,
                        30.2219535
                  ],
                  [
                        -97.621657,
                        30.221141
                  ],
                  [
                        -97.621647,
                        30.2185475
                  ],
                  [
                        -97.6216135,
                        30.2124155
                  ],
                  [
                        -97.6214355,
                        30.211215
                  ],
                  [
                        -97.6213925,
                        30.210922
                  ],
                  [
                        -97.620971,
                        30.21101
                  ],
                  [
                        -97.6206535,
                        30.211083
                  ],
                  [
                        -97.6201165,
                        30.2112355
                  ],
                  [
                        -97.618869,
                        30.2116685
                  ],
                  [
                        -97.618425,
                        30.211924
                  ],
                  [
                        -97.6178815,
                        30.212202
                  ],
                  [
                        -97.616493,
                        30.213254
                  ],
                  [
                        -97.61598,
                        30.21361
                  ],
                  [
                        -97.6147255,
                        30.214071
                  ],
                  [
                        -97.6142585,
                        30.214194
                  ],
                  [
                        -97.6139425,
                        30.2142555
                  ],
                  [
                        -97.6129875,
                        30.2149245
                  ],
                  [
                        -97.6130665,
                        30.214426
                  ],
                  [
                        -97.6131,
                        30.21432
                  ],
                  [
                        -97.6123325,
                        30.2134745
                  ],
                  [
                        -97.612325,
                        30.213373
                  ],
                  [
                        -97.6122525,
                        30.213005
                  ],
                  [
                        -97.6118005,
                        30.2128795
                  ],
                  [
                        -97.61128,
                        30.2128395
                  ],
                  [
                        -97.6104155,
                        30.213066
                  ],
                  [
                        -97.609435,
                        30.2134845
                  ],
                  [
                        -97.608792,
                        30.213784
                  ],
                  [
                        -97.60845,
                        30.214217
                  ],
                  [
                        -97.6081095,
                        30.2148865
                  ],
                  [
                        -97.607828,
                        30.21535
                  ],
                  [
                        -97.607769,
                        30.215492
                  ],
                  [
                        -97.607284,
                        30.2160125
                  ],
                  [
                        -97.6071735,
                        30.2161935
                  ],
                  [
                        -97.6072195,
                        30.2164235
                  ],
                  [
                        -97.607159,
                        30.2166975
                  ],
                  [
                        -97.6068835,
                        30.217104
                  ],
                  [
                        -97.6065055,
                        30.217417
                  ],
                  [
                        -97.6065635,
                        30.2172345
                  ],
                  [
                        -97.606674,
                        30.2170535
                  ],
                  [
                        -97.6067305,
                        30.2169175
                  ],
                  [
                        -97.6067345,
                        30.21678
                  ],
                  [
                        -97.606575,
                        30.2168225
                  ],
                  [
                        -97.6064115,
                        30.2170025
                  ],
                  [
                        -97.6061905,
                        30.2173645
                  ],
                  [
                        -97.606185,
                        30.2175475
                  ],
                  [
                        -97.6060745,
                        30.2177285
                  ],
                  [
                        -97.6058595,
                        30.2178615
                  ],
                  [
                        -97.6055865,
                        30.2181765
                  ],
                  [
                        -97.605526,
                        30.21845
                  ],
                  [
                        -97.605521,
                        30.2186335
                  ],
                  [
                        -97.605243,
                        30.219132
                  ],
                  [
                        -97.605238,
                        30.219315
                  ],
                  [
                        -97.6051285,
                        30.21945
                  ],
                  [
                        -97.6052275,
                        30.2196815
                  ],
                  [
                        -97.6052235,
                        30.219819
                  ],
                  [
                        -97.6051645,
                        30.220047
                  ],
                  [
                        -97.605265,
                        30.2202325
                  ],
                  [
                        -97.6053675,
                        30.220326
                  ],
                  [
                        -97.60536,
                        30.220601
                  ],
                  [
                        -97.605356,
                        30.2207385
                  ],
                  [
                        -97.605255,
                        30.2211945
                  ],
                  [
                        -97.6051445,
                        30.2213755
                  ],
                  [
                        -97.6051365,
                        30.2216505
                  ],
                  [
                        -97.6049695,
                        30.221968
                  ],
                  [
                        -97.6049075,
                        30.2222875
                  ],
                  [
                        -97.604681,
                        30.2228325
                  ],
                  [
                        -97.604447,
                        30.2232415
                  ],
                  [
                        -97.6042815,
                        30.2236515
                  ],
                  [
                        -97.604212,
                        30.2239285
                  ],
                  [
                        -97.6041405,
                        30.224499
                  ],
                  [
                        -97.604127,
                        30.224635
                  ],
                  [
                        -97.604191,
                        30.2251415
                  ],
                  [
                        -97.604029,
                        30.225956
                  ],
                  [
                        -97.603535,
                        30.2268465
                  ],
                  [
                        -97.602871,
                        30.227241
                  ],
                  [
                        -97.6015795,
                        30.2275835
                  ],
                  [
                        -97.601269,
                        30.2276335
                  ],
                  [
                        -97.600852,
                        30.227596
                  ],
                  [
                        -97.600585,
                        30.2276205
                  ],
                  [
                        -97.5997295,
                        30.2277525
                  ]
            ]
      ]
},
    lat: 30.223605,
    lng: -97.6120065,

    // Property details
    year_built: 2020,
    owner: 'COLORADO RIVER PROJECT LLC',
    last_sale_price: null,
    sale_date: '',
    county: 'travis',
    qoz_status: 'No',
    improvement_value: null,
    land_value: null,
    assessed_value: 3323759771,

    // Extended details
    use_code: '',
    use_description: '',
    zoning: '',
    zoning_description: '',
    num_stories: null,
    num_units: null,
    num_rooms: null,
    subdivision: '',
    lot_size_acres: null,
    lot_size_sqft: null,

    // Financial & tax data
    tax_year: '',
    parcel_value_type: '',

    // Location data
    census_tract: '',
    census_block: '',
    qoz_tract: '',

    // Data freshness
    last_refresh_date: '',
    regrid_updated_at: '',

    // Owner mailing
    owner_mailing_address: '',
    owner_mail_city: '',
    owner_mail_state: '',
    owner_mail_zip: '',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "398700",
      "apn": "292257",
      "address": {
            "line1": "S F M RD 973",
            "line2": "",
            "city": "Hornsby Bend",
            "state": "TX",
            "zip": "78617"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -97.6017235,
                              30.252255
                        ],
                        [
                              -97.6018025,
                              30.2521035
                        ],
                        [
                              -97.6020065,
                              30.252183
                        ],
                        [
                              -97.60212,
                              30.2522275
                        ],
                        [
                              -97.6020405,
                              30.2523805
                        ],
                        [
                              -97.6031535,
                              30.2528795
                        ],
                        [
                              -97.6034515,
                              30.2530135
                        ],
                        [
                              -97.604741,
                              30.250966
                        ],
                        [
                              -97.6048115,
                              30.2506735
                        ],
                        [
                              -97.604618,
                              30.250576
                        ],
                        [
                              -97.604464,
                              30.250498
                        ],
                        [
                              -97.604693,
                              30.250123
                        ],
                        [
                              -97.605103,
                              30.249453
                        ],
                        [
                              -97.604757,
                              30.2492785
                        ],
                        [
                              -97.6058015,
                              30.247977
                        ],
                        [
                              -97.6060515,
                              30.248103
                        ],
                        [
                              -97.606896,
                              30.246887
                        ],
                        [
                              -97.6102435,
                              30.2425635
                        ],
                        [
                              -97.6128035,
                              30.238539
                        ],
                        [
                              -97.613725,
                              30.237091
                        ],
                        [
                              -97.6144055,
                              30.236021
                        ],
                        [
                              -97.6147955,
                              30.2351785
                        ],
                        [
                              -97.615701,
                              30.2332235
                        ],
                        [
                              -97.616783,
                              30.2308875
                        ],
                        [
                              -97.618606,
                              30.228304
                        ],
                        [
                              -97.6176815,
                              30.2278255
                        ],
                        [
                              -97.6174685,
                              30.2278745
                        ],
                        [
                              -97.6165245,
                              30.2293645
                        ],
                        [
                              -97.6165105,
                              30.229358
                        ],
                        [
                              -97.6155665,
                              30.2308465
                        ],
                        [
                              -97.6155115,
                              30.23082
                        ],
                        [
                              -97.6154925,
                              30.2308115
                        ],
                        [
                              -97.616422,
                              30.2293185
                        ],
                        [
                              -97.616436,
                              30.2293245
                        ],
                        [
                              -97.617356,
                              30.22782
                        ],
                        [
                              -97.617492,
                              30.227686
                        ],
                        [
                              -97.617538,
                              30.227616
                        ],
                        [
                              -97.6176945,
                              30.2276965
                        ],
                        [
                              -97.618673,
                              30.228201
                        ],
                        [
                              -97.6188085,
                              30.2280035
                        ],
                        [
                              -97.6191245,
                              30.228167
                        ],
                        [
                              -97.61982,
                              30.227177
                        ],
                        [
                              -97.619968,
                              30.2269605
                        ],
                        [
                              -97.6201095,
                              30.2267405
                        ],
                        [
                              -97.620296,
                              30.2264275
                        ],
                        [
                              -97.6204695,
                              30.2262755
                        ],
                        [
                              -97.620524,
                              30.226224
                        ],
                        [
                              -97.620573,
                              30.2261695
                        ],
                        [
                              -97.6206175,
                              30.2261115
                        ],
                        [
                              -97.6206565,
                              30.226051
                        ],
                        [
                              -97.62069,
                              30.225988
                        ],
                        [
                              -97.620776,
                              30.2257995
                        ],
                        [
                              -97.6208565,
                              30.225609
                        ],
                        [
                              -97.6209315,
                              30.2254165
                        ],
                        [
                              -97.6210005,
                              30.225223
                        ],
                        [
                              -97.621063,
                              30.2250275
                        ],
                        [
                              -97.62112,
                              30.2248305
                        ],
                        [
                              -97.62114,
                              30.224747
                        ],
                        [
                              -97.621154,
                              30.2246625
                        ],
                        [
                              -97.621162,
                              30.224577
                        ],
                        [
                              -97.6211645,
                              30.2244915
                        ],
                        [
                              -97.6211625,
                              30.2240495
                        ],
                        [
                              -97.6212555,
                              30.223901
                        ],
                        [
                              -97.621661,
                              30.2219535
                        ],
                        [
                              -97.621657,
                              30.221141
                        ],
                        [
                              -97.621647,
                              30.2185475
                        ],
                        [
                              -97.6216135,
                              30.2124155
                        ],
                        [
                              -97.6214355,
                              30.211215
                        ],
                        [
                              -97.6213925,
                              30.210922
                        ],
                        [
                              -97.620971,
                              30.21101
                        ],
                        [
                              -97.6206535,
                              30.211083
                        ],
                        [
                              -97.6201165,
                              30.2112355
                        ],
                        [
                              -97.618869,
                              30.2116685
                        ],
                        [
                              -97.618425,
                              30.211924
                        ],
                        [
                              -97.6178815,
                              30.212202
                        ],
                        [
                              -97.616493,
                              30.213254
                        ],
                        [
                              -97.61598,
                              30.21361
                        ],
                        [
                              -97.6147255,
                              30.214071
                        ],
                        [
                              -97.6142585,
                              30.214194
                        ],
                        [
                              -97.6139425,
                              30.2142555
                        ],
                        [
                              -97.6129875,
                              30.2149245
                        ],
                        [
                              -97.6130665,
                              30.214426
                        ],
                        [
                              -97.6131,
                              30.21432
                        ],
                        [
                              -97.6123325,
                              30.2134745
                        ],
                        [
                              -97.612325,
                              30.213373
                        ],
                        [
                              -97.6122525,
                              30.213005
                        ],
                        [
                              -97.6118005,
                              30.2128795
                        ],
                        [
                              -97.61128,
                              30.2128395
                        ],
                        [
                              -97.6104155,
                              30.213066
                        ],
                        [
                              -97.609435,
                              30.2134845
                        ],
                        [
                              -97.608792,
                              30.213784
                        ],
                        [
                              -97.60845,
                              30.214217
                        ],
                        [
                              -97.6081095,
                              30.2148865
                        ],
                        [
                              -97.607828,
                              30.21535
                        ],
                        [
                              -97.607769,
                              30.215492
                        ],
                        [
                              -97.607284,
                              30.2160125
                        ],
                        [
                              -97.6071735,
                              30.2161935
                        ],
                        [
                              -97.6072195,
                              30.2164235
                        ],
                        [
                              -97.607159,
                              30.2166975
                        ],
                        [
                              -97.6068835,
                              30.217104
                        ],
                        [
                              -97.6065055,
                              30.217417
                        ],
                        [
                              -97.6065635,
                              30.2172345
                        ],
                        [
                              -97.606674,
                              30.2170535
                        ],
                        [
                              -97.6067305,
                              30.2169175
                        ],
                        [
                              -97.6067345,
                              30.21678
                        ],
                        [
                              -97.606575,
                              30.2168225
                        ],
                        [
                              -97.6064115,
                              30.2170025
                        ],
                        [
                              -97.6061905,
                              30.2173645
                        ],
                        [
                              -97.606185,
                              30.2175475
                        ],
                        [
                              -97.6060745,
                              30.2177285
                        ],
                        [
                              -97.6058595,
                              30.2178615
                        ],
                        [
                              -97.6055865,
                              30.2181765
                        ],
                        [
                              -97.605526,
                              30.21845
                        ],
                        [
                              -97.605521,
                              30.2186335
                        ],
                        [
                              -97.605243,
                              30.219132
                        ],
                        [
                              -97.605238,
                              30.219315
                        ],
                        [
                              -97.6051285,
                              30.21945
                        ],
                        [
                              -97.6052275,
                              30.2196815
                        ],
                        [
                              -97.6052235,
                              30.219819
                        ],
                        [
                              -97.6051645,
                              30.220047
                        ],
                        [
                              -97.605265,
                              30.2202325
                        ],
                        [
                              -97.6053675,
                              30.220326
                        ],
                        [
                              -97.60536,
                              30.220601
                        ],
                        [
                              -97.605356,
                              30.2207385
                        ],
                        [
                              -97.605255,
                              30.2211945
                        ],
                        [
                              -97.6051445,
                              30.2213755
                        ],
                        [
                              -97.6051365,
                              30.2216505
                        ],
                        [
                              -97.6049695,
                              30.221968
                        ],
                        [
                              -97.6049075,
                              30.2222875
                        ],
                        [
                              -97.604681,
                              30.2228325
                        ],
                        [
                              -97.604447,
                              30.2232415
                        ],
                        [
                              -97.6042815,
                              30.2236515
                        ],
                        [
                              -97.604212,
                              30.2239285
                        ],
                        [
                              -97.6041405,
                              30.224499
                        ],
                        [
                              -97.604127,
                              30.224635
                        ],
                        [
                              -97.604191,
                              30.2251415
                        ],
                        [
                              -97.604029,
                              30.225956
                        ],
                        [
                              -97.603535,
                              30.2268465
                        ],
                        [
                              -97.602871,
                              30.227241
                        ],
                        [
                              -97.6015795,
                              30.2275835
                        ],
                        [
                              -97.601269,
                              30.2276335
                        ],
                        [
                              -97.600852,
                              30.227596
                        ],
                        [
                              -97.600585,
                              30.2276205
                        ],
                        [
                              -97.5997295,
                              30.2277525
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 30.223605,
            "lng": -97.6120065
      },
      "properties": {
            "owner": "COLORADO RIVER PROJECT LLC",
            "lot_size_sqft": null,
            "lot_acres": null,
            "zoning": "",
            "zoning_description": "",
            "property_type": "",
            "assessed_value": 3323759771,
            "land_value": null,
            "improvement_value": null,
            "last_sale_price": null,
            "sale_date": "",
            "county": "travis",
            "qoz_status": "No",
            "use_code": "",
            "use_description": "",
            "subdivision": "",
            "num_stories": null,
            "num_units": null,
            "num_rooms": null,
            "year_built": 2020,
            "tax_year": "",
            "parcel_value_type": "",
            "census_tract": "",
            "census_block": "",
            "qoz_tract": "",
            "last_refresh_date": "",
            "regrid_updated_at": "",
            "owner_mailing_address": "",
            "owner_mail_city": "",
            "owner_mail_state": "",
            "owner_mail_zip": "",
            "qualified_opportunity_zone": "No"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Tesla Gigafactory",
            "description": "Tesla's massive electric vehicle and battery manufacturing facility",
            "type": "industrial"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Chase Headquarters',
      description: 'JPMorgan Chase\'s corporate headquarters building',
      type: 'office'
    },

    // Basic identifiers
    regrid_id: '408476',
    apn: '1012830021',
    address: '270 PARK AVE',
    city: 'NEW YORK',
    state: 'NY',
    zip_code: '10017',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -73.976785,
                        40.7559985
                  ],
                  [
                        -73.97649,
                        40.755874
                  ],
                  [
                        -73.975548,
                        40.755478
                  ],
                  [
                        -73.9751925,
                        40.755965
                  ],
                  [
                        -73.976083,
                        40.75634
                  ],
                  [
                        -73.976429,
                        40.7564855
                  ],
                  [
                        -73.976785,
                        40.7559985
                  ]
            ]
      ]
},
    lat: 40.755982,
    lng: -73.975989,

    // Property details
    year_built: 2021,
    owner: 'JPMORGAN CHASE BANK',
    last_sale_price: null,
    sale_date: null,
    county: 'new-york',
    qoz_status: 'No',
    improvement_value: null,
    land_value: 96400000,
    assessed_value: 96400000,

    // Extended details
    use_code: '05',
    use_description: null,
    zoning: 'C5-3',
    zoning_description: 'Restricted Central Commercial',
    num_stories: 70,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 1.82432,
    lot_size_sqft: 79469,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'MARKET',

    // Location data
    census_tract: '36061009400',
    census_block: '360610094002001',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2025-04-29',
    regrid_updated_at: '2025-09-15 15:15:28 -0400',

    // Owner mailing
    owner_mailing_address: '383 MADISON AVE',
    owner_mail_city: 'NEW YORK',
    owner_mail_state: 'NY',
    owner_mail_zip: '10017-3217',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "408476",
      "apn": "1012830021",
      "address": {
            "line1": "270 PARK AVE",
            "line2": "",
            "city": "NEW YORK",
            "state": "NY",
            "zip": "10017"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -73.976785,
                              40.7559985
                        ],
                        [
                              -73.97649,
                              40.755874
                        ],
                        [
                              -73.975548,
                              40.755478
                        ],
                        [
                              -73.9751925,
                              40.755965
                        ],
                        [
                              -73.976083,
                              40.75634
                        ],
                        [
                              -73.976429,
                              40.7564855
                        ],
                        [
                              -73.976785,
                              40.7559985
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 40.755982,
            "lng": -73.975989
      },
      "properties": {
            "owner": "JPMORGAN CHASE BANK",
            "lot_size_sqft": 79469,
            "lot_acres": 1.82432,
            "year_built": 2021,
            "zoning": "C5-3",
            "zoning_description": "Restricted Central Commercial",
            "property_type": "",
            "assessed_value": 96400000,
            "land_value": 96400000,
            "sale_date": "",
            "county": "new-york",
            "qoz_status": "No",
            "use_code": "05",
            "use_description": "",
            "subdivision": "",
            "num_stories": 70,
            "tax_year": "2025",
            "parcel_value_type": "MARKET",
            "census_tract": "36061009400",
            "census_block": "360610094002001",
            "qoz_tract": "",
            "last_refresh_date": "2025-04-29",
            "regrid_updated_at": "2025-09-15 15:15:28 -0400",
            "owner_mailing_address": "383 MADISON AVE",
            "owner_mail_city": "NEW YORK",
            "owner_mail_state": "NY",
            "owner_mail_zip": "10017-3217",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 408476,
            "geoid": "36061",
            "parcelnumb": "1012830021",
            "parcelnumb_no_formatting": "1012830021",
            "usecode": "05",
            "structno": 1,
            "yearbuilt": 2021,
            "numstories": 70,
            "numunits": 0,
            "parvaltype": "MARKET",
            "landval": 96400000,
            "parval": 96400000,
            "taxyear": "2025",
            "mailadd": "383 MADISON AVE",
            "mail_addno": "383",
            "mail_addstr": "MADISON",
            "mail_addsttyp": "AVE",
            "mail_city": "NEW YORK",
            "mail_state2": "NY",
            "mail_zip": "10017-3217",
            "original_mailing_address": "{\"mailadd\":\"383 MADISON AVE.\",\"mail_city\":\"NEW YORK\",\"mail_state2\":\"NY\",\"mail_zip\":\"10017-3217\"}",
            "address": "270 PARK AVE",
            "saddno": "270",
            "saddstr": "PARK",
            "saddsttyp": "AVE",
            "scity": "NEW YORK",
            "original_address": "{\"address\":\"270 PARK AVENUE\",\"saddno\":\"270\",\"saddstr\":\"PARK AVENUE\",\"scity\":\"NEW YORK\",\"szip\":\"10017\"}",
            "city": "manhattan",
            "state2": "NY",
            "szip": "10017-2014",
            "szip5": "10017",
            "address_source": "county;cass",
            "block": "1283",
            "lot": "21",
            "lat": "40.755982",
            "lon": "-73.975989",
            "qoz": "No",
            "census_blockgroup": "360610094002",
            "census_zcta": "10017",
            "ll_last_refresh": "2025-04-29",
            "sqft": 80333,
            "ll_gisacre": 1.82432,
            "ll_gissqft": 79469,
            "path": "/us/ny/new-york/manhattan/408476",
            "ll_stable_id": "geometry",
            "ll_uuid": "04487036-ba01-43ca-bb54-118fcb05355a",
            "ll_updated_at": "2025-09-15 15:15:28 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Chase Headquarters",
            "description": "JPMorgan Chase's corporate headquarters building",
            "type": "office"
      }
}
  },
  {
    // Curated metadata
    curatedMetadata: {
      name: 'Boeing Everett Factory',
      description: 'The world\'s largest building by volume, manufacturing Boeing aircraft',
      type: 'aviation'
    },

    // Basic identifiers
    regrid_id: '133384',
    apn: '28041000100200',
    address: '3003 W CASINO RD',
    city: 'EVERETT',
    state: 'WA',
    zip_code: '98204',

    // Geometry and location
    geometry: {
      "type": "MultiPolygon",
      "coordinates": [
            [
                  [
                        [
                              -122.276871,
                              47.9217325
                        ],
                        [
                              -122.2777365,
                              47.9217215
                        ],
                        [
                              -122.277814,
                              47.9217215
                        ],
                        [
                              -122.2778345,
                              47.9217215
                        ],
                        [
                              -122.277855,
                              47.9217215
                        ],
                        [
                              -122.2778835,
                              47.921722
                        ],
                        [
                              -122.277912,
                              47.9217225
                        ],
                        [
                              -122.2779405,
                              47.9217235
                        ],
                        [
                              -122.277965,
                              47.921724
                        ],
                        [
                              -122.2779935,
                              47.921725
                        ],
                        [
                              -122.278022,
                              47.9217265
                        ],
                        [
                              -122.2780505,
                              47.921728
                        ],
                        [
                              -122.278079,
                              47.9217295
                        ],
                        [
                              -122.278107,
                              47.9217315
                        ],
                        [
                              -122.2781355,
                              47.9217335
                        ],
                        [
                              -122.278164,
                              47.9217355
                        ],
                        [
                              -122.2781925,
                              47.921738
                        ],
                        [
                              -122.2782245,
                              47.921741
                        ],
                        [
                              -122.278253,
                              47.9217435
                        ],
                        [
                              -122.278281,
                              47.9217465
                        ],
                        [
                              -122.2783055,
                              47.921749
                        ],
                        [
                              -122.2783295,
                              47.9217515
                        ],
                        [
                              -122.2783535,
                              47.9217545
                        ],
                        [
                              -122.2783775,
                              47.9217575
                        ],
                        [
                              -122.2784055,
                              47.9217615
                        ],
                        [
                              -122.2784375,
                              47.921766
                        ],
                        [
                              -122.2784735,
                              47.921771
                        ],
                        [
                              -122.2785095,
                              47.9217765
                        ],
                        [
                              -122.278541,
                              47.9217815
                        ],
                        [
                              -122.278569,
                              47.921786
                        ],
                        [
                              -122.2785965,
                              47.921791
                        ],
                        [
                              -122.278624,
                              47.921796
                        ],
                        [
                              -122.2786515,
                              47.921801
                        ],
                        [
                              -122.278679,
                              47.9218065
                        ],
                        [
                              -122.27871,
                              47.9218125
                        ],
                        [
                              -122.2787415,
                              47.921819
                        ],
                        [
                              -122.2787685,
                              47.921825
                        ],
                        [
                              -122.2787955,
                              47.921831
                        ],
                        [
                              -122.2788225,
                              47.921837
                        ],
                        [
                              -122.2788495,
                              47.9218435
                        ],
                        [
                              -122.2788765,
                              47.92185
                        ],
                        [
                              -122.278892,
                              47.921854
                        ],
                        [
                              -122.278907,
                              47.921858
                        ],
                        [
                              -122.2789375,
                              47.9218655
                        ],
                        [
                              -122.2789715,
                              47.921875
                        ],
                        [
                              -122.2790055,
                              47.921884
                        ],
                        [
                              -122.2790205,
                              47.9218885
                        ],
                        [
                              -122.2790395,
                              47.921894
                        ],
                        [
                              -122.2790615,
                              47.9219005
                        ],
                        [
                              -122.2791025,
                              47.921913
                        ],
                        [
                              -122.2791285,
                              47.921921
                        ],
                        [
                              -122.279151,
                              47.921928
                        ],
                        [
                              -122.279169,
                              47.9219335
                        ],
                        [
                              -122.279191,
                              47.921941
                        ],
                        [
                              -122.2792055,
                              47.921946
                        ],
                        [
                              -122.27922,
                              47.921951
                        ],
                        [
                              -122.2792525,
                              47.9219625
                        ],
                        [
                              -122.279278,
                              47.9219715
                        ],
                        [
                              -122.279303,
                              47.9219805
                        ],
                        [
                              -122.279328,
                              47.92199
                        ],
                        [
                              -122.279349,
                              47.921998
                        ],
                        [
                              -122.2793705,
                              47.922006
                        ],
                        [
                              -122.279395,
                              47.922016
                        ],
                        [
                              -122.2794125,
                              47.922023
                        ],
                        [
                              -122.27943,
                              47.92203
                        ],
                        [
                              -122.2794925,
                              47.9220565
                        ],
                        [
                              -122.2795045,
                              47.9220615
                        ],
                        [
                              -122.2795385,
                              47.9220765
                        ],
                        [
                              -122.279551,
                              47.9220825
                        ],
                        [
                              -122.2795795,
                              47.922095
                        ],
                        [
                              -122.2795945,
                              47.922102
                        ],
                        [
                              -122.2796065,
                              47.922108
                        ],
                        [
                              -122.2796215,
                              47.922115
                        ],
                        [
                              -122.2796335,
                              47.922121
                        ],
                        [
                              -122.279645,
                              47.9221265
                        ],
                        [
                              -122.279663,
                              47.9221355
                        ],
                        [
                              -122.2796805,
                              47.9221445
                        ],
                        [
                              -122.279698,
                              47.9221535
                        ],
                        [
                              -122.2797155,
                              47.9221625
                        ],
                        [
                              -122.27973,
                              47.92217
                        ],
                        [
                              -122.2797445,
                              47.9221775
                        ],
                        [
                              -122.279756,
                              47.9221835
                        ],
                        [
                              -122.2797675,
                              47.9221895
                        ],
                        [
                              -122.27979,
                              47.922202
                        ],
                        [
                              -122.279813,
                              47.922215
                        ],
                        [
                              -122.279827,
                              47.922223
                        ],
                        [
                              -122.279852,
                              47.9222375
                        ],
                        [
                              -122.279863,
                              47.922244
                        ],
                        [
                              -122.279874,
                              47.9222505
                        ],
                        [
                              -122.279885,
                              47.922257
                        ],
                        [
                              -122.2798985,
                              47.922265
                        ],
                        [
                              -122.279912,
                              47.9222735
                        ],
                        [
                              -122.279923,
                              47.92228
                        ],
                        [
                              -122.279939,
                              47.92229
                        ],
                        [
                              -122.2799735,
                              47.9223125
                        ],
                        [
                              -122.2823065,
                              47.9238235
                        ],
                        [
                              -122.2823075,
                              47.922058
                        ],
                        [
                              -122.2823095,
                              47.9184365
                        ],
                        [
                              -122.282309,
                              47.9184365
                        ],
                        [
                              -122.276873,
                              47.91843
                        ],
                        [
                              -122.276871,
                              47.921705
                        ],
                        [
                              -122.276871,
                              47.9217325
                        ]
                  ]
            ],
            [
                  [
                        [
                              -122.2714355,
                              47.9223845
                        ],
                        [
                              -122.271453,
                              47.9256515
                        ],
                        [
                              -122.2714725,
                              47.929252
                        ],
                        [
                              -122.2714945,
                              47.9328845
                        ],
                        [
                              -122.2715165,
                              47.936517
                        ],
                        [
                              -122.2760635,
                              47.936531
                        ],
                        [
                              -122.276907,
                              47.9365335
                        ],
                        [
                              -122.2772325,
                              47.9365345
                        ],
                        [
                              -122.2773255,
                              47.9365345
                        ],
                        [
                              -122.282298,
                              47.9365495
                        ],
                        [
                              -122.2839255,
                              47.9365545
                        ],
                        [
                              -122.284217,
                              47.9362675
                        ],
                        [
                              -122.285035,
                              47.935462
                        ],
                        [
                              -122.285935,
                              47.9348495
                        ],
                        [
                              -122.2875885,
                              47.934787
                        ],
                        [
                              -122.2877155,
                              47.9347335
                        ],
                        [
                              -122.2879495,
                              47.9346415
                        ],
                        [
                              -122.287978,
                              47.9340525
                        ],
                        [
                              -122.2877995,
                              47.9333145
                        ],
                        [
                              -122.2877365,
                              47.9330535
                        ],
                        [
                              -122.287721,
                              47.932939
                        ],
                        [
                              -122.287704,
                              47.9328105
                        ],
                        [
                              -122.286897,
                              47.9322205
                        ],
                        [
                              -122.2869505,
                              47.9307575
                        ],
                        [
                              -122.2871805,
                              47.929311
                        ],
                        [
                              -122.2869325,
                              47.929009
                        ],
                        [
                              -122.286926,
                              47.9289875
                        ],
                        [
                              -122.2869195,
                              47.928966
                        ],
                        [
                              -122.2869125,
                              47.928945
                        ],
                        [
                              -122.2869045,
                              47.928924
                        ],
                        [
                              -122.286896,
                              47.9289025
                        ],
                        [
                              -122.286887,
                              47.928882
                        ],
                        [
                              -122.286878,
                              47.928861
                        ],
                        [
                              -122.286868,
                              47.92884
                        ],
                        [
                              -122.286857,
                              47.9288195
                        ],
                        [
                              -122.286846,
                              47.928799
                        ],
                        [
                              -122.2868345,
                              47.9287785
                        ],
                        [
                              -122.2868225,
                              47.9287585
                        ],
                        [
                              -122.28681,
                              47.9287385
                        ],
                        [
                              -122.2867965,
                              47.9287185
                        ],
                        [
                              -122.286783,
                              47.9286985
                        ],
                        [
                              -122.286769,
                              47.928679
                        ],
                        [
                              -122.286754,
                              47.9286595
                        ],
                        [
                              -122.286739,
                              47.9286405
                        ],
                        [
                              -122.286723,
                              47.928621
                        ],
                        [
                              -122.286707,
                              47.9286025
                        ],
                        [
                              -122.2866905,
                              47.9285835
                        ],
                        [
                              -122.286673,
                              47.928565
                        ],
                        [
                              -122.2866555,
                              47.9285465
                        ],
                        [
                              -122.2866375,
                              47.9285285
                        ],
                        [
                              -122.286619,
                              47.928511
                        ],
                        [
                              -122.2866,
                              47.928493
                        ],
                        [
                              -122.2865805,
                              47.9284755
                        ],
                        [
                              -122.2865605,
                              47.9284585
                        ],
                        [
                              -122.28654,
                              47.9284415
                        ],
                        [
                              -122.286519,
                              47.928425
                        ],
                        [
                              -122.286498,
                              47.9284085
                        ],
                        [
                              -122.2864765,
                              47.928392
                        ],
                        [
                              -122.286454,
                              47.928376
                        ],
                        [
                              -122.2864315,
                              47.9283605
                        ],
                        [
                              -122.2864085,
                              47.928345
                        ],
                        [
                              -122.286372,
                              47.928321
                        ],
                        [
                              -122.2863605,
                              47.9278505
                        ],
                        [
                              -122.2863825,
                              47.9278505
                        ],
                        [
                              -122.2863675,
                              47.92714
                        ],
                        [
                              -122.2863515,
                              47.926417
                        ],
                        [
                              -122.286344,
                              47.926062
                        ],
                        [
                              -122.286336,
                              47.925688
                        ],
                        [
                              -122.287768,
                              47.9256925
                        ],
                        [
                              -122.287764,
                              47.9247225
                        ],
                        [
                              -122.287764,
                              47.924688
                        ],
                        [
                              -122.287715,
                              47.9246915
                        ],
                        [
                              -122.2876945,
                              47.9246925
                        ],
                        [
                              -122.2876745,
                              47.9246935
                        ],
                        [
                              -122.287644,
                              47.9246955
                        ],
                        [
                              -122.2876255,
                              47.9246965
                        ],
                        [
                              -122.287609,
                              47.924697
                        ],
                        [
                              -122.287591,
                              47.924698
                        ],
                        [
                              -122.2875705,
                              47.9246985
                        ],
                        [
                              -122.28755,
                              47.924699
                        ],
                        [
                              -122.2875255,
                              47.9247
                        ],
                        [
                              -122.2875055,
                              47.9247005
                        ],
                        [
                              -122.287489,
                              47.9247005
                        ],
                        [
                              -122.287475,
                              47.924701
                        ],
                        [
                              -122.287422,
                              47.9247015
                        ],
                        [
                              -122.2873635,
                              47.924702
                        ],
                        [
                              -122.2873645,
                              47.924733
                        ],
                        [
                              -122.2873665,
                              47.924812
                        ],
                        [
                              -122.286737,
                              47.92482
                        ],
                        [
                              -122.286393,
                              47.924824
                        ],
                        [
                              -122.2851695,
                              47.9248395
                        ],
                        [
                              -122.2847655,
                              47.9248445
                        ],
                        [
                              -122.2847315,
                              47.9248445
                        ],
                        [
                              -122.2847465,
                              47.9253895
                        ],
                        [
                              -122.2847465,
                              47.925393
                        ],
                        [
                              -122.284522,
                              47.9253955
                        ],
                        [
                              -122.284298,
                              47.9253985
                        ],
                        [
                              -122.2842825,
                              47.9248435
                        ],
                        [
                              -122.284188,
                              47.924812
                        ],
                        [
                              -122.2841025,
                              47.924784
                        ],
                        [
                              -122.283895,
                              47.9247865
                        ],
                        [
                              -122.283851,
                              47.9247865
                        ],
                        [
                              -122.2838325,
                              47.9247865
                        ],
                        [
                              -122.283814,
                              47.9247865
                        ],
                        [
                              -122.2837885,
                              47.9247865
                        ],
                        [
                              -122.283763,
                              47.924786
                        ],
                        [
                              -122.2837405,
                              47.9247855
                        ],
                        [
                              -122.283715,
                              47.924785
                        ],
                        [
                              -122.2836895,
                              47.924784
                        ],
                        [
                              -122.2836635,
                              47.924783
                        ],
                        [
                              -122.283638,
                              47.924782
                        ],
                        [
                              -122.2836125,
                              47.924781
                        ],
                        [
                              -122.283587,
                              47.9247795
                        ],
                        [
                              -122.2835615,
                              47.924778
                        ],
                        [
                              -122.2835355,
                              47.9247765
                        ],
                        [
                              -122.28351,
                              47.9247745
                        ],
                        [
                              -122.283488,
                              47.924773
                        ],
                        [
                              -122.28347,
                              47.9247715
                        ],
                        [
                              -122.283448,
                              47.924769
                        ],
                        [
                              -122.2833935,
                              47.924764
                        ],
                        [
                              -122.2833685,
                              47.9247615
                        ],
                        [
                              -122.28335,
                              47.9247595
                        ],
                        [
                              -122.2833215,
                              47.924756
                        ],
                        [
                              -122.283296,
                              47.924753
                        ],
                        [
                              -122.2832745,
                              47.92475
                        ],
                        [
                              -122.2832525,
                              47.9247475
                        ],
                        [
                              -122.2832275,
                              47.924744
                        ],
                        [
                              -122.2832025,
                              47.92474
                        ],
                        [
                              -122.2831775,
                              47.9247365
                        ],
                        [
                              -122.2831525,
                              47.9247325
                        ],
                        [
                              -122.283131,
                              47.924729
                        ],
                        [
                              -122.2831095,
                              47.924725
                        ],
                        [
                              -122.283085,
                              47.924721
                        ],
                        [
                              -122.283053,
                              47.924715
                        ],
                        [
                              -122.2830245,
                              47.9247095
                        ],
                        [
                              -122.2829965,
                              47.924704
                        ],
                        [
                              -122.282972,
                              47.9246995
                        ],
                        [
                              -122.282954,
                              47.9246955
                        ],
                        [
                              -122.282933,
                              47.924691
                        ],
                        [
                              -122.2829125,
                              47.9246865
                        ],
                        [
                              -122.2828915,
                              47.924682
                        ],
                        [
                              -122.282867,
                              47.924676
                        ],
                        [
                              -122.282836,
                              47.9246685
                        ],
                        [
                              -122.2828015,
                              47.92466
                        ],
                        [
                              -122.282771,
                              47.924652
                        ],
                        [
                              -122.282747,
                              47.924646
                        ],
                        [
                              -122.2827265,
                              47.9246405
                        ],
                        [
                              -122.2827025,
                              47.924634
                        ],
                        [
                              -122.2826755,
                              47.924626
                        ],
                        [
                              -122.282652,
                              47.9246195
                        ],
                        [
                              -122.2826285,
                              47.9246125
                        ],
                        [
                              -122.282605,
                              47.924605
                        ],
                        [
                              -122.2825815,
                              47.924598
                        ],
                        [
                              -122.2825585,
                              47.9245905
                        ],
                        [
                              -122.2825355,
                              47.924583
                        ],
                        [
                              -122.2825155,
                              47.9245765
                        ],
                        [
                              -122.2824895,
                              47.9245675
                        ],
                        [
                              -122.2824665,
                              47.9245595
                        ],
                        [
                              -122.282444,
                              47.9245515
                        ],
                        [
                              -122.2824215,
                              47.924543
                        ],
                        [
                              -122.282399,
                              47.9245345
                        ],
                        [
                              -122.2823765,
                              47.924526
                        ],
                        [
                              -122.2823575,
                              47.924519
                        ],
                        [
                              -122.2823415,
                              47.9245125
                        ],
                        [
                              -122.282306,
                              47.9244985
                        ],
                        [
                              -122.28225,
                              47.924475
                        ],
                        [
                              -122.282228,
                              47.9244655
                        ],
                        [
                              -122.282216,
                              47.9244605
                        ],
                        [
                              -122.2822065,
                              47.9244565
                        ],
                        [
                              -122.2821975,
                              47.924452
                        ],
                        [
                              -122.2821885,
                              47.924448
                        ],
                        [
                              -122.2821735,
                              47.924441
                        ],
                        [
                              -122.2821585,
                              47.924434
                        ],
                        [
                              -122.2821225,
                              47.924417
                        ],
                        [
                              -122.2821015,
                              47.9244065
                        ],
                        [
                              -122.2820865,
                              47.9243995
                        ],
                        [
                              -122.282075,
                              47.9243935
                        ],
                        [
                              -122.28206,
                              47.924386
                        ],
                        [
                              -122.2820455,
                              47.9243785
                        ],
                        [
                              -122.282028,
                              47.9243695
                        ],
                        [
                              -122.282008,
                              47.924359
                        ],
                        [
                              -122.281988,
                              47.924348
                        ],
                        [
                              -122.281968,
                              47.9243375
                        ],
                        [
                              -122.281951,
                              47.924328
                        ],
                        [
                              -122.281937,
                              47.92432
                        ],
                        [
                              -122.28192,
                              47.9243105
                        ],
                        [
                              -122.281903,
                              47.924301
                        ],
                        [
                              -122.2818865,
                              47.924291
                        ],
                        [
                              -122.2818725,
                              47.924283
                        ],
                        [
                              -122.281859,
                              47.924275
                        ],
                        [
                              -122.2818455,
                              47.9242665
                        ],
                        [
                              -122.2818375,
                              47.9242615
                        ],
                        [
                              -122.2818265,
                              47.924255
                        ],
                        [
                              -122.2817885,
                              47.9242305
                        ],
                        [
                              -122.281353,
                              47.9239865
                        ],
                        [
                              -122.2810705,
                              47.924028
                        ],
                        [
                              -122.2810595,
                              47.924225
                        ],
                        [
                              -122.281032,
                              47.9247135
                        ],
                        [
                              -122.2810225,
                              47.924714
                        ],
                        [
                              -122.280865,
                              47.924716
                        ],
                        [
                              -122.280767,
                              47.924717
                        ],
                        [
                              -122.2805425,
                              47.92472
                        ],
                        [
                              -122.280536,
                              47.924472
                        ],
                        [
                              -122.2803765,
                              47.9239495
                        ],
                        [
                              -122.280371,
                              47.9239355
                        ],
                        [
                              -122.280358,
                              47.9238995
                        ],
                        [
                              -122.2803535,
                              47.9238875
                        ],
                        [
                              -122.280349,
                              47.9238755
                        ],
                        [
                              -122.280344,
                              47.9238635
                        ],
                        [
                              -122.280338,
                              47.9238495
                        ],
                        [
                              -122.280333,
                              47.9238375
                        ],
                        [
                              -122.280327,
                              47.9238235
                        ],
                        [
                              -122.2803205,
                              47.923809
                        ],
                        [
                              -122.280313,
                              47.9237925
                        ],
                        [
                              -122.2802975,
                              47.9237595
                        ],
                        [
                              -122.280286,
                              47.923736
                        ],
                        [
                              -122.280278,
                              47.9237195
                        ],
                        [
                              -122.28027,
                              47.9237035
                        ],
                        [
                              -122.2802625,
                              47.9236895
                        ],
                        [
                              -122.280255,
                              47.9236755
                        ],
                        [
                              -122.280245,
                              47.923657
                        ],
                        [
                              -122.2802345,
                              47.9236385
                        ],
                        [
                              -122.280224,
                              47.92362
                        ],
                        [
                              -122.2802145,
                              47.923604
                        ],
                        [
                              -122.2802035,
                              47.9235855
                        ],
                        [
                              -122.2801925,
                              47.9235675
                        ],
                        [
                              -122.2801825,
                              47.9235515
                        ],
                        [
                              -122.280172,
                              47.9235355
                        ],
                        [
                              -122.280162,
                              47.92352
                        ],
                        [
                              -122.28015,
                              47.923502
                        ],
                        [
                              -122.2801375,
                              47.923484
                        ],
                        [
                              -122.280125,
                              47.923466
                        ],
                        [
                              -122.2801155,
                              47.9234525
                        ],
                        [
                              -122.280106,
                              47.9234395
                        ],
                        [
                              -122.280094,
                              47.923424
                        ],
                        [
                              -122.2800825,
                              47.9234085
                        ],
                        [
                              -122.280067,
                              47.923389
                        ],
                        [
                              -122.280038,
                              47.923352
                        ],
                        [
                              -122.280026,
                              47.9233365
                        ],
                        [
                              -122.2800135,
                              47.9233215
                        ],
                        [
                              -122.2800015,
                              47.9233065
                        ],
                        [
                              -122.2799905,
                              47.9232935
                        ],
                        [
                              -122.2799795,
                              47.9232805
                        ],
                        [
                              -122.2799665,
                              47.9232655
                        ],
                        [
                              -122.2799515,
                              47.9232485
                        ],
                        [
                              -122.2799365,
                              47.923232
                        ],
                        [
                              -122.279921,
                              47.923215
                        ],
                        [
                              -122.2799075,
                              47.9232005
                        ],
                        [
                              -122.2798895,
                              47.9231815
                        ],
                        [
                              -122.2798735,
                              47.923165
                        ],
                        [
                              -122.2798555,
                              47.9231465
                        ],
                        [
                              -122.279839,
                              47.9231305
                        ],
                        [
                              -122.2798225,
                              47.923114
                        ],
                        [
                              -122.2798055,
                              47.923098
                        ],
                        [
                              -122.2797885,
                              47.9230815
                        ],
                        [
                              -122.2797735,
                              47.9230675
                        ],
                        [
                              -122.279756,
                              47.9230515
                        ],
                        [
                              -122.279741,
                              47.923038
                        ],
                        [
                              -122.279723,
                              47.923022
                        ],
                        [
                              -122.2797075,
                              47.9230085
                        ],
                        [
                              -122.279689,
                              47.922993
                        ],
                        [
                              -122.2796705,
                              47.9229775
                        ],
                        [
                              -122.27965,
                              47.9229605
                        ],
                        [
                              -122.279624,
                              47.9229395
                        ],
                        [
                              -122.279612,
                              47.92293
                        ],
                        [
                              -122.2796,
                              47.922921
                        ],
                        [
                              -122.2795525,
                              47.922884
                        ],
                        [
                              -122.2795525,
                              47.9228835
                        ],
                        [
                              -122.2794945,
                              47.9228405
                        ],
                        [
                              -122.279337,
                              47.9227565
                        ],
                        [
                              -122.2793155,
                              47.9227425
                        ],
                        [
                              -122.279305,
                              47.922736
                        ],
                        [
                              -122.2792915,
                              47.9227275
                        ],
                        [
                              -122.2792775,
                              47.9227195
                        ],
                        [
                              -122.2792475,
                              47.9227015
                        ],
                        [
                              -122.279239,
                              47.9226965
                        ],
                        [
                              -122.279228,
                              47.92269
                        ],
                        [
                              -122.2792165,
                              47.922684
                        ],
                        [
                              -122.2792055,
                              47.9226775
                        ],
                        [
                              -122.279197,
                              47.922673
                        ],
                        [
                              -122.2791795,
                              47.9226635
                        ],
                        [
                              -122.279148,
                              47.922647
                        ],
                        [
                              -122.2791335,
                              47.9226395
                        ],
                        [
                              -122.2791155,
                              47.9226305
                        ],
                        [
                              -122.279107,
                              47.922626
                        ],
                        [
                              -122.279095,
                              47.9226205
                        ],
                        [
                              -122.279074,
                              47.9226105
                        ],
                        [
                              -122.27905,
                              47.922599
                        ],
                        [
                              -122.2790375,
                              47.9225935
                        ],
                        [
                              -122.2790285,
                              47.9225895
                        ],
                        [
                              -122.2790135,
                              47.9225825
                        ],
                        [
                              -122.2789945,
                              47.9225745
                        ],
                        [
                              -122.2789605,
                              47.92256
                        ],
                        [
                              -122.2789515,
                              47.922556
                        ],
                        [
                              -122.278942,
                              47.9225525
                        ],
                        [
                              -122.278926,
                              47.922546
                        ],
                        [
                              -122.2789005,
                              47.922536
                        ],
                        [
                              -122.2788815,
                              47.922529
                        ],
                        [
                              -122.278862,
                              47.9225215
                        ],
                        [
                              -122.278846,
                              47.922516
                        ],
                        [
                              -122.278833,
                              47.922511
                        ],
                        [
                              -122.2787975,
                              47.9224985
                        ],
                        [
                              -122.2787875,
                              47.922495
                        ],
                        [
                              -122.278781,
                              47.922493
                        ],
                        [
                              -122.2787645,
                              47.9224875
                        ],
                        [
                              -122.2787445,
                              47.9224815
                        ],
                        [
                              -122.2787245,
                              47.922475
                        ],
                        [
                              -122.278698,
                              47.922467
                        ],
                        [
                              -122.278691,
                              47.922465
                        ],
                        [
                              -122.278682,
                              47.9224625
                        ],
                        [
                              -122.278678,
                              47.922461
                        ],
                        [
                              -122.2785605,
                              47.9223075
                        ],
                        [
                              -122.278288,
                              47.9222575
                        ],
                        [
                              -122.2780165,
                              47.922274
                        ],
                        [
                              -122.2779935,
                              47.922275
                        ],
                        [
                              -122.2779625,
                              47.922274
                        ],
                        [
                              -122.2777515,
                              47.922267
                        ],
                        [
                              -122.276871,
                              47.922278
                        ],
                        [
                              -122.271435,
                              47.9223115
                        ],
                        [
                              -122.2714355,
                              47.9223845
                        ]
                  ]
            ]
      ]
},
    lat: 47.928938,
    lng: -122.278891,

    // Property details
    year_built: 1966,
    owner: 'BOEING COMPANY',
    last_sale_price: null,
    sale_date: '2002-02-26',
    county: 'snohomish',
    qoz_status: 'No',
    improvement_value: 732624900,
    land_value: 178196100,
    assessed_value: 910821000,

    // Extended details
    use_code: '344',
    use_description: 'Transportation Equipment',
    zoning: 'HI',
    zoning_description: 'Heavy Industrial',
    num_stories: null,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 456.76492,
    lot_size_sqft: 19897094,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'MARKET',

    // Location data
    census_tract: '53061041304',
    census_block: '530610413042010',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2025-08-19',
    regrid_updated_at: '2025-09-15 15:46:37 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX 52427',
    owner_mail_city: 'ATLANTA',
    owner_mail_state: 'GA',
    owner_mail_zip: '30355-0427',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "133384",
      "apn": "28041000100200",
      "address": {
            "line1": "3003 W CASINO RD",
            "line2": "",
            "city": "EVERETT",
            "state": "WA",
            "zip": "98204"
      },
      "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                  [
                        [
                              [
                                    -122.276871,
                                    47.9217325
                              ],
                              [
                                    -122.2777365,
                                    47.9217215
                              ],
                              [
                                    -122.277814,
                                    47.9217215
                              ],
                              [
                                    -122.2778345,
                                    47.9217215
                              ],
                              [
                                    -122.277855,
                                    47.9217215
                              ],
                              [
                                    -122.2778835,
                                    47.921722
                              ],
                              [
                                    -122.277912,
                                    47.9217225
                              ],
                              [
                                    -122.2779405,
                                    47.9217235
                              ],
                              [
                                    -122.277965,
                                    47.921724
                              ],
                              [
                                    -122.2779935,
                                    47.921725
                              ],
                              [
                                    -122.278022,
                                    47.9217265
                              ],
                              [
                                    -122.2780505,
                                    47.921728
                              ],
                              [
                                    -122.278079,
                                    47.9217295
                              ],
                              [
                                    -122.278107,
                                    47.9217315
                              ],
                              [
                                    -122.2781355,
                                    47.9217335
                              ],
                              [
                                    -122.278164,
                                    47.9217355
                              ],
                              [
                                    -122.2781925,
                                    47.921738
                              ],
                              [
                                    -122.2782245,
                                    47.921741
                              ],
                              [
                                    -122.278253,
                                    47.9217435
                              ],
                              [
                                    -122.278281,
                                    47.9217465
                              ],
                              [
                                    -122.2783055,
                                    47.921749
                              ],
                              [
                                    -122.2783295,
                                    47.9217515
                              ],
                              [
                                    -122.2783535,
                                    47.9217545
                              ],
                              [
                                    -122.2783775,
                                    47.9217575
                              ],
                              [
                                    -122.2784055,
                                    47.9217615
                              ],
                              [
                                    -122.2784375,
                                    47.921766
                              ],
                              [
                                    -122.2784735,
                                    47.921771
                              ],
                              [
                                    -122.2785095,
                                    47.9217765
                              ],
                              [
                                    -122.278541,
                                    47.9217815
                              ],
                              [
                                    -122.278569,
                                    47.921786
                              ],
                              [
                                    -122.2785965,
                                    47.921791
                              ],
                              [
                                    -122.278624,
                                    47.921796
                              ],
                              [
                                    -122.2786515,
                                    47.921801
                              ],
                              [
                                    -122.278679,
                                    47.9218065
                              ],
                              [
                                    -122.27871,
                                    47.9218125
                              ],
                              [
                                    -122.2787415,
                                    47.921819
                              ],
                              [
                                    -122.2787685,
                                    47.921825
                              ],
                              [
                                    -122.2787955,
                                    47.921831
                              ],
                              [
                                    -122.2788225,
                                    47.921837
                              ],
                              [
                                    -122.2788495,
                                    47.9218435
                              ],
                              [
                                    -122.2788765,
                                    47.92185
                              ],
                              [
                                    -122.278892,
                                    47.921854
                              ],
                              [
                                    -122.278907,
                                    47.921858
                              ],
                              [
                                    -122.2789375,
                                    47.9218655
                              ],
                              [
                                    -122.2789715,
                                    47.921875
                              ],
                              [
                                    -122.2790055,
                                    47.921884
                              ],
                              [
                                    -122.2790205,
                                    47.9218885
                              ],
                              [
                                    -122.2790395,
                                    47.921894
                              ],
                              [
                                    -122.2790615,
                                    47.9219005
                              ],
                              [
                                    -122.2791025,
                                    47.921913
                              ],
                              [
                                    -122.2791285,
                                    47.921921
                              ],
                              [
                                    -122.279151,
                                    47.921928
                              ],
                              [
                                    -122.279169,
                                    47.9219335
                              ],
                              [
                                    -122.279191,
                                    47.921941
                              ],
                              [
                                    -122.2792055,
                                    47.921946
                              ],
                              [
                                    -122.27922,
                                    47.921951
                              ],
                              [
                                    -122.2792525,
                                    47.9219625
                              ],
                              [
                                    -122.279278,
                                    47.9219715
                              ],
                              [
                                    -122.279303,
                                    47.9219805
                              ],
                              [
                                    -122.279328,
                                    47.92199
                              ],
                              [
                                    -122.279349,
                                    47.921998
                              ],
                              [
                                    -122.2793705,
                                    47.922006
                              ],
                              [
                                    -122.279395,
                                    47.922016
                              ],
                              [
                                    -122.2794125,
                                    47.922023
                              ],
                              [
                                    -122.27943,
                                    47.92203
                              ],
                              [
                                    -122.2794925,
                                    47.9220565
                              ],
                              [
                                    -122.2795045,
                                    47.9220615
                              ],
                              [
                                    -122.2795385,
                                    47.9220765
                              ],
                              [
                                    -122.279551,
                                    47.9220825
                              ],
                              [
                                    -122.2795795,
                                    47.922095
                              ],
                              [
                                    -122.2795945,
                                    47.922102
                              ],
                              [
                                    -122.2796065,
                                    47.922108
                              ],
                              [
                                    -122.2796215,
                                    47.922115
                              ],
                              [
                                    -122.2796335,
                                    47.922121
                              ],
                              [
                                    -122.279645,
                                    47.9221265
                              ],
                              [
                                    -122.279663,
                                    47.9221355
                              ],
                              [
                                    -122.2796805,
                                    47.9221445
                              ],
                              [
                                    -122.279698,
                                    47.9221535
                              ],
                              [
                                    -122.2797155,
                                    47.9221625
                              ],
                              [
                                    -122.27973,
                                    47.92217
                              ],
                              [
                                    -122.2797445,
                                    47.9221775
                              ],
                              [
                                    -122.279756,
                                    47.9221835
                              ],
                              [
                                    -122.2797675,
                                    47.9221895
                              ],
                              [
                                    -122.27979,
                                    47.922202
                              ],
                              [
                                    -122.279813,
                                    47.922215
                              ],
                              [
                                    -122.279827,
                                    47.922223
                              ],
                              [
                                    -122.279852,
                                    47.9222375
                              ],
                              [
                                    -122.279863,
                                    47.922244
                              ],
                              [
                                    -122.279874,
                                    47.9222505
                              ],
                              [
                                    -122.279885,
                                    47.922257
                              ],
                              [
                                    -122.2798985,
                                    47.922265
                              ],
                              [
                                    -122.279912,
                                    47.9222735
                              ],
                              [
                                    -122.279923,
                                    47.92228
                              ],
                              [
                                    -122.279939,
                                    47.92229
                              ],
                              [
                                    -122.2799735,
                                    47.9223125
                              ],
                              [
                                    -122.2823065,
                                    47.9238235
                              ],
                              [
                                    -122.2823075,
                                    47.922058
                              ],
                              [
                                    -122.2823095,
                                    47.9184365
                              ],
                              [
                                    -122.282309,
                                    47.9184365
                              ],
                              [
                                    -122.276873,
                                    47.91843
                              ],
                              [
                                    -122.276871,
                                    47.921705
                              ],
                              [
                                    -122.276871,
                                    47.9217325
                              ]
                        ]
                  ],
                  [
                        [
                              [
                                    -122.2714355,
                                    47.9223845
                              ],
                              [
                                    -122.271453,
                                    47.9256515
                              ],
                              [
                                    -122.2714725,
                                    47.929252
                              ],
                              [
                                    -122.2714945,
                                    47.9328845
                              ],
                              [
                                    -122.2715165,
                                    47.936517
                              ],
                              [
                                    -122.2760635,
                                    47.936531
                              ],
                              [
                                    -122.276907,
                                    47.9365335
                              ],
                              [
                                    -122.2772325,
                                    47.9365345
                              ],
                              [
                                    -122.2773255,
                                    47.9365345
                              ],
                              [
                                    -122.282298,
                                    47.9365495
                              ],
                              [
                                    -122.2839255,
                                    47.9365545
                              ],
                              [
                                    -122.284217,
                                    47.9362675
                              ],
                              [
                                    -122.285035,
                                    47.935462
                              ],
                              [
                                    -122.285935,
                                    47.9348495
                              ],
                              [
                                    -122.2875885,
                                    47.934787
                              ],
                              [
                                    -122.2877155,
                                    47.9347335
                              ],
                              [
                                    -122.2879495,
                                    47.9346415
                              ],
                              [
                                    -122.287978,
                                    47.9340525
                              ],
                              [
                                    -122.2877995,
                                    47.9333145
                              ],
                              [
                                    -122.2877365,
                                    47.9330535
                              ],
                              [
                                    -122.287721,
                                    47.932939
                              ],
                              [
                                    -122.287704,
                                    47.9328105
                              ],
                              [
                                    -122.286897,
                                    47.9322205
                              ],
                              [
                                    -122.2869505,
                                    47.9307575
                              ],
                              [
                                    -122.2871805,
                                    47.929311
                              ],
                              [
                                    -122.2869325,
                                    47.929009
                              ],
                              [
                                    -122.286926,
                                    47.9289875
                              ],
                              [
                                    -122.2869195,
                                    47.928966
                              ],
                              [
                                    -122.2869125,
                                    47.928945
                              ],
                              [
                                    -122.2869045,
                                    47.928924
                              ],
                              [
                                    -122.286896,
                                    47.9289025
                              ],
                              [
                                    -122.286887,
                                    47.928882
                              ],
                              [
                                    -122.286878,
                                    47.928861
                              ],
                              [
                                    -122.286868,
                                    47.92884
                              ],
                              [
                                    -122.286857,
                                    47.9288195
                              ],
                              [
                                    -122.286846,
                                    47.928799
                              ],
                              [
                                    -122.2868345,
                                    47.9287785
                              ],
                              [
                                    -122.2868225,
                                    47.9287585
                              ],
                              [
                                    -122.28681,
                                    47.9287385
                              ],
                              [
                                    -122.2867965,
                                    47.9287185
                              ],
                              [
                                    -122.286783,
                                    47.9286985
                              ],
                              [
                                    -122.286769,
                                    47.928679
                              ],
                              [
                                    -122.286754,
                                    47.9286595
                              ],
                              [
                                    -122.286739,
                                    47.9286405
                              ],
                              [
                                    -122.286723,
                                    47.928621
                              ],
                              [
                                    -122.286707,
                                    47.9286025
                              ],
                              [
                                    -122.2866905,
                                    47.9285835
                              ],
                              [
                                    -122.286673,
                                    47.928565
                              ],
                              [
                                    -122.2866555,
                                    47.9285465
                              ],
                              [
                                    -122.2866375,
                                    47.9285285
                              ],
                              [
                                    -122.286619,
                                    47.928511
                              ],
                              [
                                    -122.2866,
                                    47.928493
                              ],
                              [
                                    -122.2865805,
                                    47.9284755
                              ],
                              [
                                    -122.2865605,
                                    47.9284585
                              ],
                              [
                                    -122.28654,
                                    47.9284415
                              ],
                              [
                                    -122.286519,
                                    47.928425
                              ],
                              [
                                    -122.286498,
                                    47.9284085
                              ],
                              [
                                    -122.2864765,
                                    47.928392
                              ],
                              [
                                    -122.286454,
                                    47.928376
                              ],
                              [
                                    -122.2864315,
                                    47.9283605
                              ],
                              [
                                    -122.2864085,
                                    47.928345
                              ],
                              [
                                    -122.286372,
                                    47.928321
                              ],
                              [
                                    -122.2863605,
                                    47.9278505
                              ],
                              [
                                    -122.2863825,
                                    47.9278505
                              ],
                              [
                                    -122.2863675,
                                    47.92714
                              ],
                              [
                                    -122.2863515,
                                    47.926417
                              ],
                              [
                                    -122.286344,
                                    47.926062
                              ],
                              [
                                    -122.286336,
                                    47.925688
                              ],
                              [
                                    -122.287768,
                                    47.9256925
                              ],
                              [
                                    -122.287764,
                                    47.9247225
                              ],
                              [
                                    -122.287764,
                                    47.924688
                              ],
                              [
                                    -122.287715,
                                    47.9246915
                              ],
                              [
                                    -122.2876945,
                                    47.9246925
                              ],
                              [
                                    -122.2876745,
                                    47.9246935
                              ],
                              [
                                    -122.287644,
                                    47.9246955
                              ],
                              [
                                    -122.2876255,
                                    47.9246965
                              ],
                              [
                                    -122.287609,
                                    47.924697
                              ],
                              [
                                    -122.287591,
                                    47.924698
                              ],
                              [
                                    -122.2875705,
                                    47.9246985
                              ],
                              [
                                    -122.28755,
                                    47.924699
                              ],
                              [
                                    -122.2875255,
                                    47.9247
                              ],
                              [
                                    -122.2875055,
                                    47.9247005
                              ],
                              [
                                    -122.287489,
                                    47.9247005
                              ],
                              [
                                    -122.287475,
                                    47.924701
                              ],
                              [
                                    -122.287422,
                                    47.9247015
                              ],
                              [
                                    -122.2873635,
                                    47.924702
                              ],
                              [
                                    -122.2873645,
                                    47.924733
                              ],
                              [
                                    -122.2873665,
                                    47.924812
                              ],
                              [
                                    -122.286737,
                                    47.92482
                              ],
                              [
                                    -122.286393,
                                    47.924824
                              ],
                              [
                                    -122.2851695,
                                    47.9248395
                              ],
                              [
                                    -122.2847655,
                                    47.9248445
                              ],
                              [
                                    -122.2847315,
                                    47.9248445
                              ],
                              [
                                    -122.2847465,
                                    47.9253895
                              ],
                              [
                                    -122.2847465,
                                    47.925393
                              ],
                              [
                                    -122.284522,
                                    47.9253955
                              ],
                              [
                                    -122.284298,
                                    47.9253985
                              ],
                              [
                                    -122.2842825,
                                    47.9248435
                              ],
                              [
                                    -122.284188,
                                    47.924812
                              ],
                              [
                                    -122.2841025,
                                    47.924784
                              ],
                              [
                                    -122.283895,
                                    47.9247865
                              ],
                              [
                                    -122.283851,
                                    47.9247865
                              ],
                              [
                                    -122.2838325,
                                    47.9247865
                              ],
                              [
                                    -122.283814,
                                    47.9247865
                              ],
                              [
                                    -122.2837885,
                                    47.9247865
                              ],
                              [
                                    -122.283763,
                                    47.924786
                              ],
                              [
                                    -122.2837405,
                                    47.9247855
                              ],
                              [
                                    -122.283715,
                                    47.924785
                              ],
                              [
                                    -122.2836895,
                                    47.924784
                              ],
                              [
                                    -122.2836635,
                                    47.924783
                              ],
                              [
                                    -122.283638,
                                    47.924782
                              ],
                              [
                                    -122.2836125,
                                    47.924781
                              ],
                              [
                                    -122.283587,
                                    47.9247795
                              ],
                              [
                                    -122.2835615,
                                    47.924778
                              ],
                              [
                                    -122.2835355,
                                    47.9247765
                              ],
                              [
                                    -122.28351,
                                    47.9247745
                              ],
                              [
                                    -122.283488,
                                    47.924773
                              ],
                              [
                                    -122.28347,
                                    47.9247715
                              ],
                              [
                                    -122.283448,
                                    47.924769
                              ],
                              [
                                    -122.2833935,
                                    47.924764
                              ],
                              [
                                    -122.2833685,
                                    47.9247615
                              ],
                              [
                                    -122.28335,
                                    47.9247595
                              ],
                              [
                                    -122.2833215,
                                    47.924756
                              ],
                              [
                                    -122.283296,
                                    47.924753
                              ],
                              [
                                    -122.2832745,
                                    47.92475
                              ],
                              [
                                    -122.2832525,
                                    47.9247475
                              ],
                              [
                                    -122.2832275,
                                    47.924744
                              ],
                              [
                                    -122.2832025,
                                    47.92474
                              ],
                              [
                                    -122.2831775,
                                    47.9247365
                              ],
                              [
                                    -122.2831525,
                                    47.9247325
                              ],
                              [
                                    -122.283131,
                                    47.924729
                              ],
                              [
                                    -122.2831095,
                                    47.924725
                              ],
                              [
                                    -122.283085,
                                    47.924721
                              ],
                              [
                                    -122.283053,
                                    47.924715
                              ],
                              [
                                    -122.2830245,
                                    47.9247095
                              ],
                              [
                                    -122.2829965,
                                    47.924704
                              ],
                              [
                                    -122.282972,
                                    47.9246995
                              ],
                              [
                                    -122.282954,
                                    47.9246955
                              ],
                              [
                                    -122.282933,
                                    47.924691
                              ],
                              [
                                    -122.2829125,
                                    47.9246865
                              ],
                              [
                                    -122.2828915,
                                    47.924682
                              ],
                              [
                                    -122.282867,
                                    47.924676
                              ],
                              [
                                    -122.282836,
                                    47.9246685
                              ],
                              [
                                    -122.2828015,
                                    47.92466
                              ],
                              [
                                    -122.282771,
                                    47.924652
                              ],
                              [
                                    -122.282747,
                                    47.924646
                              ],
                              [
                                    -122.2827265,
                                    47.9246405
                              ],
                              [
                                    -122.2827025,
                                    47.924634
                              ],
                              [
                                    -122.2826755,
                                    47.924626
                              ],
                              [
                                    -122.282652,
                                    47.9246195
                              ],
                              [
                                    -122.2826285,
                                    47.9246125
                              ],
                              [
                                    -122.282605,
                                    47.924605
                              ],
                              [
                                    -122.2825815,
                                    47.924598
                              ],
                              [
                                    -122.2825585,
                                    47.9245905
                              ],
                              [
                                    -122.2825355,
                                    47.924583
                              ],
                              [
                                    -122.2825155,
                                    47.9245765
                              ],
                              [
                                    -122.2824895,
                                    47.9245675
                              ],
                              [
                                    -122.2824665,
                                    47.9245595
                              ],
                              [
                                    -122.282444,
                                    47.9245515
                              ],
                              [
                                    -122.2824215,
                                    47.924543
                              ],
                              [
                                    -122.282399,
                                    47.9245345
                              ],
                              [
                                    -122.2823765,
                                    47.924526
                              ],
                              [
                                    -122.2823575,
                                    47.924519
                              ],
                              [
                                    -122.2823415,
                                    47.9245125
                              ],
                              [
                                    -122.282306,
                                    47.9244985
                              ],
                              [
                                    -122.28225,
                                    47.924475
                              ],
                              [
                                    -122.282228,
                                    47.9244655
                              ],
                              [
                                    -122.282216,
                                    47.9244605
                              ],
                              [
                                    -122.2822065,
                                    47.9244565
                              ],
                              [
                                    -122.2821975,
                                    47.924452
                              ],
                              [
                                    -122.2821885,
                                    47.924448
                              ],
                              [
                                    -122.2821735,
                                    47.924441
                              ],
                              [
                                    -122.2821585,
                                    47.924434
                              ],
                              [
                                    -122.2821225,
                                    47.924417
                              ],
                              [
                                    -122.2821015,
                                    47.9244065
                              ],
                              [
                                    -122.2820865,
                                    47.9243995
                              ],
                              [
                                    -122.282075,
                                    47.9243935
                              ],
                              [
                                    -122.28206,
                                    47.924386
                              ],
                              [
                                    -122.2820455,
                                    47.9243785
                              ],
                              [
                                    -122.282028,
                                    47.9243695
                              ],
                              [
                                    -122.282008,
                                    47.924359
                              ],
                              [
                                    -122.281988,
                                    47.924348
                              ],
                              [
                                    -122.281968,
                                    47.9243375
                              ],
                              [
                                    -122.281951,
                                    47.924328
                              ],
                              [
                                    -122.281937,
                                    47.92432
                              ],
                              [
                                    -122.28192,
                                    47.9243105
                              ],
                              [
                                    -122.281903,
                                    47.924301
                              ],
                              [
                                    -122.2818865,
                                    47.924291
                              ],
                              [
                                    -122.2818725,
                                    47.924283
                              ],
                              [
                                    -122.281859,
                                    47.924275
                              ],
                              [
                                    -122.2818455,
                                    47.9242665
                              ],
                              [
                                    -122.2818375,
                                    47.9242615
                              ],
                              [
                                    -122.2818265,
                                    47.924255
                              ],
                              [
                                    -122.2817885,
                                    47.9242305
                              ],
                              [
                                    -122.281353,
                                    47.9239865
                              ],
                              [
                                    -122.2810705,
                                    47.924028
                              ],
                              [
                                    -122.2810595,
                                    47.924225
                              ],
                              [
                                    -122.281032,
                                    47.9247135
                              ],
                              [
                                    -122.2810225,
                                    47.924714
                              ],
                              [
                                    -122.280865,
                                    47.924716
                              ],
                              [
                                    -122.280767,
                                    47.924717
                              ],
                              [
                                    -122.2805425,
                                    47.92472
                              ],
                              [
                                    -122.280536,
                                    47.924472
                              ],
                              [
                                    -122.2803765,
                                    47.9239495
                              ],
                              [
                                    -122.280371,
                                    47.9239355
                              ],
                              [
                                    -122.280358,
                                    47.9238995
                              ],
                              [
                                    -122.2803535,
                                    47.9238875
                              ],
                              [
                                    -122.280349,
                                    47.9238755
                              ],
                              [
                                    -122.280344,
                                    47.9238635
                              ],
                              [
                                    -122.280338,
                                    47.9238495
                              ],
                              [
                                    -122.280333,
                                    47.9238375
                              ],
                              [
                                    -122.280327,
                                    47.9238235
                              ],
                              [
                                    -122.2803205,
                                    47.923809
                              ],
                              [
                                    -122.280313,
                                    47.9237925
                              ],
                              [
                                    -122.2802975,
                                    47.9237595
                              ],
                              [
                                    -122.280286,
                                    47.923736
                              ],
                              [
                                    -122.280278,
                                    47.9237195
                              ],
                              [
                                    -122.28027,
                                    47.9237035
                              ],
                              [
                                    -122.2802625,
                                    47.9236895
                              ],
                              [
                                    -122.280255,
                                    47.9236755
                              ],
                              [
                                    -122.280245,
                                    47.923657
                              ],
                              [
                                    -122.2802345,
                                    47.9236385
                              ],
                              [
                                    -122.280224,
                                    47.92362
                              ],
                              [
                                    -122.2802145,
                                    47.923604
                              ],
                              [
                                    -122.2802035,
                                    47.9235855
                              ],
                              [
                                    -122.2801925,
                                    47.9235675
                              ],
                              [
                                    -122.2801825,
                                    47.9235515
                              ],
                              [
                                    -122.280172,
                                    47.9235355
                              ],
                              [
                                    -122.280162,
                                    47.92352
                              ],
                              [
                                    -122.28015,
                                    47.923502
                              ],
                              [
                                    -122.2801375,
                                    47.923484
                              ],
                              [
                                    -122.280125,
                                    47.923466
                              ],
                              [
                                    -122.2801155,
                                    47.9234525
                              ],
                              [
                                    -122.280106,
                                    47.9234395
                              ],
                              [
                                    -122.280094,
                                    47.923424
                              ],
                              [
                                    -122.2800825,
                                    47.9234085
                              ],
                              [
                                    -122.280067,
                                    47.923389
                              ],
                              [
                                    -122.280038,
                                    47.923352
                              ],
                              [
                                    -122.280026,
                                    47.9233365
                              ],
                              [
                                    -122.2800135,
                                    47.9233215
                              ],
                              [
                                    -122.2800015,
                                    47.9233065
                              ],
                              [
                                    -122.2799905,
                                    47.9232935
                              ],
                              [
                                    -122.2799795,
                                    47.9232805
                              ],
                              [
                                    -122.2799665,
                                    47.9232655
                              ],
                              [
                                    -122.2799515,
                                    47.9232485
                              ],
                              [
                                    -122.2799365,
                                    47.923232
                              ],
                              [
                                    -122.279921,
                                    47.923215
                              ],
                              [
                                    -122.2799075,
                                    47.9232005
                              ],
                              [
                                    -122.2798895,
                                    47.9231815
                              ],
                              [
                                    -122.2798735,
                                    47.923165
                              ],
                              [
                                    -122.2798555,
                                    47.9231465
                              ],
                              [
                                    -122.279839,
                                    47.9231305
                              ],
                              [
                                    -122.2798225,
                                    47.923114
                              ],
                              [
                                    -122.2798055,
                                    47.923098
                              ],
                              [
                                    -122.2797885,
                                    47.9230815
                              ],
                              [
                                    -122.2797735,
                                    47.9230675
                              ],
                              [
                                    -122.279756,
                                    47.9230515
                              ],
                              [
                                    -122.279741,
                                    47.923038
                              ],
                              [
                                    -122.279723,
                                    47.923022
                              ],
                              [
                                    -122.2797075,
                                    47.9230085
                              ],
                              [
                                    -122.279689,
                                    47.922993
                              ],
                              [
                                    -122.2796705,
                                    47.9229775
                              ],
                              [
                                    -122.27965,
                                    47.9229605
                              ],
                              [
                                    -122.279624,
                                    47.9229395
                              ],
                              [
                                    -122.279612,
                                    47.92293
                              ],
                              [
                                    -122.2796,
                                    47.922921
                              ],
                              [
                                    -122.2795525,
                                    47.922884
                              ],
                              [
                                    -122.2795525,
                                    47.9228835
                              ],
                              [
                                    -122.2794945,
                                    47.9228405
                              ],
                              [
                                    -122.279337,
                                    47.9227565
                              ],
                              [
                                    -122.2793155,
                                    47.9227425
                              ],
                              [
                                    -122.279305,
                                    47.922736
                              ],
                              [
                                    -122.2792915,
                                    47.9227275
                              ],
                              [
                                    -122.2792775,
                                    47.9227195
                              ],
                              [
                                    -122.2792475,
                                    47.9227015
                              ],
                              [
                                    -122.279239,
                                    47.9226965
                              ],
                              [
                                    -122.279228,
                                    47.92269
                              ],
                              [
                                    -122.2792165,
                                    47.922684
                              ],
                              [
                                    -122.2792055,
                                    47.9226775
                              ],
                              [
                                    -122.279197,
                                    47.922673
                              ],
                              [
                                    -122.2791795,
                                    47.9226635
                              ],
                              [
                                    -122.279148,
                                    47.922647
                              ],
                              [
                                    -122.2791335,
                                    47.9226395
                              ],
                              [
                                    -122.2791155,
                                    47.9226305
                              ],
                              [
                                    -122.279107,
                                    47.922626
                              ],
                              [
                                    -122.279095,
                                    47.9226205
                              ],
                              [
                                    -122.279074,
                                    47.9226105
                              ],
                              [
                                    -122.27905,
                                    47.922599
                              ],
                              [
                                    -122.2790375,
                                    47.9225935
                              ],
                              [
                                    -122.2790285,
                                    47.9225895
                              ],
                              [
                                    -122.2790135,
                                    47.9225825
                              ],
                              [
                                    -122.2789945,
                                    47.9225745
                              ],
                              [
                                    -122.2789605,
                                    47.92256
                              ],
                              [
                                    -122.2789515,
                                    47.922556
                              ],
                              [
                                    -122.278942,
                                    47.9225525
                              ],
                              [
                                    -122.278926,
                                    47.922546
                              ],
                              [
                                    -122.2789005,
                                    47.922536
                              ],
                              [
                                    -122.2788815,
                                    47.922529
                              ],
                              [
                                    -122.278862,
                                    47.9225215
                              ],
                              [
                                    -122.278846,
                                    47.922516
                              ],
                              [
                                    -122.278833,
                                    47.922511
                              ],
                              [
                                    -122.2787975,
                                    47.9224985
                              ],
                              [
                                    -122.2787875,
                                    47.922495
                              ],
                              [
                                    -122.278781,
                                    47.922493
                              ],
                              [
                                    -122.2787645,
                                    47.9224875
                              ],
                              [
                                    -122.2787445,
                                    47.9224815
                              ],
                              [
                                    -122.2787245,
                                    47.922475
                              ],
                              [
                                    -122.278698,
                                    47.922467
                              ],
                              [
                                    -122.278691,
                                    47.922465
                              ],
                              [
                                    -122.278682,
                                    47.9224625
                              ],
                              [
                                    -122.278678,
                                    47.922461
                              ],
                              [
                                    -122.2785605,
                                    47.9223075
                              ],
                              [
                                    -122.278288,
                                    47.9222575
                              ],
                              [
                                    -122.2780165,
                                    47.922274
                              ],
                              [
                                    -122.2779935,
                                    47.922275
                              ],
                              [
                                    -122.2779625,
                                    47.922274
                              ],
                              [
                                    -122.2777515,
                                    47.922267
                              ],
                              [
                                    -122.276871,
                                    47.922278
                              ],
                              [
                                    -122.271435,
                                    47.9223115
                              ],
                              [
                                    -122.2714355,
                                    47.9223845
                              ]
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 47.928938,
            "lng": -122.278891
      },
      "properties": {
            "owner": "BOEING COMPANY",
            "lot_size_sqft": 19897094,
            "lot_acres": 456.76492,
            "year_built": 1966,
            "zoning": "HI",
            "zoning_description": "Heavy Industrial",
            "property_type": "",
            "assessed_value": 910821000,
            "improvement_value": 732624900,
            "land_value": 178196100,
            "sale_date": "2002-02-26",
            "county": "snohomish",
            "qoz_status": "No",
            "use_code": "344",
            "use_description": "Transportation Equipment",
            "subdivision": "",
            "tax_year": "2025",
            "parcel_value_type": "MARKET",
            "census_tract": "53061041304",
            "census_block": "530610413042010",
            "qoz_tract": "",
            "last_refresh_date": "2025-08-19",
            "regrid_updated_at": "2025-09-15 15:46:37 -0400",
            "owner_mailing_address": "PO BOX 52427",
            "owner_mail_city": "ATLANTA",
            "owner_mail_state": "GA",
            "owner_mail_zip": "30355-0427",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 133384,
            "geoid": "53061",
            "parcelnumb": "28041000100200",
            "parcelnumb_no_formatting": "28041000100200",
            "usecode": "344",
            "usedesc": "Transportation Equipment",
            "yearbuilt": 1966,
            "parvaltype": "MARKET",
            "improvval": 732624900,
            "landval": 178196100,
            "parval": 910821000,
            "saleprice": 0,
            "saledate": "2002-02-26",
            "taxyear": "2025",
            "mailadd": "PO BOX 52427",
            "mail_addno": "52427",
            "mail_addstr": "PO BOX",
            "mail_city": "ATLANTA",
            "mail_state2": "GA",
            "mail_zip": "30355-0427",
            "original_mailing_address": "{\"mailadd\":\"PO BOX 52427\",\"mail_city\":\"ATLANTA\",\"mail_state2\":\"GA\",\"mail_zip\":\"30355\"}",
            "address": "3003 W CASINO RD",
            "saddno": "3003",
            "saddpref": "W",
            "saddstr": "CASINO",
            "saddsttyp": "RD",
            "scity": "EVERETT",
            "original_address": "{\"address\":\"3003 W CASINO RD\",\"saddno\":\"3003\",\"saddpref\":\"W\",\"saddstr\":\"CASINO\",\"saddsttyp\":\"RD\",\"scity\":\"EVERETT\",\"szip\":\"98204-1910\"}",
            "city": "everett",
            "state2": "WA",
            "szip": "98204-1910",
            "szip5": "98204",
            "address_source": "county;cass",
            "lat": "47.928938",
            "lon": "-122.278891",
            "qoz": "No",
            "census_blockgroup": "530610413042",
            "census_zcta": "98203",
            "ll_last_refresh": "2025-08-19",
            "gisacre": 457.06,
            "sqft": 19909656.2744,
            "ll_gisacre": 456.76492,
            "ll_gissqft": 19897094,
            "plss_township": "028N",
            "plss_section": "Section 10",
            "plss_range": "004E",
            "path": "/us/wa/snohomish/everett/133384",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "01fd2efa-9868-44d7-b48f-65e643296f8b",
            "ll_updated_at": "2025-09-15 15:46:37 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Boeing Everett Factory",
            "description": "The world's largest building by volume, manufacturing Boeing aircraft",
            "type": "aviation"
      }
}
  }
]

// Helper functions
export function getCuratedDemoProperty(apn: string): CuratedDemoProperty | undefined {
  return CURATED_DEMO_PROPERTIES.find(property => property.apn === apn)
}

export function getCuratedDemoPropertiesByType(type: CuratedDemoProperty['curatedMetadata']['type']): CuratedDemoProperty[] {
  return CURATED_DEMO_PROPERTIES.filter(property => property.curatedMetadata.type === type)
}
