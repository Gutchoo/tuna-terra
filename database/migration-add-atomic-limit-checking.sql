-- Add atomic limit checking to prevent race conditions
-- This migration adds a database function for atomic limit checking and usage increment

-- Function to atomically check and increment usage limits
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
  
  -- If user doesn't exist, create default limits
  IF user_record IS NULL THEN
    INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit)
    VALUES (p_user_id, 'free', 0, 25)
    RETURNING * INTO user_record;
  END IF;
  
  -- Check if monthly reset is needed
  IF user_record.reset_date <= NOW() THEN
    UPDATE user_limits 
    SET 
      property_lookups_used = 0,
      reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
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

-- Function to just check limits without incrementing (for preview/validation)
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
  
  -- If user doesn't exist, return default limits
  IF user_record IS NULL THEN
    RETURN QUERY SELECT 
      (p_check_count <= 25),
      0,
      25,
      'free'::TEXT,
      (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Check if monthly reset is needed
  IF user_record.reset_date <= NOW() THEN
    user_record.property_lookups_used := 0;
    user_record.reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limits(UUID, INTEGER) TO authenticated;