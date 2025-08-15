-- Migration to add sample portfolio functionality
-- Run this in your Supabase SQL editor

-- Add is_sample columns to existing tables
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Create sample portfolio function (from database/04-functions.sql)
CREATE OR REPLACE FUNCTION create_sample_portfolio_for_user(p_user_id UUID, p_user_email TEXT)
RETURNS UUID AS $$
DECLARE
  sample_portfolio_id UUID;
  property_geometry_1 JSONB;
  property_geometry_2 JSONB;
  property_geometry_3 JSONB;
BEGIN
  -- Create sample portfolio
  INSERT INTO public.portfolios (name, description, owner_id, is_default, is_sample)
  VALUES (
    'Sample Portfolio - Explore Our Data',
    'This sample portfolio showcases the comprehensive property data available on our platform. These 3 properties demonstrate different property types, locations, and data richness to help you understand our service capabilities.',
    p_user_id,
    true,
    true
  )
  RETURNING id INTO sample_portfolio_id;

  -- Define property geometries as JSONB
  property_geometry_1 := '{"type": "Polygon", "coordinates": [[[-117.3624525, 34.0768805], [-117.3624525, 34.077062], [-117.3625715, 34.077062], [-117.3625715, 34.0768805], [-117.3624525, 34.0768805]]]}';
  property_geometry_2 := '{"type": "Polygon", "coordinates": [[[-112.3625725, 33.4665925], [-112.3627205, 33.4665975], [-112.3627555, 33.4663095], [-112.3626095, 33.466289], [-112.3625725, 33.4665925]]]}';
  property_geometry_3 := '{"type": "Polygon", "coordinates": [[[-111.7391775, 32.9178675], [-111.7393735, 32.917866], [-111.73938, 32.9175305], [-111.739184, 32.917532], [-111.7391775, 32.9178675]]]}';

  -- Insert 3 sample properties based on test data
  
  -- Sample Property 1: Modern Townhouse in California
  INSERT INTO public.properties (
    user_id, portfolio_id, is_sample,
    regrid_id, apn, address, city, state, zip_code,
    geometry, lat, lng, year_built, owner,
    county, qoz_status, improvement_value, land_value, assessed_value,
    use_code, use_description, zoning, zoning_description,
    num_stories, num_units, num_rooms, subdivision,
    lot_size_acres, lot_size_sqft, tax_year, parcel_value_type,
    census_tract, census_block, qoz_tract,
    owner_mailing_address, owner_mail_city, owner_mail_state, owner_mail_zip,
    user_notes
  ) VALUES (
    p_user_id, sample_portfolio_id, true,
    '181157', '0254282260000', '2148 Lavender Ln', 'Colton', 'CA', '92324',
    property_geometry_1, 34.076971, -117.362512, 2018, 'CJ & HG LLC',
    'San Bernardino', 'Yes', 313084, 101859, 414943,
    '531', 'PUD', 'CHCCSP', 'Colton Hub City Centre Specific Plan',
    2, 0, 5, null,
    0.0546, 2378, '2024', 'Full Market',
    '06071003612', '060710036122004', '06071003609',
    '2275 Huntington Dr #518', 'San Marino', 'CA', '91108',
    'Modern 2-story townhouse in opportunity zone - great for investment'
  );

  -- Sample Property 2: Single-Family Home in Arizona
  INSERT INTO public.properties (
    user_id, portfolio_id, is_sample,
    regrid_id, apn, address, city, state, zip_code,
    geometry, lat, lng, year_built, owner,
    county, qoz_status, improvement_value, land_value, assessed_value,
    use_code, use_description, zoning, zoning_description,
    num_stories, num_units, num_rooms, subdivision,
    lot_size_acres, lot_size_sqft, tax_year, parcel_value_type,
    census_tract, census_block,
    owner_mailing_address, owner_mail_city, owner_mail_state, owner_mail_zip,
    user_notes
  ) VALUES (
    p_user_id, sample_portfolio_id, true,
    '1655778', '50183176', '14090 W Desert Flower Dr', 'Goodyear', 'AZ', '85395',
    property_geometry_2, 33.466447, -112.362664, 2021, 'Mi Casa Holdings Ltd/Quality Rental Home LLC',
    'Maricopa', 'No', 309500, 77300, 386800,
    '8540', 'TH Default Code', 'PAD', 'Planned Area Development',
    1, 0, 0, 'Vistas At Palm Valley',
    0.11188, 4874, '2026', 'Full Market',
    '04013061064', '040130610641016',
    '1330 Oak View Ave', 'San Marino', 'CA', '91108',
    'Newer construction in planned development - excellent rental property'
  );

  -- Sample Property 3: Older Single-Family in Arizona
  INSERT INTO public.properties (
    user_id, portfolio_id, is_sample,
    regrid_id, apn, address, city, state, zip_code,
    geometry, lat, lng, year_built, owner,
    county, qoz_status, land_value, assessed_value,
    use_code, use_description, zoning, zoning_description,
    num_stories, num_units, num_rooms,
    lot_size_acres, lot_size_sqft, parcel_value_type,
    census_tract, census_block,
    owner_mailing_address, owner_mail_city, owner_mail_state, owner_mail_zip,
    user_notes
  ) VALUES (
    p_user_id, sample_portfolio_id, true,
    '81885', '505090290', '1104 E Yucca St', 'Casa Grande', 'AZ', '85122',
    property_geometry_3, 32.917699, -111.739279, 1959, 'CJ & HG LLC',
    'Pinal', 'No', 29280, 132622,
    '0121', 'Residential', 'R-1', 'Single Family Residential',
    1, 0, 0,
    0.16842, 7337, 'Assessed',
    '04021001305', '040210013051008',
    '1330 Oak View Ave', 'San Marino', 'CA', '91108',
    'Classic single-family home with larger lot - value-add opportunity'
  );

  RETURN sample_portfolio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user creation triggers to create sample portfolio instead of regular default
CREATE OR REPLACE FUNCTION create_default_portfolio_for_user()
RETURNS TRIGGER AS $$
DECLARE
  sample_portfolio_id UUID;
BEGIN
  -- Set the request.jwt.claims.sub to the new user's ID for RLS context
  PERFORM set_config('request.jwt.claims.sub', NEW.id::text, true);
  
  BEGIN
    -- Create sample portfolio with 3 properties
    SELECT create_sample_portfolio_for_user(NEW.id, COALESCE(NEW.email, 'User ' || NEW.id)) 
    INTO sample_portfolio_id;
    
    RAISE LOG 'Created sample portfolio % for user %', sample_portfolio_id, NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Failed to create sample portfolio for user %: %', NEW.id, SQLERRM;
    -- Re-raise the exception to prevent user creation if portfolio can't be created
    RAISE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;