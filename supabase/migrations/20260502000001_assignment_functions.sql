-- =============================================================
-- Hearth — Step 4: Chore Assignment Functions
-- =============================================================


-- ──────────────────────────────────────────────────────────────
-- generate_weekly_assignments
-- Called from frontend on first app open of the week.
-- Idempotent: aborts immediately if this week already has rows.
-- ──────────────────────────────────────────────────────────────
create or replace function generate_weekly_assignments(p_week_start date)
returns void language plpgsql as $$
declare
  v_chore            record;
  v_flatmate         record;
  v_best_id          uuid;
  v_min_balance      numeric;
  v_balance          numeric;
  v_vacation_days    int;
  v_week_end         date;
  v_carry_flatmate_id uuid;
begin
  v_week_end := p_week_start + interval '6 days';

  -- Skip if already generated for this week
  if exists (select 1 from chore_assignments where week_start = p_week_start) then
    return;
  end if;

  -- Mark last week's incomplete assignments as missed
  update chore_assignments
  set missed = true
  where week_start = p_week_start - interval '7 days'
    and completed = false
    and missed = false;

  for v_chore in
    select * from chores where active = true and category = 'regular'
  loop
    -- Skip if chore not due yet
    if exists (
      select 1 from chore_logs
      where chore_id = v_chore.id
        and logged_at >= (p_week_start - (v_chore.recurrence_days || ' days')::interval)
    ) then
      continue;
    end if;

    -- Check for carry-forward (same flatmate missed it last week, not yet carried)
    select ca.flatmate_id into v_carry_flatmate_id
    from chore_assignments ca
    where ca.chore_id = v_chore.id
      and ca.week_start = p_week_start - interval '7 days'
      and ca.missed = true
      and ca.carry_forward = false
    limit 1;

    if v_carry_flatmate_id is not null then
      -- Carry forward only if they're not on vacation this week
      select coalesce(sum(
        least(end_date, v_week_end) - greatest(start_date, p_week_start) + 1
      ), 0) into v_vacation_days
      from vacation_periods
      where flatmate_id = v_carry_flatmate_id
        and start_date <= v_week_end and end_date >= p_week_start;

      if v_vacation_days < v_chore.recurrence_days then
        insert into chore_assignments (chore_id, flatmate_id, week_start, carry_forward)
        values (v_chore.id, v_carry_flatmate_id, p_week_start, true);

        -- Mark the previous missed assignment as having been carried forward
        update chore_assignments set carry_forward = true
        where chore_id = v_chore.id
          and week_start = p_week_start - interval '7 days'
          and missed = true;

        continue;
      end if;
      -- On vacation: fall through to normal balanced assignment
    end if;

    -- Normal assignment: flatmate with lowest effort balance over last 28 days
    v_min_balance := 999999;
    v_best_id     := null;

    for v_flatmate in select * from flatmates where active = true order by random() loop

      select coalesce(sum(
        least(end_date, v_week_end) - greatest(start_date, p_week_start) + 1
      ), 0) into v_vacation_days
      from vacation_periods
      where flatmate_id = v_flatmate.id
        and start_date <= v_week_end and end_date >= p_week_start;

      -- Skip if vacation covers the whole recurrence window
      if v_vacation_days >= v_chore.recurrence_days then continue; end if;

      select coalesce(sum(c.weight), 0) into v_balance
      from chore_assignments ca
      join chores c on c.id = ca.chore_id
      where ca.flatmate_id = v_flatmate.id
        and ca.week_start >= (p_week_start - interval '28 days');

      -- Discount balance proportionally for vacation time in the window
      v_balance := v_balance * (1 - (v_vacation_days::numeric / 28));

      if v_balance < v_min_balance then
        v_min_balance := v_balance;
        v_best_id     := v_flatmate.id;
      end if;
    end loop;

    if v_best_id is not null then
      insert into chore_assignments (chore_id, flatmate_id, week_start)
      values (v_chore.id, v_best_id, p_week_start);
    end if;

  end loop;
end; $$;


-- ──────────────────────────────────────────────────────────────
-- reassign_vacation_chores
-- Called mid-week when a flatmate saves a vacation that starts
-- within the current week. Cannot use generate_weekly_assignments
-- (its idempotency guard would abort). Reassigns only incomplete
-- chores for the given flatmate this week.
-- ──────────────────────────────────────────────────────────────
create or replace function reassign_vacation_chores(
  p_flatmate_id uuid,
  p_week_start  date
)
returns void language plpgsql as $$
declare
  v_assignment  record;
  v_flatmate    record;
  v_best_id     uuid;
  v_min_balance numeric;
  v_balance     numeric;
  v_vacation_days int;
  v_week_end    date;
begin
  v_week_end := p_week_start + interval '6 days';

  for v_assignment in
    select ca.*, c.weight, c.recurrence_days
    from chore_assignments ca
    join chores c on c.id = ca.chore_id
    where ca.flatmate_id = p_flatmate_id
      and ca.week_start = p_week_start
      and ca.completed = false
  loop
    v_min_balance := 999999;
    v_best_id     := null;

    for v_flatmate in
      select * from flatmates where active = true and id != p_flatmate_id
    loop
      select coalesce(sum(
        least(end_date, v_week_end) - greatest(start_date, p_week_start) + 1
      ), 0) into v_vacation_days
      from vacation_periods
      where flatmate_id = v_flatmate.id
        and start_date <= v_week_end and end_date >= p_week_start;

      if v_vacation_days >= v_assignment.recurrence_days then continue; end if;

      select coalesce(sum(c.weight), 0) into v_balance
      from chore_assignments ca
      join chores c on c.id = ca.chore_id
      where ca.flatmate_id = v_flatmate.id
        and ca.week_start >= (p_week_start - interval '28 days');

      if v_balance < v_min_balance then
        v_min_balance := v_balance;
        v_best_id     := v_flatmate.id;
      end if;
    end loop;

    if v_best_id is not null then
      update chore_assignments
      set flatmate_id = v_best_id
      where id = v_assignment.id;
    end if;
    -- If no one available (all on vacation), assignment stays with original flatmate

  end loop;
end; $$;
