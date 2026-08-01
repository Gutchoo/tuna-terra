// Auto-generated curated demo properties from Regrid API
// Generated on: 2026-08-01T09:54:43.497Z

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
    regrid_id: '64330692-0619-4943-b8d5-1fb0a699bf7a',
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
    assessed_value: 1283202000,

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
    tax_year: '2027',
    parcel_value_type: 'MARKET',
    sale_price: null,

    // Location data
    census_tract: '36061007600',
    census_block: '360610076001001',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-04-14',
    regrid_updated_at: '2026-07-25 13:03:01 -0400',

    // Owner mailing
    owner_mailing_address: '111 WEST 33RD STREET 12T',
    owner_mail_city: 'NEW YORK',
    owner_mail_state: 'NY',
    owner_mail_zip: '10120',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "64330692-0619-4943-b8d5-1fb0a699bf7a",
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
            "assessed_value": 1283202000,
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
            "tax_year": "2027",
            "parcel_value_type": "MARKET",
            "census_tract": "36061007600",
            "census_block": "360610076001001",
            "qoz_tract": "",
            "last_refresh_date": "2026-04-14",
            "regrid_updated_at": "2026-07-25 13:03:01 -0400",
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
            "year_built_effective_date": 2011,
            "numstories": 102,
            "numunits": 513,
            "parvaltype": "MARKET",
            "landval": 220000000,
            "parval": 1283202000,
            "saleprice": 49739616,
            "saledate": "2019-04-03",
            "taxyear": "2027",
            "last_ownership_transfer_date": "2019-04-03",
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
            "ll_last_refresh": "2026-04-14",
            "sqft": 91351,
            "ll_gisacre": 2.22732,
            "ll_gissqft": 97024,
            "path": "/us/ny/new-york/manhattan/401173",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "64330692-0619-4943-b8d5-1fb0a699bf7a",
            "ll_updated_at": "2026-07-25 13:03:01 -0400"
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
    regrid_id: '18a4b8df-4593-4cce-b59b-0897d3865466',
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
    last_sale_price: null,
    sale_date: null,
    county: 'san-francisco',
    qoz_status: 'No',
    improvement_value: 1713847455,
    land_value: 236208037,
    assessed_value: 1950055492,

    // Extended details
    use_code: null,
    use_description: 'Commercial',
    zoning: 'C-3-O(SD -1000-S-2',
    zoning_description: 'Commercial Downtown Office Special Development',
    num_stories: 63,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 1.15316,
    lot_size_sqft: 50233,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'ASSESSED',
    sale_price: null,

    // Location data
    census_tract: '06075061501',
    census_block: '060750615011004',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-04-28',
    regrid_updated_at: '2026-07-25 11:52:13 -0400',

    // Owner mailing
    owner_mailing_address: '4 EMBARCADERO CTR LBBY',
    owner_mail_city: 'SAN FRANCISCO',
    owner_mail_state: 'CA',
    owner_mail_zip: '94111',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "18a4b8df-4593-4cce-b59b-0897d3865466",
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
            "assessed_value": 1950055492,
            "improvement_value": 1713847455,
            "land_value": 236208037,
            "sale_date": "",
            "county": "san-francisco",
            "qoz_status": "No",
            "use_code": "",
            "use_description": "Commercial",
            "subdivision": "",
            "num_stories": 63,
            "tax_year": "2025",
            "parcel_value_type": "ASSESSED",
            "census_tract": "06075061501",
            "census_block": "060750615011004",
            "qoz_tract": "",
            "last_refresh_date": "2026-04-28",
            "regrid_updated_at": "2026-07-25 11:52:13 -0400",
            "owner_mailing_address": "4 EMBARCADERO CTR LBBY",
            "owner_mail_city": "SAN FRANCISCO",
            "owner_mail_state": "CA",
            "owner_mail_zip": "94111",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 136644,
            "geoid": "06075",
            "parcelnumb": "3720009",
            "parcelnumb_no_formatting": "3720009",
            "account_number": "3720-009",
            "alt_parcelnumb1": "3720009",
            "usedesc": "Commercial",
            "yearbuilt": 2018,
            "numstories": 63,
            "parvaltype": "ASSESSED",
            "improvval": 1713847455,
            "landval": 236208037,
            "parval": 1950055492,
            "taxyear": "2025",
            "last_ownership_transfer_date": "2013-03-26",
            "owner2": "MICHAEL YI",
            "mailadd": "4 EMBARCADERO CTR LBBY",
            "mail_city": "SAN FRANCISCO",
            "mail_state2": "CA",
            "mail_zip": "94111",
            "original_mailing_address": "{\"mailadd\":\"4 EMBARCADERO CTR LBBY\",\"mail_city\":\"SAN FRANCISCO\",\"mail_state2\":\"CA\",\"mail_zip\":\"94111\"}",
            "address": "415 MISSION ST",
            "saddno": "415",
            "saddstr": "MISSION",
            "saddsttyp": "ST",
            "scity": "SAN FRANCISCO",
            "original_address": "{\"address\":\"415 MISSION ST\",\"saddno\":\"415\",\"saddstr\":\"MISSION\",\"saddsttyp\":\"ST\",\"scity\":\"SAN FRANCISCO\"}",
            "city": "downtown-northeast-neighborhoods-treasure-island",
            "state2": "CA",
            "szip": "94105-2533",
            "szip5": "94105",
            "address_source": "county;cass",
            "book": "25",
            "block": "3720",
            "lot": "9",
            "neighborhood_code": "09B",
            "lat": "37.789855",
            "lon": "-122.396801",
            "qoz": "No",
            "census_blockgroup": "060750615011",
            "census_zcta": "94105",
            "ll_last_refresh": "2026-04-28",
            "sqft": 1420430,
            "ll_gisacre": 1.15316,
            "ll_gissqft": 50233,
            "path": "/us/ca/san-francisco/downtown-northeast-neighborhoods-treasure-island/136644",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "18a4b8df-4593-4cce-b59b-0897d3865466",
            "ll_updated_at": "2026-07-25 11:52:13 -0400"
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
    regrid_id: '38c37221-6732-4bb1-95d7-26b4c2414599',
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
                              -118.325808,
                              34.1542865
                        ],
                        [
                              -118.3257245,
                              34.1542015
                        ],
                        [
                              -118.3240015,
                              34.1546055
                        ],
                        [
                              -118.323978,
                              34.154611
                        ],
                        [
                              -118.3237965,
                              34.1546325
                        ],
                        [
                              -118.3221145,
                              34.155733
                        ],
                        [
                              -118.3222965,
                              34.1561125
                        ],
                        [
                              -118.3223295,
                              34.1561085
                        ],
                        [
                              -118.322442,
                              34.1560935
                        ],
                        [
                              -118.3224995,
                              34.156086
                        ],
                        [
                              -118.3226685,
                              34.156058
                        ],
                        [
                              -118.3228355,
                              34.1560215
                        ],
                        [
                              -118.323001,
                              34.155977
                        ],
                        [
                              -118.323164,
                              34.1559245
                        ],
                        [
                              -118.323324,
                              34.155864
                        ],
                        [
                              -118.323481,
                              34.1557955
                        ],
                        [
                              -118.3236345,
                              34.1557195
                        ],
                        [
                              -118.323784,
                              34.1556365
                        ],
                        [
                              -118.3239295,
                              34.1555455
                        ],
                        [
                              -118.325808,
                              34.1542865
                        ]
                  ]
            ],
            [
                  [
                        [
                              -118.324137,
                              34.1557595
                        ],
                        [
                              -118.324023,
                              34.155833
                        ],
                        [
                              -118.3239055,
                              34.155902
                        ],
                        [
                              -118.3238425,
                              34.1559365
                        ],
                        [
                              -118.323672,
                              34.156022
                        ],
                        [
                              -118.323498,
                              34.1560995
                        ],
                        [
                              -118.3233205,
                              34.156168
                        ],
                        [
                              -118.3231395,
                              34.1562275
                        ],
                        [
                              -118.322956,
                              34.1562785
                        ],
                        [
                              -118.32277,
                              34.15632
                        ],
                        [
                              -118.3225825,
                              34.1563525
                        ],
                        [
                              -118.322548,
                              34.156373
                        ],
                        [
                              -118.3225455,
                              34.1564085
                        ],
                        [
                              -118.3239875,
                              34.159412
                        ],
                        [
                              -118.324014,
                              34.1594345
                        ],
                        [
                              -118.324052,
                              34.159435
                        ],
                        [
                              -118.326605,
                              34.158583
                        ],
                        [
                              -118.3278535,
                              34.158166
                        ],
                        [
                              -118.3278805,
                              34.158144
                        ],
                        [
                              -118.327881,
                              34.1581125
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
                              -118.3261065,
                              34.154508
                        ],
                        [
                              -118.326073,
                              34.1544835
                        ],
                        [
                              -118.3260295,
                              34.1544915
                        ],
                        [
                              -118.324137,
                              34.1557595
                        ]
                  ]
            ]
      ]
},
    lat: 34.156873,
    lng: -118.325024,

    // Property details
    year_built: 1938,
    owner: 'DISNEY,WALT PRODUCTIONS INC',
    last_sale_price: null,
    sale_date: null,
    county: 'los-angeles',
    qoz_status: 'No',
    improvement_value: 504816553,
    land_value: 11877070,
    assessed_value: 516693623,

    // Extended details
    use_code: '6530',
    use_description: 'Recreational - Athletic & Amusement Facilities',
    zoning: 'PD',
    zoning_description: 'Planned Development',
    num_stories: 1,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 42.98908,
    lot_size_sqft: 1872643,

    // Financial & tax data
    tax_year: '2026',
    parcel_value_type: 'GROSS ASSESSED',
    sale_price: null,

    // Location data
    census_tract: '06037311700',
    census_block: '060373117006011',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-06-24',
    regrid_updated_at: '2026-07-25 11:50:56 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX 313',
    owner_mail_city: 'GLENDALE',
    owner_mail_state: 'CA',
    owner_mail_zip: '91209-0313',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "38c37221-6732-4bb1-95d7-26b4c2414599",
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
                                    -118.325808,
                                    34.1542865
                              ],
                              [
                                    -118.3257245,
                                    34.1542015
                              ],
                              [
                                    -118.3240015,
                                    34.1546055
                              ],
                              [
                                    -118.323978,
                                    34.154611
                              ],
                              [
                                    -118.3237965,
                                    34.1546325
                              ],
                              [
                                    -118.3221145,
                                    34.155733
                              ],
                              [
                                    -118.3222965,
                                    34.1561125
                              ],
                              [
                                    -118.3223295,
                                    34.1561085
                              ],
                              [
                                    -118.322442,
                                    34.1560935
                              ],
                              [
                                    -118.3224995,
                                    34.156086
                              ],
                              [
                                    -118.3226685,
                                    34.156058
                              ],
                              [
                                    -118.3228355,
                                    34.1560215
                              ],
                              [
                                    -118.323001,
                                    34.155977
                              ],
                              [
                                    -118.323164,
                                    34.1559245
                              ],
                              [
                                    -118.323324,
                                    34.155864
                              ],
                              [
                                    -118.323481,
                                    34.1557955
                              ],
                              [
                                    -118.3236345,
                                    34.1557195
                              ],
                              [
                                    -118.323784,
                                    34.1556365
                              ],
                              [
                                    -118.3239295,
                                    34.1555455
                              ],
                              [
                                    -118.325808,
                                    34.1542865
                              ]
                        ]
                  ],
                  [
                        [
                              [
                                    -118.324137,
                                    34.1557595
                              ],
                              [
                                    -118.324023,
                                    34.155833
                              ],
                              [
                                    -118.3239055,
                                    34.155902
                              ],
                              [
                                    -118.3238425,
                                    34.1559365
                              ],
                              [
                                    -118.323672,
                                    34.156022
                              ],
                              [
                                    -118.323498,
                                    34.1560995
                              ],
                              [
                                    -118.3233205,
                                    34.156168
                              ],
                              [
                                    -118.3231395,
                                    34.1562275
                              ],
                              [
                                    -118.322956,
                                    34.1562785
                              ],
                              [
                                    -118.32277,
                                    34.15632
                              ],
                              [
                                    -118.3225825,
                                    34.1563525
                              ],
                              [
                                    -118.322548,
                                    34.156373
                              ],
                              [
                                    -118.3225455,
                                    34.1564085
                              ],
                              [
                                    -118.3239875,
                                    34.159412
                              ],
                              [
                                    -118.324014,
                                    34.1594345
                              ],
                              [
                                    -118.324052,
                                    34.159435
                              ],
                              [
                                    -118.326605,
                                    34.158583
                              ],
                              [
                                    -118.3278535,
                                    34.158166
                              ],
                              [
                                    -118.3278805,
                                    34.158144
                              ],
                              [
                                    -118.327881,
                                    34.1581125
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
                                    -118.3261065,
                                    34.154508
                              ],
                              [
                                    -118.326073,
                                    34.1544835
                              ],
                              [
                                    -118.3260295,
                                    34.1544915
                              ],
                              [
                                    -118.324137,
                                    34.1557595
                              ]
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 34.156873,
            "lng": -118.325024
      },
      "properties": {
            "owner": "DISNEY,WALT PRODUCTIONS INC",
            "lot_size_sqft": 1872643,
            "lot_acres": 42.98908,
            "year_built": 1938,
            "zoning": "PD",
            "zoning_description": "Planned Development",
            "property_type": "",
            "assessed_value": 516693623,
            "improvement_value": 504816553,
            "land_value": 11877070,
            "sale_date": "",
            "county": "los-angeles",
            "qoz_status": "No",
            "use_code": "6530",
            "use_description": "Recreational - Athletic & Amusement Facilities",
            "subdivision": "",
            "num_stories": 1,
            "tax_year": "2026",
            "parcel_value_type": "GROSS ASSESSED",
            "census_tract": "06037311700",
            "census_block": "060373117006011",
            "qoz_tract": "",
            "last_refresh_date": "2026-06-24",
            "regrid_updated_at": "2026-07-25 11:50:56 -0400",
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
            "improvval": 504816553,
            "landval": 11877070,
            "parval": 516693623,
            "taxyear": "2026",
            "mailadd": "PO BOX 313",
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
            "lon": "-118.325024",
            "qoz": "No",
            "census_blockgroup": "060373117006",
            "census_zcta": "91505",
            "ll_last_refresh": "2026-06-24",
            "recrdareano": 12800,
            "ll_gisacre": 42.98908,
            "ll_gissqft": 1872643,
            "plss_township": "001N",
            "plss_section": "Section 00",
            "plss_range": "014W",
            "path": "/us/ca/los-angeles/san-fernando-valley/242995",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "38c37221-6732-4bb1-95d7-26b4c2414599",
            "ll_updated_at": "2026-07-25 11:50:56 -0400"
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
    regrid_id: '0654fd82-1e13-49ba-a58d-afefc919cbe3',
    apn: '31606062',
    address: '10600 S TANTAU AVE',
    city: 'CUPERTINO',
    state: 'CA',
    zip_code: '95014',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -122.0046985,
                        37.3336985
                  ],
                  [
                        -122.0047,
                        37.333877
                  ],
                  [
                        -122.0047015,
                        37.3340745
                  ],
                  [
                        -122.005306,
                        37.3340735
                  ],
                  [
                        -122.0053305,
                        37.3339395
                  ],
                  [
                        -122.0053475,
                        37.333873
                  ],
                  [
                        -122.005368,
                        37.3338075
                  ],
                  [
                        -122.0053915,
                        37.3337425
                  ],
                  [
                        -122.005418,
                        37.333678
                  ],
                  [
                        -122.0054475,
                        37.3336145
                  ],
                  [
                        -122.00548,
                        37.333552
                  ],
                  [
                        -122.005516,
                        37.3334905
                  ],
                  [
                        -122.005574,
                        37.333386
                  ],
                  [
                        -122.0055995,
                        37.3333325
                  ],
                  [
                        -122.005623,
                        37.3332785
                  ],
                  [
                        -122.0056435,
                        37.3332235
                  ],
                  [
                        -122.005662,
                        37.3331685
                  ],
                  [
                        -122.005678,
                        37.3331125
                  ],
                  [
                        -122.0057035,
                        37.332991
                  ],
                  [
                        -122.005712,
                        37.3329295
                  ],
                  [
                        -122.0057175,
                        37.332868
                  ],
                  [
                        -122.0057205,
                        37.332806
                  ],
                  [
                        -122.005721,
                        37.332786
                  ],
                  [
                        -122.0057255,
                        37.3325225
                  ],
                  [
                        -122.0057255,
                        37.332513
                  ],
                  [
                        -122.005725,
                        37.332508
                  ],
                  [
                        -122.0057245,
                        37.332503
                  ],
                  [
                        -122.0057235,
                        37.3324985
                  ],
                  [
                        -122.0057225,
                        37.3324935
                  ],
                  [
                        -122.005721,
                        37.332489
                  ],
                  [
                        -122.0057195,
                        37.332484
                  ],
                  [
                        -122.005718,
                        37.3324795
                  ],
                  [
                        -122.005716,
                        37.332475
                  ],
                  [
                        -122.005714,
                        37.3324705
                  ],
                  [
                        -122.0057115,
                        37.332466
                  ],
                  [
                        -122.005709,
                        37.3324615
                  ],
                  [
                        -122.0057065,
                        37.332457
                  ],
                  [
                        -122.0057035,
                        37.332453
                  ],
                  [
                        -122.0057005,
                        37.3324485
                  ],
                  [
                        -122.005697,
                        37.3324445
                  ],
                  [
                        -122.0056935,
                        37.3324405
                  ],
                  [
                        -122.00569,
                        37.332437
                  ],
                  [
                        -122.0056865,
                        37.332433
                  ],
                  [
                        -122.0056825,
                        37.3324295
                  ],
                  [
                        -122.005678,
                        37.3324255
                  ],
                  [
                        -122.005674,
                        37.3324225
                  ],
                  [
                        -122.0056695,
                        37.332419
                  ],
                  [
                        -122.005665,
                        37.3324155
                  ],
                  [
                        -122.0056605,
                        37.3324125
                  ],
                  [
                        -122.0056555,
                        37.3324095
                  ],
                  [
                        -122.0056505,
                        37.332407
                  ],
                  [
                        -122.0056455,
                        37.3324045
                  ],
                  [
                        -122.00564,
                        37.332402
                  ],
                  [
                        -122.005635,
                        37.3323995
                  ],
                  [
                        -122.0056295,
                        37.332397
                  ],
                  [
                        -122.005624,
                        37.332395
                  ],
                  [
                        -122.0056185,
                        37.332393
                  ],
                  [
                        -122.005613,
                        37.3323915
                  ],
                  [
                        -122.005607,
                        37.33239
                  ],
                  [
                        -122.005601,
                        37.3323885
                  ],
                  [
                        -122.0055955,
                        37.332387
                  ],
                  [
                        -122.0055895,
                        37.332386
                  ],
                  [
                        -122.0055835,
                        37.332385
                  ],
                  [
                        -122.0055775,
                        37.3323845
                  ],
                  [
                        -122.0055715,
                        37.332384
                  ],
                  [
                        -122.0055655,
                        37.3323835
                  ],
                  [
                        -122.0055595,
                        37.332383
                  ],
                  [
                        -122.0055535,
                        37.332383
                  ],
                  [
                        -122.0046865,
                        37.3323745
                  ],
                  [
                        -122.004689,
                        37.3326325
                  ],
                  [
                        -122.0046905,
                        37.332788
                  ],
                  [
                        -122.0046905,
                        37.332811
                  ],
                  [
                        -122.004692,
                        37.3329895
                  ],
                  [
                        -122.004693,
                        37.3331145
                  ],
                  [
                        -122.0046935,
                        37.3331685
                  ],
                  [
                        -122.0046955,
                        37.333347
                  ],
                  [
                        -122.004697,
                        37.3335255
                  ],
                  [
                        -122.0046985,
                        37.3336985
                  ]
            ]
      ]
},
    lat: 37.333148,
    lng: -122.005147,

    // Property details
    year_built: 2017,
    owner: 'CAMPUS HOLDINGS INC',
    last_sale_price: null,
    sale_date: '2013-10-15',
    county: 'santa-clara',
    qoz_status: 'No',
    improvement_value: 16198137,
    land_value: 19123466,
    assessed_value: 35321603,

    // Extended details
    use_code: null,
    use_description: null,
    zoning: 'P(MP',
    zoning_description: 'Planned Development Industrial Park',
    num_stories: 2,
    num_units: 1,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 3.62906,
    lot_size_sqft: 158085,

    // Financial & tax data
    tax_year: null,
    parcel_value_type: 'ASSESSED',
    sale_price: null,

    // Location data
    census_tract: '06085508102',
    census_block: '060855081021020',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-05-27',
    regrid_updated_at: '2026-07-25 11:54:06 -0400',

    // Owner mailing
    owner_mailing_address: '1 INFINITE LOOP',
    owner_mail_city: 'CUPERTINO',
    owner_mail_state: 'CA',
    owner_mail_zip: '95032',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "0654fd82-1e13-49ba-a58d-afefc919cbe3",
      "apn": "31606062",
      "address": {
            "line1": "10600 S TANTAU AVE",
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
                              -122.0046985,
                              37.3336985
                        ],
                        [
                              -122.0047,
                              37.333877
                        ],
                        [
                              -122.0047015,
                              37.3340745
                        ],
                        [
                              -122.005306,
                              37.3340735
                        ],
                        [
                              -122.0053305,
                              37.3339395
                        ],
                        [
                              -122.0053475,
                              37.333873
                        ],
                        [
                              -122.005368,
                              37.3338075
                        ],
                        [
                              -122.0053915,
                              37.3337425
                        ],
                        [
                              -122.005418,
                              37.333678
                        ],
                        [
                              -122.0054475,
                              37.3336145
                        ],
                        [
                              -122.00548,
                              37.333552
                        ],
                        [
                              -122.005516,
                              37.3334905
                        ],
                        [
                              -122.005574,
                              37.333386
                        ],
                        [
                              -122.0055995,
                              37.3333325
                        ],
                        [
                              -122.005623,
                              37.3332785
                        ],
                        [
                              -122.0056435,
                              37.3332235
                        ],
                        [
                              -122.005662,
                              37.3331685
                        ],
                        [
                              -122.005678,
                              37.3331125
                        ],
                        [
                              -122.0057035,
                              37.332991
                        ],
                        [
                              -122.005712,
                              37.3329295
                        ],
                        [
                              -122.0057175,
                              37.332868
                        ],
                        [
                              -122.0057205,
                              37.332806
                        ],
                        [
                              -122.005721,
                              37.332786
                        ],
                        [
                              -122.0057255,
                              37.3325225
                        ],
                        [
                              -122.0057255,
                              37.332513
                        ],
                        [
                              -122.005725,
                              37.332508
                        ],
                        [
                              -122.0057245,
                              37.332503
                        ],
                        [
                              -122.0057235,
                              37.3324985
                        ],
                        [
                              -122.0057225,
                              37.3324935
                        ],
                        [
                              -122.005721,
                              37.332489
                        ],
                        [
                              -122.0057195,
                              37.332484
                        ],
                        [
                              -122.005718,
                              37.3324795
                        ],
                        [
                              -122.005716,
                              37.332475
                        ],
                        [
                              -122.005714,
                              37.3324705
                        ],
                        [
                              -122.0057115,
                              37.332466
                        ],
                        [
                              -122.005709,
                              37.3324615
                        ],
                        [
                              -122.0057065,
                              37.332457
                        ],
                        [
                              -122.0057035,
                              37.332453
                        ],
                        [
                              -122.0057005,
                              37.3324485
                        ],
                        [
                              -122.005697,
                              37.3324445
                        ],
                        [
                              -122.0056935,
                              37.3324405
                        ],
                        [
                              -122.00569,
                              37.332437
                        ],
                        [
                              -122.0056865,
                              37.332433
                        ],
                        [
                              -122.0056825,
                              37.3324295
                        ],
                        [
                              -122.005678,
                              37.3324255
                        ],
                        [
                              -122.005674,
                              37.3324225
                        ],
                        [
                              -122.0056695,
                              37.332419
                        ],
                        [
                              -122.005665,
                              37.3324155
                        ],
                        [
                              -122.0056605,
                              37.3324125
                        ],
                        [
                              -122.0056555,
                              37.3324095
                        ],
                        [
                              -122.0056505,
                              37.332407
                        ],
                        [
                              -122.0056455,
                              37.3324045
                        ],
                        [
                              -122.00564,
                              37.332402
                        ],
                        [
                              -122.005635,
                              37.3323995
                        ],
                        [
                              -122.0056295,
                              37.332397
                        ],
                        [
                              -122.005624,
                              37.332395
                        ],
                        [
                              -122.0056185,
                              37.332393
                        ],
                        [
                              -122.005613,
                              37.3323915
                        ],
                        [
                              -122.005607,
                              37.33239
                        ],
                        [
                              -122.005601,
                              37.3323885
                        ],
                        [
                              -122.0055955,
                              37.332387
                        ],
                        [
                              -122.0055895,
                              37.332386
                        ],
                        [
                              -122.0055835,
                              37.332385
                        ],
                        [
                              -122.0055775,
                              37.3323845
                        ],
                        [
                              -122.0055715,
                              37.332384
                        ],
                        [
                              -122.0055655,
                              37.3323835
                        ],
                        [
                              -122.0055595,
                              37.332383
                        ],
                        [
                              -122.0055535,
                              37.332383
                        ],
                        [
                              -122.0046865,
                              37.3323745
                        ],
                        [
                              -122.004689,
                              37.3326325
                        ],
                        [
                              -122.0046905,
                              37.332788
                        ],
                        [
                              -122.0046905,
                              37.332811
                        ],
                        [
                              -122.004692,
                              37.3329895
                        ],
                        [
                              -122.004693,
                              37.3331145
                        ],
                        [
                              -122.0046935,
                              37.3331685
                        ],
                        [
                              -122.0046955,
                              37.333347
                        ],
                        [
                              -122.004697,
                              37.3335255
                        ],
                        [
                              -122.0046985,
                              37.3336985
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 37.333148,
            "lng": -122.005147
      },
      "properties": {
            "owner": "CAMPUS HOLDINGS INC",
            "lot_size_sqft": 158085,
            "lot_acres": 3.62906,
            "year_built": 2017,
            "zoning": "P(MP",
            "zoning_description": "Planned Development Industrial Park",
            "property_type": "",
            "assessed_value": 35321603,
            "improvement_value": 16198137,
            "land_value": 19123466,
            "sale_date": "2013-10-15",
            "county": "santa-clara",
            "qoz_status": "No",
            "use_code": "",
            "use_description": "",
            "subdivision": "",
            "num_stories": 2,
            "num_units": 1,
            "tax_year": "",
            "parcel_value_type": "ASSESSED",
            "census_tract": "06085508102",
            "census_block": "060855081021020",
            "qoz_tract": "",
            "last_refresh_date": "2026-05-27",
            "regrid_updated_at": "2026-07-25 11:54:06 -0400",
            "owner_mailing_address": "1 INFINITE LOOP",
            "owner_mail_city": "CUPERTINO",
            "owner_mail_state": "CA",
            "owner_mail_zip": "95032",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 8392,
            "geoid": "06085",
            "parcelnumb": "31606062",
            "parcelnumb_no_formatting": "31606062",
            "yearbuilt": 2017,
            "numstories": 2,
            "numunits": 1,
            "parvaltype": "ASSESSED",
            "improvval": 16198137,
            "landval": 19123466,
            "parval": 35321603,
            "saledate": "2013-10-15",
            "mailadd": "1 INFINITE LOOP",
            "careof": "APPLE INC., MS:104-2TX, TAX DEPT",
            "mail_city": "CUPERTINO",
            "mail_state2": "CA",
            "mail_zip": "95032",
            "original_mailing_address": "{\"mailadd\":\"1 INFINITE LOOP\",\"mail_city\":\"CUPERTINO\",\"mail_state2\":\"CA\",\"mail_zip\":\"95032\"}",
            "address": "10600 S TANTAU AVE",
            "saddno": "10600",
            "saddpref": "S",
            "saddstr": "TANTAU",
            "saddsttyp": "AVE",
            "scity": "CUPERTINO",
            "original_address": "{\"address\":\"10600 TANTAU AV CUPERTINO\",\"saddno\":\"10600\",\"saddpref\":\"N\",\"saddstr\":\"TANTAU\",\"saddsttyp\":\"AV\",\"scity\":\"CUPERTINO\",\"szip\":\"95014\"}",
            "city": "san-jose",
            "state2": "CA",
            "szip": "95014-4612",
            "szip5": "95014",
            "address_source": "county;cass",
            "lat": "37.333148",
            "lon": "-122.005147",
            "qoz": "No",
            "census_blockgroup": "060855081021",
            "census_zcta": "95014",
            "ll_last_refresh": "2026-05-27",
            "area_building": 12500,
            "area_building_definition": "TOTAL AREA",
            "gisacre": 3.58,
            "sqft": 155945,
            "ll_gisacre": 3.62906,
            "ll_gissqft": 158085,
            "plss_township": "007S",
            "plss_section": "Section 00",
            "plss_range": "001W",
            "path": "/us/ca/santa-clara/san-jose/8392",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "0654fd82-1e13-49ba-a58d-afefc919cbe3",
            "ll_updated_at": "2026-07-25 11:54:06 -0400"
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
    regrid_id: '6a1a8957-a752-4bb6-b4bf-aa583eaf56c4',
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
    improvement_value: 293313850,
    land_value: 13448400,
    assessed_value: 306762250,

    // Extended details
    use_code: '591',
    use_description: 'Commercial/Industrial',
    zoning: 'DC-16',
    zoning_description: 'Downtown Core District',
    num_stories: 99,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 2.95457,
    lot_size_sqft: 128704,

    // Financial & tax data
    tax_year: '2025',
    parcel_value_type: 'ASSESSED',
    sale_price: null,

    // Location data
    census_tract: '17031839100',
    census_block: '170318391002008',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2025-12-23',
    regrid_updated_at: '2026-07-25 12:23:11 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX A3879',
    owner_mail_city: 'CHICAGO',
    owner_mail_state: 'IL',
    owner_mail_zip: '60690-3879',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "6a1a8957-a752-4bb6-b4bf-aa583eaf56c4",
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
            "assessed_value": 306762250,
            "improvement_value": 293313850,
            "land_value": 13448400,
            "last_sale_price": 275611000,
            "sale_date": "2015-06-11",
            "county": "cook",
            "qoz_status": "No",
            "use_code": "591",
            "use_description": "Commercial/Industrial",
            "subdivision": "",
            "num_stories": 99,
            "tax_year": "2025",
            "parcel_value_type": "ASSESSED",
            "census_tract": "17031839100",
            "census_block": "170318391002008",
            "qoz_tract": "",
            "last_refresh_date": "2025-12-23",
            "regrid_updated_at": "2026-07-25 12:23:11 -0400",
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
            "usedesc": "Commercial/Industrial",
            "yearbuilt": 1970,
            "numstories": 99,
            "parvaltype": "ASSESSED",
            "improvval": 293313850,
            "landval": 13448400,
            "parval": 306762250,
            "saleprice": 275611000,
            "saledate": "2015-06-11",
            "taxyear": "2025",
            "last_ownership_transfer_date": "2015-06-11",
            "previous_owner": "UNKNOWN",
            "mailadd": "PO BOX A3879",
            "mail_addno": "A3879",
            "mail_addstr": "PO BOX",
            "mail_city": "CHICAGO",
            "mail_state2": "IL",
            "mail_zip": "60690-3879",
            "original_mailing_address": "{\"mailadd\":\"P O BOX A-3879\",\"mail_address2\":\" CHICAGO\",\"mail_city\":\" CHICAGO\",\"mail_state2\":\"IL\",\"mail_zip\":\"60690\"}",
            "address": "233 S WACKER DR",
            "saddno": "233",
            "saddpref": "S",
            "saddstr": "WACKER",
            "saddsttyp": "DR",
            "scity": "CHICAGO",
            "original_address": "{\"address\":\"233 S WACKER DR\",\"sunit\":\"\",\"scity\":\"CHICAGO\",\"szip\":\"60606\"}",
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
            "ll_last_refresh": "2025-12-23",
            "sourceurl": "https://www.cookcountyassessor.com/pin/17162160090000",
            "sqft": 128079,
            "ll_gisacre": 2.95457,
            "ll_gissqft": 128704,
            "plss_township": "039N",
            "plss_section": "Section 16",
            "plss_range": "014E",
            "path": "/us/il/cook/chicago/1357189",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "6a1a8957-a752-4bb6-b4bf-aa583eaf56c4",
            "ll_updated_at": "2026-07-25 12:23:11 -0400"
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
    regrid_id: '28fcd81d-e5a3-4d03-87af-6192f80a9108',
    apn: '292257',
    address: '9101 BRADFORD ST',
    city: 'DENTON',
    state: 'TX',
    zip_code: '76207',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -97.2470965,
                        33.1405555
                  ],
                  [
                        -97.247093,
                        33.140562
                  ],
                  [
                        -97.246979,
                        33.1407665
                  ],
                  [
                        -97.247288,
                        33.140859
                  ],
                  [
                        -97.247299,
                        33.1408615
                  ],
                  [
                        -97.2473105,
                        33.1408625
                  ],
                  [
                        -97.2473215,
                        33.1408615
                  ],
                  [
                        -97.2473325,
                        33.140859
                  ],
                  [
                        -97.2473425,
                        33.140855
                  ],
                  [
                        -97.247352,
                        33.1408495
                  ],
                  [
                        -97.24736,
                        33.140843
                  ],
                  [
                        -97.2473665,
                        33.140835
                  ],
                  [
                        -97.247371,
                        33.1408265
                  ],
                  [
                        -97.247436,
                        33.1406895
                  ],
                  [
                        -97.2470965,
                        33.1405555
                  ]
            ]
      ]
},
    lat: 33.14072,
    lng: -97.247209,

    // Property details
    year_built: 2008,
    owner: 'WILLIAMS, TIM & CONVERSE, SUSAN',
    last_sale_price: null,
    sale_date: '2023-07-05',
    county: 'denton',
    qoz_status: 'No',
    improvement_value: 284218,
    land_value: null,
    assessed_value: 451318,

    // Extended details
    use_code: 'A1',
    use_description: null,
    zoning: 'PD',
    zoning_description: 'Planned Development',
    num_stories: 1,
    num_units: null,
    num_rooms: null,
    subdivision: 'ROBSON RANCH 9 PH 1',
    lot_size_acres: 0.21051,
    lot_size_sqft: 9170,

    // Financial & tax data
    tax_year: '2026',
    parcel_value_type: 'CERTIFIED MARKET',
    sale_price: null,

    // Location data
    census_tract: '48121020310',
    census_block: '481210203101010',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-06-24',
    regrid_updated_at: '2026-07-25 13:22:24 -0400',

    // Owner mailing
    owner_mailing_address: '9101 BRADFORD ST',
    owner_mail_city: 'DENTON',
    owner_mail_state: 'TX',
    owner_mail_zip: '76207-6723',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "28fcd81d-e5a3-4d03-87af-6192f80a9108",
      "apn": "292257",
      "address": {
            "line1": "9101 BRADFORD ST",
            "line2": "",
            "city": "DENTON",
            "state": "TX",
            "zip": "76207"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -97.2470965,
                              33.1405555
                        ],
                        [
                              -97.247093,
                              33.140562
                        ],
                        [
                              -97.246979,
                              33.1407665
                        ],
                        [
                              -97.247288,
                              33.140859
                        ],
                        [
                              -97.247299,
                              33.1408615
                        ],
                        [
                              -97.2473105,
                              33.1408625
                        ],
                        [
                              -97.2473215,
                              33.1408615
                        ],
                        [
                              -97.2473325,
                              33.140859
                        ],
                        [
                              -97.2473425,
                              33.140855
                        ],
                        [
                              -97.247352,
                              33.1408495
                        ],
                        [
                              -97.24736,
                              33.140843
                        ],
                        [
                              -97.2473665,
                              33.140835
                        ],
                        [
                              -97.247371,
                              33.1408265
                        ],
                        [
                              -97.247436,
                              33.1406895
                        ],
                        [
                              -97.2470965,
                              33.1405555
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 33.14072,
            "lng": -97.247209
      },
      "properties": {
            "owner": "WILLIAMS, TIM & CONVERSE, SUSAN",
            "lot_size_sqft": 9170,
            "lot_acres": 0.21051,
            "year_built": 2008,
            "zoning": "PD",
            "zoning_description": "Planned Development",
            "property_type": "",
            "assessed_value": 451318,
            "improvement_value": 284218,
            "sale_date": "2023-07-05",
            "county": "denton",
            "qoz_status": "No",
            "use_code": "A1",
            "use_description": "",
            "subdivision": "ROBSON RANCH 9 PH 1",
            "num_stories": 1,
            "tax_year": "2026",
            "parcel_value_type": "CERTIFIED MARKET",
            "census_tract": "48121020310",
            "census_block": "481210203101010",
            "qoz_tract": "",
            "last_refresh_date": "2026-06-24",
            "regrid_updated_at": "2026-07-25 13:22:24 -0400",
            "owner_mailing_address": "9101 BRADFORD ST",
            "owner_mail_city": "DENTON",
            "owner_mail_state": "TX",
            "owner_mail_zip": "76207-6723",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 174110,
            "geoid": "48121",
            "parcelnumb": "292257",
            "parcelnumb_no_formatting": "292257",
            "usecode": "A1",
            "yearbuilt": 2008,
            "numstories": 1,
            "num_bath": 2,
            "num_bedrooms": 2,
            "parvaltype": "CERTIFIED MARKET",
            "improvval": 284218,
            "parval": 451318,
            "saleprice": 0,
            "saledate": "2023-07-05",
            "taxyear": "2026",
            "last_ownership_transfer_date": "2023-07-05",
            "mailadd": "9101 BRADFORD ST",
            "mail_addno": "9101",
            "mail_addstr": "BRADFORD",
            "mail_addsttyp": "ST",
            "mail_city": "DENTON",
            "mail_state2": "TX",
            "mail_zip": "76207-6723",
            "original_mailing_address": "{\"mailadd\":\"9101 BRADFORD ST\",\"mail_city\":\"DENTON\",\"mail_state2\":\"TX\",\"mail_zip\":\"76207-6723\"}",
            "address": "9101 BRADFORD ST",
            "saddno": "9101",
            "saddstr": "BRADFORD",
            "saddsttyp": "ST",
            "scity": "DENTON",
            "original_address": "{\"address\":\"9101 BRADFORD ST\",\"saddno\":\"9101\",\"saddstr\":\"BRADFORD\",\"saddsttyp\":\"ST\",\"scity\":\"DENTON\",\"szip\":\"76207\"}",
            "city": "justin-roanoke",
            "state2": "TX",
            "szip": "76207-6723",
            "szip5": "76207",
            "address_source": "county;cass",
            "legaldesc": "ROBSON RANCH 9 PH 1 BLK B LOT 14",
            "block": "B",
            "lot": "14",
            "lat": "33.140720",
            "lon": "-97.247209",
            "qoz": "No",
            "census_blockgroup": "481210203101",
            "census_zcta": "76207",
            "ll_last_refresh": "2026-06-24",
            "recrdareano": 1884,
            "area_building": 1884,
            "area_building_definition": "LIVING AREA",
            "deeded_acres": 0.2091,
            "sqft": 9108.396,
            "ll_gisacre": 0.21051,
            "ll_gissqft": 9170,
            "path": "/us/tx/denton/justin-roanoke/174110",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "28fcd81d-e5a3-4d03-87af-6192f80a9108",
            "ll_updated_at": "2026-07-25 13:22:24 -0400"
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
      name: 'Apollo Global Management',
      description: 'Apollo\'s El Segundo office at the Plaza at Continental Park',
      type: 'office'
    },

    // Basic identifiers
    regrid_id: '034d774e-1048-4e3a-af06-217ca01ac3d1',
    apn: '4138-011-027',
    address: '2101 ROSECRANS AVE',
    city: 'EL SEGUNDO',
    state: 'CA',
    zip_code: '90245',

    // Geometry and location
    geometry: {
      "type": "Polygon",
      "coordinates": [
            [
                  [
                        -118.3865965,
                        33.9020945
                  ],
                  [
                        -118.3865975,
                        33.9033785
                  ],
                  [
                        -118.387483,
                        33.903378
                  ],
                  [
                        -118.388429,
                        33.9033775
                  ],
                  [
                        -118.388427,
                        33.9020935
                  ],
                  [
                        -118.3883995,
                        33.9020365
                  ],
                  [
                        -118.3883315,
                        33.9020115
                  ],
                  [
                        -118.386692,
                        33.902012
                  ],
                  [
                        -118.386624,
                        33.9020375
                  ],
                  [
                        -118.3865965,
                        33.9020945
                  ]
            ]
      ]
},
    lat: 33.902696,
    lng: -118.387512,

    // Property details
    year_built: 1983,
    owner: 'PLAZA CP LLC',
    last_sale_price: null,
    sale_date: null,
    county: 'los-angeles',
    qoz_status: 'No',
    improvement_value: 75862878,
    land_value: 15928469,
    assessed_value: 91791347,

    // Extended details
    use_code: '1703',
    use_description: 'Commercial - Office Buildings',
    zoning: 'MU-S',
    zoning_description: 'Urban Mixed Use South',
    num_stories: 3,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 6.32711,
    lot_size_sqft: 275615,

    // Financial & tax data
    tax_year: '2026',
    parcel_value_type: 'GROSS ASSESSED',
    sale_price: null,

    // Location data
    census_tract: '06037980013',
    census_block: '060379800131038',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-06-24',
    regrid_updated_at: '2026-07-25 11:50:56 -0400',

    // Owner mailing
    owner_mailing_address: '2041 ROSECRANS AVE # 200',
    owner_mail_city: 'EL SEGUNDO',
    owner_mail_state: 'CA',
    owner_mail_zip: '90245',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "034d774e-1048-4e3a-af06-217ca01ac3d1",
      "apn": "4138-011-027",
      "address": {
            "line1": "2101 ROSECRANS AVE",
            "line2": "",
            "city": "EL SEGUNDO",
            "state": "CA",
            "zip": "90245"
      },
      "geometry": {
            "type": "Polygon",
            "coordinates": [
                  [
                        [
                              -118.3865965,
                              33.9020945
                        ],
                        [
                              -118.3865975,
                              33.9033785
                        ],
                        [
                              -118.387483,
                              33.903378
                        ],
                        [
                              -118.388429,
                              33.9033775
                        ],
                        [
                              -118.388427,
                              33.9020935
                        ],
                        [
                              -118.3883995,
                              33.9020365
                        ],
                        [
                              -118.3883315,
                              33.9020115
                        ],
                        [
                              -118.386692,
                              33.902012
                        ],
                        [
                              -118.386624,
                              33.9020375
                        ],
                        [
                              -118.3865965,
                              33.9020945
                        ]
                  ]
            ]
      },
      "centroid": {
            "lat": 33.902696,
            "lng": -118.387512
      },
      "properties": {
            "owner": "PLAZA CP LLC",
            "lot_size_sqft": 275615,
            "lot_acres": 6.32711,
            "year_built": 1983,
            "zoning": "MU-S",
            "zoning_description": "Urban Mixed Use South",
            "property_type": "",
            "assessed_value": 91791347,
            "improvement_value": 75862878,
            "land_value": 15928469,
            "sale_date": "",
            "county": "los-angeles",
            "qoz_status": "No",
            "use_code": "1703",
            "use_description": "Commercial - Office Buildings",
            "subdivision": "",
            "num_stories": 3,
            "tax_year": "2026",
            "parcel_value_type": "GROSS ASSESSED",
            "census_tract": "06037980013",
            "census_block": "060379800131038",
            "qoz_tract": "",
            "last_refresh_date": "2026-06-24",
            "regrid_updated_at": "2026-07-25 11:50:56 -0400",
            "owner_mailing_address": "2041 ROSECRANS AVE # 200",
            "owner_mail_city": "EL SEGUNDO",
            "owner_mail_state": "CA",
            "owner_mail_zip": "90245",
            "qualified_opportunity_zone": "No",
            "ogc_fid": 966057,
            "geoid": "06037",
            "parcelnumb": "4138-011-027",
            "parcelnumb_no_formatting": "4138011027",
            "usecode": "1703",
            "usedesc": "Commercial - Office Buildings",
            "yearbuilt": 1983,
            "numstories": 3,
            "numunits": 0,
            "parvaltype": "GROSS ASSESSED",
            "improvval": 75862878,
            "landval": 15928469,
            "parval": 91791347,
            "taxyear": "2026",
            "last_ownership_transfer_date": "2005-03-09",
            "owntype": "3",
            "mailadd": "2041 ROSECRANS AVE # 200",
            "mail_addno": "2041",
            "mail_addstr": "ROSECRANS AVE",
            "mail_unit": "# 200",
            "mail_city": "EL SEGUNDO",
            "mail_state2": "CA",
            "mail_zip": "90245",
            "original_mailing_address": "{\"mailadd\":\"02041 ROSECRANS AVE # 200\",\"mail_addno\":\"02041\",\"mail_addstr\":\"ROSECRANS AVE\",\"mail_unit\":\"# 200\",\"mail_city\":\"EL SEGUNDO\",\"mail_state2\":\"CA\",\"mail_zip\":\"902450000\"}",
            "address": "2101 ROSECRANS AVE",
            "saddno": "2101",
            "saddstr": "ROSECRANS",
            "saddsttyp": "AVE",
            "scity": "EL SEGUNDO",
            "original_address": "{\"address\":\"02101 ROSECRANS AVE\",\"saddno\":\"02101\",\"saddstr\":\"ROSECRANS AVE\",\"scity\":\"EL SEGUNDO\",\"szip\":\"902450000\"}",
            "city": "south-bay-cities",
            "state2": "CA",
            "szip": "90245-4749",
            "szip5": "90245",
            "address_source": "county;cass",
            "legaldesc": "TR=PARCEL MAP AS PER BK 124 P 52 OF P M LOT 4",
            "lat": "33.902696",
            "lon": "-118.387512",
            "qoz": "No",
            "census_blockgroup": "060379800131",
            "census_zcta": "90245",
            "ll_last_refresh": "2026-06-24",
            "recrdareano": 106000,
            "ll_gisacre": 6.32711,
            "ll_gissqft": 275615,
            "plss_township": "003S",
            "plss_section": "Section 00",
            "plss_range": "014W",
            "path": "/us/ca/los-angeles/south-bay-cities/966057",
            "ll_stable_id": "parcelnumb",
            "ll_uuid": "034d774e-1048-4e3a-af06-217ca01ac3d1",
            "ll_updated_at": "2026-07-25 11:50:56 -0400"
      },
      "demographics": null,
      "curatedMetadata": {
            "name": "Apollo Global Management",
            "description": "Apollo's El Segundo office at the Plaza at Continental Park",
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
    regrid_id: '01fd2efa-9868-44d7-b48f-65e643296f8b',
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
                        ]
                  ]
            ],
            [
                  [
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
    improvement_value: 816879900,
    land_value: 178196100,
    assessed_value: 995076000,

    // Extended details
    use_code: '344',
    use_description: 'Transportation Equipment',
    zoning: 'HI',
    zoning_description: 'Heavy Industry',
    num_stories: null,
    num_units: null,
    num_rooms: null,
    subdivision: null,
    lot_size_acres: 456.76492,
    lot_size_sqft: 19897094,

    // Financial & tax data
    tax_year: '2026',
    parcel_value_type: 'MARKET',
    sale_price: null,

    // Location data
    census_tract: '53061041304',
    census_block: '530610413042010',
    qoz_tract: null,

    // Data freshness
    last_refresh_date: '2026-06-24',
    regrid_updated_at: '2026-07-25 13:34:57 -0400',

    // Owner mailing
    owner_mailing_address: 'PO BOX 52427',
    owner_mail_city: 'ATLANTA',
    owner_mail_state: 'GA',
    owner_mail_zip: '30355-0427',

    // User fields
    is_sample: false,

    // Store full property data
    property_data: {
      "id": "01fd2efa-9868-44d7-b48f-65e643296f8b",
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
                              ]
                        ]
                  ],
                  [
                        [
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
            "zoning_description": "Heavy Industry",
            "property_type": "",
            "assessed_value": 995076000,
            "improvement_value": 816879900,
            "land_value": 178196100,
            "sale_date": "2002-02-26",
            "county": "snohomish",
            "qoz_status": "No",
            "use_code": "344",
            "use_description": "Transportation Equipment",
            "subdivision": "",
            "tax_year": "2026",
            "parcel_value_type": "MARKET",
            "census_tract": "53061041304",
            "census_block": "530610413042010",
            "qoz_tract": "",
            "last_refresh_date": "2026-06-24",
            "regrid_updated_at": "2026-07-25 13:34:57 -0400",
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
            "improvval": 816879900,
            "landval": 178196100,
            "parval": 995076000,
            "saleprice": 0,
            "saledate": "2002-02-26",
            "taxyear": "2026",
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
            "ll_last_refresh": "2026-06-24",
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
            "ll_updated_at": "2026-07-25 13:34:57 -0400"
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
