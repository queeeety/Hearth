-- =============================================================
-- Hearth — Initial Schema
-- Step 2: All tables, indexes, seeds, and Row Level Security
-- =============================================================


-- ──────────────────────────────────────────────────────────────
-- 2.1  Flatmates
-- ──────────────────────────────────────────────────────────────
create table flatmates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  avatar_emoji text default '🙂',
  active boolean default true,
  created_at timestamptz default now()
);

insert into flatmates (name, color, avatar_emoji) values
  ('Tim',    '#34C759', '🧑'),
  ('Elaine', '#007AFF', '🧑'),
  ('Suhail', '#FF9500', '🧑');


-- ──────────────────────────────────────────────────────────────
-- 2.2  Chores
-- ──────────────────────────────────────────────────────────────
create table chores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  recurrence_days int,
  weight numeric(3,1) not null check (weight between 1 and 5),
  category text not null check (category in ('regular', 'on_demand')),
  room text,
  icon text default '🧹',
  active boolean default true,
  created_at timestamptz default now()
);

insert into chores (name, recurrence_days, weight, category, room, icon, description) values

  -- Weekly
  ('Vacuum living room', 7, 2.0, 'regular', 'living_space', '🧹',
   'Vacuum the entire floor including all corners, along the skirting boards, and under the coffee table edges. Move the coffee table if needed. Don''t skip the rug — vacuum both directions. Approx. 10–15 min.'),

  ('Change oven foil & light wipe', 7, 1.0, 'regular', 'kitchen', '✨',
   'Discard the old foil from the oven base. Wipe any visible splatter from the oven walls with a damp cloth and kitchen spray. Cut a new piece of foil and lay it flat on the oven base — do not cover the heating element or vent holes at the back. Approx. 5 min.'),

  ('Clean kitchen sink & dish tray', 7, 2.0, 'regular', 'kitchen', '🧽',
   'Scrub the sink basin, drain rim, and tap base with kitchen spray and a scourer to remove grease and rust stains. Lift the plastic dish drying tray out, scrub both sides under hot water, rinse fully, and return it to position. Approx. 10 min.'),

  ('Clear out spoiled fridge items', 7, 1.0, 'regular', 'kitchen', '🗄️',
   'Remove anything past its use-by date, visibly spoiled, or growing mould. Check the veggie/crisper drawer specifically — that''s where things hide. Dispose in the food waste bin. Wipe any obvious spills while in there. Approx. 5 min.'),

  ('Dust shelves & common surfaces', 7, 2.0, 'regular', 'living_space', '🪴',
   'Wipe down with a damp cloth: coffee table (top and shelf underneath), fireplace mantle, all shelves, shoe shelf, the router, and the HomePod. Get the tops and fronts of each surface. Approx. 15 min.'),

  ('Clear & wipe dining table', 7, 1.0, 'regular', 'living_space', '🪑',
   'Remove everything that doesn''t belong on the table — post, bags, chargers, coats — and put it where it actually belongs. Wipe the table surface with a damp cloth. Done when the table is completely clear and clean. Approx. 5 min.'),

  ('Wash kitchen & tea towels', 7, 2.0, 'regular', 'laundry', '🧺',
   'Collect all kitchen towels and tea towels (check the oven door handle, the sink area, and the kitchen drawer). Wash at 60°C. Hang or tumble dry. Replace with fresh ones immediately so there''s always a clean towel available. Approx. 5 min active.'),

  ('Declutter & clean kitchen surfaces', 7, 2.0, 'regular', 'kitchen', '🍽️',
   'Clear the counters of anything that doesn''t live there — check near the kettle, toaster, and bread bin. Wipe all counter surfaces and the windowsill above the sink with kitchen spray, including behind and underneath appliances where possible. Approx. 10 min.'),

  -- Monthly
  ('Wash vacuum filters', 30, 2.0, 'regular', 'maintenance', '🌀',
   'Remove the HEPA or foam filter(s) from the vacuum (check the manual if unsure). Rinse under cold running water — no soap, no heat — until the water runs clear. Leave to air-dry completely for at least 24 hours before reinserting. Do not use the vacuum while the filter is drying. Approx. 10 min active, 24 hr drying.'),

  ('Mop living room & corridor floor', 30, 3.0, 'regular', 'living_space', '🪣',
   'Fill a bucket with warm water and floor cleaner. Mop the full hard floor of the living room and corridor, working from the far end toward the door. Wring the mop thoroughly — floors should be damp, not wet. Move furniture edges to reach underneath. Allow to dry (approx. 20 min) before walking on it. Approx. 20–30 min.'),

  ('Clean washing machine rubber seal', 30, 2.0, 'regular', 'laundry', '🫧',
   'Pull back the rubber door gasket (the fold-over seal around the drum opening) and wipe out the grime, lint, and mould inside the fold with a cloth dampened with bleach or washing machine cleaner. Wipe dry. Also put a washing machine cleaning tablet in the drum and run an empty hot wash. Approx. 15 min.'),

  ('Deep clean fridge (shelves & trays)', 30, 3.0, 'regular', 'kitchen', '🧊',
   'Remove all items and place perishables in a cool bag. Take out all removable shelves and drawers and wash in the sink with warm soapy water, then dry. Wipe down fridge walls, ceiling, and floor with a damp cloth. Reassemble. Check all returned items — this counts as the weekly spoiled-food check too. Approx. 20–30 min.'),

  ('Clear ice build-up from freezer', 30, 2.0, 'regular', 'kitchen', '❄️',
   'Chip away ice crust on the freezer shelves, around food containers, and along the walls using the back of a spoon — no sharp objects, these damage the coils. Let the ice fall to the base and wipe out with a cloth. This is not a full defrost — just clearing regular build-up. Approx. 10 min.'),

  ('Deep vacuum sofa, chairs & radiators', 30, 3.0, 'regular', 'living_space', '🛋️',
   'Remove sofa cushions and vacuum the frame and all gaps. Vacuum all chairs. Pull the sofa and chairs away from the walls and vacuum behind and underneath. Vacuum the radiators in the living room — they trap a lot of dust that recirculates in the air. Return everything to position. Approx. 25–35 min.'),

  -- 3-month
  ('Deep clean oven', 90, 4.0, 'regular', 'kitchen', '🔥',
   'Apply oven cleaner spray to the interior walls, base, and inside of the glass door. Leave as per product instructions (usually 20–30 min). Scrub off loosened grease with a non-scratch scourer and wipe clean with damp cloths. The glass door often needs the most work. Do not spray near heating elements. Ventilate the kitchen well. If cooking increases (frequent roasts or fry-ups), reduce interval to 8 weeks. Approx. 45–60 min.'),

  ('Defrost freezer', 90, 4.0, 'regular', 'kitchen', '🌡️',
   'Move freezer contents to cool bags with ice packs. Turn the freezer off or switch to defrost mode. Place towels on the floor to catch melt water. Leave the door open and allow ice to melt naturally — do not chip aggressively as this damages the evaporator coils. Once fully melted, wipe the interior dry. Plug back in, wait 30 min for it to reach temperature, then return contents. Total: 2–3 hours, mostly waiting. Best done on a cool day.'),

  -- On demand
  ('Take trash out', null, 1.0, 'on_demand', 'on_demand', '🗑️',
   'When the bin bag is full or beginning to smell, tie the bag shut and take it to the outdoor bin. Replace immediately with a fresh bin bag from the cupboard.'),

  ('Take recycling out', null, 1.0, 'on_demand', 'on_demand', '♻️',
   'When the recycling bin is full, take it out to the outdoor recycling bin. Sort into the correct bins if your outdoor bins are separated by material — check the colour coding on the lids.'),

  ('Empty & clean vacuum dust container', null, 1.0, 'on_demand', 'maintenance', '🫙',
   'When the vacuum''s dust container or full indicator shows it needs emptying, take the vacuum to an outdoor bin or hold a bin bag around the container before opening — emptying it indoors creates a dust cloud. Empty fully, wipe the inside of the container with a dry cloth, and reinsert. This is not the same as the monthly filter wash — this is just emptying collected dust.');


-- ──────────────────────────────────────────────────────────────
-- 2.3  Chore Assignments
-- ──────────────────────────────────────────────────────────────
create table chore_assignments (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id),
  flatmate_id uuid not null references flatmates(id),
  week_start date not null,
  completed boolean default false,
  completed_by uuid references flatmates(id),
  completed_at timestamptz,
  missed boolean default false,
  carry_forward boolean default false,
  created_at timestamptz default now(),
  unique(chore_id, week_start)
);

create index on chore_assignments(week_start);
create index on chore_assignments(flatmate_id);
create index on chore_assignments(missed);


-- ──────────────────────────────────────────────────────────────
-- 2.4  Chore Logs
-- ──────────────────────────────────────────────────────────────
create table chore_logs (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id),
  done_by uuid not null references flatmates(id),
  assigned_to uuid references flatmates(id),
  logged_at timestamptz default now(),
  note text,
  week_start date
);

create index on chore_logs(chore_id, logged_at desc);
create index on chore_logs(done_by);
create index on chore_logs(week_start);


-- ──────────────────────────────────────────────────────────────
-- 2.5  Vacation Periods
-- ──────────────────────────────────────────────────────────────
create table vacation_periods (
  id uuid primary key default gen_random_uuid(),
  flatmate_id uuid not null references flatmates(id),
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),
  check (end_date >= start_date)
);

create index on vacation_periods(flatmate_id);
create index on vacation_periods(start_date, end_date);


-- ──────────────────────────────────────────────────────────────
-- 2.6  Supplies
-- ──────────────────────────────────────────────────────────────
create table supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  status text not null default 'stocked'
    check (status in ('stocked', 'running_low', 'out')),
  icon text default '🧴',
  last_bought_by uuid references flatmates(id),
  last_bought_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

insert into supplies (name, category, icon) values
  -- Cleaning
  ('Dishwasher capsules',             'Cleaning', '🫧'),
  ('Dishwasher rinse aid',            'Cleaning', '💧'),
  ('Dishwasher salt',                 'Cleaning', '🧂'),
  ('Washing-up liquid',               'Cleaning', '🧴'),
  ('Bathroom cleaner',                'Cleaning', '🪣'),
  ('Glass cleaning solution',         'Cleaning', '🪟'),
  ('Bleach',                          'Cleaning', '🧪'),
  ('Oven cleaner spray',              'Cleaning', '🧹'),
  ('Washing machine cleaner tablets', 'Cleaning', '🥁'),
  ('Kettle descaler',                 'Cleaning', '🫖'),
  -- Laundry
  ('Laundry detergent',               'Laundry',  '🧺'),
  ('Fabric softener',                 'Laundry',  '🌸'),
  -- Bathroom
  ('Toilet cleaner',                  'Bathroom', '🚽'),
  ('Toilet paper',                    'Bathroom', '🧻'),
  ('Hand soap',                       'Bathroom', '🧼'),
  -- Kitchen
  ('Baking paper',                    'Kitchen',  '📄'),
  ('Cling film',                      'Kitchen',  '🎁'),
  ('Aluminium foil',                  'Kitchen',  '🪙'),
  ('Washing-up sponges',              'Kitchen',  '🧽'),
  -- General
  ('Kitchen roll',                    'General',  '🗞️'),
  ('Bin bags',                        'General',  '🗑️'),
  ('Lighter gas',                     'General',  '🔥'),
  ('Dehumidifier refills',            'General',  '💨');


-- ──────────────────────────────────────────────────────────────
-- 2.7  Supply Purchase Counts
-- ──────────────────────────────────────────────────────────────
create table supply_purchase_counts (
  supply_id uuid not null references supplies(id),
  flatmate_id uuid not null references flatmates(id),
  purchase_count int not null default 0,
  last_purchased_at timestamptz,
  primary key (supply_id, flatmate_id)
);

insert into supply_purchase_counts (supply_id, flatmate_id, purchase_count)
select s.id, f.id, 0
from supplies s cross join flatmates f;


-- ──────────────────────────────────────────────────────────────
-- 2.8  Supply Logs
-- ──────────────────────────────────────────────────────────────
create table supply_logs (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid not null references supplies(id),
  flatmate_id uuid not null references flatmates(id),
  action text not null check (action in ('bought', 'status_changed')),
  old_status text,
  new_status text,
  logged_at timestamptz default now(),
  note text
);

create index on supply_logs(supply_id, logged_at desc);
create index on supply_logs(flatmate_id);


-- ──────────────────────────────────────────────────────────────
-- 2.9  Push Subscriptions
-- ──────────────────────────────────────────────────────────────
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  flatmate_id uuid not null references flatmates(id) unique,
  onesignal_player_id text not null,
  created_at timestamptz default now()
);


-- ──────────────────────────────────────────────────────────────
-- 2.10  Notification Presets
-- ──────────────────────────────────────────────────────────────
create table notification_presets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'monday_reminder', 'saturday_nudge', 'reassignment',
    'supply_out', 'supply_low', 'motivation',
    'welcome_back', 'carry_forward'
  )),
  template text not null,
  active boolean default true,
  created_at timestamptz default now()
);

insert into notification_presets (type, template) values
  -- Monday reminder
  ('monday_reminder', 'Rise and shine, {{name}}! 🌱 {{chore_count}} chores and {{item_count}} things to pick up this week. You''ve got this.'),
  ('monday_reminder', 'New week, fresh start! {{name}}, your list is ready — {{chore_count}} chores and {{item_count}} items to grab 🛒'),
  ('monday_reminder', 'Hey {{name}}! The house is counting on you this week 🏠 {{chore_count}} chores on deck, plus {{item_count}} things to restock.'),
  ('monday_reminder', 'Monday check-in, {{name}} 👋 {{chore_count}} chores and {{item_count}} shopping items — let''s make it a great week.'),

  -- Saturday nudge
  ('saturday_nudge', 'Psst, {{name}} 👀 The weekend''s here and {{chore_count}} chores are still waiting for you.'),
  ('saturday_nudge', 'Saturday vibes ✨ Don''t forget — {{name}}, you''ve still got {{chore_count}} chores to knock out this week.'),
  ('saturday_nudge', 'Hey {{name}}, the weekend called. It wants your {{chore_count}} chores done 😄'),
  ('saturday_nudge', '{{name}}, quick reminder — {{chore_count}} chores left this week. Sunday''s closer than you think! 🕐'),

  -- Mid-week reassignment
  ('reassignment', '{{leaving_name}} is heading out for {{days_away}} days (back {{return_date}}) 🧳 Some chores have been reshuffled — check your updated list!'),
  ('reassignment', 'Quick heads up — {{leaving_name}} is away for {{days_away}} days. We''ve reassigned their chores. Take a look at your list 🏠'),
  ('reassignment', '{{leaving_name}} is off until {{return_date}}! Their unfinished chores have been redistributed. Check what''s new on your plate 🔄'),

  -- Supply out
  ('supply_out', 'We''re out of {{item_name}}! Time to restock, {{name}} 🛒'),
  ('supply_out', '{{item_name}} is all gone — looks like you''re up, {{name}}! Time for a quick shop 🏪'),
  ('supply_out', 'Last of the {{item_name}} is gone 📦 {{name}}, you''re next in line to grab some!'),

  -- Supply low
  ('supply_low', '{{item_name}} is running low 📦 You''re next to grab it, {{name}}. Worth picking up soon!'),
  ('supply_low', 'Heads up {{name}} — {{item_name}} is almost out. You''re on deck 🧴'),
  ('supply_low', 'Just a nudge: {{item_name}} is running low and you''re up next, {{name}} 🛒'),

  -- Motivation nudge
  ('motivation', '{{logger_name}} just knocked out their chores 💪 Your turn, {{name}}!'),
  ('motivation', 'Heads up {{name}} — {{logger_name}} already checked off their list. Don''t let them have all the fun 🏡'),
  ('motivation', 'Plot twist: {{logger_name}} is done with their chores 🎉 You''ve still got yours, {{name}}. Go get ''em!'),
  ('motivation', '{{logger_name}} is on a roll today 🌀 {{name}}, your chores are still waiting for you!'),

  -- Welcome back
  ('welcome_back', 'Welcome home, {{name}}! 🏠 The house missed you. You''ve got {{chore_count}} chores waiting — no rush, just good to have you back.'),
  ('welcome_back', '{{name}}''s back! 🎉 Hope the trip was great. {{chore_count}} chores are on your plate — you''ve got this!'),
  ('welcome_back', 'Home sweet home, {{name}} 🌿 {{chore_count}} chores lined up whenever you''re ready.'),

  -- Carry forward
  ('carry_forward', 'No stress, {{name}} — {{chore_name}} rolled over from last week. Knock it out when you can 👍'),
  ('carry_forward', '{{chore_name}} from last week is still on your list, {{name}}. You''ve totally got this 🌱'),
  ('carry_forward', 'Little reminder: {{chore_name}} carried over from last week, {{name}}. First chance you get! 🏡');


-- ──────────────────────────────────────────────────────────────
-- 2.11  Notification Log
-- ──────────────────────────────────────────────────────────────
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  flatmate_id uuid not null references flatmates(id),
  notification_type text not null,
  week_start date,
  sent_at timestamptz default now()
);

create index on notification_log(flatmate_id, notification_type, week_start);


-- ──────────────────────────────────────────────────────────────
-- 2.12  Row Level Security
-- ──────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'flatmates','chores','chore_assignments','chore_logs',
    'vacation_periods','supplies','supply_purchase_counts',
    'supply_logs','push_subscriptions',
    'notification_presets','notification_log'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "anon_all" on %I for all to anon using (true) with check (true)', t
    );
  end loop;
end $$;
