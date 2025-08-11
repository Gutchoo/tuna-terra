CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE portfolio_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, user_id)
);

CREATE TABLE portfolio_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  regrid_id TEXT,
  apn TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  geometry JSONB,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  year_built INTEGER,
  owner TEXT,
  last_sale_price DECIMAL(12, 2),
  sale_date DATE,
  county TEXT,
  qoz_status TEXT,
  improvement_value DECIMAL(12, 2),
  land_value DECIMAL(12, 2),
  assessed_value DECIMAL(12, 2),
  use_code TEXT,
  use_description TEXT,
  zoning TEXT,
  zoning_description TEXT,
  num_stories INTEGER,
  num_units INTEGER,
  num_rooms INTEGER,
  subdivision TEXT,
  lot_size_acres DECIMAL(10, 4),
  lot_size_sqft INTEGER,
  tax_year TEXT,
  parcel_value_type TEXT,
  census_tract TEXT,
  census_block TEXT,
  qoz_tract TEXT,
  last_refresh_date DATE,
  regrid_updated_at TIMESTAMP WITH TIME ZONE,
  owner_mailing_address TEXT,
  owner_mail_city TEXT,
  owner_mail_state TEXT,
  owner_mail_zip TEXT,
  property_data JSONB,
  user_notes TEXT,
  tags TEXT[],
  insurance_provider TEXT,
  maintenance_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolios_owner_id ON portfolios(owner_id);
CREATE UNIQUE INDEX idx_portfolios_single_default ON portfolios(owner_id) WHERE is_default = true;
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX idx_portfolio_memberships_portfolio_id ON portfolio_memberships(portfolio_id);
CREATE INDEX idx_portfolio_memberships_user_id ON portfolio_memberships(user_id);
CREATE INDEX idx_portfolio_memberships_role ON portfolio_memberships(portfolio_id, role);
CREATE INDEX idx_portfolio_memberships_accepted ON portfolio_memberships(portfolio_id, user_id) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_portfolio_invitations_portfolio_id ON portfolio_invitations(portfolio_id);
CREATE INDEX idx_portfolio_invitations_email ON portfolio_invitations(email);
CREATE INDEX idx_portfolio_invitations_token ON portfolio_invitations(invitation_token);
CREATE INDEX idx_portfolio_invitations_expires ON portfolio_invitations(expires_at) WHERE accepted_at IS NULL;
CREATE UNIQUE INDEX idx_portfolio_invitations_unique_pending ON portfolio_invitations(portfolio_id, email) WHERE accepted_at IS NULL;
CREATE INDEX idx_properties_portfolio_id ON properties(portfolio_id);
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_apn ON properties(apn);
CREATE INDEX idx_properties_address ON properties(address);
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_owned_portfolios" ON portfolios
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "users_can_create_portfolios" ON portfolios
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owners_can_update_portfolios" ON portfolios
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "owners_can_delete_portfolios" ON portfolios  
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "users_can_view_portfolio_properties" ON properties
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_portfolio_properties" ON properties
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_portfolio_properties" ON properties
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_portfolio_properties" ON properties
  FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION create_portfolio_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO portfolio_memberships (portfolio_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_owner_membership_trigger
  AFTER INSERT ON portfolios
  FOR EACH ROW EXECUTE FUNCTION create_portfolio_owner_membership();

CREATE OR REPLACE FUNCTION create_default_portfolio_for_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO portfolios (name, description, owner_id, is_default)
    VALUES (
      COALESCE(NEW.email, 'User ' || NEW.id) || '''s Portfolio',
      'Default portfolio created automatically',
      NEW.id,
      true
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Failed to create default portfolio for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_default_portfolio_trigger ON auth.users;
CREATE TRIGGER create_default_portfolio_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_portfolio_for_user();

CREATE OR REPLACE FUNCTION get_user_portfolio_role(p_portfolio_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_user_edit_portfolio(p_portfolio_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_portfolio_role(p_portfolio_id, p_user_id) IN ('owner', 'editor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_portfolio_properties(
  p_user_id UUID,
  p_portfolio_id UUID DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  address TEXT,
  city TEXT,
  state TEXT,
  apn TEXT,
  owner TEXT,
  portfolio_id UUID,
  portfolio_name TEXT,
  user_role TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;