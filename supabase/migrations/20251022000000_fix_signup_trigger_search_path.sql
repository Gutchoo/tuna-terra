-- ============================================================================
-- Migration: Fix Signup Trigger Search Path Issue
-- Description: Adds missing SET search_path to create_default_portfolio_for_user
--              function to fix "Database error saving new user" on signup
-- Date: 2025-10-22
-- Issue: Signup fails with "OAuth error:server_error - Database error saving new user"
--        because the trigger function cannot find the portfolios table
-- ============================================================================

-- Update the trigger function to include proper search_path
CREATE OR REPLACE FUNCTION public.create_default_portfolio_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Critical fix: Add explicit search_path
AS $function$
DECLARE
  first_name text;
BEGIN
  -- Set the request.jwt.claims.sub to the new user's ID for RLS context
  PERFORM set_config('request.jwt.claims.sub', NEW.id::text, true);

  BEGIN
    -- Extract first name from user metadata
    first_name := COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
      split_part(NEW.email, '@', 1),
      'User'
    );

    INSERT INTO public.portfolios (name, description, owner_id, is_default)
    VALUES (
      first_name || '''s Portfolio',
      'Default portfolio created automatically',
      NEW.id,
      true
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Failed to create default portfolio for user %: %', NEW.id, SQLERRM;
    -- Re-raise the exception to prevent user creation if portfolio can't be created
    RAISE;
  END;
  RETURN NEW;
END;
$function$;

-- Verify the function was updated correctly
DO $$
DECLARE
  func_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO func_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.proname = 'create_default_portfolio_for_user'
    AND n.nspname = 'public';

  IF func_def NOT LIKE '%SET search_path%' THEN
    RAISE EXCEPTION 'Failed to update create_default_portfolio_for_user with search_path';
  END IF;

  RAISE NOTICE 'Successfully updated create_default_portfolio_for_user function with search_path';
END;
$$;