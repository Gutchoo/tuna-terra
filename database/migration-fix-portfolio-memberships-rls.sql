-- Fix portfolio_memberships RLS to eliminate need for service role key in API
-- This migration adds RLS policies to portfolio_memberships table to enable secure access

-- Enable RLS on portfolio_memberships if not already enabled
ALTER TABLE portfolio_memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view memberships where they are involved" ON portfolio_memberships;
DROP POLICY IF EXISTS "Portfolio owners can manage memberships" ON portfolio_memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON portfolio_memberships;
DROP POLICY IF EXISTS "Users can insert memberships for portfolios they own" ON portfolio_memberships;
DROP POLICY IF EXISTS "Users can update memberships for portfolios they own" ON portfolio_memberships;
DROP POLICY IF EXISTS "Users can delete memberships for portfolios they own" ON portfolio_memberships;

-- Policy: Users can view memberships where they are the member OR they own the portfolio
CREATE POLICY "Users can view relevant memberships" ON portfolio_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR -- User can see their own memberships
    auth.uid() IN ( -- User can see memberships in portfolios they own
      SELECT owner_id FROM portfolios WHERE id = portfolio_id
    )
  );

-- Policy: Users can insert memberships for portfolios they own
CREATE POLICY "Portfolio owners can create memberships" ON portfolio_memberships
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM portfolios WHERE id = portfolio_id
    )
  );

-- Policy: Users can update memberships for portfolios they own
CREATE POLICY "Portfolio owners can update memberships" ON portfolio_memberships
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM portfolios WHERE id = portfolio_id
    )
  );

-- Policy: Users can delete memberships for portfolios they own OR their own membership
CREATE POLICY "Users can delete relevant memberships" ON portfolio_memberships
  FOR DELETE USING (
    auth.uid() = user_id OR -- Users can leave portfolios themselves
    auth.uid() IN ( -- Portfolio owners can remove members
      SELECT owner_id FROM portfolios WHERE id = portfolio_id
    )
  );

-- Create a view for easier portfolio access checking
CREATE OR REPLACE VIEW user_accessible_portfolios AS
SELECT DISTINCT 
  p.id,
  p.name,
  p.description,
  p.owner_id,
  p.is_default,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.owner_id = auth.uid() THEN 'owner'
    ELSE pm.role
  END as user_role
FROM portfolios p
LEFT JOIN portfolio_memberships pm ON (
  pm.portfolio_id = p.id 
  AND pm.user_id = auth.uid() 
  AND pm.accepted_at IS NOT NULL
)
WHERE 
  p.owner_id = auth.uid() -- User owns the portfolio
  OR (
    pm.user_id = auth.uid() 
    AND pm.accepted_at IS NOT NULL -- User is an accepted member
  );

-- Grant access to the view
GRANT SELECT ON user_accessible_portfolios TO authenticated;

-- Add RLS to the view (though views inherit from underlying tables)
ALTER VIEW user_accessible_portfolios SET (security_barrier = true);