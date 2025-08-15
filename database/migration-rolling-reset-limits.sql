-- Migration: Rolling Reset for Pro Lookups
-- Change from global monthly reset to individual user rolling reset based on join date
-- Reduces limit from 15 to 10 lookups per period, no accumulation

-- Step 1: Add join_date column to track when user first signed up
ALTER TABLE user_limits 
ADD COLUMN join_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Populate join_date for existing users from auth.users.created_at
UPDATE user_limits 
SET join_date = (
  SELECT created_at 
  FROM auth.users 
  WHERE auth.users.id = user_limits.user_id
);

-- Step 3: Make join_date NOT NULL (now that all existing rows are populated)
ALTER TABLE user_limits 
ALTER COLUMN join_date SET NOT NULL;

-- Step 4: Add index for performance on join_date queries
CREATE INDEX idx_user_limits_join_date ON user_limits(join_date);

-- Step 5: Change default limit from 15 to 10 for new users
ALTER TABLE user_limits 
ALTER COLUMN property_lookups_limit SET DEFAULT 10;

-- Step 6: Update existing users to have 10 lookup limit instead of 15
UPDATE user_limits 
SET property_lookups_limit = 10 
WHERE property_lookups_limit = 15 AND tier = 'free';

-- Step 7: Function to calculate next reset date based on user's join date anniversary
CREATE OR REPLACE FUNCTION calculate_next_reset_date(join_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update check_usage_limits function to use rolling reset based on join_date
CREATE OR REPLACE FUNCTION check_usage_limits(
  p_user_id UUID,
  p_check_count INTEGER DEFAULT 1
) RETURNS TABLE(
  can_proceed BOOLEAN,
  current_usage INTEGER,
  usage_limit INTEGER,
  tier TEXT,
  reset_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record user_limits%ROWTYPE;
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
      'free'::TEXT,
      calculate_next_reset_date(NOW());
    RETURN;
  END IF;
  
  -- Check if rolling reset is needed based on user's join date anniversary
  IF user_record.reset_date <= NOW() THEN
    user_record.property_lookups_used := 0;
    user_record.reset_date := calculate_next_reset_date(user_record.join_date);
  END IF;
  
  -- Pro users have unlimited access
  IF user_record.tier = 'pro' THEN
    RETURN QUERY SELECT 
      TRUE,
      user_record.property_lookups_used,
      user_record.property_lookups_limit,
      user_record.tier,
      user_record.reset_date;
    RETURN;
  END IF;
  
  -- Check if proposed usage would exceed limit
  RETURN QUERY SELECT 
    (user_record.property_lookups_used + p_check_count <= user_record.property_lookups_limit),
    user_record.property_lookups_used,
    user_record.property_lookups_limit,
    user_record.tier,
    user_record.reset_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Update check_and_increment_usage function to use rolling reset
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_increment INTEGER DEFAULT 1
) RETURNS TABLE(
  can_proceed BOOLEAN,
  current_usage INTEGER,
  usage_limit INTEGER,
  tier TEXT,
  reset_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record user_limits%ROWTYPE;
  new_usage INTEGER;
BEGIN
  -- Lock the user_limits row to prevent race conditions
  SELECT * INTO user_record
  FROM user_limits 
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If user doesn't exist, create default limits with 10 lookups
  IF user_record IS NULL THEN
    INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit, join_date)
    VALUES (
      p_user_id, 
      'free', 
      0, 
      10, 
      NOW()
    )
    RETURNING * INTO user_record;
    
    -- Set initial reset date based on join date
    UPDATE user_limits 
    SET reset_date = calculate_next_reset_date(user_record.join_date)
    WHERE user_id = p_user_id
    RETURNING * INTO user_record;
  END IF;
  
  -- Check if rolling reset is needed based on user's join date anniversary  
  IF user_record.reset_date <= NOW() THEN
    UPDATE user_limits 
    SET 
      property_lookups_used = 0,
      reset_date = calculate_next_reset_date(user_record.join_date),
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO user_record;
  END IF;
  
  -- Calculate new usage
  new_usage := user_record.property_lookups_used + p_increment;
  
  -- Check if user is on pro tier (unlimited)
  IF user_record.tier = 'pro' THEN
    -- Pro users have unlimited access - just increment usage
    UPDATE user_limits 
    SET 
      property_lookups_used = new_usage,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT 
      TRUE,
      new_usage,
      user_record.property_lookups_limit,
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
      user_record.tier,
      user_record.reset_date;
    RETURN;
  END IF;
  
  -- Increment usage as it's within limits
  UPDATE user_limits 
  SET 
    property_lookups_used = new_usage,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT 
    TRUE,
    new_usage,
    user_record.property_lookups_limit,
    user_record.tier,
    user_record.reset_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Update the trigger function for new users to include join_date and use limit of 10
CREATE OR REPLACE FUNCTION create_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_limits (
    user_id, 
    tier, 
    property_lookups_used, 
    property_lookups_limit, 
    join_date,
    reset_date
  )
  VALUES (
    NEW.id, 
    'free', 
    0, 
    10,
    NEW.created_at,
    calculate_next_reset_date(NEW.created_at)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Recalculate reset_date for all existing users based on their join_date
UPDATE user_limits 
SET reset_date = calculate_next_reset_date(join_date);

-- Step 12: Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_next_reset_date(TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Migration complete: Users now have individual rolling reset dates based on when they joined
-- Lookups are limited to 10 per period with no accumulation