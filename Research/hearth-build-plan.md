# Hearth — Flatmate Chore & Supplies Tracker
## AI Agent Build Plan · Complete Edition

> **What we're building:** A mobile-friendly web app for 3 flatmates to track household chores and shared supplies. Feels like a native iOS app, runs in any browser, costs nothing to host or maintain.

---

## ⚠️ Pre-Setup Guide — Complete This Before Running the AI Agent

This section is for **Tim to complete manually** before handing the plan to an AI coding agent. Every placeholder marked `[[LIKE THIS]]` must be filled in before the agent starts work.

---

### Pre-Step 1 — GitHub Account & Repository

1. Go to [github.com](https://github.com) and create a free account if you don't have one.
2. Click **New repository**, name it `hearth`, set it to **Public**, and click **Create repository**.
3. On the repo page, go to **Settings → Pages → Source** and set it to **GitHub Actions**.
4. Copy your GitHub username and repo URL.

> Fill in when done:
> - `[[GITHUB_USERNAME]]` — your GitHub username (e.g. `timm`)
> - `[[GITHUB_REPO_URL]]` — full repo URL (e.g. `https://github.com/timm/hearth`)

---

### Pre-Step 2 — Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a name (`hearth`), set a strong database password, pick the **EU West** region (closest to Ireland), and click **Create new project**. Wait ~2 minutes for it to provision.
3. Once ready, go to **Project Settings → API**.
4. Copy the **Project URL**, the **anon/public** key, and the **service_role** key (needed for pg_cron scheduled jobs — keep this secret).

> Fill in when done:
> - `[[SUPABASE_URL]]` — e.g. `https://abcdefgh.supabase.co`
> - `[[SUPABASE_ANON_KEY]]` — the long `eyJ...` string under "anon public"
> - `[[SERVICE_ROLE_KEY]]` — the long `eyJ...` string under "service_role" (**never expose this in frontend code or git**)

---

### Pre-Step 3 — Eircode Hash

Your Eircode is never stored in plain text. Generate a SHA-256 hash of it once, here:

1. Open any modern browser, press **F12** to open DevTools, go to the **Console** tab.
2. Paste and run the following (replace `D02XY45` with your actual Eircode, uppercase, no spaces):
```js
const e = "D02XY45"
const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(e))
console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''))
```
3. Copy the output (a 64-character hex string).

> Fill in when done:
> - `[[EIRCODE_HASH]]` — the 64-character hash string (not your actual Eircode)

---

### Pre-Step 4 — OneSignal Push Notifications

1. Go to [onesignal.com](https://onesignal.com) and create a free account.
2. Click **New App/Website**, name it `Hearth`, select **Web**.
3. Choose **Custom Code** as the integration type.
4. Enter your future GitHub Pages URL as the Site URL: `https://[[GITHUB_USERNAME]].github.io/hearth`
5. Complete setup and go to **Settings → Keys & IDs**.
6. Copy the **App ID** and the **REST API Key**.
7. Download the `OneSignalSDKWorker.js` file from the setup page — you'll place this in the project's `public/` folder.

> Fill in when done:
> - `[[ONESIGNAL_APP_ID]]` — the App ID GUID
> - `[[ONESIGNAL_REST_KEY]]` — the REST API Key

---

### Pre-Step 5 — Flatmate Names & Details

The database seeds 3 flatmates. Replace the placeholders with real names.

> Fill in:
> - `[[FLATMATE_1_NAME]]` — e.g. `Tim`
> - `[[FLATMATE_2_NAME]]` — e.g. `Elaine`
> - `[[FLATMATE_3_NAME]]` — e.g. `Suhail`

---

### Pre-Step 6 — GitHub Repository Secrets

Once the GitHub repo is created and all values above are collected:

1. In your GitHub repo, go to **Settings → Secrets and variables → Actions**.
2. Click **New repository secret** for each of the following:

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `[[SUPABASE_URL]]` |
| `VITE_SUPABASE_ANON_KEY` | `[[SUPABASE_ANON_KEY]]` |
| `VITE_EIRCODE` | `[[EIRCODE_HASH]]` |
| `VITE_ONESIGNAL_APP_ID` | `[[ONESIGNAL_APP_ID]]` |
| `ONESIGNAL_REST_KEY` | `[[ONESIGNAL_REST_KEY]]` |

---

### Pre-Step 7 — Local Development Environment

On your computer, ensure the following are installed:

1. **Node.js** (v20 or later) — download from [nodejs.org](https://nodejs.org), choose LTS version.
2. **Git** — download from [git-scm.com](https://git-scm.com).
3. **Supabase CLI** — required to create, test, and deploy Edge Functions:
   ```bash
   # macOS (Homebrew):
   brew install supabase/tap/supabase

   # Windows / Linux:
   # Download the binary from https://github.com/supabase/cli/releases
   # or use: npm install -g supabase
   ```
4. **VS Code** (optional but recommended) — [code.visualstudio.com](https://code.visualstudio.com).

To verify installation, open Terminal and run:
```bash
node --version      # should print v20.x.x or higher
git --version       # should print git version 2.x
supabase --version  # should print supabase version x.x.x
```

After the project folder is created by the agent, link it to your Supabase project:
```bash
supabase login           # opens browser to authenticate
supabase link --project-ref <your-project-ref>
# Project ref is found in Supabase dashboard → Project Settings → General → Reference ID
```

Add the Supabase secrets needed by Edge Functions:
```bash
supabase secrets set ONESIGNAL_REST_KEY=[[ONESIGNAL_REST_KEY]]
supabase secrets set ONESIGNAL_APP_ID=[[ONESIGNAL_APP_ID]]
```

> Fill in when done:
> - `[[SUPABASE_PROJECT_REF]]` — the Reference ID from Supabase Project Settings → General

---

### Pre-Step 8 — Create Local `.env.local` File

Once the project folder is created by the agent, create a file called `.env.local` in the project root with the following contents (fill in your values):

```
VITE_SUPABASE_URL=[[SUPABASE_URL]]
VITE_SUPABASE_ANON_KEY=[[SUPABASE_ANON_KEY]]
VITE_EIRCODE=[[EIRCODE_HASH]]
VITE_ONESIGNAL_APP_ID=[[ONESIGNAL_APP_ID]]
```

> This file must never be committed to GitHub. The agent will add it to `.gitignore` automatically.

---

## Project Snapshot

| Item | Decision |
|------|----------|
| App name | **Hearth** |
| Frontend | React + Vite |
| Styling | Tailwind CSS (Apple-native visual language) |
| Database & Backend | Supabase (free tier — PostgreSQL + Edge Functions + Cron) |
| Hosting | GitHub Pages via GitHub Actions |
| Push Notifications | OneSignal (free tier) |
| Flatmates | 3 (fixed at launch; new flatmate flow documented separately) |
| Access control | Shared Eircode hash + device session (7 days, localStorage) |
| Design language | iOS Human Interface Guidelines — native-feeling, not Material |

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│               User Devices (3 flatmates)              │
│        Safari / Chrome on iPhone or desktop           │
│                                                        │
│   React + Vite SPA (static files)                     │
│   ├── reads/writes data via Supabase REST API         │
│   ├── real-time updates via Supabase Realtime WS      │
│   └── push notification subscription via OneSignal   │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS REST + WebSocket
                   ▼
┌──────────────────────────────────────────────────────┐
│                     Supabase                          │
│                                                        │
│  ┌────────────────┐   ┌──────────────────────────┐   │
│  │  PostgreSQL DB  │   │     Edge Functions        │   │
│  │                │   │  send-monday-reminders    │   │
│  │  All app data  │   │  (calls OneSignal API)    │   │
│  └────────────────┘   └────────────┬─────────────┘   │
│                                     │                  │
│  ┌─────────────────────────────┐   │                  │
│  │  Scheduled Cron Job         │───┘                  │
│  │  Every Monday 09:00 UTC     │                      │
│  │  → triggers Edge Function   │                      │
│  └─────────────────────────────┘                      │
│                                                        │
│  ┌─────────────────────────────┐                      │
│  │  DB Function                │                      │
│  │  generate_weekly_assignments│                      │
│  │  (called from frontend      │                      │
│  │   on first Monday open)     │                      │
│  └─────────────────────────────┘                      │
└─────────────────────────────┬────────────────────────┘
                               │ REST API call
                               ▼
                     ┌──────────────────┐
                     │    OneSignal     │
                     │  Push Platform  │
                     └────────┬─────────┘
                               │ Web Push
                               ▼
                     Browser Push API
                     (all subscribed devices)

┌──────────────────────────────────────────────────────┐
│                      GitHub                           │
│                                                        │
│  main branch ──push──► GitHub Actions CI/CD          │
│                              │                        │
│                              │ npm build              │
│                              ▼                        │
│                         GitHub Pages                  │
│                    (serves static /dist)              │
│            https://[[GITHUB_USERNAME]].github.io/hearth │
└──────────────────────────────────────────────────────┘

Data flow summary:
  User action → React state → Supabase write → Realtime → other devices update
  Monday 09:00 → Cron → Edge Function → OneSignal → Push notification to devices
  Git push → Actions → Build → GitHub Pages deploy (≈2 min)
```

---

## Page Tree

```
Hearth App
│
├── 🔐 ACCESS GATE (shown when no valid session)
│   ├── Eircode Screen
│   │   └── Single input + "Enter" button
│   │       → on correct code: go to Flatmate Select
│   │       → on wrong code: shake animation + "That doesn't seem right"
│   │
│   └── Flatmate Select Screen
│       └── 3 large tappable profile cards (name + emoji + color)
│           → on tap: save session, enter main app
│
└── 📱 MAIN APP (bottom tab bar: 5 tabs + persistent FAB)
    │
    ├── 🏠 HOME TAB  /
    │   ├── Greeting header ("Good morning/afternoon/evening, Tim")
    │   ├── Week completion ring (% of this week's chores done)
    │   ├── Weekly calendar (7-day strip, dots = chores per day)
    │   ├── Missed chores section (overdue, highlighted in amber)
    │   ├── Upcoming chores (next 3–5 due this week)
    │   ├── Needs attention card (supplies: out + running low)
    │   └── Recently done feed (last 5 logs across all flatmates)
    │
    ├── ✓ ALL CHORES TAB  /chores
    │   ├── Search bar
    │   ├── Chore list (sorted: missed → due soonest → future)
    │   │   └── Each card: icon · name · assigned flatmate initial · due label
    │   │
    │   └── → CHORE DETAIL SCREEN  /chores/:id
    │           ├── Chore name + icon + recurrence info
    │           ├── "Next assigned to" with flatmate avatar
    │           ├── Stats block: scheduled frequency vs actual frequency
    │           ├── Completion history timeline
    │           │   └── [Avatar] Name · note · date
    │           └── "Log this chore" button → opens Log View (prefilled)
    │
    ├── 🛒 ALL BUYINGS TAB  /buyings
    │   ├── Search bar
    │   ├── Supply list (sorted: out → running low → stocked)
    │   │   └── Each card: icon · name · status badge · "Last bought by [avatar]"
    │   │
    │   └── → ITEM DETAIL SCREEN  /buyings/:id
    │           ├── Item name + category
    │           ├── Status selector (Stocked / Running Low / Out)
    │           ├── "I bought this" button → opens Log View (prefilled, type=buying)
    │           ├── Next to buy: flatmate avatar + name
    │           └── Purchase history timeline
    │               └── [Avatar] Name · note · date
    │
    ├── 📋 MY WORK TAB  /my-work
    │   ├── Flatmate switcher (3 avatar pills at top)
    │   ├── "Your chores this week" section
    │   │   └── Chore cards → tap → Log View (prefilled with chore + flatmate)
    │   └── "Your buyings" section
    │       └── Items where this flatmate is next to buy
    │           → tap → Log View (prefilled with item + flatmate, type=buying)
    │
    ├── 👤 ME TAB  /me
    │   ├── Profile card (name + emoji + color ring)
    │   ├── Flatmate switcher
    │   ├── "Recent activity" — last 10 logs by this flatmate
    │   ├── → VACATION MODE SCREEN  /me/vacation
    │   │       ├── "I'm leaving" form (start date + end date)
    │   │       ├── Preview: "You'll miss X chores — they'll be reassigned"
    │   │       ├── Upcoming vacations list (each deletable)
    │   │       └── Save → triggers assignment recalculation
    │   ├── Notifications toggle (enables OneSignal Monday reminders)
    │   └── "Log out of this device" button
    │
    └── ＋ FAB (floating, above tab bar, bottom-right)
            └── → LOG VIEW (bottom sheet modal)
                    ├── Segmented toggle: Chore / Buying
                    ├── Timestamp field (default: current date & time, editable)
                    ├── "Done by" selector (default: current flatmate, switchable)
                    ├── Assigned-to-me list (quick-tap items)
                    ├── Search field (find any chore or supply not in list)
                    ├── Optional note (140 chars, emoji-friendly)
                    └── "Log it" green button
```

---

## Design System Reference

> The agent must follow these values across every component. The goal is an iOS-native feel — clean, calm, familiar to iPhone users.

### Visual Language
- **Model after:** Apple native apps (Health, Reminders, Calendar). Not Material Design. Not Bootstrap.
- **No heavy shadows.** Surfaces are separated by background color contrast, not drop shadows.
- **No gradients.** Flat surfaces only.
- **Generous white space.** Content breathes.
- **Rounded corners everywhere.** Cards, buttons, inputs — nothing is sharp.
- **List cells with hairline separators**, not cards-within-cards for list items.

### Typography
```
Font stack: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif
  → This automatically uses SF Pro on Apple devices, Inter elsewhere.

Sizes (follow iOS type scale):
  34px  Large Title    (screen headers on main tabs, font-weight: 700)
  28px  Title 1        (section titles, font-weight: 700)
  22px  Title 2        (card titles, font-weight: 600)
  17px  Body           (default text, font-weight: 400)
  15px  Subheadline    (secondary info, font-weight: 400)
  13px  Footnote       (metadata, timestamps, font-weight: 400)
  11px  Caption        (badges, labels, font-weight: 500, uppercase + tracking)
```

### Colors
```
--green-primary:   #34C759   (iOS system green — main actions, CTAs)
--green-light:     #E8F7ED   (tinted backgrounds, selected states)
--green-dark:      #248A3D   (pressed states, emphasis)
--bg-primary:      #F2F2F7   (iOS system grouped background)
--bg-secondary:    #FFFFFF   (cards, list backgrounds)
--bg-tertiary:     #F2F2F7   (inset grouped sections)
--text-primary:    #000000   (main text)
--text-secondary:  #3C3C43   at 60% opacity  (#3C3C4399)
--text-tertiary:   #3C3C43   at 30% opacity
--separator:       #3C3C43   at 12% opacity  (hairline dividers)
--fill-quaternary: #74748014 (very subtle fills for inputs)
--amber:           #FF9500   (iOS system orange — running low, missed)
--red:             #FF3B30   (iOS system red — out of stock, errors)
--blue:            #007AFF   (iOS system blue — links, secondary actions)
--label-bg:        #E5E5EA   (pill/badge backgrounds)
```

### Spacing & Shape
```
Base unit: 4px
Common spacings: 8, 12, 16, 20, 24, 32, 48px
Card border radius: 12px (iOS standard grouped card)
Button border radius: 12px (filled) / 9999px (pill)
Input border radius: 10px
List cell height: 44px minimum (iOS tap target standard)
Bottom sheet handle: 4×36px rounded pill, --separator color
```

### iOS-Specific Implementation Notes
```css
/* Safe area insets — critical for phones with home bar / notch */
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);

/* Momentum scrolling on iOS */
-webkit-overflow-scrolling: touch;

/* Prevent text size adjustment on rotation */
-webkit-text-size-adjust: 100%;

/* Remove tap highlight */
-webkit-tap-highlight-color: transparent;
```

### Interaction Patterns
- **Bottom sheets** (not centered modals) for all overlays. Drag handle at top. Drag down to dismiss.
- **Haptic feedback** using `navigator.vibrate(10)` on primary button taps (silently fails on unsupported browsers).
- **Large tap targets** — minimum 44×44px for all interactive elements.
- **Pull-to-refresh** on all list screens using a custom pull handler.
- **Swipe to log** — optional stretch goal: swipe right on a chore card to open Log View for that chore.
- **iOS-style segmented control** for in-screen tab switches (not Material tabs with underline indicator).
- **Spring animations** for modals and transitions using CSS `cubic-bezier(0.34, 1.56, 0.64, 1)`.

---

## Predefined Chore List

> Seeded into the database. Tim can add more via Supabase Table Editor after launch — no code changes needed.
> Icons are emoji stored as text. Change any icon by editing the `icon` field directly in Supabase.

**Weight scale:** 1 = quick (<10 min), 2 = light (10–20 min), 3 = moderate (20–40 min), 4 = heavy (40–60 min), 5 = major (1 hr+)

**Icon approach:** emoji are stored as plain text in the `icon` column. The frontend renders them inline as a `<span>`. No icon library needed for chore/supply icons. Lucide React (already installed) is used only for UI chrome — tab bar icons, chevrons, buttons, etc.

### Weekly Chores (every 7 days)

| Icon | Name | Weight | Room |
|------|------|--------|------|
| 🧹 | Vacuum living room | 2 | living_space |
| ✨ | Change oven foil & light wipe | 1 | kitchen |
| 🧽 | Clean kitchen sink & dish tray | 2 | kitchen |
| 🗄️ | Clear out spoiled fridge items | 1 | kitchen |
| 🪴 | Dust shelves & common surfaces | 2 | living_space |
| 🪑 | Clear & wipe dining table | 1 | living_space |
| 🧺 | Wash kitchen & tea towels | 2 | laundry |
| 🍽️ | Declutter & clean kitchen surfaces | 2 | kitchen |

### Monthly Chores (every 30 days)

| Icon | Name | Weight | Room |
|------|------|--------|------|
| 🌀 | Wash vacuum filters | 2 | maintenance |
| 🪣 | Mop living room & corridor floor | 3 | living_space |
| 🫧 | Clean washing machine rubber seal | 2 | laundry |
| 🧊 | Deep clean fridge (shelves & trays) | 3 | kitchen |
| ❄️ | Clear ice build-up from freezer | 2 | kitchen |
| 🛋️ | Deep vacuum sofa, chairs & radiators | 3 | living_space |

### Every 3 Months (every 90 days)

| Icon | Name | Weight | Room |
|------|------|--------|------|
| 🔥 | Deep clean oven | 4 | kitchen |
| 🌡️ | Defrost freezer | 4 | kitchen |

### On Demand

| Icon | Name | Weight | Room |
|------|------|--------|------|
| 🗑️ | Take trash out | 1 | on_demand |
| ♻️ | Take recycling out | 1 | on_demand |
| 🫙 | Empty & clean vacuum dust container | 1 | maintenance |

---

### Chore Descriptions

The `description` field is shown on the Chore Detail screen. Descriptions must be unambiguous — specific enough that anyone doing the chore for the first time knows exactly what "done" looks like.

```
Vacuum living room
  Vacuum the entire floor including all corners, along the skirting boards, and under
  the coffee table edges. Move the coffee table if needed to reach underneath. Don't skip
  the rug — vacuum both directions. Approx. 10–15 min.

Change oven foil & light wipe
  Discard the old foil from the oven base. Wipe any visible splatter from the oven walls
  with a damp cloth and kitchen spray. Cut a new piece of foil and lay it flat on the oven
  base — do not cover the heating element or vent holes at the back. Approx. 5 min.

Clean kitchen sink & dish tray
  Scrub the sink basin, drain rim, and tap base with kitchen spray and a scourer to remove
  grease and rust stains. Lift the plastic dish drying tray out, scrub both sides under
  hot water, rinse fully, and return it to position. Approx. 10 min.

Clear out spoiled fridge items
  Open the fridge and remove anything past its use-by date, visibly spoiled, or growing
  mould. Check the veggie/crisper drawer — that's where things hide. Dispose in the food
  waste bin. Wipe any obvious spills while you're in there. Approx. 5 min.

Dust shelves & common surfaces
  Using a damp cloth or duster, wipe down: coffee table (top and shelf underneath),
  fireplace mantle, all shelves (books/ornaments can be moved then returned), shoe shelf,
  the router, and the HomePod. Get the tops and fronts of each surface. Approx. 15 min.

Clear & wipe dining table
  Remove everything that doesn't belong on the table — post, bags, chargers, coats — and
  put it where it actually belongs (not the counter or sofa). Wipe the table surface with
  a damp cloth. The table should be completely clear and clean when done. Approx. 5 min.

Wash kitchen & tea towels
  Collect all kitchen towels and tea towels — check the oven door handle, the area by the
  sink, and the kitchen drawer. Wash at 60°C to kill bacteria. Hang or tumble dry. Replace
  with fresh ones immediately so there's always a clean towel available. Approx. 5 min
  active, then machine time.

Declutter & clean kitchen surfaces
  Clear the counters of anything left out that doesn't live there — check near the kettle,
  toaster, and bread bin. Wipe all counter surfaces and the windowsill above the sink with
  kitchen spray, including behind and underneath appliances where possible. Approx. 10 min.

Wash vacuum filters (HEPA/foam filters)
  Remove the HEPA or foam filter(s) from the vacuum — check the vacuum's manual if unsure
  which panel. Rinse under cold running water (no soap, no heat) until the water runs clear.
  Leave to air-dry completely for at least 24 hours before reinserting. Do not use the
  vacuum while the filter is drying. Approx. 10 min active, 24 hr drying.

Mop living room & corridor floor
  Fill a bucket with warm water and floor cleaner. Mop the full hard floor of the living
  room and the corridor/hallway, working from the far end toward the door. Wring the mop
  thoroughly — floors should be damp, not wet. Move furniture edges to reach underneath.
  Allow to dry (approx. 20 min) before walking on it. Approx. 20–30 min.

Clean washing machine rubber seal
  Pull back the rubber door gasket (the fold-over seal around the drum opening) and use a
  damp cloth with a small amount of bleach or washing machine cleaner to wipe out the
  grime, lint, and mould that collects inside the fold. Wipe dry. Also run the drum-clean
  or maintenance cycle if the machine has one — put a washing machine cleaning tablet in
  the drum and run an empty hot wash. Approx. 15 min.

Deep clean fridge (shelves & trays)
  Remove all items and place perishables in a cool bag. Take out all removable shelves and
  drawers and wash in the sink with warm soapy water, then dry. Wipe down fridge walls,
  ceiling, and floor with a damp cloth. Reassemble. Check all returned items — treat this
  as the weekly spoiled-food check too so you don't have to do both that week. Approx.
  20–30 min.

Clear ice build-up from freezer
  Open the freezer and chip away any ice crust that has formed on the shelves, around food
  containers, or along the walls. Use the back of a spoon — do not use a sharp object as
  it can damage the freezer coils. Let the ice fall into the freezer base and wipe out with
  a cloth. This is not a full defrost — just clearing the regular build-up. Approx. 10 min.

Deep vacuum sofa, chairs & radiators
  Remove all sofa cushions and vacuum the sofa frame and all gaps between/under cushions.
  Vacuum all chairs. Pull the sofa and chairs away from the walls and vacuum behind and
  underneath them. Vacuum the radiators in the living room — they trap a lot of dust that
  recirculates in the air. Return everything to position. Approx. 25–35 min.

Deep clean oven (every 12 weeks)
  Apply oven cleaner spray to the interior walls, base, and inside of the glass door.
  Leave to work as per product instructions (usually 20–30 min). Scrub off loosened grease
  with a non-scratch scourer. Wipe clean with damp cloths, rinsing the cloth frequently.
  The glass door often needs the most attention — use a scraper if needed. Do not spray
  near the heating elements. Ventilate the kitchen well while cleaning. Approx. 45–60 min.
  If cooking increases (frequent roasts or fry-ups), move to every 8 weeks.

Defrost freezer (every 12 weeks)
  Move freezer contents into cool bags with ice packs (or a neighbour's freezer). Turn the
  freezer off or switch to defrost mode. Place old towels on the floor to catch melt water.
  Leave the door open and allow ice to melt naturally — do not chip aggressively as this
  can damage the evaporator coils. Once fully melted, wipe the interior dry. Plug back in,
  wait 30 min for it to reach temperature, then return contents. Total: 2–3 hours, mostly
  waiting. Best done on a cool day.

Take trash out
  When the bin bag is full or beginning to smell, tie the bag shut and take it to the
  outdoor bin. Replace immediately with a fresh bin bag from the cupboard.

Take recycling out
  When the recycling bin is full, take it out to the outdoor recycling bin. Sort into the
  correct bins if your outdoor bins are separated by material (check the colour coding).

Empty & clean vacuum dust container
  When the vacuum's dust container or indicator shows it's full, remove the container
  outdoors (or over a bin bag — emptying it indoors creates a dust cloud). Empty fully,
  wipe the inside with a dry cloth, and reinsert. Different from the monthly HEPA filter
  wash — this is just emptying the collected dust.
```

---

## Categories Reference

### Chore Rooms
Used for visual grouping in the All Chores screen and to give context to assignments. Stored in the `room` column of the `chores` table (text, nullable — not used in assignment logic, only for display).

| Room | Description |
|------|-------------|
| `living_space` | Living room, corridor, dining area, common surfaces |
| `kitchen` | Kitchen surfaces, sink, oven, fridge, appliances |
| `laundry` | Washing machine, drying, towels |
| `bathroom` | Toilet, shower, bath, bathroom sink |
| `maintenance` | Vacuum, filters, equipment upkeep |
| `on_demand` | Any chore logged as-needed, no room grouping |

### Supply Categories
Used for visual grouping on the All Buyings screen. Stored in the `category` column of the `supplies` table.

| Category | Description |
|----------|-------------|
| `Cleaning` | Surface sprays, bleach, bathroom/oven cleaners |
| `Kitchen` | Cooking consumables — foil, baking paper, cling film |
| `Laundry` | Detergent, softener, washing machine maintenance |
| `Bathroom` | Toilet paper, hand soap, bathroom-specific items |
| `General` | Bin bags, lighter, misc items that don't fit elsewhere |

---

## Predefined Supplies List

> Seeded into the database. Tim can add more via Supabase Table Editor after launch.

| Icon | Supply | Category |
|------|--------|----------|
| 🫧 | Dishwasher capsules | Cleaning |
| 💧 | Dishwasher rinse aid | Cleaning |
| 🧂 | Dishwasher salt | Cleaning |
| 🧴 | Washing-up liquid | Cleaning |
| 🪣 | Bathroom cleaner | Cleaning |
| 🪟 | Glass cleaning solution | Cleaning |
| 🧪 | Bleach | Cleaning |
| 🧹 | Oven cleaner spray | Cleaning |
| 🥁 | Washing machine cleaner tablets | Cleaning |
| 🫖 | Kettle descaler | Cleaning |
| 🧺 | Laundry detergent | Laundry |
| 🌸 | Fabric softener | Laundry |
| 🚽 | Toilet cleaner | Bathroom |
| 🧻 | Toilet paper | Bathroom |
| 🧼 | Hand soap | Bathroom |
| 📄 | Baking paper | Kitchen |
| 🎁 | Cling film | Kitchen |
| 🪙 | Aluminium foil | Kitchen |
| 🧽 | Washing-up sponges / scourers | Kitchen |
| 🗞️ | Kitchen roll | General |
| 🗑️ | Bin bags | General |
| 🔥 | Lighter gas | General |
| 💨 | Dehumidifier refills | General |

---

## Step 1 — Repository & Environment Setup

**Goal:** A working React + Vite project committed to GitHub, connected to Supabase, ready for development.

### 1.1 Initialize React + Vite Project

```bash
npm create vite@latest hearth -- --template react
cd hearth
npm install
```

Install all dependencies:
```bash
# Core
npm install @supabase/supabase-js react-router-dom @tanstack/react-query

# Utilities
npm install date-fns lucide-react react-onesignal

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.2 Tailwind Configuration

In `tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'", "'Inter'", 'sans-serif'],
      },
      colors: {
        green: {
          primary: '#34C759',
          light: '#E8F7ED',
          dark: '#248A3D',
        },
        ios: {
          bg: '#F2F2F7',
          surface: '#FFFFFF',
          amber: '#FF9500',
          red: '#FF3B30',
          blue: '#007AFF',
          separator: 'rgba(60,60,67,0.12)',
        }
      },
      borderRadius: {
        'ios': '12px',
        'ios-sm': '10px',
      },
      boxShadow: {
        'ios': '0 1px 0 0 rgba(60,60,67,0.12)',
      }
    }
  }
}
```

### 1.3 Create Environment File

Create `.env.local` in the project root:
```
VITE_SUPABASE_URL=[[SUPABASE_URL]]
VITE_SUPABASE_ANON_KEY=[[SUPABASE_ANON_KEY]]
VITE_EIRCODE=[[EIRCODE_HASH]]
VITE_ONESIGNAL_APP_ID=[[ONESIGNAL_APP_ID]]
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

### 1.4 Create Supabase Client

Create `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 1.5 Copy OneSignal Worker File

Place the downloaded `OneSignalSDKWorker.js` file into the `public/` folder. This enables push notifications on the deployed site.

---

## Step 2 — Database Schema

**Goal:** All tables created in Supabase with correct columns, constraints, indexes, and seeded data.

Run all SQL in the Supabase **SQL Editor** (project dashboard → SQL Editor → New query).

### 2.1 Flatmates
```sql
create table flatmates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  avatar_emoji text default '🙂',
  active boolean default true,
  created_at timestamptz default now()
);

insert into flatmates (name, color, avatar_emoji) values
  ('[[FLATMATE_1_NAME]]', '#34C759', '🧑'),
  ('[[FLATMATE_2_NAME]]', '#007AFF', '🧑'),
  ('[[FLATMATE_3_NAME]]', '#FF9500', '🧑');
```

### 2.2 Chores
```sql
create table chores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,           -- step-by-step instructions shown in Chore Detail screen
  recurrence_days int,        -- null = on_demand
  weight numeric(3,1) not null check (weight between 1 and 5),
  category text not null check (category in ('regular', 'on_demand')),
  room text,                  -- display grouping: living_space / kitchen / laundry / bathroom / maintenance / on_demand
  icon text default '🧹',
  active boolean default true,
  created_at timestamptz default now()
);
```
Seed chores with icons, rooms, and descriptions:
```sql
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
```

### 2.3 Chore Assignments
```sql
create table chore_assignments (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id),
  flatmate_id uuid not null references flatmates(id),
  week_start date not null,        -- always a Monday
  completed boolean default false,
  completed_by uuid references flatmates(id),
  completed_at timestamptz,
  missed boolean default false,    -- true if week ended without completion
  carry_forward boolean default false, -- true if this is a carried-over missed chore
  created_at timestamptz default now(),
  unique(chore_id, week_start)
);

create index on chore_assignments(week_start);
create index on chore_assignments(flatmate_id);
create index on chore_assignments(missed);
```

### 2.4 Chore Logs
```sql
create table chore_logs (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id),
  done_by uuid not null references flatmates(id),
  assigned_to uuid references flatmates(id),  -- null for on_demand
  logged_at timestamptz default now(),
  note text,
  week_start date                              -- which week this log belongs to
);

create index on chore_logs(chore_id, logged_at desc);
create index on chore_logs(done_by);
create index on chore_logs(week_start);
```

### 2.5 Vacation Periods
```sql
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
```

### 2.6 Supplies
```sql
create table supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  status text not null default 'stocked'
    check (status in ('stocked', 'running_low', 'out')),
  icon text default '🧴',
  last_bought_by uuid references flatmates(id),   -- flatmate who last purchased
  last_bought_at timestamptz,                     -- timestamp of last purchase
  active boolean default true,
  created_at timestamptz default now()
);
```
Seed supplies with icons:
```sql
insert into supplies (name, category, icon) values
  -- Cleaning
  ('Dishwasher capsules',            'Cleaning', '🫧'),
  ('Dishwasher rinse aid',           'Cleaning', '💧'),
  ('Dishwasher salt',                'Cleaning', '🧂'),
  ('Washing-up liquid',              'Cleaning', '🧴'),
  ('Bathroom cleaner',               'Cleaning', '🪣'),
  ('Glass cleaning solution',        'Cleaning', '🪟'),
  ('Bleach',                         'Cleaning', '🧪'),
  ('Oven cleaner spray',             'Cleaning', '🧹'),
  ('Washing machine cleaner tablets','Cleaning', '🥁'),
  ('Kettle descaler',                'Cleaning', '🫖'),
  -- Laundry
  ('Laundry detergent',              'Laundry',  '🧺'),
  ('Fabric softener',                'Laundry',  '🌸'),
  -- Bathroom
  ('Toilet cleaner',                 'Bathroom', '🚽'),
  ('Toilet paper',                   'Bathroom', '🧻'),
  ('Hand soap',                      'Bathroom', '🧼'),
  -- Kitchen
  ('Baking paper',                   'Kitchen',  '📄'),
  ('Cling film',                     'Kitchen',  '🎁'),
  ('Aluminium foil',                 'Kitchen',  '🪙'),
  ('Washing-up sponges',             'Kitchen',  '🧽'),
  -- General
  ('Kitchen roll',                   'General',  '🗞️'),
  ('Bin bags',                       'General',  '🗑️'),
  ('Lighter gas',                    'General',  '🔥'),
  ('Dehumidifier refills',           'General',  '💨');
```

### 2.7 Supply Purchase Counts
> Tracks how many times each flatmate has bought each supply item. Used to determine "next buyer" via lowest-count logic.
```sql
create table supply_purchase_counts (
  supply_id uuid not null references supplies(id),
  flatmate_id uuid not null references flatmates(id),
  purchase_count int not null default 0,
  last_purchased_at timestamptz,
  primary key (supply_id, flatmate_id)
);

-- Initialize counts to 0 for all flatmate × supply combinations after seeding:
insert into supply_purchase_counts (supply_id, flatmate_id, purchase_count)
select s.id, f.id, 0
from supplies s cross join flatmates f;
```

### 2.8 Supply Logs
```sql
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
```

### 2.9 Push Subscriptions
```sql
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  flatmate_id uuid not null references flatmates(id) unique,  -- one subscription per flatmate; required by upsert onConflict
  onesignal_player_id text not null,
  created_at timestamptz default now()
);
```

### 2.10 Notification Presets

> Stores all push notification copy variants per type. Tim can add new variants anytime via the Supabase Table Editor — no code changes needed.

```sql
create table notification_presets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'monday_reminder', 'saturday_nudge', 'reassignment',
    'supply_out', 'supply_low', 'motivation',
    'welcome_back', 'carry_forward'
  )),
  template text not null,
  -- Template tokens by type:
  -- monday_reminder:  {{name}}, {{chore_count}}, {{item_count}}
  -- saturday_nudge:   {{name}}, {{chore_count}}
  -- reassignment:     {{leaving_name}}, {{days_away}}, {{return_date}}
  -- supply_out:       {{name}}, {{item_name}}
  -- supply_low:       {{name}}, {{item_name}}
  -- motivation:       {{name}}, {{logger_name}}
  -- welcome_back:     {{name}}, {{chore_count}}
  -- carry_forward:    {{name}}, {{chore_name}}
  active boolean default true,
  created_at timestamptz default now()
);

-- ⚠️ Future expansion note: the CHECK constraint on `type` must be updated with ALTER TABLE
-- if a new notification type is ever added. Example:
--   ALTER TABLE notification_presets DROP CONSTRAINT notification_presets_type_check;
--   ALTER TABLE notification_presets ADD CONSTRAINT notification_presets_type_check
--     CHECK (type IN ('monday_reminder', 'saturday_nudge', ..., 'your_new_type'));
-- Document any new type's template tokens in the column comment above.

-- Seed: 3–4 variants per type (Duolingo-style — friendly, warm, a little playful)
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
```

### 2.11 Notification Log

> Tracks sent notifications to enforce per-week limits (e.g. motivation nudge: max 1 per person per week).

```sql
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  flatmate_id uuid not null references flatmates(id),
  notification_type text not null,
  week_start date,             -- for weekly-limited types; null for one-off events
  sent_at timestamptz default now()
);

create index on notification_log(flatmate_id, notification_type, week_start);
```

### 2.12 Row Level Security

Enable RLS on all tables and allow full anon access (access control is handled client-side via Eircode):

```sql
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
```

---

## Step 3 — Access Control

**Goal:** Eircode gate + flatmate identity selection + 7-day device session.

### 3.1 Session Flow
1. App loads → check `localStorage` for `hearth_session`
2. If missing or expired → show **Eircode Screen**
3. Eircode entered → SHA-256 hash compared to `VITE_EIRCODE` env var
4. If match → show **Flatmate Select Screen** (3 profile cards)
5. Flatmate selected → save session to `localStorage` with 7-day expiry
6. If session valid → skip gate, enter app directly

### 3.2 `src/lib/auth.js`
```js
import { SESSION_DURATION_MS, SESSION_STORAGE_KEY } from '../constants'

export async function hashInput(input) {
  const normalized = input.toUpperCase().replace(/\s/g, '')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_STORAGE_KEY); return null }
    return s  // { flatmateId, flatmateName, flatmateColor, flatmateEmoji, expiresAt }
  } catch { return null }
}

export function saveSession(flatmate) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    flatmateId: flatmate.id,
    flatmateName: flatmate.name,
    flatmateColor: flatmate.color,
    flatmateEmoji: flatmate.avatar_emoji,
    expiresAt: Date.now() + SESSION_DURATION_MS
  }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
```

### 3.3 SessionContext
`src/contexts/SessionContext.jsx` provides `{ flatmate, setFlatmate, isAuthenticated, logout }` globally. The `SessionGate` wrapper component renders the auth screens when `!isAuthenticated`.

### 3.4 Flatmate Switching
From **Me** tab or **My Work** tab: user taps a different flatmate avatar → calls `setFlatmate(newFlatmate)` which updates the session in localStorage and context without requiring re-entry of Eircode.

Full logout (returns to Eircode screen): calls `clearSession()` then redirects to `/`.

---

## Step 4 — Chore Assignment Algorithm

**Goal:** Fair weekly chore distribution using effort-weight balancing, vacation skipping, and missed-chore carry-forward.

### 4.1 Core Concepts

**Effort Balance:** Per flatmate, sum of `weight` values of all chore assignments over a rolling 28-day window. The flatmate with the lowest balance gets the next chore assigned.

**Chore Due Logic:** A chore is "due this week" if no `chore_log` entry exists for it within the last `recurrence_days` days.

**Vacation Skip Rule:** For a given chore and flatmate, calculate how many days of the current week (Mon–Sun) overlap with any vacation period. If `vacation_overlap_days >= chore.recurrence_days`, exclude that flatmate from consideration for this chore this week.

**Missed Chore Carry-Forward:**
- Each Sunday night (or on first app open of the new week), a check marks any incomplete assignments from last week as `missed = true`.
- For each missed assignment, the algorithm adds a `carry_forward = true` assignment to the new week for the same flatmate — overriding the normal balance calculation.
- A chore is only carried forward **once**. If missed twice in a row, the second week gets a normal balanced assignment and both misses are recorded in stats.

### 4.2 Main Assignment Function (Supabase SQL)

```sql
create or replace function generate_weekly_assignments(p_week_start date)
returns void language plpgsql as $$
declare
  v_chore record;
  v_flatmate record;
  v_best_id uuid;
  v_min_balance numeric;
  v_balance numeric;
  v_vacation_days int;
  v_week_end date;
  v_carry_flatmate_id uuid;
begin
  v_week_end := p_week_start + interval '6 days';

  -- Skip if already generated
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
    -- Check if chore is due this week
    if exists (
      select 1 from chore_logs
      where chore_id = v_chore.id
        and logged_at >= (p_week_start - (v_chore.recurrence_days || ' days')::interval)
    ) then
      continue;  -- not due yet
    end if;

    -- Check if this is a carry-forward case (same flatmate missed it last week)
    select ca.flatmate_id into v_carry_flatmate_id
    from chore_assignments ca
    where ca.chore_id = v_chore.id
      and ca.week_start = p_week_start - interval '7 days'
      and ca.missed = true
      and ca.carry_forward = false  -- only carry forward once
    limit 1;

    if v_carry_flatmate_id is not null then
      -- Carry forward: assign to same person unless they are on vacation
      select coalesce(sum(
        least(end_date, v_week_end) - greatest(start_date, p_week_start) + 1
      ), 0) into v_vacation_days
      from vacation_periods
      where flatmate_id = v_carry_flatmate_id
        and start_date <= v_week_end and end_date >= p_week_start;

      if v_vacation_days < v_chore.recurrence_days then
        insert into chore_assignments (chore_id, flatmate_id, week_start, carry_forward)
        values (v_chore.id, v_carry_flatmate_id, p_week_start, true);

        -- Mark the previous missed assignment as having been carried
        update chore_assignments set carry_forward = true
        where chore_id = v_chore.id
          and week_start = p_week_start - interval '7 days'
          and missed = true;

        continue;
      end if;
      -- If on vacation, fall through to normal assignment below
    end if;

    -- Normal assignment: find flatmate with lowest effort balance
    v_min_balance := 999999;
    v_best_id := null;

    for v_flatmate in select * from flatmates where active = true order by random() loop

      -- Vacation overlap days this week
      select coalesce(sum(
        least(end_date, v_week_end) - greatest(start_date, p_week_start) + 1
      ), 0) into v_vacation_days
      from vacation_periods
      where flatmate_id = v_flatmate.id
        and start_date <= v_week_end and end_date >= p_week_start;

      if v_vacation_days >= v_chore.recurrence_days then continue; end if;

      -- Effort balance: sum of weights assigned over last 28 days
      -- Adjusted down proportionally for vacation time during that window
      select coalesce(sum(c.weight), 0) into v_balance
      from chore_assignments ca
      join chores c on c.id = ca.chore_id
      where ca.flatmate_id = v_flatmate.id
        and ca.week_start >= (p_week_start - interval '28 days');

      v_balance := v_balance * (1 - (v_vacation_days::numeric / 28));

      if v_balance < v_min_balance then
        v_min_balance := v_balance;
        v_best_id := v_flatmate.id;
      end if;
    end loop;

    if v_best_id is not null then
      insert into chore_assignments (chore_id, flatmate_id, week_start)
      values (v_chore.id, v_best_id, p_week_start);
    end if;

  end loop;
end; $$;
```

### 4.3 Triggering from Frontend

In `src/lib/chores.js`:
```js
import { format, startOfWeek } from 'date-fns'
import { supabase } from './supabase'
import { ASSIGNMENTS_STORAGE_KEY_PREFIX } from '../constants'

export async function ensureWeeklyAssignments() {
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const storageKey = ASSIGNMENTS_STORAGE_KEY_PREFIX + weekStart
  if (localStorage.getItem(storageKey)) return  // already run this week on this device
  await supabase.rpc('generate_weekly_assignments', { p_week_start: weekStart })
  localStorage.setItem(storageKey, '1')
}
```

Call `ensureWeeklyAssignments()` in the app root on every mount.

### 4.4 Logging a Chore Done by a Non-Assigned Flatmate

When flatmate A logs a chore assigned to flatmate B:
1. Insert into `chore_logs`: `done_by = A`, `assigned_to = B`, `week_start = getThisMonday()`, `logged_at = selected timestamp`
2. Update `chore_assignments` for this week: `completed = true`, `completed_by = A`, `completed_at = now()`
3. The algorithm naturally corrects next week: A's effort balance increases, B's stays lower.
4. Assignments for the current week are never retroactively changed.

> **`week_start` population rule:** Always set to the Monday of the week in which the `logged_at` timestamp falls — not necessarily today's week. Example: if a flatmate logs a chore with timestamp "yesterday" and yesterday was in last week, `week_start` should be last week's Monday. Use `startOfWeek(loggedAt, { weekStartsOn: 1 })` from `date-fns`.

### 4.5 Mid-Week Vacation Reassignment

When a flatmate saves a vacation with `start_date` within the current week, the app must reassign their incomplete chores. This **cannot** use `generate_weekly_assignments` — its idempotency guard (`if exists … return`) will abort immediately since the week already has assignments. A dedicated function handles this case instead.

```sql
create or replace function reassign_vacation_chores(
  p_flatmate_id uuid,
  p_week_start date
)
returns void language plpgsql as $$
declare
  v_assignment record;
  v_flatmate   record;   -- iterator for flatmate loop
  v_best_id uuid;
  v_min_balance numeric;
  v_balance numeric;
  v_vacation_days int;
  v_week_end date;
begin
  v_week_end := p_week_start + interval '6 days';

  -- Loop over this flatmate's incomplete assignments for the current week
  for v_assignment in
    select ca.*, c.weight, c.recurrence_days
    from chore_assignments ca
    join chores c on c.id = ca.chore_id
    where ca.flatmate_id = p_flatmate_id
      and ca.week_start = p_week_start
      and ca.completed = false
  loop
    v_min_balance := 999999;
    v_best_id := null;

    -- Find best available flatmate (excluding the vacationing one)
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
        v_best_id := v_flatmate.id;
      end if;
    end loop;

    -- Reassign to best available flatmate
    if v_best_id is not null then
      update chore_assignments
      set flatmate_id = v_best_id
      where id = v_assignment.id;
    end if;
    -- If no one available (e.g. all on vacation), leave as unassigned (flatmate_id stays,
    -- but a future improvement could set a nullable flatmate_id + 'unassigned' flag)

  end loop;
end; $$;
```

**Frontend call** (in `VacationScreen.jsx`, after saving a vacation that starts this week):
```js
const isThisWeek = isWithinInterval(parseISO(startDate), { start: thisMonday, end: thisSunday })
if (isThisWeek) {
  await supabase.rpc('reassign_vacation_chores', {
    p_flatmate_id: currentFlatmate.id,
    p_week_start: thisWeekStart
  })
  // Then fire the reassignment notification
  await supabase.functions.invoke('send-event-notification', {
    body: { type: 'reassignment', data: { leaving_flatmate_id: currentFlatmate.id, start_date: startDate, end_date: endDate } }
  })
}
```

### 4.6 Adding a New Flatmate

When a 4th person moves in (handled via Supabase Table Editor — no UI needed):
1. Insert the new flatmate row into `flatmates`.
2. Insert their `supply_purchase_counts` rows initialized to `min(existing counts per item)`.
3. For chore balance: set their virtual effort by inserting synthetic `chore_assignments` rows totaling the group average weight for the past 4 weeks. This prevents them from being given every chore their first week.

> Document this procedure in a comment in the `flatmates` table description in Supabase.

---

## Step 5 — Supply ("Buying") Assignment Logic

**Goal:** Fair per-item round-robin for shared supplies, based on purchase count with vacation awareness.

### 5.1 How It Works

For each supply item, the "next buyer" is determined by:
1. Find the flatmate(s) with the **lowest purchase count** for that item (`supply_purchase_counts.purchase_count`).
2. If tied, pick whoever has the **oldest `last_purchased_at`** (or null, treated as the oldest).
3. If that flatmate is currently **on vacation**, skip to the next eligible flatmate.

This means if Tim buys dishwasher capsules 3 times in a row (on sale), his count is 3 while Elaine and Suhail are at 1 — so they both get turns before Tim is "next" again.

### 5.2 "Next Buyer" Database Function

```sql
create or replace function get_next_buyer(p_supply_id uuid)
returns uuid language plpgsql as $$
declare
  v_today date := current_date;
  v_result uuid;
begin
  select spc.flatmate_id into v_result
  from supply_purchase_counts spc
  join flatmates f on f.id = spc.flatmate_id
  where spc.supply_id = p_supply_id
    and f.active = true
    -- Exclude flatmates currently on vacation
    and not exists (
      select 1 from vacation_periods vp
      where vp.flatmate_id = spc.flatmate_id
        and vp.start_date <= v_today
        and vp.end_date >= v_today
    )
  order by spc.purchase_count asc, spc.last_purchased_at asc nulls first
  limit 1;

  return v_result;
end; $$;
```

### 5.3 Logging a Purchase

When a flatmate marks a supply as bought:
1. Insert into `supply_logs`: `action = 'bought'`, `flatmate_id = current_flatmate`
2. Update `supplies`: `status = 'stocked'`, `last_bought_by = flatmate_id`, `last_bought_at = now()`
3. Upsert `supply_purchase_counts` using **increment-on-conflict** — a plain upsert would reset the count to 0:
```sql
insert into supply_purchase_counts (supply_id, flatmate_id, purchase_count, last_purchased_at)
values (p_supply_id, p_flatmate_id, 1, now())
on conflict (supply_id, flatmate_id) do update
  set purchase_count    = supply_purchase_counts.purchase_count + 1,
      last_purchased_at = now();
```
In the frontend (via Supabase JS), call this as a raw RPC or use the equivalent `supabase.rpc('increment_purchase_count', { p_supply_id, p_flatmate_id })`. Create the corresponding DB function in Step 2 alongside the other schema SQL:
```sql
create or replace function increment_purchase_count(p_supply_id uuid, p_flatmate_id uuid)
returns void language sql as $$
  insert into supply_purchase_counts (supply_id, flatmate_id, purchase_count, last_purchased_at)
  values (p_supply_id, p_flatmate_id, 1, now())
  on conflict (supply_id, flatmate_id) do update
    set purchase_count    = supply_purchase_counts.purchase_count + 1,
        last_purchased_at = now();
$$;
```

### 5.4 Updating Supply Status (without purchase)

When a flatmate changes status without buying (e.g., marks "running low"):
1. Insert into `supply_logs`: `action = 'status_changed'`, `old_status`, `new_status`
2. Update `supplies.status`
3. Do NOT touch `supply_purchase_counts` — no purchase occurred.

---

## Step 6 — Frontend Architecture

### 6.1 Folder Structure
```
src/
├── lib/
│   ├── supabase.js           # Supabase client singleton
│   ├── auth.js               # Eircode hashing + session helpers
│   ├── chores.js             # Chore queries, ensureWeeklyAssignments, log helpers
│   ├── supplies.js           # Supply queries, purchase logic, status update helpers
│   ├── notifications.js      # Frontend notification helpers (invoke Edge Functions)
│   └── utils.js              # Date helpers (getThisMonday, formatTimeAgo), constants
├── constants/
│   └── index.js              # App-wide constants: query keys, notification types,
│                             #   supply statuses, chore categories, route paths
├── types/
│   └── index.js              # JSDoc @typedef definitions for all data shapes (Step 19.3)
├── contexts/
│   ├── SessionContext.jsx    # Current flatmate identity + isAuthenticated
│   └── ErrorContext.jsx      # Global error state for ErrorBanner; provides setError()
├── hooks/
│   ├── useChores.js          # React Query hooks: useAssignments, useChoreHistory, etc.
│   ├── useSupplies.js        # React Query hooks: useSupplies, useNextBuyer, etc.
│   ├── useFlatmates.js       # React Query hook: useFlatmates
│   ├── useNotifications.js  # Notification permission state + subscribe/unsubscribe
│   └── useRealtimeSync.js   # Supabase Realtime subscriptions → React Query invalidation
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx      # Wraps all main screens; renders BottomNav + FAB
│   │   ├── BottomNav.jsx     # 5-tab bottom navigation bar
│   │   ├── FAB.jsx           # Floating action button (opens LogView)
│   │   └── PageHeader.jsx    # Large iOS-style collapsing screen title
│   ├── ui/
│   │   ├── Avatar.jsx        # Colored circle + emoji; sizes: sm / md / lg
│   │   ├── Badge.jsx         # Status pill: stocked / running_low / out
│   │   ├── BottomSheet.jsx   # Reusable bottom sheet with drag handle + dismiss
│   │   ├── SegmentedControl.jsx  # iOS-style segmented toggle
│   │   ├── ListCell.jsx      # iOS-style row: left slot · content · right slot + separator
│   │   ├── SearchBar.jsx     # iOS-style search input with clear (×) button
│   │   ├── FlatmateSwitcher.jsx  # Row of 3 avatar pills for identity switching
│   │   ├── EmptyState.jsx    # Centered icon + heading + body for empty lists
│   │   ├── ErrorBanner.jsx   # Non-blocking top banner for network/fetch errors
│   │   └── PullToRefresh.jsx # Pull-to-refresh gesture + spinner wrapper
│   ├── log/
│   │   └── LogView.jsx       # Log chore/buying bottom sheet (Step 15 spec)
│   ├── chores/
│   │   ├── ChoreCard.jsx     # Card used in All Chores list
│   │   ├── AssignmentCard.jsx  # Card used in My Work (tap → prefills LogView)
│   │   └── WeekCalendarStrip.jsx  # 7-day strip with assignment dots for Home
│   ├── supplies/
│   │   ├── SupplyCard.jsx    # Card used in All Buyings list
│   │   └── StatusSelector.jsx  # 3-button status picker (Stocked / Low / Out)
│   └── stats/
│       ├── CompletionRing.jsx  # SVG donut ring showing % complete for Home
│       └── ActivityFeed.jsx  # "Recently done" timeline feed for Home
├── screens/
│   ├── auth/
│   │   ├── EircodeScreen.jsx
│   │   └── FlatmateSelectScreen.jsx
│   ├── HomeScreen.jsx
│   ├── AllChoresScreen.jsx
│   ├── ChoreDetailScreen.jsx
│   ├── AllBuyingsScreen.jsx
│   ├── ItemDetailScreen.jsx
│   ├── MyWorkScreen.jsx
│   ├── MeScreen.jsx
│   └── VacationScreen.jsx
├── App.jsx                   # Root: providers + router + OneSignal init
├── main.jsx                  # Vite entry point
└── index.css                 # Tailwind base directives + global resets
```

### 6.2 Routing

```jsx
// App.jsx
<SessionProvider>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/hearth">
      <SessionGate>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/chores" element={<AllChoresScreen />} />
            <Route path="/chores/:id" element={<ChoreDetailScreen />} />
            <Route path="/buyings" element={<AllBuyingsScreen />} />
            <Route path="/buyings/:id" element={<ItemDetailScreen />} />
            <Route path="/my-work" element={<MyWorkScreen />} />
            <Route path="/me" element={<MeScreen />} />
            <Route path="/me/vacation" element={<VacationScreen />} />
          </Routes>
        </AppShell>
      </SessionGate>
    </BrowserRouter>
  </QueryClientProvider>
</SessionProvider>
```

### 6.3 Data Fetching Strategy
- **React Query** for all Supabase reads. Set `staleTime: 60_000` (1 min) and `refetchOnWindowFocus: true`.
- **Supabase Realtime** subscriptions for `chore_logs` and `supply_logs` so all devices see updates without manual refresh.
- **Optimistic updates** for log actions: immediately reflect the logged chore as "completed" in the UI before the server confirms.

### 6.4 Realtime Subscription Implementation

Set up in `App.jsx` after the session is confirmed, and tear down on unmount:

```js
// src/hooks/useRealtimeSync.js
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { QUERY_KEYS } from '../constants'

export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('hearth-sync')
      // Someone logged a chore → invalidate chore data on all devices
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chore_logs' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHORE_LOGS] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
        }
      )
      // Supply status changed or purchase logged → invalidate supply data
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'supply_logs' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'supplies' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
      )
      // Assignment changed (e.g. vacation reassignment) → invalidate assignment data
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chore_assignments' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])
}
```

Call `useRealtimeSync()` inside `AppShell.jsx` (only runs when the app shell is mounted, i.e. after authentication).

All query key strings live in `src/constants/index.js` — see the canonical definition in Step 19.4 (which includes `NEXT_BUYER`).

---

## Step 7 — Home Screen

**Layout (top to bottom):**

1. **Header:** Time-of-day greeting + flatmate name · today's date in `EEEE, d MMM` format. Gear icon (⚙️) top-right links to `/me`.
   - 05:00–11:59 → "Good morning, Tim 🌅"
   - 12:00–17:59 → "Good afternoon, Tim ☀️"
   - 18:00–04:59 → "Good evening, Tim 🌙"

2. **Week Completion Ring:** Large centered SVG donut. Shows percentage of all this-week assignments that are marked complete. Label inside: `"67% done"`. Below ring: `"4 of 6 chores this week"`. Color transitions: 0–49% = amber, 50–89% = primary green, 90–100% = bright green.

3. **Weekly Calendar Strip:** 7 day pills (Mon–Sun). Each pill shows the day number. Active day = filled green. Days with assignments = small green dot beneath. Tapping a day is decorative only (no navigation) — it's an overview, not a planner.

4. **Missed Chores Section** (only shown if misses exist): Section header "⚠️ Missed last week" in amber. List of cards showing the missed chore, original assignee avatar, and a "Log it now" button that opens the Log View prefilled.

5. **Upcoming Chores:** Section header "This week". Compact list of the 5 most-pressing incomplete assignments (any flatmate). Each row: flatmate avatar · chore name · due indicator. Tapping opens Chore Detail.

6. **Needs Attention Card:** Shown only if ≥1 supply is `out` or `running_low`. A tappable card with a list of affected items and their status badges. Tapping navigates to `/buyings`.

7. **Recently Done Feed:** Always shown. Section header "Recently done". Last 5 `chore_logs` entries across all flatmates, in reverse chronological order. Each row: flatmate avatar (colored circle + emoji) · chore name · time ago label (e.g. "2 hours ago", "Yesterday"). This is the household's social pulse — no actions, read-only, encourages awareness without making it competitive. If no logs exist yet (first week), show a friendly empty state: "Nothing logged yet — be the first! 🏠".

---

## Step 8 — All Chores Screen

**Layout:**

1. **Large title:** "Chores" (iOS large title style, collapses on scroll)
2. **Search bar** (iOS-style, sticky below title)
3. **Sorted list** of all active chores:
   - **Section 1 — Missed:** Red background tint, "Missed" label
   - **Section 2 — Due this week:** Normal cards
   - **Section 3 — Coming up:** Muted cards, shows "in X days"
   - **Section 4 — On demand:** Separate section, no due date
4. Each **ChoreCard** shows:
   - Left: chore icon
   - Center: chore name + due label
   - Right: flatmate initial in a colored circle (the assigned flatmate)
   - Chevron `›` to indicate tappable
5. Tapping navigates to `/chores/:id`

---

## Step 9 — Chore Detail Screen

**Navigation:** Back button returns to All Chores. Title = chore name.

**Layout:**

1. **Chore header card:** icon · name · `Recurrence: every X days` · `Effort: ●●●○○`
2. **Next assigned to:** Flatmate avatar + name. If current week's assignment exists, show its completion status.
3. **Stats block** (iOS grouped card style):
   - Scheduled: every `X` days
   - Average actual interval: calculated from `chore_logs` history
   - Times done this month / this year
4. **"Log this chore" button:** Opens Log View (bottom sheet) pre-filled with this chore. No auto-logging — always goes through Log View so the user can confirm or change details.
5. **History timeline:** Chronological list of `chore_logs` entries for this chore. Each row: flatmate avatar · name · optional note · date. Oldest at bottom, newest at top.

---

## Step 10 — All Buyings Screen

**Layout:**

1. **Large title:** "Supplies"
2. **Search bar** (sticky)
3. **Sorted list** by status, then alphabetical within each status group:
   - **Section 1 — Out 🔴:** `status = 'out'`
   - **Section 2 — Running Low 🟡:** `status = 'running_low'`
   - **Section 3 — Stocked 🟢:** `status = 'stocked'`
4. Each **SupplyCard** shows:
   - Left: supply icon
   - Center: supply name · "Last bought by [name] · X days ago"
   - Right: status badge + chevron
5. Tapping navigates to `/buyings/:id`

---

## Step 11 — Item Detail Screen

**Navigation:** Back button returns to All Buyings. Title = item name.

**Layout:**

1. **Status selector:** Three large buttons — "Stocked 🟢" · "Running Low 🟡" · "Out 🔴". Currently active status is highlighted. Tapping a different status immediately updates with a confirmation haptic.
2. **Next to buy:** Flatmate avatar + name (from `get_next_buyer()` function). Label: "Up next to buy".
3. **"I bought this" button:** Opens Log View pre-filled with this supply item, type = buying, `done_by` = current flatmate.
4. **Purchase history timeline:** All `supply_logs` entries with `action = 'bought'` for this item. Each row: flatmate avatar · name · optional note · date.

---

## Step 12 — My Work Screen

**Layout:**

1. **Flatmate switcher:** Three avatar pills at top. Active flatmate is highlighted. Switching changes the entire screen's content.
2. **"Your chores this week" section:**
   - Lists all `chore_assignments` for the selected flatmate for the current week
   - Completed chores shown with strikethrough + green check
   - Incomplete chores shown as tappable cards → opens Log View pre-filled with chore + selected flatmate
   - If carry_forward assignment exists, show a subtle "carried over from last week" label
3. **"Your buyings" section:**
   - Lists all supply items where the selected flatmate is `get_next_buyer()` result
   - Each row: supply name · status badge · "You're up next"
   - Tapping opens Log View pre-filled with supply item + selected flatmate, type = buying

---

## Step 13 — Me Screen

**Layout:**

1. **Profile card:** Large avatar emoji in a colored circle · flatmate name · "Member since [date]"
2. **Flatmate switcher:** Same 3-avatar pill row as My Work. Switching changes the profile view.
3. **"Your recent activity":** Last 10 `chore_logs` and `supply_logs` entries for this flatmate. Mixed timeline. Each row: action description · date. Example: "Vacuumed living room · 2 days ago", "Bought toilet paper · 5 days ago".
4. **Vacation Mode row:** iOS list cell with chevron → navigates to `/me/vacation`
5. **Notifications row:** Toggle cell. On enable: request permission + register with OneSignal + save player ID to `push_subscriptions`.
6. **"Switch profile" row:** Clears flatmate from session (keeps Eircode verified), returns to Flatmate Select Screen.
7. **"Log out of this device" row:** Red text. Clears full session, returns to Eircode Screen.

---

## Step 14 — Vacation Mode Screen

**Navigation:** Back to Me. Title: "Vacation Mode".

**Layout:**

1. **"I'm leaving" form:**
   - Start date picker (iOS-style inline wheel or calendar, defaults to today)
   - End date picker (defaults to today + 3 days)
   - Dynamic preview label: "You'll be away for **5 days**. Weekly chores (≤5 day recurrence) will be reassigned. Bi-weekly or longer chores stay assigned."
   - "Save vacation" green button → inserts into `vacation_periods`, then:
     - If `start_date` is within the **current week**: calls `reassign_vacation_chores(flatmate_id, thisWeekStart)` (mid-week reassignment — Step 4.5), then invokes the `reassignment` push notification to all flatmates.
     - Future weeks: no extra call needed — `generate_weekly_assignments` runs each Monday and naturally excludes flatmates on vacation at that time.
2. **"Upcoming vacations" list:** All future `vacation_periods` for this flatmate. Each row: date range · "X days". Swipe-to-delete (calls `DELETE` on that row). No reassignment logic runs on delete — any chores already redistributed by `reassign_vacation_chores` stay with their new assignee. This is by design: mid-week chore swaps are not reversed when a vacation is cancelled.
3. **No past vacations shown** (no value in displaying historical ones).

---

## Step 15 — Log View (Bottom Sheet)

**Trigger:** FAB button, "Log this chore" on Chore Detail, chore tap in My Work, "I bought this" on Item Detail.

**Component: `BottomSheet` wrapping a `LogView` form.**

**Layout:**

1. **Drag handle** at top (decorative — drag down to close)
2. **Segmented control:** `Chore` | `Buying`
3. **"Done by" selector:** Row of 3 flatmate avatar pills. Defaults to current session flatmate. Tap to change.
4. **Timestamp field:** Shows `"Today, HH:MM"`. Tapping opens an inline date+time picker. Defaults to now. Allows setting to any past date/time (for "forgot to log yesterday" case). Does not allow future timestamps.
5. **Assignment list:** Shows items assigned to the selected "done by" flatmate. Filtered by type (chore or buying). Tappable — tap to select. Shows a checkmark on the selected item.
   - If arriving from a pre-fill context (Chore Detail, My Work tap), the relevant item is pre-selected and highlighted.
6. **Search field:** Below the assignment list. Type to search all chores (or all supplies) — not just assigned ones. Results appear inline as you type. Select from results to log something not assigned.
7. **Note field:** Optional. Placeholder: "Add a note… (optional)". 140 char limit. Emoji keyboard triggers naturally on mobile.
8. **"Log it" button:** Disabled until an item is selected. On tap: calls the appropriate log function, shows a brief green success animation, closes the sheet.

---

## Step 16 — Push Notifications

**Provider:** OneSignal (free tier, unlimited notifications).
**Copy:** All message text lives in the `notification_presets` table — one variant is selected at random per send. Tim can add new variants in Supabase at any time without touching code.

---

### 16.1 Frontend Initialisation

`react-onesignal` v2+ wraps the OneSignal Web SDK v16 which has a **different API** from v1. All code here uses the **v2 API**.

In `App.jsx`, initialise OneSignal on mount (note: `init` is async):
```js
import OneSignal from 'react-onesignal'

useEffect(() => {
  async function initOneSignal() {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    })
  }
  initOneSignal()
}, [])
```

### 16.2 Subscription (Me Screen toggle)

```js
async function enableNotifications(flatmateId) {
  // v2 SDK: opt in to push, get subscription ID, tag the user
  await OneSignal.User.PushSubscription.optIn()
  const subscriptionId = OneSignal.User.PushSubscription.id
  OneSignal.User.addTag('flatmate_id', flatmateId)
  await supabase.from('push_subscriptions').upsert(
    { flatmate_id: flatmateId, onesignal_player_id: subscriptionId },
    { onConflict: 'flatmate_id' }
  )
}

async function disableNotifications() {
  await OneSignal.User.PushSubscription.optOut()
}
```

### 16.3 Template Renderer (shared Edge Function helper)

All Edge Functions use a shared `renderTemplate(template, vars)` helper:
```ts
function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

async function getRandomPreset(supabase, type: string): Promise<string> {
  const { data } = await supabase
    .from('notification_presets')
    .select('template')
    .eq('type', type)
    .eq('active', true)
  if (!data?.length) return ''
  return data[Math.floor(Math.random() * data.length)].template
}
```

### 16.4 Sending a Notification (shared helper)

```ts
async function sendPush(onesignalRestKey: string, appId: string, flatmateId: string, message: string) {
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${onesignalRestKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      filters: [{ field: 'tag', key: 'flatmate_id', value: flatmateId }],
      contents: { en: message },
    }),
  })
}
```

Store `ONESIGNAL_REST_KEY` and `ONESIGNAL_APP_ID` as secrets in Supabase: **Project Settings → Edge Functions → Secrets**.

---

### 16.5 Notification Type: Monday Reminder

**When:** Every Monday at 09:00 UTC (scheduled cron).
**Who:** Each flatmate individually, personalised to their assignments.
**Tokens:** `{{name}}`, `{{chore_count}}`, `{{item_count}}`
— `item_count` = number of supplies where this flatmate is `get_next_buyer()` result AND status is `out` or `running_low`.

**Cron schedule:** `0 9 * * 1`

**Edge Function:** `supabase/functions/send-monday-reminders/index.ts`
- Get this week's `chore_assignments` grouped by flatmate
- Get each flatmate's "next to buy" supply count
- For each flatmate with a push subscription: pick random preset, render, send, log to `notification_log`

---

### 16.6 Notification Type: Saturday Nudge

**When:** Every Saturday at 10:00 UTC (scheduled cron).
**Who:** Only flatmates who still have ≥1 incomplete `chore_assignments` for this week.
**Tokens:** `{{name}}`, `{{chore_count}}`
**Limit:** Max 1 per person per week (check `notification_log` before sending).

**Cron schedule:** `0 10 * * 6`

**Edge Function:** `supabase/functions/send-saturday-nudge/index.ts`
- Query incomplete assignments for current week, grouped by flatmate
- For each flatmate with incomplete chores: check `notification_log` for this week's `saturday_nudge` entry — skip if already sent
- Pick random preset, render, send, log

---

### 16.7 Notification Type: Mid-Week Reassignment

**When:** Triggered by the frontend immediately after a vacation is saved with `start_date` within the current week.
**Who:** All 3 flatmates (broadcast — everyone needs to know their list changed).
**Tokens:** `{{leaving_name}}`, `{{days_away}}`, `{{return_date}}`
**Trigger:** Frontend calls Edge Function after saving vacation. If the vacation starts this week, `reassign_vacation_chores` is called first (Step 4.5); future weeks need no extra call.

**Frontend call (in `VacationScreen.jsx` after save):**
```js
await supabase.functions.invoke('send-event-notification', {
  body: {
    type: 'reassignment',
    data: {
      leaving_flatmate_id: currentFlatmate.id,
      start_date: startDate,
      end_date: endDate,
    }
  }
})
```

**Edge Function:** `supabase/functions/send-event-notification/index.ts` (handles multiple event types — see 16.8–16.9 below for other types handled by this same function).

Logic for reassignment:
- Fetch leaving flatmate name
- Calculate `days_away` = `end_date - start_date + 1`
- Format `return_date` = `format(end_date + 1 day, 'EEE d MMM')`
- Pick random preset, render with vars
- Send to ALL flatmates (loop through all push subscriptions)

---

### 16.8 Notification Types: Supply Out / Supply Low

**When:** Triggered by the frontend after a supply status is changed to `out` or `running_low`.
**Who:** The next buyer only (result of `get_next_buyer(supply_id)`).
**Tokens:** `{{name}}` (next buyer's name), `{{item_name}}`

**Frontend call (in supply status update handler):**
```js
if (newStatus === 'out' || newStatus === 'running_low') {
  await supabase.functions.invoke('send-event-notification', {
    body: {
      type: newStatus === 'out' ? 'supply_out' : 'supply_low',
      data: { supply_id: supply.id }
    }
  })
}
```

**Edge Function (`send-event-notification`) logic:**
- Call `get_next_buyer(supply_id)` to find recipient flatmate
- Fetch their name and push subscription
- Pick random preset for `supply_out` or `supply_low`, render, send

---

### 16.9 Notification Type: Motivation Nudge

**When:** Triggered after any chore is logged — but only fires under specific conditions.
**Who:** Flatmates who have 0 completed chore assignments this week AND it is Wednesday or later.
**Tokens:** `{{name}}` (recipient), `{{logger_name}}` (who just logged)
**Hard limit:** Maximum 1 motivation notification per flatmate per week (enforced via `notification_log`).

**Frontend call (after any chore log submission):**
```js
await supabase.functions.invoke('send-event-notification', {
  body: {
    type: 'motivation',
    data: { logged_by_id: currentFlatmate.id, week_start: thisWeekStart }
  }
})
```

**Edge Function logic:**
```
day_of_week = current day (0=Sun, 1=Mon … 6=Sat)
if day_of_week < 3: return early (Mon/Tue — too early to nudge)

for each flatmate (excluding the logger):
  completed_count = count of chore_assignments where
    flatmate_id = this_flatmate AND week_start = this_week AND completed = true
  if completed_count > 0: skip (they've done something)

  already_nudged = count of notification_log where
    flatmate_id = this_flatmate AND type = 'motivation' AND week_start = this_week
  if already_nudged > 0: skip (already sent this week)

  → pick random motivation preset, render, send, log
```

---

### 16.10 Notification Type: Welcome Back

**When:** Daily cron at 09:00 UTC — checks if any flatmate's vacation `end_date` was yesterday.
**Who:** Personal — the returning flatmate only.
**Tokens:** `{{name}}`, `{{chore_count}}` (incomplete assignments for the current week)

**Cron schedule:** `0 9 * * *` (daily)

**Edge Function:** `supabase/functions/send-daily-checks/index.ts`
```
yesterday = today - 1 day
returning_flatmates = vacation_periods WHERE end_date = yesterday

for each returning flatmate:
  chore_count = count of incomplete chore_assignments for this week
  pick random welcome_back preset, render, send
```

---

### 16.11 Notification Type: Carry-Forward

**When:** Sent as part of Monday assignment generation, when a carry-forward assignment is created.
**Who:** Personal — the flatmate receiving the carried-over chore.
**Tokens:** `{{name}}`, `{{chore_name}}`

This is sent inside `send-monday-reminders` Edge Function — after generating assignments, check for any `carry_forward = true` assignments created this week and send a separate carry-forward notification for each one, in addition to the regular Monday reminder.

---

### 16.12 Cron Schedule Summary

Enable `pg_cron` in Supabase: **Database → Extensions → pg_cron → Enable**.

After enabling, first store your service role key so pg_cron can reference it, then create the scheduled jobs. Run all of the following in the SQL Editor:

**Step 1 — Store the service role key as a database setting** (replace `[[SERVICE_ROLE_KEY]]` with the `service_role` key from Supabase → Project Settings → API — this is the secret key, not the anon key):
```sql
alter database postgres set app.service_role_key = '[[SERVICE_ROLE_KEY]]';
```

**Step 2 — Create the cron jobs** (replace `[[SUPABASE_PROJECT_REF]]` with your project reference ID):
```sql
-- Monday 09:00 UTC: generate assignments + send reminders
select cron.schedule(
  'monday-reminders',
  '0 9 * * 1',
  format(
    $q$select net.http_post(
      url := 'https://%s.supabase.co/functions/v1/send-monday-reminders',
      headers := '{"Authorization":"Bearer %s"}'::jsonb,
      body := '{}'::jsonb
    )$q$,
    '[[SUPABASE_PROJECT_REF]]',
    current_setting('app.service_role_key')
  )
);

-- Saturday 10:00 UTC: nudge for incomplete chores
select cron.schedule(
  'saturday-nudge',
  '0 10 * * 6',
  format(
    $q$select net.http_post(
      url := 'https://%s.supabase.co/functions/v1/send-saturday-nudge',
      headers := '{"Authorization":"Bearer %s"}'::jsonb,
      body := '{}'::jsonb
    )$q$,
    '[[SUPABASE_PROJECT_REF]]',
    current_setting('app.service_role_key')
  )
);

-- Daily 09:00 UTC: welcome back from vacation check
select cron.schedule(
  'daily-checks',
  '0 9 * * *',
  format(
    $q$select net.http_post(
      url := 'https://%s.supabase.co/functions/v1/send-daily-checks',
      headers := '{"Authorization":"Bearer %s"}'::jsonb,
      body := '{}'::jsonb
    )$q$,
    '[[SUPABASE_PROJECT_REF]]',
    current_setting('app.service_role_key')
  )
);
```

> **Note:** The `net` extension (pg_net) must also be enabled: **Database → Extensions → pg_net → Enable**. This is what allows PostgreSQL to make outbound HTTP calls to Edge Functions. The `[[SERVICE_ROLE_KEY]]` is a secret — do not commit it anywhere; it only lives in the database setting.

| Cron expression | UTC time | Edge Function | Purpose |
|----------------|----------|---------------|---------|
| `0 9 * * 1` | Mon 09:00 | `send-monday-reminders` | Weekly chore list + carry-forward notices |
| `0 10 * * 6` | Sat 10:00 | `send-saturday-nudge` | Incomplete chore reminder |
| `0 9 * * *` | Daily 09:00 | `send-daily-checks` | Welcome back from vacation |

Event-driven notifications (reassignment, supply changes, motivation) are invoked directly from the frontend via `supabase.functions.invoke('send-event-notification', ...)`.

---

### 16.13 Edge Function File Structure

```
supabase/
└── functions/
    ├── send-monday-reminders/index.ts
    ├── send-saturday-nudge/index.ts
    ├── send-daily-checks/index.ts
    ├── send-event-notification/index.ts  ← handles reassignment, supply, motivation
    └── _shared/
        ├── supabase.ts     ← shared Supabase admin client
        ├── onesignal.ts    ← sendPush() helper
        └── templates.ts    ← renderTemplate() + getRandomPreset() helpers
```

---

## Step 17 — GitHub Pages Deployment

### 17.1 Vite Config
In `vite.config.js`:
```js
export default defineConfig({
  base: '/hearth/',
  plugins: [react()]
})
```

### 17.2 GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_EIRCODE: ${{ secrets.VITE_EIRCODE }}
          VITE_ONESIGNAL_APP_ID: ${{ secrets.VITE_ONESIGNAL_APP_ID }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 17.3 SPA Routing Fix

GitHub Pages serves a 404 for deep routes like `/hearth/chores`. Fix:

Create `public/404.html` that contains a redirect script (the standard [spa-github-pages trick](https://github.com/rafgraph/spa-github-pages)) — copies the URL path into a query param and redirects to `index.html`.

In `index.html`, add the companion script that reads the query param and restores the URL via `history.replaceState`.

---

## Step 18 — PWA Manifest

`public/manifest.json`:
```json
{
  "name": "Hearth",
  "short_name": "Hearth",
  "description": "Flatmate chores and supplies tracker",
  "start_url": "/hearth/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F2F2F7",
  "theme_color": "#34C759",
  "icons": [
    { "src": "/hearth/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/hearth/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/hearth/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/hearth/manifest.json">
<meta name="theme-color" content="#34C759">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Hearth">
<link rel="apple-touch-icon" href="/hearth/icon-192.png">
```

Generate icons using [favicon.io](https://favicon.io) — use a 🏠 emoji icon, which will automatically produce correctly sized PNGs.

---

## Step 19 — Coding Standards & Future-Expansion Guidelines

**Goal:** The codebase must be clean, well-documented, and structured so that any developer (or AI agent in a future session) can understand it immediately and extend it without fear of breaking things.

---

### 19.1 Official Documentation References

The agent must follow the official documentation for every library used. These are the canonical sources:

| Technology | Official Docs |
|-----------|---------------|
| React 18 | https://react.dev |
| Vite | https://vitejs.dev/guide/ |
| React Router v6 | https://reactrouter.com/en/main |
| TanStack Query v5 | https://tanstack.com/query/latest/docs/framework/react/overview |
| Supabase JS Client | https://supabase.com/docs/reference/javascript/introduction |
| Supabase Edge Functions | https://supabase.com/docs/guides/functions |
| Supabase Realtime | https://supabase.com/docs/guides/realtime |
| Tailwind CSS v3 | https://tailwindcss.com/docs/installation |
| date-fns v3 | https://date-fns.org/docs/Getting-Started |
| OneSignal Web SDK | https://documentation.onesignal.com/docs/web-push-sdk |
| Lucide React | https://lucide.dev/guide/packages/lucide-react |

When in doubt about an API, check the official docs rather than inferring from memory.

---

### 19.2 File & Component Documentation Standards

Every file must have a top-of-file JSDoc block describing its purpose:

```js
/**
 * @file useChores.js
 * @description React Query hooks for fetching and mutating chore data.
 *   Includes: useAssignments, useChoreHistory, useLogChore
 *
 * Related: src/lib/chores.js (raw query functions)
 * Supabase tables: chores, chore_assignments, chore_logs
 */
```

Every exported function or component must have a JSDoc comment:

```js
/**
 * Returns the current week's chore assignments for a given flatmate.
 * @param {string} flatmateId - UUID of the flatmate
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useAssignments(flatmateId) { ... }
```

```jsx
/**
 * Displays a single chore card in the All Chores list.
 * Tapping navigates to /chores/:id.
 *
 * @param {Object} props
 * @param {import('../types').Chore} props.chore - The chore object
 * @param {import('../types').Flatmate} props.assignedTo - The assigned flatmate
 * @param {'missed'|'due'|'upcoming'} props.status - Display state
 */
export function ChoreCard({ chore, assignedTo, status }) { ... }
```

---

### 19.3 Type Definitions

Create `src/types/index.js` with JSDoc `@typedef` definitions for all core data shapes. This makes the codebase self-documenting without requiring TypeScript:

```js
/**
 * @typedef {Object} Flatmate
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {string} avatar_emoji
 * @property {boolean} active
 */

/**
 * @typedef {Object} Chore
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {number|null} recurrence_days - null = on_demand
 * @property {number} weight - 1 to 5
 * @property {'regular'|'on_demand'} category
 * @property {string} icon
 * @property {boolean} active
 */

/**
 * @typedef {Object} ChoreAssignment
 * @property {string} id
 * @property {string} chore_id
 * @property {string} flatmate_id
 * @property {string} week_start - ISO date string (Monday)
 * @property {boolean} completed
 * @property {string|null} completed_by
 * @property {string|null} completed_at
 * @property {boolean} missed
 * @property {boolean} carry_forward
 */

/**
 * @typedef {Object} Supply
 * @property {string} id
 * @property {string} name
 * @property {string} [category]
 * @property {'stocked'|'running_low'|'out'} status
 * @property {string} icon
 * @property {string|null} last_bought_by
 * @property {string|null} last_bought_at
 * @property {boolean} active
 */

/**
 * @typedef {Object} SupplyLog
 * @property {string} id
 * @property {string} supply_id
 * @property {string} flatmate_id
 * @property {'bought'|'status_changed'} action
 * @property {string|null} old_status
 * @property {string|null} new_status
 * @property {string} logged_at
 * @property {string|null} note
 */

/**
 * @typedef {Object} VacationPeriod
 * @property {string} id
 * @property {string} flatmate_id
 * @property {string} start_date - ISO date string
 * @property {string} end_date   - ISO date string
 */

/**
 * @typedef {Object} ChoreLog
 * @property {string} id
 * @property {string} chore_id
 * @property {string} done_by
 * @property {string|null} assigned_to
 * @property {string} logged_at
 * @property {string|null} note
 * @property {string|null} week_start
 */

/**
 * @typedef {Object} Session
 * @property {string} flatmateId
 * @property {string} flatmateName
 * @property {string} flatmateColor
 * @property {string} flatmateEmoji
 * @property {number} expiresAt - Unix timestamp ms
 */
```

---

### 19.4 Constants File

All magic strings and numbers must live in `src/constants/index.js`. Nothing hardcoded inline:

```js
// React Query cache keys
export const QUERY_KEYS = {
  ASSIGNMENTS:  'assignments',
  CHORE_LOGS:   'chore_logs',
  CHORES:       'chores',
  SUPPLIES:     'supplies',
  FLATMATES:    'flatmates',
  NEXT_BUYER:   'next_buyer',
}

// Supply statuses
export const SUPPLY_STATUS = {
  STOCKED:     'stocked',
  RUNNING_LOW: 'running_low',
  OUT:         'out',
}

// Chore categories
export const CHORE_CATEGORY = {
  REGULAR:   'regular',
  ON_DEMAND: 'on_demand',
}

// Notification types
export const NOTIFICATION_TYPE = {
  MONDAY_REMINDER: 'monday_reminder',
  SATURDAY_NUDGE:  'saturday_nudge',
  REASSIGNMENT:    'reassignment',
  SUPPLY_OUT:      'supply_out',
  SUPPLY_LOW:      'supply_low',
  MOTIVATION:      'motivation',
  WELCOME_BACK:    'welcome_back',
  CARRY_FORWARD:   'carry_forward',
}

// Session
export const SESSION_DURATION_MS          = 7 * 24 * 60 * 60 * 1000  // 7 days
export const SESSION_STORAGE_KEY          = 'hearth_session'
export const ASSIGNMENTS_STORAGE_KEY_PREFIX = 'hearth_assignments_'  // + weekStart date

// Misc
export const MAX_NOTE_LENGTH   = 140
export const RECENT_LOGS_COUNT = 5   // "Recently done" feed on Home
export const ME_ACTIVITY_COUNT = 10  // Activity feed on Me screen
export const HOME_UPCOMING_COUNT = 5 // Upcoming chores shown on Home
```

---

### 19.5 Error Handling

**Global error banner:** `ErrorBanner.jsx` subscribes to a lightweight error state held in a React context (`ErrorContext`). When a React Query fetch fails or a Supabase mutation throws, catch the error and call `setError(message)` from that context. The banner appears at the top of the screen, non-blocking, auto-dismisses after 5 seconds. No additional library needed — plain React context is sufficient.

```js
// In every React Query mutation:
onError: (error) => {
  setError('Something went wrong. Check your connection.')
  console.error('[Hearth]', error)
}
```

**Never crash silently.** All `async` functions in `src/lib/` must be wrapped in try/catch and log errors to the console with a `[Hearth]` prefix for easy filtering.

**Supabase errors:** Always destructure `{ data, error }` from Supabase calls and check `error` before using `data`. Never assume success.

---

### 19.6 Future Expansion Design Principles

The codebase must be built assuming the following expansions could happen at any time:

**More flatmates:** Nothing should hardcode `3`. Use `flatmates.length` everywhere. The assignment algorithm already handles N flatmates. The UI switcher should render however many exist.

**More chore/supply categories:** The `category` field is a string, not a boolean. New categories can be added without schema changes (only the UI sort/filter logic would need updating).

**More notification types:** The `notification_presets` table handles this (with the ALTER TABLE note above). The `send-event-notification` Edge Function should use a `switch(type)` pattern so adding a new type means adding one case.

**Internationalization (i18n):** All user-facing strings should eventually come from a strings file (not hardcoded in JSX). Even if not implemented now, avoid spreading display strings throughout components — group them at the top of each file as a `const STRINGS = {}` object so they're easy to extract later.

**Dark mode:** All colors use the Tailwind design system tokens defined in `tailwind.config.js`. Never use raw hex values in JSX. This makes dark mode a matter of adding a dark-mode variant to the config, not hunting through components.

**Richer statistics:** The `chore_logs` and `supply_logs` tables are append-only event logs — they contain everything needed for any future analytics. No data is ever deleted, only flagged `active = false`.

---

### 19.7 Code Style

- **Functional components only.** No class components.
- **Named exports** for components. Default exports only for screen-level components (matched by React Router).
- **No inline styles.** All styling via Tailwind classes. If a style can't be expressed in Tailwind, add it to `index.css` with a comment.
- **Prop destructuring** in function signatures: `function ChoreCard({ chore, assignedTo, status })` not `function ChoreCard(props)`.
- **Early returns** for loading/error/empty states at the top of each component.
- **Custom hooks for all data fetching.** No `useQuery` or `supabase.from()` calls directly inside screen components — always via `src/hooks/`.
- **No hardcoded IDs or magic strings** — always use `QUERY_KEYS`, `SUPPLY_STATUS`, `CHORE_CATEGORY` constants.
- **Consistent file naming:** components `PascalCase.jsx`, hooks `useCamelCase.js`, lib files `camelCase.js`.

---

### 19.8 README.md

The agent must create a `README.md` in the project root containing:
- What Hearth is (2 sentences)
- Tech stack table
- Local development setup instructions (step by step from clone to `npm run dev`)
- How to add new chores and supplies (point to Supabase Table Editor)
- How to add new notification copy variants
- How to deploy (git push to main)
- Architecture overview (copy the ASCII system architecture diagram from Step 1 of this plan directly into the README)
- A note on the Eircode access system

---

## Step 20 — Edge Cases & Behaviors to Implement

The following specific behaviors must be coded; they are easy to miss:

| Scenario | Expected behavior |
|----------|------------------|
| No assignments yet (first Monday) | `ensureWeeklyAssignments()` generates them; empty states shown until then |
| All flatmates on vacation same week | `generate_weekly_assignments` finds no eligible assignee (`v_best_id = null`) and skips the insert — no assignment row is created. The UI detects chores that are due (based on `chore_logs` recurrence check) but have no `chore_assignments` row for this week, and displays them as "Unassigned 🟡" in amber on the Home and All Chores screens. |
| Chore never completed before | Treated as overdue from day 0 → always due in the first week |
| Supply never bought | `last_purchased_at = null` → treated as oldest, so first buyer is whoever has count=0 first by insertion order |
| Log submitted with past timestamp | Accepted; displayed correctly in history; does NOT retroactively mark a past week's assignment as complete |
| Two flatmates log same chore same day | Both inserts succeed in `chore_logs`; `chore_assignments` `completed_by` takes the first logger; second log is still shown in history |
| Flatmate on vacation logs a chore | Allowed — they can always log work even while away |
| Session expires mid-session | Next API call returns; React Query error triggers `clearSession()` + redirect to Eircode Screen |
| Offline / Supabase unreachable | Show a non-blocking banner "Can't reach the server. Showing cached data." React Query stale cache used. No crashes. |
| Pull-to-refresh while offline | Spinner shows, fails gracefully, banner persists |
| Chore with recurrence longer than 28 days (e.g., oven every 30 days) | The 28-day effort balance window still works — the chore simply won't be due every week, so it contributes to balance less frequently |

---

## Step 21 — Final QA Checklist

Before marking the build complete, verify every item:

**Access & Identity**
- [ ] Eircode screen: wrong code shows error animation, correct code proceeds
- [ ] Flatmate select shows all 3 profiles with correct names, colors, emojis
- [ ] Session persists for 7 days; expired session returns to Eircode screen
- [ ] Flatmate switch from My Work and Me works without re-entering Eircode
- [ ] Full logout clears session and returns to Eircode screen

**Chores**
- [ ] Weekly assignments generate on Monday (or first Monday visit)
- [ ] Assignments respect vacation skip rule (long vacations skip, short ones don't)
- [ ] Missed chore from last week appears on Home with amber highlight
- [ ] Missed chore is carried forward to correct flatmate next week
- [ ] Second consecutive miss is NOT carried forward (normal assignment instead)
- [ ] Logging a chore from My Work, Chore Detail, and FAB all work
- [ ] Logging a chore as someone other than assigned: `done_by ≠ assigned_to` recorded correctly
- [ ] On-demand chores never appear in weekly assignment grid
- [ ] On-demand chores can be logged from Home and All Chores

**Supplies**
- [ ] "Next buyer" is the flatmate with lowest purchase count; ties break by oldest purchase
- [ ] Buying a supply increments `supply_purchase_counts` correctly
- [ ] Status change without buying does NOT increment purchase count
- [ ] Flatmate on vacation is skipped for "next buyer"
- [ ] "Needs attention" card on Home shows out + running_low items

**Log View**
- [ ] Segmented control switches between Chore and Buying modes
- [ ] Pre-fill works from Chore Detail, My Work chore tap, My Work buying tap, Item Detail
- [ ] Timestamp defaults to now; past timestamps accepted; future timestamps blocked
- [ ] "Done by" can be changed to any flatmate
- [ ] Search finds chores/supplies not in the default list
- [ ] Note field respects 140 char limit
- [ ] "Log it" button is disabled until an item is selected

**Design**
- [ ] Fonts render as -apple-system (SF Pro) on iOS devices
- [ ] Bottom tab bar respects `safe-area-inset-bottom` (no overlap with iOS home bar)
- [ ] All tap targets are ≥ 44×44px
- [ ] Bottom sheets drag down to dismiss
- [ ] Pull-to-refresh works on all list screens
- [ ] App is installable as PWA on iPhone (Add to Home Screen)
- [ ] App looks correct at 375px width (iPhone SE), 390px (iPhone 14), and 430px (iPhone 15 Plus)

**Stats & Data Integrity**
- [ ] Completion ring on Home shows correct percentage
- [ ] Chore Detail history is chronologically correct
- [ ] Item Detail purchase history is chronologically correct
- [ ] Recent activity on Me screen shows mixed chore + buying logs

**Notifications**
- [ ] Enabling notifications on Me screen requests browser permission and tags the device in OneSignal with `flatmate_id`
- [ ] Monday reminder received at 09:00 UTC on Monday — content matches the flatmate's actual chore + buying count
- [ ] Saturday nudge received at 10:00 UTC on Saturday only when incomplete chores exist — not sent if all done
- [ ] Saturday nudge not sent twice to the same person in one week
- [ ] Mid-week reassignment notification sent to all 3 flatmates immediately when vacation is saved mid-week — includes leaving person's name, days away, and return date
- [ ] Supply "out" notification sent only to the next buyer — not to all flatmates
- [ ] Supply "running low" notification sent only to the next buyer
- [ ] Motivation nudge only fires on Wednesday or later — never on Monday/Tuesday
- [ ] Motivation nudge not sent if recipient already completed ≥1 chore this week
- [ ] Motivation nudge sent max once per person per week even if multiple logs happen
- [ ] Welcome back notification sent the morning after a vacation `end_date` — not before, not on the last vacation day
- [ ] Carry-forward notification sent on Monday alongside the regular reminder when applicable
- [ ] All notification copy comes from `notification_presets` table — variant is random across sends of the same type
- [ ] Adding a new row to `notification_presets` in Supabase immediately makes it eligible for future sends (no code change or redeploy)
- [ ] `notification_log` correctly records all sent notifications with `week_start` for weekly-limited types

**Deployment**
- [ ] GitHub Actions workflow completes successfully on push to `main`
- [ ] App accessible at `https://[[GITHUB_USERNAME]].github.io/hearth/`
- [ ] Deep routes (e.g. `/hearth/chores`) work on direct load (SPA redirect fix)
- [ ] No `.env` values exposed in browser DevTools → Network tab (only `VITE_SUPABASE_ANON_KEY` is expected to be visible — that is normal)
- [ ] All 4 Supabase Edge Functions deploy without errors (check Supabase dashboard → Edge Functions)

---

## Adding Chores & Supplies After Launch

Tim can add new items at any time without touching code:

**Add a new chore:**
1. Supabase dashboard → Table Editor → `chores` table → Insert row
2. Fill in: `name`, `recurrence_days` (or leave null for on-demand), `weight` (1–5), `category` (`regular` or `on_demand`), `icon` (any emoji)
3. Leave `active = true`
4. The app will include this chore in the next Monday's assignment generation automatically

**Add a new supply:**
1. Supabase dashboard → Table Editor → `supplies` table → Insert row
2. Fill in: `name`, `category`, `icon`, leave `status = 'stocked'`
3. Then go to `supply_purchase_counts` table → Insert 3 rows (one per flatmate), all with `purchase_count = 0`
4. The app will immediately show this supply and include the flatmates in the "next buyer" rotation

**Add a new notification variant:**
1. Supabase dashboard → Table Editor → `notification_presets` table → Insert row
2. Set `type` to any existing type (e.g. `monday_reminder`, `motivation`, etc.)
3. Write the `template` text using the appropriate `{{token}}` placeholders listed in the column comment
4. Leave `active = true`
5. It will be immediately eligible for random selection in the next send of that type — no code changes needed

---

*End of build plan. Recommended execution order: Pre-Setup → Steps 1 → 2 → 3 → 6 → 4 → 5 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21*
