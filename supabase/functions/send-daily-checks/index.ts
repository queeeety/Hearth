import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabase.ts'
import { sendPush } from '../_shared/onesignal.ts'
import { renderTemplate, getRandomPreset, getThisMonday } from '../_shared/templates.ts'

const REST_KEY = Deno.env.get('ONESIGNAL_REST_KEY')!
const APP_ID   = Deno.env.get('ONESIGNAL_APP_ID')!

serve(async () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const weekStart = getThisMonday(today)

  const { data: returning } = await supabase
    .from('vacation_periods')
    .select('flatmate_id')
    .eq('end_date', yesterdayStr)

  if (!returning?.length) return new Response('none returning', { status: 200 })

  const [{ data: subscriptions }, { data: flatmates }] = await Promise.all([
    supabase.from('push_subscriptions').select('flatmate_id'),
    supabase.from('flatmates').select('id, name'),
  ])

  for (const vac of returning) {
    if (!subscriptions?.some(s => s.flatmate_id === vac.flatmate_id)) continue

    const flatmate = flatmates?.find(f => f.id === vac.flatmate_id)
    if (!flatmate) continue

    const { count } = await supabase
      .from('chore_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('flatmate_id', vac.flatmate_id)
      .eq('week_start', weekStart)
      .eq('completed', false)

    const template = await getRandomPreset('welcome_back')
    if (!template) continue

    const msg = renderTemplate(template, {
      name: flatmate.name,
      chore_count: String(count ?? 0),
    })
    await sendPush(REST_KEY, APP_ID, vac.flatmate_id, msg)
  }

  return new Response('ok', { status: 200 })
})
