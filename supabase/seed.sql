-- Seed data for TunaTerra local development
-- This file runs automatically after migrations during `supabase db reset`
-- Best practice: Only include data insertions, not schema changes

-- =============================================================================
-- TEST USERS SETUP
-- =============================================================================
-- Create multiple test users for development
-- All passwords: tunaterra123
--
-- Test User 1: test1@example.com
-- Test User 2: test2@example.com
-- Test User 3: test3@example.com

-- User 1: test1@example.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  is_super_admin,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test1@example.com',
  crypt('tunaterra123', gen_salt('bf')),
  NOW(),
  '', '', '', '', '', NULL, '', '', '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"User 1","full_name":"Test User 1"}',
  'authenticated',
  'authenticated',
  false,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000001',
    'email', 'test1@example.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- User 2: test2@example.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  is_super_admin,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'test2@example.com',
  crypt('tunaterra123', gen_salt('bf')),
  NOW(),
  '', '', '', '', '', NULL, '', '', '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"User 2","full_name":"Test User 2"}',
  'authenticated',
  'authenticated',
  false,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000002',
    'email', 'test2@example.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- User 3: test3@example.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  is_super_admin,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'test3@example.com',
  crypt('tunaterra123', gen_salt('bf')),
  NOW(),
  '', '', '', '', '', NULL, '', '', '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"User 3","full_name":"Test User 3"}',
  'authenticated',
  'authenticated',
  false,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000003',
    'email', 'test3@example.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =============================================================================
-- USER LIMITS
-- =============================================================================
-- Note: This will be auto-created by trigger, but we can ensure it exists
INSERT INTO user_limits (
  user_id,
  tier,
  property_lookups_used,
  property_lookups_limit,
  total_lookups_lifetime,
  join_date
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'free',
  3, -- Show some usage
  10,
  15, -- Lifetime usage
  NOW() - INTERVAL '30 days'
),
(
  '00000000-0000-0000-0000-000000000002',
  'free',
  1, -- Minimal usage
  10,
  5,
  NOW() - INTERVAL '20 days'
),
(
  '00000000-0000-0000-0000-000000000003',
  'free',
  0, -- No usage yet
  10,
  0,
  NOW() - INTERVAL '10 days'
)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- PORTFOLIOS
-- =============================================================================
-- Note: Normally a default portfolio is auto-created by trigger on signup,
-- but since we're seeding the auth.users table directly, we need to create it manually

-- USER 1 PORTFOLIOS
-- Default portfolio for User 1
INSERT INTO portfolios (
  id,
  name,
  description,
  owner_id,
  is_default,
  is_sample,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000009',
  'Test''s Portfolio',
  'Default portfolio created automatically',
  '00000000-0000-0000-0000-000000000001',
  true,
  false,
  NOW() - INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

-- Second portfolio for User 1
INSERT INTO portfolios (
  id,
  name,
  description,
  owner_id,
  is_default,
  is_sample,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Commercial Properties',
  'Portfolio focused on commercial real estate investments',
  '00000000-0000-0000-0000-000000000001',
  false,
  false,
  NOW() - INTERVAL '25 days'
)
ON CONFLICT (id) DO NOTHING;

-- USER 2 PORTFOLIOS
-- Default portfolio for User 2
INSERT INTO portfolios (
  id,
  name,
  description,
  owner_id,
  is_default,
  is_sample,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  'Test''s Portfolio',
  'Default portfolio created automatically',
  '00000000-0000-0000-0000-000000000002',
  true,
  false,
  NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO NOTHING;

-- USER 3 PORTFOLIOS
-- Default portfolio for User 3
INSERT INTO portfolios (
  id,
  name,
  description,
  owner_id,
  is_default,
  is_sample,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000030',
  'Test''s Portfolio',
  'Default portfolio created automatically',
  '00000000-0000-0000-0000-000000000003',
  true,
  false,
  NOW() - INTERVAL '10 days'
)
ON CONFLICT (id) DO NOTHING;

-- Note: We intentionally do NOT create a "Sample Portfolio" here
-- The virtual sample portfolio is hardcoded in src/lib/sample-portfolio.ts
-- and is automatically shown to all users via the frontend hook

-- =============================================================================
-- PROPERTIES
-- =============================================================================
-- Add test properties to the default portfolio

-- USER 1 PROPERTIES
-- Properties in User 1's default portfolio
INSERT INTO properties (
  portfolio_id,
  user_id,
  address,
  city,
  state,
  zip_code,
  apn,
  owner,
  year_built,
  assessed_value,
  lat,
  lng,
  is_sample,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '123 Market Street',
  'San Francisco',
  'CA',
  '94103',
  '1234-567-890',
  'Test Owner LLC',
  2010,
  1250000.00,
  37.7749,
  -122.4194,
  false,
  NOW() - INTERVAL '20 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '456 Mission Street',
  'San Francisco',
  'CA',
  '94105',
  '0987-654-321',
  'Sample Properties Inc',
  2015,
  2750000.00,
  37.7897,
  -122.3972,
  false,
  NOW() - INTERVAL '18 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '2400 Fulton Street',
  'San Francisco',
  'CA',
  '94118',
  '4444-555-666',
  'Golden Gate Properties',
  2005,
  1850000.00,
  37.7694,
  -122.4862,
  false,
  NOW() - INTERVAL '16 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '1500 Broadway',
  'Oakland',
  'CA',
  '94612',
  '5555-666-777',
  'Bay Area Investments',
  2012,
  980000.00,
  37.8044,
  -122.2711,
  false,
  NOW() - INTERVAL '14 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '3200 El Camino Real',
  'Palo Alto',
  'CA',
  '94306',
  '6666-777-888',
  'Peninsula Holdings',
  2019,
  3450000.00,
  37.4275,
  -122.1697,
  false,
  NOW() - INTERVAL '12 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '750 University Avenue',
  'Berkeley',
  'CA',
  '94710',
  '7777-888-999',
  'Campus Real Estate LLC',
  2008,
  1650000.00,
  37.8715,
  -122.2730,
  false,
  NOW() - INTERVAL '10 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '8900 Santa Monica Boulevard',
  'West Hollywood',
  'CA',
  '90069',
  '8888-999-000',
  'Sunset Strip Properties',
  2017,
  4200000.00,
  34.0900,
  -118.3850,
  false,
  NOW() - INTERVAL '8 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '1250 Ocean Avenue',
  'Santa Monica',
  'CA',
  '90401',
  '9999-000-111',
  'Coastal Ventures Inc',
  2014,
  5750000.00,
  34.0195,
  -118.4912,
  false,
  NOW() - INTERVAL '6 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '4600 Park Boulevard',
  'San Diego',
  'CA',
  '92116',
  '0000-111-222',
  'SoCal Property Group',
  2011,
  1420000.00,
  32.7157,
  -117.1611,
  false,
  NOW() - INTERVAL '4 days'
),
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  '2850 Colorado Avenue',
  'Santa Monica',
  'CA',
  '90404',
  '1111-222-333',
  'Westside Realty Partners',
  2020,
  3980000.00,
  34.0280,
  -118.4746,
  false,
  NOW() - INTERVAL '2 days'
)
ON CONFLICT DO NOTHING;

-- Properties in User 1's Commercial Properties portfolio
INSERT INTO properties (
  portfolio_id,
  user_id,
  address,
  city,
  state,
  zip_code,
  apn,
  owner,
  year_built,
  assessed_value,
  lat,
  lng,
  is_sample,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '789 Office Plaza',
  'Palo Alto',
  'CA',
  '94301',
  '1111-222-333',
  'Tech Properties LLC',
  2018,
  4500000.00,
  37.4419,
  -122.1430,
  false,
  NOW() - INTERVAL '15 days'
)
ON CONFLICT DO NOTHING;

-- USER 2 PROPERTIES
-- Properties in User 2's default portfolio
INSERT INTO properties (
  portfolio_id,
  user_id,
  address,
  city,
  state,
  zip_code,
  apn,
  owner,
  year_built,
  assessed_value,
  lat,
  lng,
  is_sample,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000002',
  '100 Main Street',
  'San Jose',
  'CA',
  '95110',
  '2222-333-444',
  'Silicon Valley Properties',
  2020,
  3200000.00,
  37.3382,
  -121.8863,
  false,
  NOW() - INTERVAL '12 days'
)
ON CONFLICT DO NOTHING;

-- USER 3 PROPERTIES
-- Properties in User 3's default portfolio
INSERT INTO properties (
  portfolio_id,
  user_id,
  address,
  city,
  state,
  zip_code,
  apn,
  owner,
  year_built,
  assessed_value,
  lat,
  lng,
  is_sample,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000003',
  '500 Broadway',
  'Oakland',
  'CA',
  '94607',
  '3333-444-555',
  'East Bay Holdings',
  2016,
  1950000.00,
  37.8044,
  -122.2712,
  false,
  NOW() - INTERVAL '5 days'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PORTFOLIO MEMBERSHIPS
-- =============================================================================
-- Create owner memberships for all portfolios
-- Note: The trigger normally creates these, but since we're seeding directly, we need to add them

INSERT INTO portfolio_memberships (
  portfolio_id,
  user_id,
  role,
  accepted_at,
  created_at
) VALUES
-- User 1 memberships
(
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'owner',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'owner',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
-- User 2 memberships
(
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000002',
  'owner',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
-- User 3 memberships
(
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000003',
  'owner',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
)
ON CONFLICT (portfolio_id, user_id) DO NOTHING;

-- =============================================================================
-- EDUCATION PROGRESS
-- =============================================================================
-- Add some completed lessons for test users
INSERT INTO user_education_progress (
  user_id,
  lesson_slug,
  completed_at,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'noi-fundamentals',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),
(
  '00000000-0000-0000-0000-000000000002',
  'noi-fundamentals',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),
(
  '00000000-0000-0000-0000-000000000002',
  'cap-rate-fundamentals',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (user_id, lesson_slug) DO NOTHING;

-- =============================================================================
-- SEED DATA SUMMARY
-- =============================================================================
-- Test User Credentials (all use same password):
--
-- Email: test1@example.com | Password: tunaterra123
-- Email: test2@example.com | Password: tunaterra123
-- Email: test3@example.com | Password: tunaterra123
--
-- User 1: 2 portfolios, 11 properties (10 in default, 1 in commercial), 1 lesson completed
-- User 2: 1 portfolio, 1 property, 2 lessons completed
-- User 3: 1 portfolio, 1 property, 0 lessons completed
--
-- All users also see the Virtual Sample Portfolio (frontend-only)
-- Supabase Studio: http://127.0.0.1:54323
