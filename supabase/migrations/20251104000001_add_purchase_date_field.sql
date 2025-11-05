-- Add purchase_date field to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS purchase_date date;

-- Add comment for documentation
COMMENT ON COLUMN properties.purchase_date IS 'User-entered purchase date for tracking acquisition';
