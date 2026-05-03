-- =============================================================
-- Hearth — done_at columns, on-demand vacation skips,
--           chore & supply descriptions
-- =============================================================


-- ──────────────────────────────────────────────────────────────
-- done_at: user-specified execution time
-- (logged_at = DB insert time, auto-filled)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE chore_logs  ADD COLUMN IF NOT EXISTS done_at timestamptz;
ALTER TABLE supply_logs ADD COLUMN IF NOT EXISTS done_at timestamptz;

ALTER TABLE chore_logs  ALTER COLUMN logged_at SET DEFAULT now();
ALTER TABLE supply_logs ALTER COLUMN logged_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS chore_logs_done_at  ON chore_logs  (done_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS supply_logs_done_at ON supply_logs (done_at DESC NULLS LAST);


-- ──────────────────────────────────────────────────────────────
-- On-demand chore vacation skips
-- skip_if_away_days: if a flatmate is away >= this many days,
-- they skip their next turn on this on-demand chore
-- ──────────────────────────────────────────────────────────────
ALTER TABLE chores ADD COLUMN IF NOT EXISTS skip_if_away_days int;

UPDATE chores SET skip_if_away_days = 3  WHERE name = 'Take trash out';
UPDATE chores SET skip_if_away_days = 7  WHERE name = 'Take recycling out';
UPDATE chores SET skip_if_away_days = 14 WHERE name = 'Empty & clean vacuum dust container';

-- is_vacation_skip: synthetic log entry created by a vacation save.
-- Counts as a turn taken (shifts the rotation) but shown differently in UI.
ALTER TABLE chore_logs ADD COLUMN IF NOT EXISTS is_vacation_skip boolean DEFAULT false;

CREATE OR REPLACE FUNCTION create_on_demand_vacation_skips(
  p_flatmate_id    uuid,
  p_vacation_start date,
  p_vacation_end   date
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_days int;
BEGIN
  v_days := p_vacation_end - p_vacation_start + 1;

  INSERT INTO chore_logs (chore_id, done_by, is_vacation_skip, done_at, week_start)
  SELECT
    id,
    p_flatmate_id,
    true,
    p_vacation_start::timestamptz,
    date_trunc('week', p_vacation_start::timestamptz)::date
  FROM chores
  WHERE category         = 'on_demand'
    AND active           = true
    AND skip_if_away_days IS NOT NULL
    AND v_days           >= skip_if_away_days;
END; $$;


-- ──────────────────────────────────────────────────────────────
-- Supply descriptions
-- ──────────────────────────────────────────────────────────────
ALTER TABLE supplies ADD COLUMN IF NOT EXISTS description text;

UPDATE supplies SET description = 'All-in-one pods for the dishwasher. Load one per cycle into the detergent compartment.'
  WHERE name = 'Dishwasher capsules';
UPDATE supplies SET description = 'Keeps glasses spot-free and helps the dishwasher drain properly. Fill the rinse-aid dispenser inside the door.'
  WHERE name = 'Dishwasher rinse aid';
UPDATE supplies SET description = 'Prevents limescale build-up in the dishwasher. Fill the salt reservoir (bottom of the machine, unscrew cap).'
  WHERE name = 'Dishwasher salt';
UPDATE supplies SET description = 'For hand-washing dishes, pots, and the sink. A small squeeze goes a long way.'
  WHERE name = 'Washing-up liquid';
UPDATE supplies SET description = 'Spray cleaner for the toilet, bath, sink, and tiles. Leave for a minute before scrubbing.'
  WHERE name = 'Bathroom cleaner';
UPDATE supplies SET description = 'Streak-free cleaner for mirrors and windows. Spray and wipe with a microfibre cloth.'
  WHERE name = 'Glass cleaning solution';
UPDATE supplies SET description = 'Strong disinfectant for the toilet bowl, drains, and mould spots. Dilute for general surface use.'
  WHERE name = 'Bleach';
UPDATE supplies SET description = 'Heavy-duty degreaser for inside the oven. Spray on, leave for 20–30 min, scrub off.'
  WHERE name = 'Oven cleaner spray';
UPDATE supplies SET description = 'Monthly drum-cleaning tablets. Run an empty hot cycle with one tablet to remove odours and residue.'
  WHERE name = 'Washing machine cleaner tablets';
UPDATE supplies SET description = 'Removes limescale from the kettle. Follow pack instructions — usually dilute and boil, then rinse thoroughly.'
  WHERE name = 'Kettle descaler';
UPDATE supplies SET description = 'For the washing machine. Check the label — some go in the drum, some in the drawer.'
  WHERE name = 'Laundry detergent';
UPDATE supplies SET description = 'Goes in the fabric softener compartment of the washing machine. Keeps clothes soft and reduces static.'
  WHERE name = 'Fabric softener';
UPDATE supplies SET description = 'Squirt under the rim and leave for a few minutes before brushing. Keeps the bowl clean and fresh.'
  WHERE name = 'Toilet cleaner';
UPDATE supplies SET description = 'Standard toilet paper. Keep at least one spare roll accessible in the bathroom.'
  WHERE name = 'Toilet paper';
UPDATE supplies SET description = 'Liquid hand soap for the bathroom sink dispenser.'
  WHERE name = 'Hand soap';
UPDATE supplies SET description = 'Non-stick paper for baking trays and roasting. Tear to size as needed.'
  WHERE name = 'Baking paper';
UPDATE supplies SET description = 'For covering bowls and wrapping food in the fridge to keep it fresh.'
  WHERE name = 'Cling film';
UPDATE supplies SET description = 'Used as oven base liner (changed weekly) and for covering dishes when roasting.'
  WHERE name = 'Aluminium foil';
UPDATE supplies SET description = 'For washing up and scrubbing surfaces. Replace when they start to smell or fall apart.'
  WHERE name = 'Washing-up sponges';
UPDATE supplies SET description = 'Multi-purpose absorbent paper. Useful for drying surfaces, soaking up spills, and cleaning.'
  WHERE name = 'Kitchen roll';
UPDATE supplies SET description = 'Standard bin liners for the kitchen bin. Tie and remove when full, replace immediately.'
  WHERE name = 'Bin bags';
UPDATE supplies SET description = 'Refill gas for the kitchen lighter. Unscrew the nozzle tip and press the refill canister in.'
  WHERE name = 'Lighter gas';
UPDATE supplies SET description = 'Crystals for the dehumidifier units around the flat. Replace when the tray is full of water.'
  WHERE name = 'Dehumidifier refills';
