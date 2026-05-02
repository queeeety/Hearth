import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabase.ts'
import { sendPush } from '../_shared/onesignal.ts'
import { renderTemplate, getRandomPreset, getThisMonday } from '../_shared/templates.ts'

const REST_KEY = Deno.env.get('ONESIGNAL_REST_KEY')!
const APP_ID   = Deno.env.get('ONESIGNAL_APP_ID')!

serve(async () => {
  const weekStart = getThisMonday()

  // Idempotent assignment generation
  await supabase.rpc('generate_weekly_assignments', { p_week_start: weekStart })

  const [{ data: assignments }, { data: supplies }, { data: subscriptions }, { data: flatmates }] =
    await Promise.all([
      supabase.from('chore_assignments').select('flatmate_id, carry_forward, chore_id').eq('week_start', weekStart),
      supabase.from('supplies').select('id, status').eq('active', true).neq('status', 'stocked'),
      supabase.from('push_subscriptions').select('flatmate_id'),
      supabase.from('flatmates').select('id, name').eq('active', true),
    ])

  for (const sub of (subscriptions ?? [])) {
    const flatmate = flatmates?.find(f => f.id === sub.flatmate_id)
    if (!flatmate) continue

    const choreCount = (assignments ?? []).filter(a => a.flatmate_id === sub.flatmate_id).length

    // Count supplies where this flatmate is next buyer and status is out/running_low
    let itemCount = 0
    for (const s of (supplies ?? [])) {
      const { data: nextId } = await supabase.rpc('get_next_buyer', { p_supply_id: s.id })
      if (nextId === sub.flatmate_id) itemCount++
    }

    const template = await getRandomPreset('monday_reminder')
    if (template) {
      const msg = renderTemplate(template, {
        name: flatmate.name,
        chore_count: String(choreCount),
        item_count: String(itemCount),
      })
      await sendPush(REST_KEY, APP_ID, sub.flatmate_id, msg)
      await supabase.from('notification_log').insert({
        flatmate_id: sub.flatmate_id,
        notification_type: 'monday_reminder',
        week_start: weekStart,
      })
    }

    // Carry-forward notices
    const carried = (assignments ?? []).filter(
      a => a.flatmate_id === sub.flatmate_id && a.carry_forward,
    )
    for (const cf of carried) {
      const { data: chore } = await supabase.from('chores').select('name').eq('id', cf.chore_id).single()
      const cfTemplate = await getRandomPreset('carry_forward')
      if (!cfTemplate) continue
      const cfMsg = renderTemplate(cfTemplate, { name: flatmate.name, chore_name: chore?.name ?? '' })
      await sendPush(REST_KEY, APP_ID, sub.flatmate_id, cfMsg)
    }
  }

  return new Response('ok', { status: 200 })
})
