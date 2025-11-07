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
-- Pre-hashed password for 'tunaterra123' using bcrypt
-- Hash generated with: $2a$10$rMUjzL8Uu9w8P5lMj0iAjeXFXmj5oMq8gCVOcXKGf5PUjBqvHHQ3i
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
  '$2a$10$rMUjzL8Uu9w8P5lMj0iAjeXFXmj5oMq8gCVOcXKGf5PUjBqvHHQ3i',
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
-- Pre-hashed password for 'tunaterra123' using bcrypt
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
  '$2a$10$rMUjzL8Uu9w8P5lMj0iAjeXFXmj5oMq8gCVOcXKGf5PUjBqvHHQ3i',
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
-- Pre-hashed password for 'tunaterra123' using bcrypt
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
  '$2a$10$rMUjzL8Uu9w8P5lMj0iAjeXFXmj5oMq8gCVOcXKGf5PUjBqvHHQ3i',
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
-- SEED DATA SUMMARY
-- =============================================================================
-- Test User Credentials (all use same password):
--
-- Email: test1@example.com | Password: tunaterra123
-- Email: test2@example.com | Password: tunaterra123
-- Email: test3@example.com | Password: tunaterra123
--
-- User 1: 2 portfolios, 3 properties
-- User 2: 1 portfolio, 1 property
-- User 3: 1 portfolio, 1 property
--
-- All users also see the Virtual Sample Portfolio (frontend-only)
-- Supabase Studio: http://127.0.0.1:54323
