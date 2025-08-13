-- Add user limits and tier system
-- This migration adds property lookup limits and user tiers

CREATE TABLE user_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  property_lookups_used INTEGER DEFAULT 0,
  property_lookups_limit INTEGER DEFAULT 25,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX idx_user_limits_reset_date ON user_limits(reset_date);
CREATE INDEX idx_user_limits_tier ON user_limits(tier);

-- Enable RLS for security
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own limits
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policy: Users can insert their own limits (for automatic creation)
CREATE POLICY "Users can insert own limits" ON user_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can update their own limits (for usage tracking)
CREATE POLICY "Users can update own limits" ON user_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user_limits row for new users
CREATE OR REPLACE FUNCTION create_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit)
  VALUES (NEW.id, 'free', 0, 25);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_limits when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_limits();

-- Function to reset monthly usage (to be called by a scheduled job)
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
  UPDATE user_limits 
  SET 
    property_lookups_used = 0,
    reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    updated_at = NOW()
  WHERE reset_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert limits for existing users (one-time migration)
INSERT INTO user_limits (user_id, tier, property_lookups_used, property_lookups_limit)
SELECT id, 'free', 0, 25
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_limits);