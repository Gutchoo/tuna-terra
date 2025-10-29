-- Add property details fields for acquisition and disposition tracking
-- Plus override tracking for manually modified Regrid fields

-- Add user-entered acquisition fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS sold_date date,
  ADD COLUMN IF NOT EXISTS sold_price numeric,
  ADD COLUMN IF NOT EXISTS field_overrides jsonb DEFAULT '{}'::jsonb;

-- Add check constraints for data validation
ALTER TABLE properties
  ADD CONSTRAINT check_sold_date_after_purchase
    CHECK (sold_date IS NULL OR purchase_date IS NULL OR sold_date >= purchase_date);

ALTER TABLE properties
  ADD CONSTRAINT check_sold_price_positive
    CHECK (sold_price IS NULL OR sold_price > 0);

-- Add comments for documentation
COMMENT ON COLUMN properties.purchase_date IS 'User-entered date when property was acquired by the current owner';
COMMENT ON COLUMN properties.sold_date IS 'User-entered date when property was sold/disposed';
COMMENT ON COLUMN properties.sold_price IS 'User-entered sale price for disposition tracking';
COMMENT ON COLUMN properties.field_overrides IS 'JSONB object tracking which Regrid fields have been manually overridden by users. Format: {"field_name": {"original": value, "overridden_at": timestamp, "overridden_by": user_id}}';

-- Add index for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_purchase_date ON properties(purchase_date) WHERE purchase_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_sold_date ON properties(sold_date) WHERE sold_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_field_overrides ON properties USING gin(field_overrides) WHERE field_overrides IS NOT NULL AND field_overrides != '{}'::jsonb;
