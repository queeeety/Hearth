# Hearth

A mobile-first PWA for three flatmates to track household chores and shared supplies. Deployed on GitHub Pages, backed by Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS v3 (iOS design tokens) |
| Routing | React Router v7, `basename="/Hearth"` |
| Data fetching | TanStack React Query v5, `staleTime: 60s` |
| Backend | Supabase (PostgreSQL, PostgREST, Edge Functions) |
| Push notifications | OneSignal Web SDK v16 via `react-onesignal` v3 |
| Hosting | GitHub Pages (`https://queeeety.github.io/Hearth/`) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                      │
│  HomeScreen  AllChoresScreen  AllBuyingsScreen           │
│  MyWorkScreen  MeScreen  VacationScreen                  │
│  LogView (bottom sheet) — FAB + per-screen triggers      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST / Realtime
┌──────────────────────▼──────────────────────────────────┐
│                     Supabase                             │
│  PostgreSQL tables:                                      │
│    flatmates  chores  chore_assignments  chore_logs      │
│    supplies  supply_logs  supply_purchase_counts          │
│    vacation_periods  notification_log  push_subscriptions│
│  Edge Functions (Deno):                                  │
│    send-monday-reminders   send-saturday-nudge           │
│    send-daily-checks       send-event-notification       │
│  RPCs:                                                   │
│    generate_weekly_assignments(week_start)               │
│    reassign_vacation_chores(flatmate_id, week_start)     │
│  pg_cron jobs: Mon 09:00, Sat 10:00, daily 08:00 UTC    │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                    OneSignal                             │
│  Push subscriptions tagged with flatmate_id             │
│  Service worker: queeeety.github.io/OneSignalSDKWorker.js│
└─────────────────────────────────────────────────────────┘
```

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/queeeety/Hearth.git
cd Hearth

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_EIRCODE, VITE_ONESIGNAL_APP_ID

# 4. Start dev server
npm run dev
# Opens at http://localhost:5173/Hearth/
```

> **Note:** Push notifications don't work on localhost — test on the deployed URL.

## Access Control

The app uses an Eircode (SHA-256 hash stored in `VITE_EIRCODE`) as a shared household password. Correct code → flatmate select screen → 7-day session stored in `localStorage`. No user accounts or passwords.

## Adding Chores

1. Go to [Supabase Table Editor](https://supabase.com/dashboard) → `chores` table
2. Insert a row: `name`, `icon` (emoji), `recurrence_days` (7=weekly, 14=biweekly, null=on-demand), `weight` (1–5), `category` (`regular` or `on_demand`)
3. The chore becomes eligible for assignment on the next Monday automatically

## Adding Supplies

1. Go to Supabase Table Editor → `supplies` table
2. Insert a row: `name`, `icon` (emoji), `status` (`stocked`)
3. In `supply_purchase_counts`, insert one row per flatmate for this supply (`purchase_count: 0`)

## Adding Notification Copy Variants

1. Go to Supabase Table Editor → `notification_presets` table
2. Insert a row with `type` (e.g. `monday_reminder`) and your `title` + `body` text
3. New variants are immediately eligible — no redeploy needed

Supported types: `monday_reminder`, `carry_forward`, `saturday_nudge`, `motivation`, `reassignment`, `supply_out`, `supply_low`, `welcome_back`

## Deployment

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

```bash
git push origin main
```

The workflow is in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (safe to expose in browser) |
| `VITE_EIRCODE` | SHA-256 hash of the household eircode |
| `VITE_ONESIGNAL_APP_ID` | OneSignal app ID for push notifications |

Set all four as repository secrets in GitHub → Settings → Secrets → Actions for production builds.
