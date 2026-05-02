import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabase.ts'
import { sendPush } from '../_shared/onesignal.ts'
import { renderTemplate, getRandomPreset, getThisMonday } from '../_shared/templates.ts'

const REST_KEY = Deno.env.get('ONESIGNAL_REST_KEY')!
const APP_ID   = Deno.env.get('ONESIGNAL_APP_ID')!

serve(async () => {
  const weekStart = getThisMonday()

  const [{ data: incomplete }, { data: subscriptions }, { data: flatmates }] = await Promise.all([
    supabase.from('chore_assignments').select('flatmate_id').eq('week_start', weekStart).eq('completed', false),
    supabase.from('push_subscriptions').select('flatmate_id'),
    supabase.from('flatmates').select('id, name'),
  ])

  if (!incomplete?.length) return new Response('nothing to nudge', { status: 200 })

  const counts: Record<string, number> = {}
  for (const a of incomplete) counts[a.flatmate_id] = (counts[a.flatmate_id] ?? 0) + 1

  for (const [flatmateId, choreCount] of Object.entries(counts)) {
    if (!subscriptions?.some(s => s.flatmate_id === flatmateId)) continue

    const { data: alreadySent } = await supabase
      .from('notification_log')
      .select('id')
      .eq('flatmate_id', flatmateId)
      .eq('notification_type', 'saturday_nudge')
      .eq('week_start', weekStart)
      .limit(1)
    if (alreadySent?.length) continue

    const flatmate = flatmates?.find(f => f.id === flatmateId)
    if (!flatmate) continue

    const template = await getRandomPreset('saturday_nudge')
    if (!template) continue

    const msg = renderTemplate(template, { name: flatmate.name, chore_count: String(choreCount) })
    await sendPush(REST_KEY, APP_ID, flatmateId, msg)
    await supabase.from('notification_log').insert({
      flatmate_id: flatmateId,
      notification_type: 'saturday_nudge',
      week_start: weekStart,
    })
  }

  return new Response('ok', { status: 200 })
})
