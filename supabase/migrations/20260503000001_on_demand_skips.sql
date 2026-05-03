-- =============================================================
-- Hearth — On-demand chore vacation skips + done_at columns
-- =============================================================

-- done_at: user-specified execution time (vs logged_at = DB insert time)
ALTER TABLE chore_logs  ADD COLUMN IF NOT EXISTS done_at timestamptz;
ALTER TABLE supply_logs ADD COLUMN IF NOT EXISTS done_at timestamptz;

ALTER TABLE chore_logs  ALTER COLUMN logged_at SET DEFAULT now();
ALTER TABLE supply_logs ALTER COLUMN logged_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS chore_logs_done_at  ON chore_logs  (done_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS supply_logs_done_at ON supply_logs (done_at DESC NULLS LAST);


-- skip_if_away_days: if a flatmate is away >= this many days, they skip
-- their next turn on this on-demand chore (null = no skip logic)
ALTER TABLE chores ADD COLUMN IF NOT EXISTS skip_if_away_days int;

UPDATE chores SET skip_if_away_days = 3  WHERE name = 'Take trash out';
UPDATE chores SET skip_if_away_days = 7  WHERE name = 'Take recycling out';
UPDATE chores SET skip_if_away_days = 14 WHERE name = 'Empty & clean vacuum dust container';


-- is_vacation_skip: marks synthetic log entries created by vacation
-- (counts as a "turn taken" so the rotation stays fair, but shown
-- differently in the UI — not as real work done)
ALTER TABLE chore_logs ADD COLUMN IF NOT EXISTS is_vacation_skip boolean DEFAULT false;


-- ──────────────────────────────────────────────────────────────
-- create_on_demand_vacation_skips
-- Called when a vacation period is saved.
-- Inserts one skip-log per on-demand chore whose skip_if_away_days
-- threshold is met by the vacation length.
-- ──────────────────────────────────────────────────────────────
create or replace function create_on_demand_vacation_skips(
  p_flatmate_id   uuid,
  p_vacation_start date,
  p_vacation_end   date
) returns void language plpgsql as $$
declare
  v_days int;
begin
  v_days := p_vacation_end - p_vacation_start + 1;

  insert into chore_logs (chore_id, done_by, is_vacation_skip, done_at, week_start)
  select
    id,
    p_flatmate_id,
    true,
    p_vacation_start::timestamptz,
    date_trunc('week', p_vacation_start::timestamptz)::date
  from chores
  where category    = 'on_demand'
    and active      = true
    and skip_if_away_days is not null
    and v_days >= skip_if_away_days;
end; $$;
