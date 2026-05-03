-- Merge "Clear ice build-up from freezer" into "Defrost freezer"
-- Both describe the same task; keep Defrost freezer (heavier weight, fuller description).

DO $$
DECLARE
  v_keep uuid;
  v_drop uuid;
BEGIN
  SELECT id INTO v_keep FROM chores WHERE name = 'Defrost freezer';
  SELECT id INTO v_drop FROM chores WHERE name = 'Clear ice build-up from freezer';

  IF v_keep IS NULL OR v_drop IS NULL THEN
    RAISE NOTICE 'One or both chores not found — skipping merge.';
    RETURN;
  END IF;

  -- Re-point logs
  UPDATE chore_logs       SET chore_id = v_keep WHERE chore_id = v_drop;

  -- Re-point assignments (drop duplicates that would violate a unique constraint)
  UPDATE chore_assignments SET chore_id = v_keep
  WHERE chore_id = v_drop
    AND NOT EXISTS (
      SELECT 1 FROM chore_assignments ca2
      WHERE ca2.chore_id    = v_keep
        AND ca2.flatmate_id = chore_assignments.flatmate_id
        AND ca2.week_start  = chore_assignments.week_start
    );

  -- Delete any leftover assignment rows (duplicates that couldn't be re-pointed)
  DELETE FROM chore_assignments WHERE chore_id = v_drop;

  -- Delete the redundant chore
  DELETE FROM chores WHERE id = v_drop;
END; $$;
