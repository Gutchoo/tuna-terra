

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."document_type" AS ENUM (
    'invoice',
    'receipt',
    'work_order',
    'insurance_policy',
    'tax_document',
    'lease_agreement',
    'inspection_report',
    'property_photo',
    'floor_plan',
    'other'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."expense_category" AS ENUM (
    'repairs_maintenance',
    'property_taxes',
    'insurance',
    'utilities',
    'property_management',
    'hoa_fees',
    'landscaping',
    'pest_control',
    'cleaning',
    'legal_fees',
    'accounting_fees',
    'advertising',
    'capital_expenditure',
    'other_expense'
);


ALTER TYPE "public"."expense_category" OWNER TO "postgres";


CREATE TYPE "public"."income_category" AS ENUM (
    'rental_income',
    'parking_income',
    'storage_income',
    'pet_fees',
    'late_fees',
    'utility_reimbursement',
    'laundry_income',
    'other_income'
);


ALTER TYPE "public"."income_category" OWNER TO "postgres";


CREATE TYPE "public"."processing_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE "public"."processing_status" OWNER TO "postgres";


CREATE TYPE "public"."recurrence_frequency" AS ENUM (
    'weekly',
    'bi_weekly',
    'monthly',
    'quarterly',
    'semi_annual',
    'annual'
);


ALTER TYPE "public"."recurrence_frequency" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'actual',
    'projected'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_next_reset_date"("join_date" timestamp with time zone) RETURNS timestamp with time zone
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  current_time TIMESTAMP WITH TIME ZONE := NOW();
  current_month INTEGER := EXTRACT(MONTH FROM current_time);
  current_year INTEGER := EXTRACT(YEAR FROM current_time);
  join_day INTEGER := EXTRACT(DAY FROM join_date);
  next_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate the reset date for the current month
  next_reset_date := make_timestamptz(
    current_year,
    current_month,
    LEAST(join_day, extract(day from (make_date(current_year, current_month, 1) + interval '1 month - 1 day'))::integer),
    EXTRACT(HOUR FROM join_date)::integer,
    EXTRACT(MINUTE FROM join_date)::integer,
    EXTRACT(SECOND FROM join_date),
    'UTC'
  );

  -- If the reset date for this month has already passed, move to next month
  IF next_reset_date <= current_time THEN
    -- Move to next month
    IF current_month = 12 THEN
      current_month := 1;
      current_year := current_year + 1;
    ELSE
      current_month := current_month + 1;
    END IF;

    next_reset_date := make_timestamptz(
      current_year,
      current_month,
      LEAST(join_day, extract(day from (make_date(current_year, current_month, 1) + interval '1 month - 1 day'))::integer),
      EXTRACT(HOUR FROM join_date)::integer,
      EXTRACT(MINUTE FROM join_date)::integer,
      EXTRACT(SECOND FROM join_date),
      'UTC'
    );
  END IF;

  RETURN next_reset_date;
END;
$$;


ALTER FUNCTION "public"."calculate_next_reset_date"("join_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_user_reset_date"("user_join_date" timestamp with time zone) RETURNS timestamp with time zone
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  join_day INTEGER;
  current_date_check DATE;
  next_reset_candidate TIMESTAMP WITH TIME ZONE;
  target_month INTEGER;
  target_year INTEGER;
BEGIN
  -- Extract the day from join_date (1-31)
  join_day := EXTRACT(DAY FROM user_join_date);
  current_date_check := NOW()::DATE;
  
  -- Start with current month
  target_year := EXTRACT(YEAR FROM current_date_check);
  target_month := EXTRACT(MONTH FROM current_date_check);
  
  -- Try to create reset date for current month with same day as join date
  -- PostgreSQL will automatically adjust for month-end issues (Jan 31 -> Feb 28, etc.)
  next_reset_candidate := make_timestamp(
    target_year::INTEGER, 
    target_month::INTEGER, 
    LEAST(join_day, EXTRACT(DAY FROM (DATE_TRUNC('month', current_date_check) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER),
    0, 0, 0
  );
  
  -- If current month's reset date has already passed, move to next month
  IF next_reset_candidate <= NOW() THEN
    -- Move to next month
    IF target_month = 12 THEN
      target_year := target_year + 1;
      target_month := 1;
    ELSE
      target_month := target_month + 1;
    END IF;
    
    -- Create reset date for next month, handling day adjustments
    next_reset_candidate := make_timestamp(
      target_year::INTEGER,
      target_month::INTEGER,
      LEAST(join_day, EXTRACT(DAY FROM (make_date(target_year::INTEGER, target_month::INTEGER, 1) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER),
      0, 0, 0
    );
  END IF;
  
  RETURN next_reset_candidate;
END;
$$;


ALTER FUNCTION "public"."calculate_user_reset_date"("user_join_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_user_edit_portfolio"("p_portfolio_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN get_user_portfolio_role(p_portfolio_id, p_user_id) IN ('owner', 'editor');
END;
$$;


ALTER FUNCTION "public"."can_user_edit_portfolio"("p_portfolio_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_and_increment_usage"("p_user_id" "uuid", "p_increment" integer DEFAULT 1) RETURNS TABLE("can_proceed" boolean, "current_usage" integer, "usage_limit" integer, "total_lifetime" integer, "tier" "text", "reset_date" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."check_and_increment_usage"("p_user_id" "uuid", "p_increment" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_usage_limits"("p_user_id" "uuid", "p_check_count" integer DEFAULT 1) RETURNS TABLE("can_proceed" boolean, "current_usage" integer, "usage_limit" integer, "total_lifetime" integer, "tier" "text", "reset_date" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."check_usage_limits"("p_user_id" "uuid", "p_check_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_portfolio_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."create_default_portfolio_for_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_owner_membership"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  INSERT INTO portfolio_memberships (portfolio_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_owner_membership"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_portfolio_owner_membership"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  INSERT INTO public.portfolio_memberships (portfolio_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Failed to create owner membership for portfolio % user %: %', NEW.id, NEW.owner_id, SQLERRM;
  -- Re-raise the exception to prevent portfolio creation if membership can't be created
  RAISE;
END;
$$;


ALTER FUNCTION "public"."create_portfolio_owner_membership"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_sample_portfolio_for_user"("p_user_id" "uuid", "p_user_email" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
  sample_portfolio_id UUID;
  has_existing_default BOOLEAN;
BEGIN
  -- Check if user already has a default portfolio
  SELECT EXISTS(
    SELECT 1 FROM portfolios 
    WHERE owner_id = p_user_id AND is_default = true
  ) INTO has_existing_default;
  
  -- Create sample portfolio (default only if no existing default)
  INSERT INTO public.portfolios (name, description, owner_id, is_default, is_sample)
  VALUES (
    'Sample Portfolio - Explore Our Data',
    'This sample portfolio showcases the comprehensive property data available on our platform. You can add properties here to see how our platform displays and manages real estate data.',
    p_user_id,
    NOT has_existing_default, -- Only default if no existing default
    true
  )
  RETURNING id INTO sample_portfolio_id;

  -- No longer creating sample properties
  -- Properties will be added later as needed

  RETURN sample_portfolio_id;
END;
$$;


ALTER FUNCTION "public"."create_sample_portfolio_for_user"("p_user_id" "uuid", "p_user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_limits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit, total_lookups_lifetime, join_date)
  VALUES (NEW.id, 'free', 0, 10, 0, NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_default_portfolio"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."ensure_single_default_portfolio"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_census_data"("place_geoid" "text") RETURNS TABLE("geoid" "text", "year" integer, "median_income" numeric, "mean_income" numeric, "population" integer, "unemployment_rate" numeric, "households" integer, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    RETURN QUERY
    SELECT c.geoid, c.year, c.median_income, c.mean_income, 
           c.population, c.unemployment_rate, c.households, c.updated_at
    FROM public.census_data c
    WHERE c.geoid = place_geoid
    ORDER BY c.year DESC, c.updated_at DESC
    LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_latest_census_data"("place_geoid" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_places_missing_census_data"("place_geoids" "text"[], "data_year" integer) RETURNS TABLE("geoid" "text", "name" "text", "state_abbr" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    RETURN QUERY
    SELECT p.geoid, p.name, p.state_abbr
    FROM public.places p
    WHERE p.geoid = ANY(place_geoids)
      AND NOT EXISTS (
          SELECT 1 FROM public.census_data c 
          WHERE c.geoid = p.geoid AND c.year = data_year
      );
END;
$$;


ALTER FUNCTION "public"."get_places_missing_census_data"("place_geoids" "text"[], "data_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_property_place_match"("property_city" "text", "property_state" "text") RETURNS TABLE("place_id" "uuid", "geoid" "text", "datausa_code" "text", "normalized_name" "text", "match_confidence" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    -- Try exact match first (highest confidence)
    RETURN QUERY
    SELECT 
        p.id as place_id,
        p.geoid,
        p.datausa_code,
        p.basename_normalized as normalized_name,
        'exact' as match_confidence
    FROM public.places p
    WHERE p.basename_normalized = LOWER(TRIM(property_city))
      AND p.state_abbr = UPPER(TRIM(property_state))
    LIMIT 1;
    
    -- If no exact match, try fuzzy match
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            p.id as place_id,
            p.geoid,
            p.datausa_code,
            p.basename_normalized as normalized_name,
            'fuzzy' as match_confidence
        FROM public.places p
        WHERE p.state_abbr = UPPER(TRIM(property_state))
          AND (
            p.basename_normalized LIKE '%' || LOWER(TRIM(property_city)) || '%'
            OR LOWER(TRIM(property_city)) LIKE '%' || p.basename_normalized || '%'
          )
        ORDER BY 
            -- Prefer shorter names (more specific matches)
            LENGTH(p.basename_normalized),
            p.name
        LIMIT 1;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_property_place_match"("property_city" "text", "property_state" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_accessible_portfolios"() RETURNS TABLE("id" "uuid", "name" "text", "description" "text", "owner_id" "uuid", "is_default" boolean, "is_sample" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "user_role" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
    SELECT DISTINCT 
        p.id,
        p.name,
        p.description,
        p.owner_id,
        p.is_default,
        p.is_sample,
        p.created_at,
        p.updated_at,
        CASE
            WHEN p.owner_id = auth.uid() THEN 'owner'::text
            ELSE pm.role
        END AS user_role
    FROM portfolios p
    LEFT JOIN portfolio_memberships pm 
        ON pm.portfolio_id = p.id 
        AND pm.user_id = auth.uid() 
        AND pm.accepted_at IS NOT NULL
    WHERE p.owner_id = auth.uid() 
        OR (pm.user_id = auth.uid() AND pm.accepted_at IS NOT NULL);
$$;


ALTER FUNCTION "public"."get_user_accessible_portfolios"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_portfolio_role"("p_portfolio_id" "uuid", "p_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT 'owner' INTO user_role
  FROM portfolios 
  WHERE id = p_portfolio_id AND owner_id = p_user_id;
  
  IF FOUND THEN
    RETURN user_role;
  END IF;
  
  SELECT role INTO user_role
  FROM portfolio_memberships 
  WHERE portfolio_id = p_portfolio_id 
  AND user_id = p_user_id 
  AND accepted_at IS NOT NULL;
  
  RETURN user_role;
END;
$$;


ALTER FUNCTION "public"."get_user_portfolio_role"("p_portfolio_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_census_data"("place_geoid" "text", "data_year" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.census_data 
        WHERE geoid = place_geoid AND year = data_year
    );
END;
$$;


ALTER FUNCTION "public"."has_census_data"("place_geoid" "text", "data_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_monthly_limits"() RETURNS TABLE("users_reset" integer, "users_processed" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."reset_monthly_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_portfolio_properties"("p_user_id" "uuid", "p_portfolio_id" "uuid" DEFAULT NULL::"uuid", "p_search" "text" DEFAULT NULL::"text", "p_city" "text" DEFAULT NULL::"text", "p_state" "text" DEFAULT NULL::"text", "p_tags" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("id" "uuid", "address" "text", "city" "text", "state" "text", "apn" "text", "owner" "text", "portfolio_id" "uuid", "portfolio_name" "text", "user_role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.address,
    p.city,
    p.state,
    p.apn,
    p.owner,
    p.portfolio_id,
    pf.name as portfolio_name,
    get_user_portfolio_role(p.portfolio_id, p_user_id) as user_role
  FROM properties p
  LEFT JOIN portfolios pf ON p.portfolio_id = pf.id
  WHERE 
    (
      p.user_id = p_user_id OR
      pf.owner_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM portfolio_memberships pm
        WHERE pm.portfolio_id = p.portfolio_id
        AND pm.user_id = p_user_id
        AND pm.accepted_at IS NOT NULL
      )
    )
    AND (p_portfolio_id IS NULL OR p.portfolio_id = p_portfolio_id)
    AND (p_search IS NULL OR (
      p.address ILIKE '%' || p_search || '%' OR
      p.owner ILIKE '%' || p_search || '%' OR
      p.apn ILIKE '%' || p_search || '%' OR
      p.city ILIKE '%' || p_search || '%'
    ))
    AND (p_city IS NULL OR p.city ILIKE p_city)
    AND (p_state IS NULL OR p.state ILIKE p_state)
    AND (p_tags IS NULL OR p.tags && p_tags)
  ORDER BY p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."search_portfolio_properties"("p_user_id" "uuid", "p_portfolio_id" "uuid", "p_search" "text", "p_city" "text", "p_state" "text", "p_tags" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "text") RETURNS TABLE("id" "uuid", "address" "text", "city" "text", "state" "text", "zip_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.address, p.city, p.state, p.zip_code
  FROM properties p
  WHERE p.user_id = user_id_param
    AND (
      p.address ILIKE '%' || search_term || '%' OR
      p.city ILIKE '%' || search_term || '%' OR
      p.zip_code ILIKE '%' || search_term || '%'
    )
  LIMIT 10;
END;
$$;


ALTER FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "uuid") RETURNS TABLE("id" "uuid", "address" "text", "city" "text", "state" "text", "zip_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.address, p.city, p.state, p.zip_code
  FROM properties p
  WHERE p.user_id = user_id_param
    AND (
      p.address ILIKE '%' || search_term || '%' OR
      p.city ILIKE '%' || search_term || '%' OR
      p.zip_code ILIKE '%' || search_term || '%'
    )
  LIMIT 10;
END;
$$;


ALTER FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_property_financials_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_property_financials_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_census_data"("place_geoid" "text", "data_year" integer, "p_median_income" numeric DEFAULT NULL::numeric, "p_mean_income" numeric DEFAULT NULL::numeric, "p_population" integer DEFAULT NULL::integer, "p_unemployment_rate" numeric DEFAULT NULL::numeric, "p_households" integer DEFAULT NULL::integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    INSERT INTO public.census_data (
        geoid, year, median_income, mean_income, 
        population, unemployment_rate, households
    ) VALUES (
        place_geoid, data_year, p_median_income, p_mean_income,
        p_population, p_unemployment_rate, p_households
    )
    ON CONFLICT (geoid, year) 
    DO UPDATE SET
        median_income = COALESCE(EXCLUDED.median_income, census_data.median_income),
        mean_income = COALESCE(EXCLUDED.mean_income, census_data.mean_income),
        population = COALESCE(EXCLUDED.population, census_data.population),
        unemployment_rate = COALESCE(EXCLUDED.unemployment_rate, census_data.unemployment_rate),
        households = COALESCE(EXCLUDED.households, census_data.households),
        updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."upsert_census_data"("place_geoid" "text", "data_year" integer, "p_median_income" numeric, "p_mean_income" numeric, "p_population" integer, "p_unemployment_rate" numeric, "p_households" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."census_data" (
    "geoid" "text" NOT NULL,
    "year" integer NOT NULL,
    "median_income" numeric(12,2),
    "mean_income" numeric(12,2),
    "population" integer,
    "unemployment_rate" numeric(5,2),
    "households" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "median_age" numeric,
    "age_brackets" "jsonb",
    "total_housing_units" integer,
    "owner_occupied_units" integer,
    "renter_occupied_units" integer,
    "median_rent" numeric(8,2),
    "avg_household_size_owner" numeric(4,2),
    "avg_household_size_renter" numeric(4,2),
    "education_details" "jsonb",
    CONSTRAINT "census_data_median_age_check" CHECK ((("median_age" IS NULL) OR (("median_age" >= (0)::numeric) AND ("median_age" <= (120)::numeric)))),
    CONSTRAINT "check_households_positive" CHECK ((("households" IS NULL) OR ("households" >= 0))),
    CONSTRAINT "check_mean_income_positive" CHECK ((("mean_income" IS NULL) OR ("mean_income" >= (0)::numeric))),
    CONSTRAINT "check_median_income_positive" CHECK ((("median_income" IS NULL) OR ("median_income" >= (0)::numeric))),
    CONSTRAINT "check_population_positive" CHECK ((("population" IS NULL) OR ("population" >= 0))),
    CONSTRAINT "check_unemployment_rate_valid" CHECK ((("unemployment_rate" IS NULL) OR (("unemployment_rate" >= (0)::numeric) AND ("unemployment_rate" <= (100)::numeric)))),
    CONSTRAINT "check_year_valid" CHECK ((("year" >= 2010) AND ("year" <= 2030)))
);


ALTER TABLE "public"."census_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."census_data" IS 'Stores Census.gov demographic and economic data by place and year for caching API results';



COMMENT ON COLUMN "public"."census_data"."median_age" IS 'Median age of population from Census S0101 table';



COMMENT ON COLUMN "public"."census_data"."age_brackets" IS 'Age distribution by brackets (20-24, 25-29, etc.) as JSON from S0101 table';



COMMENT ON COLUMN "public"."census_data"."total_housing_units" IS 'Total housing units from DP04_0001E';



COMMENT ON COLUMN "public"."census_data"."owner_occupied_units" IS 'Owner-occupied units from DP04_0046E';



COMMENT ON COLUMN "public"."census_data"."renter_occupied_units" IS 'Renter-occupied units from DP04_0047E';



COMMENT ON COLUMN "public"."census_data"."median_rent" IS 'Median gross rent from DP04_0134E';



COMMENT ON COLUMN "public"."census_data"."avg_household_size_owner" IS 'Average household size for owner-occupied from DP04_0089E';



COMMENT ON COLUMN "public"."census_data"."avg_household_size_renter" IS 'Average household size for renter-occupied from DP04_0090E';



COMMENT ON COLUMN "public"."census_data"."education_details" IS 'Education statistics from S1501 table stored as JSONB';



CREATE TABLE IF NOT EXISTS "public"."expense_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "unit_id" "uuid",
    "transaction_date" "date" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "transaction_type" "text" DEFAULT 'actual'::"text" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurrence_frequency" "text",
    "recurrence_start_date" "date",
    "recurrence_end_date" "date",
    "parent_transaction_id" "uuid",
    "vendor_name" "text",
    "vendor_contact" "text",
    "notes" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expense_transactions_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "expense_transactions_category_check" CHECK (("category" = ANY (ARRAY['repairs_maintenance'::"text", 'property_taxes'::"text", 'insurance'::"text", 'utilities'::"text", 'property_management'::"text", 'hoa_fees'::"text", 'landscaping'::"text", 'pest_control'::"text", 'cleaning'::"text", 'legal_fees'::"text", 'accounting_fees'::"text", 'advertising'::"text", 'capital_expenditure'::"text", 'other_expense'::"text"]))),
    CONSTRAINT "expense_transactions_check" CHECK ((("is_recurring" = false) OR (("is_recurring" = true) AND ("recurrence_frequency" IS NOT NULL)))),
    CONSTRAINT "expense_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['actual'::"text", 'projected'::"text"])))
);


ALTER TABLE "public"."expense_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."income_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "unit_id" "uuid",
    "transaction_date" "date" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "transaction_type" "text" DEFAULT 'actual'::"text" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurrence_frequency" "text",
    "recurrence_start_date" "date",
    "recurrence_end_date" "date",
    "parent_transaction_id" "uuid",
    "notes" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "income_transactions_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "income_transactions_category_check" CHECK (("category" = ANY (ARRAY['rental_income'::"text", 'parking_income'::"text", 'storage_income'::"text", 'pet_fees'::"text", 'late_fees'::"text", 'utility_reimbursement'::"text", 'laundry_income'::"text", 'other_income'::"text"]))),
    CONSTRAINT "income_transactions_check" CHECK ((("is_recurring" = false) OR (("is_recurring" = true) AND ("recurrence_frequency" IS NOT NULL)))),
    CONSTRAINT "income_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['actual'::"text", 'projected'::"text"])))
);


ALTER TABLE "public"."income_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "geoid" "text" NOT NULL,
    "state_fips" "text" NOT NULL,
    "state_abbr" "text" NOT NULL,
    "placefp" "text" NOT NULL,
    "name" "text" NOT NULL,
    "namelsad" "text" NOT NULL,
    "basename_normalized" "text" NOT NULL,
    "datausa_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "invitation_token" "uuid" DEFAULT "gen_random_uuid"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "portfolio_invitations_role_check" CHECK (("role" = ANY (ARRAY['editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."portfolio_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "portfolio_memberships_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."portfolio_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "owner_id" "uuid" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_sample" boolean DEFAULT false
);


ALTER TABLE "public"."portfolios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "regrid_id" "text",
    "apn" "text",
    "address" "text" NOT NULL,
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "geometry" "jsonb",
    "lat" numeric(10,8),
    "lng" numeric(11,8),
    "year_built" integer,
    "owner" "text",
    "last_sale_price" numeric(12,2),
    "sale_date" "date",
    "county" "text",
    "qoz_status" "text",
    "improvement_value" numeric(12,2),
    "land_value" numeric(12,2),
    "assessed_value" numeric(12,2),
    "use_code" "text",
    "use_description" "text",
    "zoning" "text",
    "zoning_description" "text",
    "num_stories" integer,
    "num_units" integer,
    "num_rooms" integer,
    "subdivision" "text",
    "lot_size_acres" numeric(10,4),
    "lot_size_sqft" integer,
    "tax_year" "text",
    "parcel_value_type" "text",
    "census_tract" "text",
    "census_block" "text",
    "qoz_tract" "text",
    "last_refresh_date" "date",
    "regrid_updated_at" timestamp with time zone,
    "owner_mailing_address" "text",
    "owner_mail_city" "text",
    "owner_mail_state" "text",
    "owner_mail_zip" "text",
    "property_data" "jsonb",
    "user_notes" "text",
    "tags" "text"[],
    "insurance_provider" "text",
    "maintenance_history" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_sample" boolean DEFAULT false,
    "fts" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", ((((((COALESCE("address", ''::"text") || ' '::"text") || COALESCE("city", ''::"text")) || ' '::"text") || COALESCE("apn", ''::"text")) || ' '::"text") || COALESCE("owner", ''::"text")))) STORED,
    "purchase_price" numeric(12,2),
    "purchase_date" "date",
    "sale_price" numeric,
    "management_company" "text"
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


COMMENT ON COLUMN "public"."properties"."purchase_price" IS 'User-entered purchase price for the property. Used in financial modeling and may differ from last_sale_price.';



CREATE TABLE IF NOT EXISTS "public"."property_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "unit_id" "uuid",
    "income_transaction_id" "uuid",
    "expense_transaction_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size_bytes" bigint NOT NULL,
    "file_type" "text" NOT NULL,
    "storage_bucket" "text" DEFAULT 'property-documents'::"text" NOT NULL,
    "document_type" "text" NOT NULL,
    "document_category" "text",
    "title" "text",
    "description" "text",
    "tags" "text"[],
    "document_date" "date",
    "expiration_date" "date",
    "ocr_text" "text",
    "ai_extracted_data" "jsonb",
    "is_processed" boolean DEFAULT false,
    "processing_status" "text" DEFAULT 'pending'::"text",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "property_documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['invoice'::"text", 'receipt'::"text", 'work_order'::"text", 'insurance_policy'::"text", 'tax_document'::"text", 'lease_agreement'::"text", 'inspection_report'::"text", 'property_photo'::"text", 'floor_plan'::"text", 'other'::"text"]))),
    CONSTRAINT "property_documents_file_size_bytes_check" CHECK (("file_size_bytes" > 0)),
    CONSTRAINT "property_documents_processing_status_check" CHECK (("processing_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."property_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_financials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "potential_rental_income" "jsonb" DEFAULT '[]'::"jsonb",
    "other_income" "jsonb" DEFAULT '[]'::"jsonb",
    "vacancy_rates" "jsonb" DEFAULT '[]'::"jsonb",
    "rental_income_growth_rate" numeric(5,2),
    "default_vacancy_rate" numeric(5,2),
    "operating_expenses" "jsonb" DEFAULT '[]'::"jsonb",
    "operating_expense_type" "text",
    "property_taxes" "jsonb" DEFAULT '[]'::"jsonb",
    "insurance" "jsonb" DEFAULT '[]'::"jsonb",
    "maintenance" "jsonb" DEFAULT '[]'::"jsonb",
    "property_management" "jsonb" DEFAULT '[]'::"jsonb",
    "utilities" "jsonb" DEFAULT '[]'::"jsonb",
    "other_expenses" "jsonb" DEFAULT '[]'::"jsonb",
    "default_operating_expense_rate" numeric(5,2),
    "financing_type" "text",
    "loan_amount" numeric(15,2),
    "interest_rate" numeric(5,4),
    "loan_term_years" integer,
    "amortization_years" integer,
    "payments_per_year" integer DEFAULT 12,
    "loan_costs" numeric(15,2),
    "loan_cost_type" "text",
    "target_dscr" numeric(5,2),
    "target_ltv" numeric(5,2),
    "property_type" "text",
    "land_percentage" numeric(5,2),
    "improvements_percentage" numeric(5,2),
    "ordinary_income_tax_rate" numeric(5,4),
    "capital_gains_tax_rate" numeric(5,4),
    "depreciation_recapture_rate" numeric(5,4),
    "hold_period_years" integer,
    "disposition_price_type" "text",
    "disposition_price" numeric(15,2),
    "disposition_cap_rate" numeric(5,4),
    "cost_of_sale_type" "text",
    "cost_of_sale_amount" numeric(15,2),
    "cost_of_sale_percentage" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "property_financials_cost_of_sale_type_check" CHECK (("cost_of_sale_type" = ANY (ARRAY['percentage'::"text", 'dollar'::"text", ''::"text"]))),
    CONSTRAINT "property_financials_disposition_price_type_check" CHECK (("disposition_price_type" = ANY (ARRAY['dollar'::"text", 'caprate'::"text", ''::"text"]))),
    CONSTRAINT "property_financials_financing_type_check" CHECK (("financing_type" = ANY (ARRAY['dscr'::"text", 'ltv'::"text", 'cash'::"text", ''::"text"]))),
    CONSTRAINT "property_financials_loan_cost_type_check" CHECK (("loan_cost_type" = ANY (ARRAY['percentage'::"text", 'dollar'::"text", ''::"text"]))),
    CONSTRAINT "property_financials_operating_expense_type_check" CHECK (("operating_expense_type" = ANY (ARRAY['percentage'::"text", 'dollar'::"text", ''::"text"]))),
    CONSTRAINT "property_financials_property_type_check" CHECK (("property_type" = ANY (ARRAY['residential'::"text", 'commercial'::"text", 'industrial'::"text", ''::"text"])))
);


ALTER TABLE "public"."property_financials" OWNER TO "postgres";


COMMENT ON TABLE "public"."property_financials" IS 'Stores user-entered financial modeling data for individual properties';



COMMENT ON COLUMN "public"."property_financials"."potential_rental_income" IS 'Array of up to 30 years of rental income values';



COMMENT ON COLUMN "public"."property_financials"."operating_expenses" IS 'Array of up to 30 years of operating expense values';



COMMENT ON COLUMN "public"."property_financials"."financing_type" IS 'Financing method: dscr (debt service coverage ratio), ltv (loan to value), or cash';



CREATE OR REPLACE VIEW "public"."property_place_analysis" WITH ("security_invoker"='true') AS
 SELECT "prop"."id" AS "property_id",
    "prop"."address",
    "prop"."city",
    "prop"."state",
    "places"."geoid",
    "places"."datausa_code",
    "places"."basename_normalized" AS "matched_place_name",
        CASE
            WHEN ("places"."basename_normalized" = "lower"(TRIM(BOTH FROM "prop"."city"))) THEN 'exact'::"text"
            WHEN ("places"."basename_normalized" IS NOT NULL) THEN 'fuzzy'::"text"
            ELSE 'no_match'::"text"
        END AS "match_quality"
   FROM ("public"."properties" "prop"
     LEFT JOIN "public"."places" "places" ON ((("places"."basename_normalized" = "lower"(TRIM(BOTH FROM "prop"."city"))) AND ("places"."state_abbr" = "upper"(TRIM(BOTH FROM "prop"."state"))))))
  WHERE (("prop"."city" IS NOT NULL) AND ("prop"."state" IS NOT NULL));


ALTER VIEW "public"."property_place_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "unit_number" "text" NOT NULL,
    "unit_name" "text",
    "square_footage" numeric(10,2),
    "tenant_name" "text",
    "tenant_email" "text",
    "tenant_phone" "text",
    "lease_start_date" "date",
    "lease_end_date" "date",
    "monthly_rent" numeric(12,2),
    "security_deposit" numeric(12,2),
    "lease_terms" "text",
    "is_occupied" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "property_units_monthly_rent_check" CHECK ((("monthly_rent" >= (0)::numeric) OR ("monthly_rent" IS NULL))),
    CONSTRAINT "property_units_security_deposit_check" CHECK ((("security_deposit" >= (0)::numeric) OR ("security_deposit" IS NULL))),
    CONSTRAINT "property_units_square_footage_check" CHECK ((("square_footage" >= (0)::numeric) OR ("square_footage" IS NULL)))
);


ALTER TABLE "public"."property_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "state_fips" "text" NOT NULL,
    "abbr" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."states" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_accessible_portfolios" AS
 SELECT "id",
    "name",
    "description",
    "owner_id",
    "is_default",
    "is_sample",
    "created_at",
    "updated_at",
    "user_role"
   FROM "public"."get_user_accessible_portfolios"() "get_user_accessible_portfolios"("id", "name", "description", "owner_id", "is_default", "is_sample", "created_at", "updated_at", "user_role");


ALTER VIEW "public"."user_accessible_portfolios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_education_progress" (
    "user_id" "uuid" NOT NULL,
    "lesson_slug" "text" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_education_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "property_lookups_used" integer DEFAULT 0,
    "property_lookups_limit" integer DEFAULT 10,
    "reset_date" timestamp with time zone DEFAULT ("date_trunc"('month'::"text", "now"()) + '1 mon'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "join_date" timestamp with time zone NOT NULL,
    "total_lookups_lifetime" integer DEFAULT 0,
    CONSTRAINT "user_limits_tier_check" CHECK (("tier" = ANY (ARRAY['free'::"text", 'pro'::"text"])))
);


ALTER TABLE "public"."user_limits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."census_data"
    ADD CONSTRAINT "census_data_pkey" PRIMARY KEY ("geoid", "year");



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_geoid_key" UNIQUE ("geoid");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_invitations"
    ADD CONSTRAINT "portfolio_invitations_invitation_token_key" UNIQUE ("invitation_token");



ALTER TABLE ONLY "public"."portfolio_invitations"
    ADD CONSTRAINT "portfolio_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_memberships"
    ADD CONSTRAINT "portfolio_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_memberships"
    ADD CONSTRAINT "portfolio_memberships_portfolio_id_user_id_key" UNIQUE ("portfolio_id", "user_id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_file_path_key" UNIQUE ("file_path");



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_financials"
    ADD CONSTRAINT "property_financials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_financials"
    ADD CONSTRAINT "property_financials_property_id_portfolio_id_key" UNIQUE ("property_id", "portfolio_id");



ALTER TABLE ONLY "public"."property_units"
    ADD CONSTRAINT "property_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_units"
    ADD CONSTRAINT "property_units_property_id_unit_number_key" UNIQUE ("property_id", "unit_number");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_abbr_key" UNIQUE ("abbr");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_state_fips_key" UNIQUE ("state_fips");



ALTER TABLE ONLY "public"."user_education_progress"
    ADD CONSTRAINT "user_education_progress_pkey" PRIMARY KEY ("user_id", "lesson_slug");



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_census_data_geoid" ON "public"."census_data" USING "btree" ("geoid");



CREATE INDEX "idx_census_data_geoid_year" ON "public"."census_data" USING "btree" ("geoid", "year");



COMMENT ON INDEX "public"."idx_census_data_geoid_year" IS 'Performance index for census data lookups by place and year';



CREATE INDEX "idx_census_data_geoid_year_desc" ON "public"."census_data" USING "btree" ("geoid", "year" DESC);



CREATE INDEX "idx_census_data_updated_at" ON "public"."census_data" USING "btree" ("updated_at");



CREATE INDEX "idx_census_data_year" ON "public"."census_data" USING "btree" ("year");



CREATE INDEX "idx_census_data_year_geoid" ON "public"."census_data" USING "btree" ("year", "geoid");



CREATE INDEX "idx_expense_transactions_category" ON "public"."expense_transactions" USING "btree" ("category");



CREATE INDEX "idx_expense_transactions_date" ON "public"."expense_transactions" USING "btree" ("transaction_date");



CREATE INDEX "idx_expense_transactions_parent" ON "public"."expense_transactions" USING "btree" ("parent_transaction_id");



CREATE INDEX "idx_expense_transactions_portfolio_id" ON "public"."expense_transactions" USING "btree" ("portfolio_id");



CREATE INDEX "idx_expense_transactions_property_id" ON "public"."expense_transactions" USING "btree" ("property_id");



CREATE INDEX "idx_expense_transactions_recurring" ON "public"."expense_transactions" USING "btree" ("is_recurring");



CREATE INDEX "idx_expense_transactions_type" ON "public"."expense_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_expense_transactions_unit_id" ON "public"."expense_transactions" USING "btree" ("unit_id");



CREATE INDEX "idx_income_transactions_category" ON "public"."income_transactions" USING "btree" ("category");



CREATE INDEX "idx_income_transactions_date" ON "public"."income_transactions" USING "btree" ("transaction_date");



CREATE INDEX "idx_income_transactions_parent" ON "public"."income_transactions" USING "btree" ("parent_transaction_id");



CREATE INDEX "idx_income_transactions_portfolio_id" ON "public"."income_transactions" USING "btree" ("portfolio_id");



CREATE INDEX "idx_income_transactions_property_id" ON "public"."income_transactions" USING "btree" ("property_id");



CREATE INDEX "idx_income_transactions_recurring" ON "public"."income_transactions" USING "btree" ("is_recurring");



CREATE INDEX "idx_income_transactions_type" ON "public"."income_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_income_transactions_unit_id" ON "public"."income_transactions" USING "btree" ("unit_id");



CREATE INDEX "idx_places_basename_normalized" ON "public"."places" USING "btree" ("basename_normalized");



CREATE INDEX "idx_places_basename_state" ON "public"."places" USING "btree" ("basename_normalized", "state_abbr");



COMMENT ON INDEX "public"."idx_places_basename_state" IS 'Performance index for place lookups by normalized city name and state';



CREATE INDEX "idx_places_datausa_code" ON "public"."places" USING "btree" ("datausa_code");



CREATE INDEX "idx_places_geoid" ON "public"."places" USING "btree" ("geoid");



CREATE INDEX "idx_places_state_abbr" ON "public"."places" USING "btree" ("state_abbr");



CREATE INDEX "idx_places_state_city_match" ON "public"."places" USING "btree" ("state_abbr", "basename_normalized");



CREATE INDEX "idx_places_state_fips" ON "public"."places" USING "btree" ("state_fips");



CREATE INDEX "idx_portfolio_invitations_email" ON "public"."portfolio_invitations" USING "btree" ("email");



CREATE INDEX "idx_portfolio_invitations_expires" ON "public"."portfolio_invitations" USING "btree" ("expires_at") WHERE ("accepted_at" IS NULL);



CREATE INDEX "idx_portfolio_invitations_portfolio_id" ON "public"."portfolio_invitations" USING "btree" ("portfolio_id");



CREATE INDEX "idx_portfolio_invitations_token" ON "public"."portfolio_invitations" USING "btree" ("invitation_token");



CREATE UNIQUE INDEX "idx_portfolio_invitations_unique_pending" ON "public"."portfolio_invitations" USING "btree" ("portfolio_id", "email") WHERE ("accepted_at" IS NULL);



CREATE INDEX "idx_portfolio_memberships_accepted" ON "public"."portfolio_memberships" USING "btree" ("portfolio_id", "user_id") WHERE ("accepted_at" IS NOT NULL);



CREATE INDEX "idx_portfolio_memberships_portfolio_id" ON "public"."portfolio_memberships" USING "btree" ("portfolio_id");



CREATE INDEX "idx_portfolio_memberships_role" ON "public"."portfolio_memberships" USING "btree" ("portfolio_id", "role");



CREATE INDEX "idx_portfolio_memberships_user_id" ON "public"."portfolio_memberships" USING "btree" ("user_id");



CREATE INDEX "idx_portfolios_created_at" ON "public"."portfolios" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_portfolios_owner_id" ON "public"."portfolios" USING "btree" ("owner_id");



CREATE UNIQUE INDEX "idx_portfolios_single_default" ON "public"."portfolios" USING "btree" ("owner_id") WHERE ("is_default" = true);



CREATE UNIQUE INDEX "idx_portfolios_unique_default_per_user" ON "public"."portfolios" USING "btree" ("owner_id") WHERE ("is_default" = true);



CREATE INDEX "idx_properties_address" ON "public"."properties" USING "btree" ("address");



CREATE INDEX "idx_properties_apn" ON "public"."properties" USING "btree" ("apn");



CREATE INDEX "idx_properties_city_state" ON "public"."properties" USING "btree" ("city", "state");



CREATE INDEX "idx_properties_created_at" ON "public"."properties" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_properties_portfolio_id" ON "public"."properties" USING "btree" ("portfolio_id");



CREATE INDEX "idx_properties_user_id" ON "public"."properties" USING "btree" ("user_id");



CREATE INDEX "idx_property_documents_expense_tx" ON "public"."property_documents" USING "btree" ("expense_transaction_id");



CREATE INDEX "idx_property_documents_expiration" ON "public"."property_documents" USING "btree" ("expiration_date");



CREATE INDEX "idx_property_documents_file_path" ON "public"."property_documents" USING "btree" ("file_path");



CREATE INDEX "idx_property_documents_income_tx" ON "public"."property_documents" USING "btree" ("income_transaction_id");



CREATE INDEX "idx_property_documents_portfolio_id" ON "public"."property_documents" USING "btree" ("portfolio_id");



CREATE INDEX "idx_property_documents_property_id" ON "public"."property_documents" USING "btree" ("property_id");



CREATE INDEX "idx_property_documents_type" ON "public"."property_documents" USING "btree" ("document_type");



CREATE INDEX "idx_property_documents_unit_id" ON "public"."property_documents" USING "btree" ("unit_id");



CREATE INDEX "idx_property_financials_portfolio_id" ON "public"."property_financials" USING "btree" ("portfolio_id");



CREATE INDEX "idx_property_financials_property_id" ON "public"."property_financials" USING "btree" ("property_id");



CREATE INDEX "idx_property_financials_user_id" ON "public"."property_financials" USING "btree" ("user_id");



CREATE INDEX "idx_property_units_is_active" ON "public"."property_units" USING "btree" ("is_active");



CREATE INDEX "idx_property_units_lease_dates" ON "public"."property_units" USING "btree" ("lease_start_date", "lease_end_date");



CREATE INDEX "idx_property_units_portfolio_id" ON "public"."property_units" USING "btree" ("portfolio_id");



CREATE INDEX "idx_property_units_property_id" ON "public"."property_units" USING "btree" ("property_id");



CREATE INDEX "idx_states_abbr" ON "public"."states" USING "btree" ("abbr");



CREATE INDEX "idx_states_state_fips" ON "public"."states" USING "btree" ("state_fips");



CREATE INDEX "idx_user_education_progress_completed_at" ON "public"."user_education_progress" USING "btree" ("completed_at");



CREATE INDEX "idx_user_education_progress_lesson_slug" ON "public"."user_education_progress" USING "btree" ("lesson_slug");



CREATE INDEX "idx_user_education_progress_user_id" ON "public"."user_education_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_limits_join_date" ON "public"."user_limits" USING "btree" ("join_date");



CREATE INDEX "idx_user_limits_reset_date" ON "public"."user_limits" USING "btree" ("reset_date");



CREATE INDEX "idx_user_limits_tier" ON "public"."user_limits" USING "btree" ("tier");



CREATE INDEX "idx_user_limits_user_id" ON "public"."user_limits" USING "btree" ("user_id");



CREATE INDEX "properties_fts_idx" ON "public"."properties" USING "gin" ("fts");



CREATE OR REPLACE TRIGGER "create_owner_membership_trigger" AFTER INSERT ON "public"."portfolios" FOR EACH ROW EXECUTE FUNCTION "public"."create_portfolio_owner_membership"();



CREATE OR REPLACE TRIGGER "ensure_single_default_portfolio_insert_trigger" BEFORE INSERT ON "public"."portfolios" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_default_portfolio"();



CREATE OR REPLACE TRIGGER "ensure_single_default_portfolio_trigger" BEFORE UPDATE ON "public"."portfolios" FOR EACH ROW WHEN (("new"."is_default" IS DISTINCT FROM "old"."is_default")) EXECUTE FUNCTION "public"."ensure_single_default_portfolio"();



CREATE OR REPLACE TRIGGER "update_census_data_updated_at" BEFORE UPDATE ON "public"."census_data" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_expense_transactions_updated_at" BEFORE UPDATE ON "public"."expense_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_income_transactions_updated_at" BEFORE UPDATE ON "public"."income_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_places_updated_at" BEFORE UPDATE ON "public"."places" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_property_documents_updated_at" BEFORE UPDATE ON "public"."property_documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_property_financials_updated_at" BEFORE UPDATE ON "public"."property_financials" FOR EACH ROW EXECUTE FUNCTION "public"."update_property_financials_updated_at"();



CREATE OR REPLACE TRIGGER "update_property_units_updated_at" BEFORE UPDATE ON "public"."property_units" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_states_updated_at" BEFORE UPDATE ON "public"."states" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_parent_transaction_id_fkey" FOREIGN KEY ("parent_transaction_id") REFERENCES "public"."expense_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_transactions"
    ADD CONSTRAINT "expense_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."census_data"
    ADD CONSTRAINT "fk_census_data_geoid" FOREIGN KEY ("geoid") REFERENCES "public"."places"("geoid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "fk_places_state_fips" FOREIGN KEY ("state_fips") REFERENCES "public"."states"("state_fips") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_parent_transaction_id_fkey" FOREIGN KEY ("parent_transaction_id") REFERENCES "public"."income_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."income_transactions"
    ADD CONSTRAINT "income_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_invitations"
    ADD CONSTRAINT "portfolio_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_invitations"
    ADD CONSTRAINT "portfolio_invitations_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_memberships"
    ADD CONSTRAINT "portfolio_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."portfolio_memberships"
    ADD CONSTRAINT "portfolio_memberships_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_memberships"
    ADD CONSTRAINT "portfolio_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_expense_transaction_id_fkey" FOREIGN KEY ("expense_transaction_id") REFERENCES "public"."expense_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_income_transaction_id_fkey" FOREIGN KEY ("income_transaction_id") REFERENCES "public"."income_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_documents"
    ADD CONSTRAINT "property_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_financials"
    ADD CONSTRAINT "property_financials_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_financials"
    ADD CONSTRAINT "property_financials_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_financials"
    ADD CONSTRAINT "property_financials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_units"
    ADD CONSTRAINT "property_units_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_units"
    ADD CONSTRAINT "property_units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."property_units"
    ADD CONSTRAINT "property_units_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_education_progress"
    ADD CONSTRAINT "user_education_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anonymous users to insert census data" ON "public"."census_data" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anonymous users to read census data" ON "public"."census_data" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anonymous users to read places" ON "public"."places" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anonymous users to update census data" ON "public"."census_data" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert census data" ON "public"."census_data" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read census data" ON "public"."census_data" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read places" ON "public"."places" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read states" ON "public"."states" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update census data" ON "public"."census_data" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Only owners can delete documents" ON "public"."property_documents" FOR DELETE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = 'owner'::"text")))));



CREATE POLICY "Only owners can delete expense transactions" ON "public"."expense_transactions" FOR DELETE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = 'owner'::"text")))));



CREATE POLICY "Only owners can delete income transactions" ON "public"."income_transactions" FOR DELETE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = 'owner'::"text")))));



CREATE POLICY "Only owners can delete units" ON "public"."property_units" FOR DELETE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = 'owner'::"text")))));



CREATE POLICY "Owners and editors can create expense transactions" ON "public"."expense_transactions" FOR INSERT WITH CHECK (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can create income transactions" ON "public"."income_transactions" FOR INSERT WITH CHECK (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can create property financials" ON "public"."property_financials" FOR INSERT WITH CHECK ((("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("portfolio_memberships"."accepted_at" IS NOT NULL)))) OR ("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."owner_id" = "auth"."uid"())))));



COMMENT ON POLICY "Owners and editors can create property financials" ON "public"."property_financials" IS 'Allow portfolio owners and editors to create financial modeling data for properties';



CREATE POLICY "Owners and editors can create units" ON "public"."property_units" FOR INSERT WITH CHECK (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can delete property financials" ON "public"."property_financials" FOR DELETE USING ((("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("portfolio_memberships"."accepted_at" IS NOT NULL)))) OR ("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."owner_id" = "auth"."uid"())))));



COMMENT ON POLICY "Owners and editors can delete property financials" ON "public"."property_financials" IS 'Allow portfolio owners and editors to delete financial modeling data';



CREATE POLICY "Owners and editors can update documents" ON "public"."property_documents" FOR UPDATE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can update expense transactions" ON "public"."expense_transactions" FOR UPDATE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can update income transactions" ON "public"."income_transactions" FOR UPDATE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can update property financials" ON "public"."property_financials" FOR UPDATE USING ((("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("portfolio_memberships"."accepted_at" IS NOT NULL)))) OR ("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."owner_id" = "auth"."uid"())))));



COMMENT ON POLICY "Owners and editors can update property financials" ON "public"."property_financials" IS 'Allow portfolio owners and editors to update financial modeling data';



CREATE POLICY "Owners and editors can update units" ON "public"."property_units" FOR UPDATE USING (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Owners and editors can upload documents" ON "public"."property_documents" FOR INSERT WITH CHECK (("portfolio_id" IN ( SELECT "portfolio_memberships"."portfolio_id"
   FROM "public"."portfolio_memberships"
  WHERE (("portfolio_memberships"."user_id" = "auth"."uid"()) AND ("portfolio_memberships"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"]))))));



CREATE POLICY "Portfolio owners can create memberships" ON "public"."portfolio_memberships" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "portfolios"."owner_id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."id" = "portfolio_memberships"."portfolio_id"))));



CREATE POLICY "Portfolio owners can update memberships" ON "public"."portfolio_memberships" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "portfolios"."owner_id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."id" = "portfolio_memberships"."portfolio_id"))));



CREATE POLICY "Users can delete own education progress" ON "public"."user_education_progress" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete relevant memberships" ON "public"."portfolio_memberships" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "portfolios"."owner_id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."id" = "portfolio_memberships"."portfolio_id")))));



CREATE POLICY "Users can insert own education progress" ON "public"."user_education_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own limits" ON "public"."user_limits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own education progress" ON "public"."user_education_progress" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own limits" ON "public"."user_limits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view documents in accessible portfolios" ON "public"."property_documents" FOR SELECT USING (("property_id" IN ( SELECT "properties"."id"
   FROM "public"."properties"
  WHERE ("properties"."portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
           FROM "public"."user_accessible_portfolios")))));



CREATE POLICY "Users can view expense transactions in accessible portfolios" ON "public"."expense_transactions" FOR SELECT USING (("property_id" IN ( SELECT "properties"."id"
   FROM "public"."properties"
  WHERE ("properties"."portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
           FROM "public"."user_accessible_portfolios")))));



CREATE POLICY "Users can view income transactions in accessible portfolios" ON "public"."income_transactions" FOR SELECT USING (("property_id" IN ( SELECT "properties"."id"
   FROM "public"."properties"
  WHERE ("properties"."portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
           FROM "public"."user_accessible_portfolios")))));



CREATE POLICY "Users can view own education progress" ON "public"."user_education_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own limits" ON "public"."user_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view property financials in accessible portfolios" ON "public"."property_financials" FOR SELECT USING (("property_id" IN ( SELECT "properties"."id"
   FROM "public"."properties"
  WHERE ("properties"."portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
           FROM "public"."user_accessible_portfolios")))));



CREATE POLICY "Users can view relevant memberships" ON "public"."portfolio_memberships" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "portfolios"."owner_id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."id" = "portfolio_memberships"."portfolio_id")))));



CREATE POLICY "Users can view units in accessible portfolios" ON "public"."property_units" FOR SELECT USING (("property_id" IN ( SELECT "properties"."id"
   FROM "public"."properties"
  WHERE ("properties"."portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
           FROM "public"."user_accessible_portfolios")))));



CREATE POLICY "authenticated_users_create_invitations" ON "public"."portfolio_invitations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "block_client_census_deletes" ON "public"."census_data" FOR DELETE USING (false);



CREATE POLICY "block_client_census_updates" ON "public"."census_data" FOR UPDATE USING (false);



CREATE POLICY "block_client_census_writes" ON "public"."census_data" FOR INSERT WITH CHECK (false);



CREATE POLICY "block_client_places_deletes" ON "public"."places" FOR DELETE USING (false);



CREATE POLICY "block_client_places_updates" ON "public"."places" FOR UPDATE USING (false);



CREATE POLICY "block_client_places_writes" ON "public"."places" FOR INSERT WITH CHECK (false);



CREATE POLICY "block_client_states_deletes" ON "public"."states" FOR DELETE USING (false);



CREATE POLICY "block_client_states_updates" ON "public"."states" FOR UPDATE USING (false);



CREATE POLICY "block_client_states_writes" ON "public"."states" FOR INSERT WITH CHECK (false);



ALTER TABLE "public"."census_data" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "editors_can_delete_properties" ON "public"."properties" FOR DELETE USING (("portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
   FROM "public"."user_accessible_portfolios"
  WHERE ("user_accessible_portfolios"."user_role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])))));



CREATE POLICY "editors_can_insert_properties" ON "public"."properties" FOR INSERT WITH CHECK (("portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
   FROM "public"."user_accessible_portfolios"
  WHERE ("user_accessible_portfolios"."user_role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])))));



CREATE POLICY "editors_can_update_properties" ON "public"."properties" FOR UPDATE USING (("portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
   FROM "public"."user_accessible_portfolios"
  WHERE ("user_accessible_portfolios"."user_role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])))));



ALTER TABLE "public"."expense_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."income_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitees_view_own_invitations" ON "public"."portfolio_invitations" FOR SELECT USING (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "owners_can_delete_portfolios" ON "public"."portfolios" FOR DELETE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "owners_can_update_portfolios" ON "public"."portfolios" FOR UPDATE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "owners_delete_own_invitations" ON "public"."portfolio_invitations" FOR DELETE USING (("invited_by" = "auth"."uid"()));



CREATE POLICY "owners_update_own_invitations" ON "public"."portfolio_invitations" FOR UPDATE USING (("invited_by" = "auth"."uid"()));



CREATE POLICY "owners_view_sent_invitations" ON "public"."portfolio_invitations" FOR SELECT USING (("invited_by" = "auth"."uid"()));



ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portfolio_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portfolio_memberships" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "portfolio_owners_manage_invitations" ON "public"."portfolio_invitations" USING ((EXISTS ( SELECT 1
   FROM "public"."portfolios"
  WHERE (("portfolios"."id" = "portfolio_invitations"."portfolio_id") AND ("portfolios"."owner_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."portfolios"
  WHERE (("portfolios"."id" = "portfolio_invitations"."portfolio_id") AND ("portfolios"."owner_id" = "auth"."uid"())))));



ALTER TABLE "public"."portfolios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_financials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_units" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_census" ON "public"."census_data" FOR SELECT USING (true);



CREATE POLICY "public_read_places" ON "public"."places" FOR SELECT USING (true);



CREATE POLICY "public_read_states" ON "public"."states" FOR SELECT USING (true);



ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_education_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_accept_own_invitations" ON "public"."portfolio_invitations" FOR SELECT USING (((("auth"."jwt"() ->> 'email'::"text") = "email") AND ("accepted_at" IS NULL) AND ("expires_at" > "now"())));



CREATE POLICY "users_can_create_portfolios" ON "public"."portfolios" FOR INSERT WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "users_can_view_owned_portfolios" ON "public"."portfolios" FOR SELECT USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "users_can_view_shared_properties" ON "public"."properties" FOR SELECT USING (("portfolio_id" IN ( SELECT "user_accessible_portfolios"."id"
   FROM "public"."user_accessible_portfolios")));



CREATE POLICY "users_delete_own_progress" ON "public"."user_education_progress" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_insert_own_progress" ON "public"."user_education_progress" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users_update_own_progress" ON "public"."user_education_progress" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_view_own_progress" ON "public"."user_education_progress" FOR SELECT USING (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_next_reset_date"("join_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_next_reset_date"("join_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_next_reset_date"("join_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_user_reset_date"("user_join_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_user_reset_date"("user_join_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_user_reset_date"("user_join_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."can_user_edit_portfolio"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_edit_portfolio"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_edit_portfolio"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_increment_usage"("p_user_id" "uuid", "p_increment" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_increment_usage"("p_user_id" "uuid", "p_increment" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_increment_usage"("p_user_id" "uuid", "p_increment" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_usage_limits"("p_user_id" "uuid", "p_check_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_usage_limits"("p_user_id" "uuid", "p_check_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_usage_limits"("p_user_id" "uuid", "p_check_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_portfolio_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_portfolio_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_portfolio_for_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_owner_membership"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_owner_membership"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_owner_membership"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_portfolio_owner_membership"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_portfolio_owner_membership"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_portfolio_owner_membership"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_sample_portfolio_for_user"("p_user_id" "uuid", "p_user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_sample_portfolio_for_user"("p_user_id" "uuid", "p_user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_sample_portfolio_for_user"("p_user_id" "uuid", "p_user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_default_portfolio"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_portfolio"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_portfolio"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_census_data"("place_geoid" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_census_data"("place_geoid" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_census_data"("place_geoid" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_places_missing_census_data"("place_geoids" "text"[], "data_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_places_missing_census_data"("place_geoids" "text"[], "data_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_places_missing_census_data"("place_geoids" "text"[], "data_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_property_place_match"("property_city" "text", "property_state" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_property_place_match"("property_city" "text", "property_state" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_property_place_match"("property_city" "text", "property_state" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_accessible_portfolios"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_accessible_portfolios"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_accessible_portfolios"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_portfolio_role"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_portfolio_role"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_portfolio_role"("p_portfolio_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_census_data"("place_geoid" "text", "data_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."has_census_data"("place_geoid" "text", "data_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_census_data"("place_geoid" "text", "data_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_portfolio_properties"("p_user_id" "uuid", "p_portfolio_id" "uuid", "p_search" "text", "p_city" "text", "p_state" "text", "p_tags" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."search_portfolio_properties"("p_user_id" "uuid", "p_portfolio_id" "uuid", "p_search" "text", "p_city" "text", "p_state" "text", "p_tags" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_portfolio_properties"("p_user_id" "uuid", "p_portfolio_id" "uuid", "p_search" "text", "p_city" "text", "p_state" "text", "p_tags" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_properties_by_address"("search_term" "text", "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_property_financials_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_property_financials_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_property_financials_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_census_data"("place_geoid" "text", "data_year" integer, "p_median_income" numeric, "p_mean_income" numeric, "p_population" integer, "p_unemployment_rate" numeric, "p_households" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_census_data"("place_geoid" "text", "data_year" integer, "p_median_income" numeric, "p_mean_income" numeric, "p_population" integer, "p_unemployment_rate" numeric, "p_households" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_census_data"("place_geoid" "text", "data_year" integer, "p_median_income" numeric, "p_mean_income" numeric, "p_population" integer, "p_unemployment_rate" numeric, "p_households" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."census_data" TO "anon";
GRANT ALL ON TABLE "public"."census_data" TO "authenticated";
GRANT ALL ON TABLE "public"."census_data" TO "service_role";



GRANT ALL ON TABLE "public"."expense_transactions" TO "anon";
GRANT ALL ON TABLE "public"."expense_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."income_transactions" TO "anon";
GRANT ALL ON TABLE "public"."income_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."income_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT ALL ON TABLE "public"."places" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_invitations" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_memberships" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."portfolios" TO "anon";
GRANT ALL ON TABLE "public"."portfolios" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolios" TO "service_role";



GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



GRANT ALL ON TABLE "public"."property_documents" TO "anon";
GRANT ALL ON TABLE "public"."property_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."property_documents" TO "service_role";



GRANT ALL ON TABLE "public"."property_financials" TO "anon";
GRANT ALL ON TABLE "public"."property_financials" TO "authenticated";
GRANT ALL ON TABLE "public"."property_financials" TO "service_role";



GRANT ALL ON TABLE "public"."property_place_analysis" TO "anon";
GRANT ALL ON TABLE "public"."property_place_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."property_place_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."property_units" TO "anon";
GRANT ALL ON TABLE "public"."property_units" TO "authenticated";
GRANT ALL ON TABLE "public"."property_units" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";



GRANT ALL ON TABLE "public"."user_accessible_portfolios" TO "anon";
GRANT ALL ON TABLE "public"."user_accessible_portfolios" TO "authenticated";
GRANT ALL ON TABLE "public"."user_accessible_portfolios" TO "service_role";



GRANT ALL ON TABLE "public"."user_education_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_education_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_education_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_limits" TO "anon";
GRANT ALL ON TABLE "public"."user_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_limits" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

CREATE TRIGGER create_default_portfolio_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_default_portfolio_for_user();

CREATE TRIGGER create_user_limits_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_user_limits();


  create policy "Users can delete documents r9vqgw_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'property-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (properties.id)::text AS id
   FROM public.properties
  WHERE (properties.portfolio_id IN ( SELECT user_accessible_portfolios.id
           FROM public.user_accessible_portfolios
          WHERE (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text]))))))));



  create policy "Users can modify documents r9vqgw_0"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'property-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (properties.id)::text AS id
   FROM public.properties
  WHERE (properties.portfolio_id IN ( SELECT user_accessible_portfolios.id
           FROM public.user_accessible_portfolios
          WHERE (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text]))))))));



  create policy "Users can upload documents r9vqgw_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'property-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (properties.id)::text AS id
   FROM public.properties
  WHERE (properties.portfolio_id IN ( SELECT user_accessible_portfolios.id
           FROM public.user_accessible_portfolios
          WHERE (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text]))))))));



  create policy "Users can view property documents  r9vqgw_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'property-documents'::text) AND ((storage.foldername(name))[1] IN ( SELECT (properties.id)::text AS id
   FROM public.properties
  WHERE (properties.portfolio_id IN ( SELECT user_accessible_portfolios.id
           FROM public.user_accessible_portfolios))))));



