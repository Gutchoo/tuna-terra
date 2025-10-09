create table "public"."census_data" (
    "geoid" text not null,
    "year" integer not null,
    "median_income" numeric(12,2),
    "mean_income" numeric(12,2),
    "population" integer,
    "unemployment_rate" numeric(5,2),
    "households" integer,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "median_age" numeric,
    "age_brackets" jsonb,
    "total_housing_units" integer,
    "owner_occupied_units" integer,
    "renter_occupied_units" integer,
    "median_rent" numeric(8,2),
    "avg_household_size_owner" numeric(4,2),
    "avg_household_size_renter" numeric(4,2),
    "education_details" jsonb
);


alter table "public"."census_data" enable row level security;

create table "public"."places" (
    "id" uuid not null default gen_random_uuid(),
    "geoid" text not null,
    "state_fips" text not null,
    "state_abbr" text not null,
    "placefp" text not null,
    "name" text not null,
    "namelsad" text not null,
    "basename_normalized" text not null,
    "datausa_code" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."places" enable row level security;

create table "public"."portfolio_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "portfolio_id" uuid not null,
    "email" text not null,
    "role" text not null,
    "invited_by" uuid not null,
    "invitation_token" uuid default gen_random_uuid(),
    "expires_at" timestamp with time zone default (now() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."portfolio_invitations" enable row level security;

create table "public"."portfolio_memberships" (
    "id" uuid not null default gen_random_uuid(),
    "portfolio_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null,
    "invited_by" uuid,
    "invited_at" timestamp with time zone default now(),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."portfolio_memberships" enable row level security;

create table "public"."portfolios" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "owner_id" uuid not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_sample" boolean default false
);


alter table "public"."portfolios" enable row level security;

create table "public"."properties" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "portfolio_id" uuid not null,
    "regrid_id" text,
    "apn" text,
    "address" text not null,
    "city" text,
    "state" text,
    "zip_code" text,
    "geometry" jsonb,
    "lat" numeric(10,8),
    "lng" numeric(11,8),
    "year_built" integer,
    "owner" text,
    "last_sale_price" numeric(12,2),
    "sale_date" date,
    "county" text,
    "qoz_status" text,
    "improvement_value" numeric(12,2),
    "land_value" numeric(12,2),
    "assessed_value" numeric(12,2),
    "use_code" text,
    "use_description" text,
    "zoning" text,
    "zoning_description" text,
    "num_stories" integer,
    "num_units" integer,
    "num_rooms" integer,
    "subdivision" text,
    "lot_size_acres" numeric(10,4),
    "lot_size_sqft" integer,
    "tax_year" text,
    "parcel_value_type" text,
    "census_tract" text,
    "census_block" text,
    "qoz_tract" text,
    "last_refresh_date" date,
    "regrid_updated_at" timestamp with time zone,
    "owner_mailing_address" text,
    "owner_mail_city" text,
    "owner_mail_state" text,
    "owner_mail_zip" text,
    "property_data" jsonb,
    "user_notes" text,
    "tags" text[],
    "insurance_provider" text,
    "maintenance_history" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_sample" boolean default false,
    "fts" tsvector generated always as (to_tsvector('english'::regconfig, ((((((COALESCE(address, ''::text) || ' '::text) || COALESCE(city, ''::text)) || ' '::text) || COALESCE(apn, ''::text)) || ' '::text) || COALESCE(owner, ''::text)))) stored,
    "purchase_price" numeric(12,2)
);


alter table "public"."properties" enable row level security;

create table "public"."property_financials" (
    "id" uuid not null default gen_random_uuid(),
    "property_id" uuid not null,
    "portfolio_id" uuid not null,
    "user_id" uuid not null,
    "potential_rental_income" jsonb default '[]'::jsonb,
    "other_income" jsonb default '[]'::jsonb,
    "vacancy_rates" jsonb default '[]'::jsonb,
    "rental_income_growth_rate" numeric(5,2),
    "default_vacancy_rate" numeric(5,2),
    "operating_expenses" jsonb default '[]'::jsonb,
    "operating_expense_type" text,
    "property_taxes" jsonb default '[]'::jsonb,
    "insurance" jsonb default '[]'::jsonb,
    "maintenance" jsonb default '[]'::jsonb,
    "property_management" jsonb default '[]'::jsonb,
    "utilities" jsonb default '[]'::jsonb,
    "other_expenses" jsonb default '[]'::jsonb,
    "default_operating_expense_rate" numeric(5,2),
    "financing_type" text,
    "loan_amount" numeric(15,2),
    "interest_rate" numeric(5,4),
    "loan_term_years" integer,
    "amortization_years" integer,
    "payments_per_year" integer default 12,
    "loan_costs" numeric(15,2),
    "loan_cost_type" text,
    "target_dscr" numeric(5,2),
    "target_ltv" numeric(5,2),
    "property_type" text,
    "land_percentage" numeric(5,2),
    "improvements_percentage" numeric(5,2),
    "ordinary_income_tax_rate" numeric(5,4),
    "capital_gains_tax_rate" numeric(5,4),
    "depreciation_recapture_rate" numeric(5,4),
    "hold_period_years" integer,
    "disposition_price_type" text,
    "disposition_price" numeric(15,2),
    "disposition_cap_rate" numeric(5,4),
    "cost_of_sale_type" text,
    "cost_of_sale_amount" numeric(15,2),
    "cost_of_sale_percentage" numeric(5,2),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."property_financials" enable row level security;

create table "public"."states" (
    "id" uuid not null default gen_random_uuid(),
    "state_fips" text not null,
    "abbr" text not null,
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."states" enable row level security;

create table "public"."user_education_progress" (
    "user_id" uuid not null,
    "lesson_slug" text not null,
    "completed_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_education_progress" enable row level security;

create table "public"."user_limits" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "tier" text not null default 'free'::text,
    "property_lookups_used" integer default 0,
    "property_lookups_limit" integer default 10,
    "reset_date" timestamp with time zone default (date_trunc('month'::text, now()) + '1 mon'::interval),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "join_date" timestamp with time zone not null,
    "total_lookups_lifetime" integer default 0
);


alter table "public"."user_limits" enable row level security;

CREATE UNIQUE INDEX census_data_pkey ON public.census_data USING btree (geoid, year);

CREATE INDEX idx_census_data_geoid ON public.census_data USING btree (geoid);

CREATE INDEX idx_census_data_geoid_year ON public.census_data USING btree (geoid, year);

CREATE INDEX idx_census_data_geoid_year_desc ON public.census_data USING btree (geoid, year DESC);

CREATE INDEX idx_census_data_updated_at ON public.census_data USING btree (updated_at);

CREATE INDEX idx_census_data_year ON public.census_data USING btree (year);

CREATE INDEX idx_census_data_year_geoid ON public.census_data USING btree (year, geoid);

CREATE INDEX idx_places_basename_normalized ON public.places USING btree (basename_normalized);

CREATE INDEX idx_places_basename_state ON public.places USING btree (basename_normalized, state_abbr);

CREATE INDEX idx_places_datausa_code ON public.places USING btree (datausa_code);

CREATE INDEX idx_places_geoid ON public.places USING btree (geoid);

CREATE INDEX idx_places_state_abbr ON public.places USING btree (state_abbr);

CREATE INDEX idx_places_state_city_match ON public.places USING btree (state_abbr, basename_normalized);

CREATE INDEX idx_places_state_fips ON public.places USING btree (state_fips);

CREATE INDEX idx_portfolio_invitations_email ON public.portfolio_invitations USING btree (email);

CREATE INDEX idx_portfolio_invitations_expires ON public.portfolio_invitations USING btree (expires_at) WHERE (accepted_at IS NULL);

CREATE INDEX idx_portfolio_invitations_portfolio_id ON public.portfolio_invitations USING btree (portfolio_id);

CREATE INDEX idx_portfolio_invitations_token ON public.portfolio_invitations USING btree (invitation_token);

CREATE UNIQUE INDEX idx_portfolio_invitations_unique_pending ON public.portfolio_invitations USING btree (portfolio_id, email) WHERE (accepted_at IS NULL);

CREATE INDEX idx_portfolio_memberships_accepted ON public.portfolio_memberships USING btree (portfolio_id, user_id) WHERE (accepted_at IS NOT NULL);

CREATE INDEX idx_portfolio_memberships_portfolio_id ON public.portfolio_memberships USING btree (portfolio_id);

CREATE INDEX idx_portfolio_memberships_role ON public.portfolio_memberships USING btree (portfolio_id, role);

CREATE INDEX idx_portfolio_memberships_user_id ON public.portfolio_memberships USING btree (user_id);

CREATE INDEX idx_portfolios_created_at ON public.portfolios USING btree (created_at DESC);

CREATE INDEX idx_portfolios_owner_id ON public.portfolios USING btree (owner_id);

CREATE UNIQUE INDEX idx_portfolios_single_default ON public.portfolios USING btree (owner_id) WHERE (is_default = true);

CREATE UNIQUE INDEX idx_portfolios_unique_default_per_user ON public.portfolios USING btree (owner_id) WHERE (is_default = true);

CREATE INDEX idx_properties_address ON public.properties USING btree (address);

CREATE INDEX idx_properties_apn ON public.properties USING btree (apn);

CREATE INDEX idx_properties_city_state ON public.properties USING btree (city, state);

CREATE INDEX idx_properties_created_at ON public.properties USING btree (created_at DESC);

CREATE INDEX idx_properties_portfolio_id ON public.properties USING btree (portfolio_id);

CREATE INDEX idx_properties_user_id ON public.properties USING btree (user_id);

CREATE INDEX idx_property_financials_portfolio_id ON public.property_financials USING btree (portfolio_id);

CREATE INDEX idx_property_financials_property_id ON public.property_financials USING btree (property_id);

CREATE INDEX idx_property_financials_user_id ON public.property_financials USING btree (user_id);

CREATE INDEX idx_states_abbr ON public.states USING btree (abbr);

CREATE INDEX idx_states_state_fips ON public.states USING btree (state_fips);

CREATE INDEX idx_user_education_progress_completed_at ON public.user_education_progress USING btree (completed_at);

CREATE INDEX idx_user_education_progress_lesson_slug ON public.user_education_progress USING btree (lesson_slug);

CREATE INDEX idx_user_education_progress_user_id ON public.user_education_progress USING btree (user_id);

CREATE INDEX idx_user_limits_join_date ON public.user_limits USING btree (join_date);

CREATE INDEX idx_user_limits_reset_date ON public.user_limits USING btree (reset_date);

CREATE INDEX idx_user_limits_tier ON public.user_limits USING btree (tier);

CREATE INDEX idx_user_limits_user_id ON public.user_limits USING btree (user_id);

CREATE UNIQUE INDEX places_geoid_key ON public.places USING btree (geoid);

CREATE UNIQUE INDEX places_pkey ON public.places USING btree (id);

CREATE UNIQUE INDEX portfolio_invitations_invitation_token_key ON public.portfolio_invitations USING btree (invitation_token);

CREATE UNIQUE INDEX portfolio_invitations_pkey ON public.portfolio_invitations USING btree (id);

CREATE UNIQUE INDEX portfolio_memberships_pkey ON public.portfolio_memberships USING btree (id);

CREATE UNIQUE INDEX portfolio_memberships_portfolio_id_user_id_key ON public.portfolio_memberships USING btree (portfolio_id, user_id);

CREATE UNIQUE INDEX portfolios_pkey ON public.portfolios USING btree (id);

CREATE INDEX properties_fts_idx ON public.properties USING gin (fts);

CREATE UNIQUE INDEX properties_pkey ON public.properties USING btree (id);

CREATE UNIQUE INDEX property_financials_pkey ON public.property_financials USING btree (id);

CREATE UNIQUE INDEX property_financials_property_id_portfolio_id_key ON public.property_financials USING btree (property_id, portfolio_id);

CREATE UNIQUE INDEX states_abbr_key ON public.states USING btree (abbr);

CREATE UNIQUE INDEX states_pkey ON public.states USING btree (id);

CREATE UNIQUE INDEX states_state_fips_key ON public.states USING btree (state_fips);

CREATE UNIQUE INDEX user_education_progress_pkey ON public.user_education_progress USING btree (user_id, lesson_slug);

CREATE UNIQUE INDEX user_limits_pkey ON public.user_limits USING btree (id);

CREATE UNIQUE INDEX user_limits_user_id_key ON public.user_limits USING btree (user_id);

alter table "public"."census_data" add constraint "census_data_pkey" PRIMARY KEY using index "census_data_pkey";

alter table "public"."places" add constraint "places_pkey" PRIMARY KEY using index "places_pkey";

alter table "public"."portfolio_invitations" add constraint "portfolio_invitations_pkey" PRIMARY KEY using index "portfolio_invitations_pkey";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_pkey" PRIMARY KEY using index "portfolio_memberships_pkey";

alter table "public"."portfolios" add constraint "portfolios_pkey" PRIMARY KEY using index "portfolios_pkey";

alter table "public"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "public"."property_financials" add constraint "property_financials_pkey" PRIMARY KEY using index "property_financials_pkey";

alter table "public"."states" add constraint "states_pkey" PRIMARY KEY using index "states_pkey";

alter table "public"."user_education_progress" add constraint "user_education_progress_pkey" PRIMARY KEY using index "user_education_progress_pkey";

alter table "public"."user_limits" add constraint "user_limits_pkey" PRIMARY KEY using index "user_limits_pkey";

alter table "public"."census_data" add constraint "census_data_median_age_check" CHECK (((median_age IS NULL) OR ((median_age >= (0)::numeric) AND (median_age <= (120)::numeric)))) not valid;

alter table "public"."census_data" validate constraint "census_data_median_age_check";

alter table "public"."census_data" add constraint "check_households_positive" CHECK (((households IS NULL) OR (households >= 0))) not valid;

alter table "public"."census_data" validate constraint "check_households_positive";

alter table "public"."census_data" add constraint "check_mean_income_positive" CHECK (((mean_income IS NULL) OR (mean_income >= (0)::numeric))) not valid;

alter table "public"."census_data" validate constraint "check_mean_income_positive";

alter table "public"."census_data" add constraint "check_median_income_positive" CHECK (((median_income IS NULL) OR (median_income >= (0)::numeric))) not valid;

alter table "public"."census_data" validate constraint "check_median_income_positive";

alter table "public"."census_data" add constraint "check_population_positive" CHECK (((population IS NULL) OR (population >= 0))) not valid;

alter table "public"."census_data" validate constraint "check_population_positive";

alter table "public"."census_data" add constraint "check_unemployment_rate_valid" CHECK (((unemployment_rate IS NULL) OR ((unemployment_rate >= (0)::numeric) AND (unemployment_rate <= (100)::numeric)))) not valid;

alter table "public"."census_data" validate constraint "check_unemployment_rate_valid";

alter table "public"."census_data" add constraint "check_year_valid" CHECK (((year >= 2010) AND (year <= 2030))) not valid;

alter table "public"."census_data" validate constraint "check_year_valid";

alter table "public"."census_data" add constraint "fk_census_data_geoid" FOREIGN KEY (geoid) REFERENCES places(geoid) ON DELETE CASCADE not valid;

alter table "public"."census_data" validate constraint "fk_census_data_geoid";

alter table "public"."places" add constraint "fk_places_state_fips" FOREIGN KEY (state_fips) REFERENCES states(state_fips) ON DELETE RESTRICT not valid;

alter table "public"."places" validate constraint "fk_places_state_fips";

alter table "public"."places" add constraint "places_geoid_key" UNIQUE using index "places_geoid_key";

alter table "public"."portfolio_invitations" add constraint "portfolio_invitations_invitation_token_key" UNIQUE using index "portfolio_invitations_invitation_token_key";

alter table "public"."portfolio_invitations" add constraint "portfolio_invitations_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_invitations" validate constraint "portfolio_invitations_invited_by_fkey";

alter table "public"."portfolio_invitations" add constraint "portfolio_invitations_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_invitations" validate constraint "portfolio_invitations_portfolio_id_fkey";

alter table "public"."portfolio_invitations" add constraint "portfolio_invitations_role_check" CHECK ((role = ANY (ARRAY['editor'::text, 'viewer'::text]))) not valid;

alter table "public"."portfolio_invitations" validate constraint "portfolio_invitations_role_check";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."portfolio_memberships" validate constraint "portfolio_memberships_invited_by_fkey";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_memberships" validate constraint "portfolio_memberships_portfolio_id_fkey";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_portfolio_id_user_id_key" UNIQUE using index "portfolio_memberships_portfolio_id_user_id_key";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text]))) not valid;

alter table "public"."portfolio_memberships" validate constraint "portfolio_memberships_role_check";

alter table "public"."portfolio_memberships" add constraint "portfolio_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_memberships" validate constraint "portfolio_memberships_user_id_fkey";

alter table "public"."portfolios" add constraint "portfolios_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolios" validate constraint "portfolios_owner_id_fkey";

alter table "public"."properties" add constraint "properties_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_portfolio_id_fkey";

alter table "public"."properties" add constraint "properties_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_user_id_fkey";

alter table "public"."property_financials" add constraint "property_financials_cost_of_sale_type_check" CHECK ((cost_of_sale_type = ANY (ARRAY['percentage'::text, 'dollar'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_cost_of_sale_type_check";

alter table "public"."property_financials" add constraint "property_financials_disposition_price_type_check" CHECK ((disposition_price_type = ANY (ARRAY['dollar'::text, 'caprate'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_disposition_price_type_check";

alter table "public"."property_financials" add constraint "property_financials_financing_type_check" CHECK ((financing_type = ANY (ARRAY['dscr'::text, 'ltv'::text, 'cash'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_financing_type_check";

alter table "public"."property_financials" add constraint "property_financials_loan_cost_type_check" CHECK ((loan_cost_type = ANY (ARRAY['percentage'::text, 'dollar'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_loan_cost_type_check";

alter table "public"."property_financials" add constraint "property_financials_operating_expense_type_check" CHECK ((operating_expense_type = ANY (ARRAY['percentage'::text, 'dollar'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_operating_expense_type_check";

alter table "public"."property_financials" add constraint "property_financials_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."property_financials" validate constraint "property_financials_portfolio_id_fkey";

alter table "public"."property_financials" add constraint "property_financials_property_id_fkey" FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE not valid;

alter table "public"."property_financials" validate constraint "property_financials_property_id_fkey";

alter table "public"."property_financials" add constraint "property_financials_property_id_portfolio_id_key" UNIQUE using index "property_financials_property_id_portfolio_id_key";

alter table "public"."property_financials" add constraint "property_financials_property_type_check" CHECK ((property_type = ANY (ARRAY['residential'::text, 'commercial'::text, 'industrial'::text, ''::text]))) not valid;

alter table "public"."property_financials" validate constraint "property_financials_property_type_check";

alter table "public"."property_financials" add constraint "property_financials_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."property_financials" validate constraint "property_financials_user_id_fkey";

alter table "public"."states" add constraint "states_abbr_key" UNIQUE using index "states_abbr_key";

alter table "public"."states" add constraint "states_state_fips_key" UNIQUE using index "states_state_fips_key";

alter table "public"."user_education_progress" add constraint "user_education_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_education_progress" validate constraint "user_education_progress_user_id_fkey";

alter table "public"."user_limits" add constraint "user_limits_tier_check" CHECK ((tier = ANY (ARRAY['free'::text, 'pro'::text]))) not valid;

alter table "public"."user_limits" validate constraint "user_limits_tier_check";

alter table "public"."user_limits" add constraint "user_limits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_limits" validate constraint "user_limits_user_id_fkey";

alter table "public"."user_limits" add constraint "user_limits_user_id_key" UNIQUE using index "user_limits_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_next_reset_date(join_date timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  current_month_reset TIMESTAMP WITH TIME ZONE;
  next_month_reset TIMESTAMP WITH TIME ZONE;
  join_day INTEGER;
  current_day INTEGER;
BEGIN
  -- Get the day of month the user joined (1-31)
  join_day := EXTRACT(DAY FROM join_date);
  current_day := EXTRACT(DAY FROM NOW());
  
  -- Calculate reset date for current month
  current_month_reset := DATE_TRUNC('month', NOW()) + INTERVAL '1 day' * (join_day - 1);
  
  -- Handle edge case: if join day doesn't exist in current month (e.g., joined Jan 31, Feb only has 28/29)
  -- Use the last day of the month instead
  IF EXTRACT(DAY FROM current_month_reset) != join_day THEN
    current_month_reset := DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day';
  END IF;
  
  -- If we haven't passed the reset day this month, use current month
  -- Otherwise, calculate next month
  IF current_day < join_day THEN
    RETURN current_month_reset;
  ELSE
    next_month_reset := DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '1 day' * (join_day - 1);
    
    -- Handle edge case for next month too
    IF EXTRACT(DAY FROM next_month_reset) != join_day THEN
      next_month_reset := DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 day';
    END IF;
    
    RETURN next_month_reset;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_user_reset_date(user_join_date timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.can_user_edit_portfolio(p_portfolio_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN get_user_portfolio_role(p_portfolio_id, p_user_id) IN ('owner', 'editor');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid, p_increment integer DEFAULT 1)
 RETURNS TABLE(can_proceed boolean, current_usage integer, usage_limit integer, total_lifetime integer, tier text, reset_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
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
  
  -- Calculate new usage and lifetime totals
  new_usage := user_record.property_lookups_used + p_increment;
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
      TRUE,
      new_usage,
      user_record.property_lookups_limit,
      new_lifetime,
      user_record.tier,
      user_record.reset_date;
    RETURN;
  END IF;
  
  -- Check if new usage would exceed limit for free tier
  IF new_usage > user_record.property_lookups_limit THEN
    -- Return current state without incrementing
    RETURN QUERY SELECT 
      FALSE,
      user_record.property_lookups_used,
      user_record.property_lookups_limit,
      COALESCE(user_record.total_lookups_lifetime, 0),
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
    TRUE,
    new_usage,
    user_record.property_lookups_limit,
    new_lifetime,
    user_record.tier,
    user_record.reset_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_usage_limits(p_user_id uuid, p_check_count integer DEFAULT 1)
 RETURNS TABLE(can_proceed boolean, current_usage integer, usage_limit integer, total_lifetime integer, tier text, reset_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
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
      (p_check_count <= 10),
      0,
      10,
      0,
      'free'::TEXT,
      (DATE_TRUNC('day', NOW()) + INTERVAL '1 month')::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Calculate proper reset date based on join_date
  calculated_reset_date := calculate_user_reset_date(user_record.join_date);
  
  -- Check if monthly reset is needed (simulation for read-only)
  IF user_record.reset_date <= NOW() THEN
    effective_usage := 0;
  ELSE
    effective_usage := user_record.property_lookups_used;
  END IF;
  
  -- Pro users have unlimited access
  IF user_record.tier = 'pro' THEN
    RETURN QUERY SELECT 
      TRUE,
      effective_usage,
      user_record.property_lookups_limit,
      COALESCE(user_record.total_lookups_lifetime, 0),
      user_record.tier,
      calculated_reset_date;
    RETURN;
  END IF;
  
  -- Check if proposed usage would exceed limit
  RETURN QUERY SELECT 
    (effective_usage + p_check_count <= user_record.property_lookups_limit),
    effective_usage,
    user_record.property_lookups_limit,
    COALESCE(user_record.total_lookups_lifetime, 0),
    user_record.tier,
    calculated_reset_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_default_portfolio_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_owner_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO portfolio_memberships (portfolio_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_portfolio_owner_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.portfolio_memberships (portfolio_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Failed to create owner membership for portfolio % user %: %', NEW.id, NEW.owner_id, SQLERRM;
  -- Re-raise the exception to prevent portfolio creation if membership can't be created
  RAISE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_sample_portfolio_for_user(p_user_id uuid, p_user_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit, total_lookups_lifetime, join_date)
  VALUES (NEW.id, 'free', 0, 10, 0, NOW());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_single_default_portfolio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- If we're setting is_default to true
  IF NEW.is_default = true AND (OLD.is_default IS NULL OR OLD.is_default = false) THEN
    -- Unset is_default for all other portfolios by this user
    UPDATE portfolios
    SET is_default = false
    WHERE owner_id = NEW.owner_id
      AND id != NEW.id
      AND is_default = true;

    RAISE LOG 'Set portfolio % as default for user %, unset others', NEW.id, NEW.owner_id;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_latest_census_data(place_geoid text)
 RETURNS TABLE(geoid text, year integer, median_income numeric, mean_income numeric, population integer, unemployment_rate numeric, households integer, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN QUERY
    SELECT c.geoid, c.year, c.median_income, c.mean_income, 
           c.population, c.unemployment_rate, c.households, c.updated_at
    FROM public.census_data c
    WHERE c.geoid = place_geoid
    ORDER BY c.year DESC, c.updated_at DESC
    LIMIT 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_places_missing_census_data(place_geoids text[], data_year integer)
 RETURNS TABLE(geoid text, name text, state_abbr text)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_property_place_match(property_city text, property_state text)
 RETURNS TABLE(place_id uuid, geoid text, datausa_code text, normalized_name text, match_confidence text)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_portfolio_role(p_portfolio_id uuid, p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.has_census_data(place_geoid text, data_year integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.census_data 
        WHERE geoid = place_geoid AND year = data_year
    );
END;
$function$
;

create or replace view "public"."property_place_analysis" as  SELECT prop.id AS property_id,
    prop.address,
    prop.city,
    prop.state,
    places.geoid,
    places.datausa_code,
    places.basename_normalized AS matched_place_name,
        CASE
            WHEN (places.basename_normalized = lower(TRIM(BOTH FROM prop.city))) THEN 'exact'::text
            WHEN (places.basename_normalized IS NOT NULL) THEN 'fuzzy'::text
            ELSE 'no_match'::text
        END AS match_quality
   FROM (properties prop
     LEFT JOIN places places ON (((places.basename_normalized = lower(TRIM(BOTH FROM prop.city))) AND (places.state_abbr = upper(TRIM(BOTH FROM prop.state))))))
  WHERE ((prop.city IS NOT NULL) AND (prop.state IS NOT NULL));


CREATE OR REPLACE FUNCTION public.reset_monthly_limits()
 RETURNS TABLE(users_reset integer, users_processed integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
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
      AND property_lookups_used > 0  -- Only reset if they have usage to reset
    RETURNING user_id
  )
  SELECT COUNT(*) INTO reset_count FROM reset_users;
  
  -- Count total free users processed
  SELECT COUNT(*) INTO total_count 
  FROM user_limits 
  WHERE tier = 'free';
  
  RETURN QUERY SELECT reset_count, total_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_portfolio_properties(p_user_id uuid, p_portfolio_id uuid DEFAULT NULL::uuid, p_search text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[])
 RETURNS TABLE(id uuid, address text, city text, state text, apn text, owner text, portfolio_id uuid, portfolio_name text, user_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.search_properties_by_address(search_term text, user_id_param text)
 RETURNS TABLE(id uuid, address text, city text, state text, zip_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.search_properties_by_address(search_term text, user_id_param uuid)
 RETURNS TABLE(id uuid, address text, city text, state text, zip_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_property_financials_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_census_data(place_geoid text, data_year integer, p_median_income numeric DEFAULT NULL::numeric, p_mean_income numeric DEFAULT NULL::numeric, p_population integer DEFAULT NULL::integer, p_unemployment_rate numeric DEFAULT NULL::numeric, p_households integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
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
$function$
;

create or replace view "public"."user_accessible_portfolios" as  SELECT DISTINCT p.id,
    p.name,
    p.description,
    p.owner_id,
    p.is_default,
    p.is_sample,
    p.created_at,
    p.updated_at,
        CASE
            WHEN (p.owner_id = auth.uid()) THEN 'owner'::text
            ELSE pm.role
        END AS user_role
   FROM (portfolios p
     LEFT JOIN portfolio_memberships pm ON (((pm.portfolio_id = p.id) AND (pm.user_id = auth.uid()) AND (pm.accepted_at IS NOT NULL))))
  WHERE ((p.owner_id = auth.uid()) OR ((pm.user_id = auth.uid()) AND (pm.accepted_at IS NOT NULL)));


create policy "Allow anonymous users to insert census data"
on "public"."census_data"
as permissive
for insert
to anon
with check (true);


create policy "Allow anonymous users to read census data"
on "public"."census_data"
as permissive
for select
to anon
using (true);


create policy "Allow anonymous users to update census data"
on "public"."census_data"
as permissive
for update
to anon
using (true)
with check (true);


create policy "Allow authenticated users to insert census data"
on "public"."census_data"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow authenticated users to read census data"
on "public"."census_data"
as permissive
for select
to authenticated
using (true);


create policy "Allow authenticated users to update census data"
on "public"."census_data"
as permissive
for update
to authenticated
using (true);


create policy "block_client_census_deletes"
on "public"."census_data"
as permissive
for delete
to public
using (false);


create policy "block_client_census_updates"
on "public"."census_data"
as permissive
for update
to public
using (false);


create policy "block_client_census_writes"
on "public"."census_data"
as permissive
for insert
to public
with check (false);


create policy "public_read_census"
on "public"."census_data"
as permissive
for select
to public
using (true);


create policy "Allow anonymous users to read places"
on "public"."places"
as permissive
for select
to anon
using (true);


create policy "Allow authenticated users to read places"
on "public"."places"
as permissive
for select
to authenticated
using (true);


create policy "block_client_places_deletes"
on "public"."places"
as permissive
for delete
to public
using (false);


create policy "block_client_places_updates"
on "public"."places"
as permissive
for update
to public
using (false);


create policy "block_client_places_writes"
on "public"."places"
as permissive
for insert
to public
with check (false);


create policy "public_read_places"
on "public"."places"
as permissive
for select
to public
using (true);


create policy "authenticated_users_create_invitations"
on "public"."portfolio_invitations"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "invitees_view_own_invitations"
on "public"."portfolio_invitations"
as permissive
for select
to public
using ((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text));


create policy "owners_delete_own_invitations"
on "public"."portfolio_invitations"
as permissive
for delete
to public
using ((invited_by = auth.uid()));


create policy "owners_update_own_invitations"
on "public"."portfolio_invitations"
as permissive
for update
to public
using ((invited_by = auth.uid()));


create policy "owners_view_sent_invitations"
on "public"."portfolio_invitations"
as permissive
for select
to public
using ((invited_by = auth.uid()));


create policy "portfolio_owners_manage_invitations"
on "public"."portfolio_invitations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM portfolios
  WHERE ((portfolios.id = portfolio_invitations.portfolio_id) AND (portfolios.owner_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM portfolios
  WHERE ((portfolios.id = portfolio_invitations.portfolio_id) AND (portfolios.owner_id = auth.uid())))));


create policy "users_accept_own_invitations"
on "public"."portfolio_invitations"
as permissive
for select
to public
using ((((auth.jwt() ->> 'email'::text) = email) AND (accepted_at IS NULL) AND (expires_at > now())));


create policy "Portfolio owners can create memberships"
on "public"."portfolio_memberships"
as permissive
for insert
to public
with check ((auth.uid() IN ( SELECT portfolios.owner_id
   FROM portfolios
  WHERE (portfolios.id = portfolio_memberships.portfolio_id))));


create policy "Portfolio owners can update memberships"
on "public"."portfolio_memberships"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT portfolios.owner_id
   FROM portfolios
  WHERE (portfolios.id = portfolio_memberships.portfolio_id))));


create policy "Users can delete relevant memberships"
on "public"."portfolio_memberships"
as permissive
for delete
to public
using (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT portfolios.owner_id
   FROM portfolios
  WHERE (portfolios.id = portfolio_memberships.portfolio_id)))));


create policy "Users can view relevant memberships"
on "public"."portfolio_memberships"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT portfolios.owner_id
   FROM portfolios
  WHERE (portfolios.id = portfolio_memberships.portfolio_id)))));


create policy "owners_can_delete_portfolios"
on "public"."portfolios"
as permissive
for delete
to public
using ((owner_id = auth.uid()));


create policy "owners_can_update_portfolios"
on "public"."portfolios"
as permissive
for update
to public
using ((owner_id = auth.uid()));


create policy "users_can_create_portfolios"
on "public"."portfolios"
as permissive
for insert
to public
with check ((owner_id = auth.uid()));


create policy "users_can_view_owned_portfolios"
on "public"."portfolios"
as permissive
for select
to public
using ((owner_id = auth.uid()));


create policy "editors_can_delete_properties"
on "public"."properties"
as permissive
for delete
to public
using ((portfolio_id IN ( SELECT user_accessible_portfolios.id
   FROM user_accessible_portfolios
  WHERE ((user_accessible_portfolios.id = properties.portfolio_id) AND (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text]))))));


create policy "editors_can_insert_properties"
on "public"."properties"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (portfolio_id IN ( SELECT user_accessible_portfolios.id
   FROM user_accessible_portfolios
  WHERE ((user_accessible_portfolios.id = properties.portfolio_id) AND (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text])))))));


create policy "editors_can_update_properties"
on "public"."properties"
as permissive
for update
to public
using ((portfolio_id IN ( SELECT user_accessible_portfolios.id
   FROM user_accessible_portfolios
  WHERE ((user_accessible_portfolios.id = properties.portfolio_id) AND (user_accessible_portfolios.user_role = ANY (ARRAY['owner'::text, 'editor'::text]))))));


create policy "users_can_view_shared_properties"
on "public"."properties"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (portfolio_id IN ( SELECT user_accessible_portfolios.id
   FROM user_accessible_portfolios
  WHERE (user_accessible_portfolios.id = properties.portfolio_id)))));


create policy "Owners and editors can create property financials"
on "public"."property_financials"
as permissive
for insert
to public
with check (((portfolio_id IN ( SELECT portfolio_memberships.portfolio_id
   FROM portfolio_memberships
  WHERE ((portfolio_memberships.user_id = auth.uid()) AND (portfolio_memberships.role = ANY (ARRAY['owner'::text, 'editor'::text])) AND (portfolio_memberships.accepted_at IS NOT NULL)))) OR (portfolio_id IN ( SELECT portfolios.id
   FROM portfolios
  WHERE (portfolios.owner_id = auth.uid())))));


create policy "Owners and editors can delete property financials"
on "public"."property_financials"
as permissive
for delete
to public
using (((portfolio_id IN ( SELECT portfolio_memberships.portfolio_id
   FROM portfolio_memberships
  WHERE ((portfolio_memberships.user_id = auth.uid()) AND (portfolio_memberships.role = ANY (ARRAY['owner'::text, 'editor'::text])) AND (portfolio_memberships.accepted_at IS NOT NULL)))) OR (portfolio_id IN ( SELECT portfolios.id
   FROM portfolios
  WHERE (portfolios.owner_id = auth.uid())))));


create policy "Owners and editors can update property financials"
on "public"."property_financials"
as permissive
for update
to public
using (((portfolio_id IN ( SELECT portfolio_memberships.portfolio_id
   FROM portfolio_memberships
  WHERE ((portfolio_memberships.user_id = auth.uid()) AND (portfolio_memberships.role = ANY (ARRAY['owner'::text, 'editor'::text])) AND (portfolio_memberships.accepted_at IS NOT NULL)))) OR (portfolio_id IN ( SELECT portfolios.id
   FROM portfolios
  WHERE (portfolios.owner_id = auth.uid())))));


create policy "Users can view property financials in accessible portfolios"
on "public"."property_financials"
as permissive
for select
to public
using ((portfolio_id IN ( SELECT user_accessible_portfolios.id
   FROM user_accessible_portfolios
  WHERE (property_financials.user_id = auth.uid()))));


create policy "Allow authenticated users to read states"
on "public"."states"
as permissive
for select
to authenticated
using (true);


create policy "block_client_states_deletes"
on "public"."states"
as permissive
for delete
to public
using (false);


create policy "block_client_states_updates"
on "public"."states"
as permissive
for update
to public
using (false);


create policy "block_client_states_writes"
on "public"."states"
as permissive
for insert
to public
with check (false);


create policy "public_read_states"
on "public"."states"
as permissive
for select
to public
using (true);


create policy "Users can delete own education progress"
on "public"."user_education_progress"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own education progress"
on "public"."user_education_progress"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own education progress"
on "public"."user_education_progress"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own education progress"
on "public"."user_education_progress"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "users_delete_own_progress"
on "public"."user_education_progress"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "users_insert_own_progress"
on "public"."user_education_progress"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "users_update_own_progress"
on "public"."user_education_progress"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "users_view_own_progress"
on "public"."user_education_progress"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can insert own limits"
on "public"."user_limits"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own limits"
on "public"."user_limits"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own limits"
on "public"."user_limits"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_census_data_updated_at BEFORE UPDATE ON public.census_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_owner_membership_trigger AFTER INSERT ON public.portfolios FOR EACH ROW EXECUTE FUNCTION create_portfolio_owner_membership();

CREATE TRIGGER ensure_single_default_portfolio_insert_trigger BEFORE INSERT ON public.portfolios FOR EACH ROW EXECUTE FUNCTION ensure_single_default_portfolio();

CREATE TRIGGER ensure_single_default_portfolio_trigger BEFORE UPDATE ON public.portfolios FOR EACH ROW WHEN ((new.is_default IS DISTINCT FROM old.is_default)) EXECUTE FUNCTION ensure_single_default_portfolio();

CREATE TRIGGER update_property_financials_updated_at BEFORE UPDATE ON public.property_financials FOR EACH ROW EXECUTE FUNCTION update_property_financials_updated_at();

CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON public.states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


