# Hearth — HomePod Integration Plan
## AI Agent Build Plan · Supplementary Module

> **What this adds:** Four voice commands usable from any HomePod (or iPhone) via Siri Shortcuts, backed by four Supabase Edge Functions. No new dependencies. The Hearth Supabase project from the main build plan must already exist and be fully deployed before running this plan.

---

## Supported Voice Commands

| Phrase | What it does |
|--------|-------------|
| "Hey Siri, Hearth chores due" | Lists this week's incomplete chores for a named flatmate |
| "Hey Siri, Log Hearth chore" | Logs a named chore as done by a named flatmate |
| "Hey Siri, Hearth supplies" | Reads out all supplies that are out or running low |
| "Hey Siri, Log Hearth supply" | Marks a named supply as bought by a named flatmate |

---

## Architecture

```
HomePod / iPhone
      │
      │  "Hey Siri, Hearth chores due"
      ▼
Siri Shortcut (on iPhone, shared to HomePod via iCloud)
      │
      │  Asks: "Which flatmate?"  →  You: "Tim"
      │  GET /functions/v1/chores-due?flatmate=Tim
      │  Header: Authorization: Bearer [anon key]
      ▼
Supabase Edge Function (Deno/TypeScript, server-side)
      │
      │  Queries DB with service_role key (bypasses RLS)
      │  Returns plain-text sentence
      ▼
Siri reads the response aloud
```

The Edge Functions run inside the existing Supabase project. They use the `service_role` key internally (stored as a Supabase environment variable — never exposed to the client or Shortcuts). The Shortcuts pass only the `anon` key, which Supabase verifies as a valid JWT before the function runs.

---

## ⚠️ Pre-Setup — Complete Before Running the Agent

The following values must be filled into this plan before handing it to an AI coding agent. All values come from the main Hearth build plan's Pre-Setup section.

> Fill in:
> - `[[SUPABASE_URL]]` — e.g. `https://abcdefgh.supabase.co`
> - `[[SUPABASE_PROJECT_REF]]` — the 8-character project ID (e.g. `abcdefgh`) — found in Project Settings → General
> - `[[SUPABASE_ANON_KEY]]` — the `eyJ...` anon/public key

The agent does **not** need the service role key — it is already available to Edge Functions as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` automatically.

---

## Step 1 — Enable pg_trgm Extension

Run in the Supabase SQL editor (needed for partial name matching in the Edge Functions):

```sql
create extension if not exists pg_trgm;
```

---

## Step 2 — Edge Function: `chores-due`

**Purpose:** Returns a spoken-English sentence listing the incomplete chores assigned to a given flatmate for the current week.

**File:** `supabase/functions/chores-due/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getThisWeekStart(): string {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday
  const daysFromMonday = day === 0 ? 6 : day - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  return monday.toISOString().split('T')[0]
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const flatmateName = url.searchParams.get('flatmate')?.trim()

  if (!flatmateName) {
    return new Response(
      "Which flatmate? Pass ?flatmate=Tim in the URL.",
      { status: 400, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Find flatmate — case-insensitive exact name match first, then partial
  let { data: flatmate } = await supabase
    .from('flatmates')
    .select('id, name')
    .ilike('name', flatmateName)
    .eq('active', true)
    .single()

  if (!flatmate) {
    const { data: fuzzy } = await supabase
      .from('flatmates')
      .select('id, name')
      .ilike('name', `%${flatmateName}%`)
      .eq('active', true)
    flatmate = fuzzy?.[0] ?? null
  }

  if (!flatmate) {
    return new Response(
      `I couldn't find a flatmate named ${flatmateName}. Check the spelling and try again.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const weekStart = getThisWeekStart()

  const { data: assignments, error } = await supabase
    .from('chore_assignments')
    .select('completed, carry_forward, chores(name)')
    .eq('flatmate_id', flatmate.id)
    .eq('week_start', weekStart)

  if (error) {
    return new Response(
      `Something went wrong fetching chores: ${error.message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  if (!assignments || assignments.length === 0) {
    return new Response(
      `${flatmate.name} has no chores assigned this week.`,
      { headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const due = assignments.filter(a => !a.completed)
  const doneCount = assignments.length - due.length

  if (due.length === 0) {
    return new Response(
      `${flatmate.name} is all done for this week! All ${doneCount} chore${doneCount !== 1 ? 's' : ''} completed.`,
      { headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const choreNames = due.map(a => {
    const name = (a.chores as { name: string }).name
    return a.carry_forward ? `${name} (carried over)` : name
  })

  const list = choreNames.length === 1
    ? choreNames[0]
    : choreNames.slice(0, -1).join(', ') + ', and ' + choreNames.at(-1)

  const doneSuffix = doneCount > 0 ? ` ${doneCount} already done.` : ''

  return new Response(
    `${flatmate.name} has ${due.length} chore${due.length !== 1 ? 's' : ''} due this week: ${list}.${doneSuffix}`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
})
```

---

## Step 3 — Edge Function: `log-chore`

**Purpose:** Logs a chore as done by a given flatmate. Fuzzy-matches both chore and flatmate names. Updates the assignment to `completed = true` regardless of who was originally assigned.

**File:** `supabase/functions/log-chore/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getThisWeekStart(): string {
  const today = new Date()
  const day = today.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  return monday.toISOString().split('T')[0]
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: { chore?: string; flatmate?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body.', { status: 400 })
  }

  const { chore, flatmate } = body

  if (!chore || !flatmate) {
    return new Response(
      'Request body must include "chore" and "flatmate" fields.',
      { status: 400, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── Resolve flatmate ──────────────────────────────────────────────
  let { data: flatmateRow } = await supabase
    .from('flatmates')
    .select('id, name')
    .ilike('name', flatmate.trim())
    .eq('active', true)
    .single()

  if (!flatmateRow) {
    const { data: fuzzy } = await supabase
      .from('flatmates')
      .select('id, name')
      .ilike('name', `%${flatmate.trim()}%`)
      .eq('active', true)
    flatmateRow = fuzzy?.[0] ?? null
  }

  if (!flatmateRow) {
    return new Response(
      `I couldn't find a flatmate named "${flatmate}". Check the spelling and try again.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  // ── Resolve chore ─────────────────────────────────────────────────
  const { data: matches } = await supabase
    .from('chores')
    .select('id, name')
    .ilike('name', `%${chore.trim()}%`)
    .eq('active', true)

  if (!matches || matches.length === 0) {
    return new Response(
      `I couldn't find a chore matching "${chore}". Try a different word.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  if (matches.length > 3) {
    const names = matches.slice(0, 5).map(c => c.name).join(', ')
    return new Response(
      `I found multiple chores matching "${chore}": ${names}. Please be more specific.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  // Pick shortest name (closest match for partial search)
  const choreRow = matches.sort((a, b) => a.name.length - b.name.length)[0]

  const weekStart = getThisWeekStart()
  const now = new Date().toISOString()

  // ── Find assignment for this week (any flatmate) ──────────────────
  const { data: assignment } = await supabase
    .from('chore_assignments')
    .select('id, flatmate_id')
    .eq('chore_id', choreRow.id)
    .eq('week_start', weekStart)
    .single()

  // ── Insert chore log ──────────────────────────────────────────────
  const { error: logError } = await supabase.from('chore_logs').insert({
    chore_id:    choreRow.id,
    done_by:     flatmateRow.id,
    assigned_to: assignment?.flatmate_id ?? null,
    week_start:  weekStart,
    logged_at:   now,
  })

  if (logError) {
    return new Response(
      `Failed to log the chore: ${logError.message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  // ── Mark assignment completed (whoever did it) ────────────────────
  if (assignment) {
    await supabase
      .from('chore_assignments')
      .update({ completed: true, completed_by: flatmateRow.id, completed_at: now })
      .eq('id', assignment.id)
  }

  const suffix = assignment && assignment.flatmate_id !== flatmateRow.id
    ? ` (originally assigned to someone else — still marked done)`
    : ''

  return new Response(
    `Got it! Logged "${choreRow.name}" as done by ${flatmateRow.name}.${suffix}`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
})
```

---

## Step 4 — Edge Function: `supplies-status`

**Purpose:** Returns a spoken-English sentence listing all supplies currently marked as `out` or `running_low`. No parameters needed.

**File:** `supabase/functions/supplies-status/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: supplies, error } = await supabase
    .from('supplies')
    .select('name, status')
    .in('status', ['running_low', 'out'])
    .eq('active', true)
    .order('name')

  if (error) {
    return new Response(
      `Something went wrong: ${error.message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  if (!supplies || supplies.length === 0) {
    return new Response(
      "All supplies are fully stocked. Nothing to buy right now.",
      { headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const out = supplies.filter(s => s.status === 'out').map(s => s.name)
  const low = supplies.filter(s => s.status === 'running_low').map(s => s.name)

  const parts: string[] = []

  if (out.length > 0) {
    const list = out.length === 1 ? out[0] : out.slice(0, -1).join(', ') + ', and ' + out.at(-1)
    parts.push(`Out of: ${list}.`)
  }

  if (low.length > 0) {
    const list = low.length === 1 ? low[0] : low.slice(0, -1).join(', ') + ', and ' + low.at(-1)
    parts.push(`Running low on: ${list}.`)
  }

  return new Response(
    parts.join(' '),
    { headers: { 'Content-Type': 'text/plain' } }
  )
})
```

---

## Step 5 — Edge Function: `log-supply-bought`

**Purpose:** Marks a supply as bought by a given flatmate — sets status back to `stocked`, inserts a supply log, and increments the flatmate's purchase count using the existing `increment_purchase_count` DB function.

**File:** `supabase/functions/log-supply-bought/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: { supply?: string; flatmate?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body.', { status: 400 })
  }

  const { supply, flatmate } = body

  if (!supply || !flatmate) {
    return new Response(
      'Request body must include "supply" and "flatmate" fields.',
      { status: 400, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── Resolve flatmate ──────────────────────────────────────────────
  let { data: flatmateRow } = await supabase
    .from('flatmates')
    .select('id, name')
    .ilike('name', flatmate.trim())
    .eq('active', true)
    .single()

  if (!flatmateRow) {
    const { data: fuzzy } = await supabase
      .from('flatmates')
      .select('id, name')
      .ilike('name', `%${flatmate.trim()}%`)
      .eq('active', true)
    flatmateRow = fuzzy?.[0] ?? null
  }

  if (!flatmateRow) {
    return new Response(
      `I couldn't find a flatmate named "${flatmate}". Check the spelling and try again.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  // ── Resolve supply ────────────────────────────────────────────────
  const { data: matches } = await supabase
    .from('supplies')
    .select('id, name, status')
    .ilike('name', `%${supply.trim()}%`)
    .eq('active', true)

  if (!matches || matches.length === 0) {
    return new Response(
      `I couldn't find a supply matching "${supply}". Try a different word.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  if (matches.length > 3) {
    const names = matches.slice(0, 5).map(s => s.name).join(', ')
    return new Response(
      `I found multiple supplies matching "${supply}": ${names}. Please be more specific.`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const supplyRow = matches.sort((a, b) => a.name.length - b.name.length)[0]
  const oldStatus = supplyRow.status
  const now = new Date().toISOString()

  // ── Update supply ─────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('supplies')
    .update({
      status:        'stocked',
      last_bought_by: flatmateRow.id,
      last_bought_at: now,
    })
    .eq('id', supplyRow.id)

  if (updateError) {
    return new Response(
      `Failed to update supply: ${updateError.message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  // ── Insert supply log ─────────────────────────────────────────────
  await supabase.from('supply_logs').insert({
    supply_id:   supplyRow.id,
    flatmate_id: flatmateRow.id,
    action:      'bought',
    old_status:  oldStatus,
    new_status:  'stocked',
    logged_at:   now,
  })

  // ── Increment purchase count ──────────────────────────────────────
  await supabase.rpc('increment_purchase_count', {
    p_supply_id:   supplyRow.id,
    p_flatmate_id: flatmateRow.id,
  })

  return new Response(
    `Got it! Logged ${flatmateRow.name} bought ${supplyRow.name}. Status set back to stocked.`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
})
```

---

## Step 6 — Deploy Edge Functions

From the root of the Hearth project directory (requires the Supabase CLI, already installed as part of the main build plan):

```bash
supabase functions deploy chores-due
supabase functions deploy log-chore
supabase functions deploy supplies-status
supabase functions deploy log-supply-bought
```

> **No `--no-verify-jwt` flag.** The Shortcuts pass the anon key as a Bearer token. Supabase validates it as a signed JWT automatically — this is the correct and secure default.

Verify deployment by hitting each function with curl:

```bash
# Test chores-due
curl "[[SUPABASE_URL]]/functions/v1/chores-due?flatmate=Tim" \
  -H "Authorization: Bearer [[SUPABASE_ANON_KEY]]"

# Test supplies-status
curl "[[SUPABASE_URL]]/functions/v1/supplies-status" \
  -H "Authorization: Bearer [[SUPABASE_ANON_KEY]]"

# Test log-chore (use a real chore name from your DB)
curl -X POST "[[SUPABASE_URL]]/functions/v1/log-chore" \
  -H "Authorization: Bearer [[SUPABASE_ANON_KEY]]" \
  -H "Content-Type: application/json" \
  -d '{"chore":"vacuum","flatmate":"Tim"}'

# Test log-supply-bought (use a real supply name from your DB)
curl -X POST "[[SUPABASE_URL]]/functions/v1/log-supply-bought" \
  -H "Authorization: Bearer [[SUPABASE_ANON_KEY]]" \
  -H "Content-Type: application/json" \
  -d '{"supply":"bin bags","flatmate":"Tim"}'
```

All four should return plain-text sentences. Fix any errors before proceeding.

---

## Step 7 — HomePod Pre-Requisite: Enable Personal Requests

For Siri Shortcuts on your iPhone to be accessible from HomePod:

1. Open the **Home** app on your iPhone.
2. Tap the house icon (top left) → **Home Settings**.
3. Tap your HomePod under **People**.
4. Enable **Personal Requests**.

This connects HomePod's Siri to your iPhone's shortcuts via iCloud. All four shortcuts you create will be available on every HomePod in the home once this is on.

---

## Step 8 — Siri Shortcut: "Hearth Chores Due"

**Trigger phrase:** "Hey Siri, Hearth chores due"

Open the **Shortcuts** app on iPhone → tap **+** (new shortcut) → add the following actions in order:

### Action 1 — Ask for Input
- Action: **Ask for Input**
- Prompt: `Which flatmate?`
- Input type: **Text**

### Action 2 — Get Contents of URL
- Action: **Get Contents of URL**
- URL: `[[SUPABASE_URL]]/functions/v1/chores-due?flatmate=` + tap the magic variable picker and select **Provided Input** from Action 1
- Method: **GET**
- Headers: tap **Add new header**
  - Key: `Authorization`
  - Value: `Bearer [[SUPABASE_ANON_KEY]]`

### Action 3 — Speak Text
- Action: **Speak Text**
- Text: tap the magic variable picker → select **Contents of URL** (from Action 2)

### Finalise
1. Tap the shortcut name at the top → rename to `Hearth Chores Due`
2. Tap the settings icon (sliders) → **Add to Siri**
3. Tap **Record** and say: **"Hearth chores due"**
4. Tap **Done**

---

## Step 9 — Siri Shortcut: "Log Hearth Chore"

**Trigger phrase:** "Hey Siri, Log Hearth chore"

Open the **Shortcuts** app → tap **+** → add the following actions:

### Action 1 — Ask for Input
- Action: **Ask for Input**
- Prompt: `Which chore?`
- Input type: **Text**

### Action 2 — Set Variable
- Action: **Set Variable**
- Variable name: `ChoreName`
- To: **Provided Input** (from Action 1)

### Action 3 — Ask for Input
- Action: **Ask for Input**
- Prompt: `Done by which flatmate?`
- Input type: **Text**

### Action 4 — Get Contents of URL
- Action: **Get Contents of URL**
- URL: `[[SUPABASE_URL]]/functions/v1/log-chore`
- Method: **POST**
- Headers: tap **Add new header**
  - Key: `Authorization`  
  - Value: `Bearer [[SUPABASE_ANON_KEY]]`
  - tap **Add new header** again:
  - Key: `Content-Type`
  - Value: `application/json`
- Request Body: **JSON**
  - tap **Add new field → Text**:
    - Key: `chore` → Value: tap magic variable picker → **ChoreName**
  - tap **Add new field → Text**:
    - Key: `flatmate` → Value: tap magic variable picker → **Provided Input** (Action 3)

### Action 5 — Speak Text
- Action: **Speak Text**
- Text: **Contents of URL** (from Action 4)

### Finalise
1. Rename to `Log Hearth Chore`
2. **Add to Siri** → record phrase: **"Log Hearth chore"**
3. Tap **Done**

---

## Step 10 — Siri Shortcut: "Hearth Supplies"

**Trigger phrase:** "Hey Siri, Hearth supplies"

This one needs no input — it just reads back the current supply situation.

Open the **Shortcuts** app → tap **+** → add:

### Action 1 — Get Contents of URL
- Action: **Get Contents of URL**
- URL: `[[SUPABASE_URL]]/functions/v1/supplies-status`
- Method: **GET**
- Headers:
  - Key: `Authorization`
  - Value: `Bearer [[SUPABASE_ANON_KEY]]`

### Action 2 — Speak Text
- Action: **Speak Text**
- Text: **Contents of URL** (from Action 1)

### Finalise
1. Rename to `Hearth Supplies`
2. **Add to Siri** → record phrase: **"Hearth supplies"**
3. Tap **Done**

---

## Step 11 — Siri Shortcut: "Log Hearth Supply"

**Trigger phrase:** "Hey Siri, Log Hearth supply"

Open the **Shortcuts** app → tap **+** → add:

### Action 1 — Ask for Input
- Action: **Ask for Input**
- Prompt: `Which supply was bought?`
- Input type: **Text**

### Action 2 — Set Variable
- Action: **Set Variable**
- Variable name: `SupplyName`
- To: **Provided Input** (from Action 1)

### Action 3 — Ask for Input
- Action: **Ask for Input**
- Prompt: `Bought by which flatmate?`
- Input type: **Text**

### Action 4 — Get Contents of URL
- Action: **Get Contents of URL**
- URL: `[[SUPABASE_URL]]/functions/v1/log-supply-bought`
- Method: **POST**
- Headers:
  - Key: `Authorization` → Value: `Bearer [[SUPABASE_ANON_KEY]]`
  - Key: `Content-Type` → Value: `application/json`
- Request Body: **JSON**
  - Key: `supply` → Value: **SupplyName**
  - Key: `flatmate` → Value: **Provided Input** (Action 3)

### Action 5 — Speak Text
- Action: **Speak Text**
- Text: **Contents of URL** (from Action 4)

### Finalise
1. Rename to `Log Hearth Supply`
2. **Add to Siri** → record phrase: **"Log Hearth supply"**
3. Tap **Done**

---

## Step 12 — Test All Four Commands

Test from iPhone first (tap the shortcut in the Shortcuts app), then from HomePod by voice.

**Smoke tests:**

| Say | Expected response |
|-----|------------------|
| "Hey Siri, Hearth chores due" → "Tim" | "[N] chores due this week: ..." or "all done" |
| "Hey Siri, Hearth chores due" → "nobody" | "I couldn't find a flatmate named nobody..." |
| "Hey Siri, Log Hearth chore" → "vacuum" → "Tim" | "Got it! Logged Vacuum living room as done by Tim." |
| "Hey Siri, Log Hearth chore" → "aaaa" → "Tim" | "I couldn't find a chore matching..." |
| "Hey Siri, Hearth supplies" | Either lists items or "All supplies are fully stocked." |
| "Hey Siri, Log Hearth supply" → "bin bags" → "Tim" | "Got it! Logged Tim bought Bin bags. Status set back to stocked." |
| "Hey Siri, Log Hearth supply" → "dishwasher" → "Tim" | "I found multiple supplies matching dishwasher: ..." |

After each voice log, open the Hearth web app and confirm the change is reflected in real time.

---

## Step 13 — QA Checklist

**Edge Functions**
- [ ] All four functions deploy without errors (`supabase functions deploy` exits 0)
- [ ] All four curl smoke tests return plain-text sentences (not HTML error pages)
- [ ] `chores-due` returns "all done" when all assignments are completed
- [ ] `chores-due` returns "no chores assigned" for a fresh week before Monday triggers assignment
- [ ] `log-chore` marks `chore_assignments.completed = true` in the DB
- [ ] `log-chore` sets `completed_by` correctly even when a different flatmate logs it
- [ ] `log-supply-bought` sets `supplies.status = 'stocked'`
- [ ] `log-supply-bought` increments `supply_purchase_counts.purchase_count` by 1
- [ ] `log-supply-bought` inserts a row in `supply_logs` with `action = 'bought'`
- [ ] Ambiguous supply name (e.g. "dishwasher") returns a disambiguation message, not a silent wrong pick
- [ ] Unknown flatmate name returns a friendly error, not a 500

**Siri Shortcuts**
- [ ] All four shortcuts run successfully from the Shortcuts app on iPhone
- [ ] All four respond to their Siri phrases when triggered on iPhone
- [ ] HomePod Personal Requests is enabled
- [ ] All four respond to their Siri phrases when triggered from HomePod
- [ ] Siri reads the response aloud (not just displays it on screen)
- [ ] The anon key is not visible in any response or error message

---

## Notes for Future Expansion

**Adding more commands** — create a new Edge Function in `supabase/functions/` and a matching Shortcut. No changes to the main app needed.

**Sharing with flatmates** — each flatmate needs to copy the shortcuts to their own iPhone from iCloud.com → Shortcuts, or you can share the `.shortcut` file via AirDrop. They paste the same anon key into their copy.

**Richer responses** — the Edge Functions return `text/plain` for simplicity. If you later want JSON (e.g. for an iOS widget or Watch app), add `?format=json` support and return structured data alongside the `speech` field.
