-- ============================================================================
-- Migration: Auto-Update Unit Occupancy Based on Rental Income
-- Description: Automatically sets property_units.is_occupied based on
--              whether the unit has any rental_income transactions linked to it
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: update_unit_occupancy
-- Description: Updates a unit's is_occupied status based on rental income
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_unit_occupancy()
RETURNS TRIGGER AS $$
DECLARE
  v_unit_id UUID;
  v_has_rental_income BOOLEAN;
BEGIN
  -- Determine which unit_id to check based on trigger operation
  IF TG_OP = 'DELETE' THEN
    v_unit_id := OLD.unit_id;
  ELSE
    v_unit_id := NEW.unit_id;
  END IF;

  -- Only process if a unit is involved
  IF v_unit_id IS NOT NULL THEN
    -- Check if unit has any rental income transactions
    SELECT EXISTS (
      SELECT 1
      FROM income_transactions
      WHERE unit_id = v_unit_id
        AND category = 'rental_income'
    ) INTO v_has_rental_income;

    -- Update the unit's occupancy status
    UPDATE property_units
    SET
      is_occupied = v_has_rental_income,
      updated_at = now()
    WHERE id = v_unit_id;
  END IF;

  -- For UPDATE operations, also check the old unit_id if it changed
  IF TG_OP = 'UPDATE' AND OLD.unit_id IS NOT NULL AND OLD.unit_id != NEW.unit_id THEN
    -- Check if old unit still has rental income
    SELECT EXISTS (
      SELECT 1
      FROM income_transactions
      WHERE unit_id = OLD.unit_id
        AND category = 'rental_income'
    ) INTO v_has_rental_income;

    -- Update the old unit's occupancy status
    UPDATE property_units
    SET
      is_occupied = v_has_rental_income,
      updated_at = now()
    WHERE id = OLD.unit_id;
  END IF;

  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Trigger: trigger_update_unit_occupancy_on_income
-- Description: Fires after INSERT, UPDATE, or DELETE on income_transactions
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_update_unit_occupancy_on_income ON income_transactions;

CREATE TRIGGER trigger_update_unit_occupancy_on_income
  AFTER INSERT OR UPDATE OR DELETE ON income_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_unit_occupancy();

-- ----------------------------------------------------------------------------
-- Initial Sync: Update all existing units based on current rental income
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  unit_record RECORD;
  v_has_rental_income BOOLEAN;
BEGIN
  -- Loop through all property units
  FOR unit_record IN SELECT id FROM property_units LOOP
    -- Check if unit has rental income
    SELECT EXISTS (
      SELECT 1
      FROM income_transactions
      WHERE unit_id = unit_record.id
        AND category = 'rental_income'
    ) INTO v_has_rental_income;

    -- Update occupancy status
    UPDATE property_units
    SET
      is_occupied = v_has_rental_income,
      updated_at = now()
    WHERE id = unit_record.id;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------
COMMENT ON FUNCTION update_unit_occupancy() IS
  'Automatically updates property_units.is_occupied based on existence of rental_income transactions. Unit is occupied if it has ANY rental income linked to it.';

COMMENT ON TRIGGER trigger_update_unit_occupancy_on_income ON income_transactions IS
  'Automatically updates unit occupancy when rental income transactions are added, modified, or removed.';
