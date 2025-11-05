-- Add management company and debt tracking fields to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS management_company text,
ADD COLUMN IF NOT EXISTS mortgage_amount numeric,
ADD COLUMN IF NOT EXISTS lender_name text,
ADD COLUMN IF NOT EXISTS loan_rate numeric,
ADD COLUMN IF NOT EXISTS loan_maturity_date date;

-- Add comments for documentation
COMMENT ON COLUMN properties.management_company IS 'Property management company name';
COMMENT ON COLUMN properties.mortgage_amount IS 'Current mortgage/debt amount on the property';
COMMENT ON COLUMN properties.lender_name IS 'Name of the lending institution';
COMMENT ON COLUMN properties.loan_rate IS 'Interest rate on the loan (percentage)';
COMMENT ON COLUMN properties.loan_maturity_date IS 'Loan maturity/payoff date';
