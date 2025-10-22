-- ============================================================================
-- Migration: Fix All SECURITY DEFINER Functions Missing Search Path
-- Description: Adds missing SET search_path to multiple SECURITY DEFINER functions
--              to prevent "relation does not exist" errors
-- Date: 2025-10-22
-- Issue: Multiple functions fail to find tables in SECURITY DEFINER context
-- ============================================================================

-- 1. Fix create_user_limits (critical for signup)
CREATE OR REPLACE FUNCTION public.create_user_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Add search_path
AS $function$
BEGIN
  INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit, total_lookups_lifetime, join_date)
  VALUES (NEW.id, 'free', 0, 10, 0, NOW());
  RETURN NEW;
END;
$function$;

-- 2. Fix ensure_single_default_portfolio (critical for portfolio creation)
CREATE OR REPLACE FUNCTION public.ensure_single_default_portfolio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Add search_path
AS $function$
BEGIN
  -- If this portfolio is being set as default
  IF NEW.is_default = true THEN
    -- Set all other portfolios for this user to non-default
    UPDATE portfolios
    SET is_default = false
    WHERE owner_id = NEW.owner_id
      AND id != NEW.id
      AND is_default = true;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3. Fix check_and_increment_usage (critical for API usage tracking)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid, p_increment integer DEFAULT 1)
 RETURNS TABLE(can_proceed boolean, current_usage integer, usage_limit integer, total_lifetime integer, tier text, reset_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Add search_path
AS $function$
DECLARE
  user_record user_limits%ROWTYPE;
  new_usage INTEGER;
  new_lifetime INTEGER;
  calculated_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Lock the user_limits row to prevent race conditions
  SELECT * INTO user_record
  FROM user_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user doesn't exist, create default limits with 10 lookups
  IF user_record IS NULL THEN
    INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit, total_lookups_lifetime, join_date)
    VALUES (p_user_id, 'free', 0, 10, 0, NOW())
    RETURNING * INTO user_record;
  END IF;

  -- Calculate proper reset date based on join_date
  calculated_reset_date := calculate_user_reset_date(user_record.join_date);

  -- Check if monthly reset is needed
  IF user_record.reset_date <= NOW() OR ABS(EXTRACT(EPOCH FROM (user_record.reset_date - calculated_reset_date))) > 86400 THEN
    UPDATE user_limits
    SET
      property_lookups_used = 0,
      reset_date = calculated_reset_date,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO user_record;
  END IF;

  -- Calculate new usage
  new_usage := COALESCE(user_record.property_lookups_used, 0) + p_increment;
  new_lifetime := COALESCE(user_record.total_lookups_lifetime, 0) + p_increment;

  -- Check if user is on pro tier (unlimited)
  IF user_record.tier = 'pro' THEN
    -- Pro users have unlimited access - just increment counters
    UPDATE user_limits
    SET
      property_lookups_used = new_usage,
      total_lookups_lifetime = new_lifetime,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT
      true,
      new_usage,
      user_record.property_lookups_limit,
      new_lifetime,
      user_record.tier,
      user_record.reset_date;
    RETURN;
  END IF;

  -- Check limits for free tier
  IF new_usage > user_record.property_lookups_limit THEN
    -- Over limit
    RETURN QUERY SELECT
      false,
      user_record.property_lookups_used,
      user_record.property_lookups_limit,
      user_record.total_lookups_lifetime,
      user_record.tier,
      user_record.reset_date;
    RETURN;
  END IF;

  -- Increment usage as it's within limits
  UPDATE user_limits
  SET
    property_lookups_used = new_usage,
    total_lookups_lifetime = new_lifetime,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT
    true,
    new_usage,
    user_record.property_lookups_limit,
    new_lifetime,
    user_record.tier,
    user_record.reset_date;
END;
$function$;

-- 4. Fix check_usage_limits (critical for API usage checking)
CREATE OR REPLACE FUNCTION public.check_usage_limits(p_user_id uuid, p_check_count integer DEFAULT 1)
 RETURNS TABLE(can_proceed boolean, current_usage integer, usage_limit integer, total_lifetime integer, tier text, reset_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Add search_path
AS $function$
DECLARE
  user_record user_limits%ROWTYPE;
  calculated_reset_date TIMESTAMP WITH TIME ZONE;
  effective_usage INTEGER;
BEGIN
  -- Get user limits (no lock needed for read-only check)
  SELECT * INTO user_record
  FROM user_limits
  WHERE user_id = p_user_id;

  -- If user doesn't exist, return default limits with 10 lookups
  IF user_record IS NULL THEN
    RETURN QUERY SELECT
      (p_check_count <= 10)::boolean as can_proceed,
      0 as current_usage,
      10 as usage_limit,
      0 as total_lifetime,
      'free'::text as tier,
      calculate_user_reset_date(NOW()) as reset_date;
    RETURN;
  END IF;

  -- Calculate proper reset date
  calculated_reset_date := calculate_user_reset_date(user_record.join_date);

  -- Calculate effective usage (reset if needed)
  IF user_record.reset_date <= NOW() OR ABS(EXTRACT(EPOCH FROM (user_record.reset_date - calculated_reset_date))) > 86400 THEN
    -- Monthly reset is due
    effective_usage := 0;
  ELSE
    effective_usage := COALESCE(user_record.property_lookups_used, 0);
  END IF;

  -- Check if user is on pro tier (unlimited)
  IF user_record.tier = 'pro' THEN
    RETURN QUERY SELECT
      true,
      effective_usage,
      user_record.property_lookups_limit,
      user_record.total_lookups_lifetime,
      user_record.tier,
      calculated_reset_date;
    RETURN;
  END IF;

  -- Check limits for free tier
  RETURN QUERY SELECT
    ((effective_usage + p_check_count) <= user_record.property_lookups_limit),
    effective_usage,
    user_record.property_lookups_limit,
    user_record.total_lookups_lifetime,
    user_record.tier,
    calculated_reset_date;
END;
$function$;

-- 5. Fix reset_monthly_limits (maintenance function)
CREATE OR REPLACE FUNCTION public.reset_monthly_limits()
 RETURNS TABLE(users_reset integer, users_processed integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'  -- Add search_path
AS $function$
DECLARE
  reset_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Reset users whose reset_date has passed
  WITH reset_users AS (
    UPDATE user_limits
    SET
      property_lookups_used = 0,
      reset_date = calculate_user_reset_date(join_date),
      updated_at = NOW()
    WHERE tier = 'free'
      AND reset_date <= NOW()
    RETURNING user_id
  )
  SELECT COUNT(*) INTO reset_count FROM reset_users;

  -- Count total free users processed
  SELECT COUNT(*) INTO total_count
  FROM user_limits
  WHERE tier = 'free';

  RETURN QUERY SELECT reset_count, total_count;
END;
$function$;

-- Verification
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM information_schema.routines r
  JOIN pg_proc p ON p.proname = r.routine_name
  JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = r.routine_schema
  WHERE routine_schema = 'public'
    AND security_type = 'DEFINER'
    AND pg_get_functiondef(p.oid) NOT LIKE '%SET search_path%';

  RAISE NOTICE 'SECURITY DEFINER functions still missing search_path: %', missing_count;
END;
$$;