-- =============================================================
-- Hearth — Step 5: Supply Assignment Functions
-- =============================================================


-- ──────────────────────────────────────────────────────────────
-- get_next_buyer
-- Returns the flatmate_id who should buy the given supply next.
-- Picks the flatmate with the lowest purchase count (ties broken
-- by oldest last_purchased_at). Skips flatmates on vacation today.
-- ──────────────────────────────────────────────────────────────
create or replace function get_next_buyer(p_supply_id uuid)
returns uuid language plpgsql as $$
declare
  v_today  date := current_date;
  v_result uuid;
begin
  select spc.flatmate_id into v_result
  from supply_purchase_counts spc
  join flatmates f on f.id = spc.flatmate_id
  where spc.supply_id = p_supply_id
    and f.active = true
    and not exists (
      select 1 from vacation_periods vp
      where vp.flatmate_id = spc.flatmate_id
        and vp.start_date <= v_today
        and vp.end_date   >= v_today
    )
  order by spc.purchase_count asc, spc.last_purchased_at asc nulls first
  limit 1;

  return v_result;
end; $$;


-- ──────────────────────────────────────────────────────────────
-- increment_purchase_count
-- Atomically increments purchase_count for a flatmate × supply
-- pair. Uses upsert so a plain insert never resets the counter.
-- ──────────────────────────────────────────────────────────────
create or replace function increment_purchase_count(p_supply_id uuid, p_flatmate_id uuid)
returns void language sql as $$
  insert into supply_purchase_counts (supply_id, flatmate_id, purchase_count, last_purchased_at)
  values (p_supply_id, p_flatmate_id, 1, now())
  on conflict (supply_id, flatmate_id) do update
    set purchase_count    = supply_purchase_counts.purchase_count + 1,
        last_purchased_at = now();
$$;
