import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabase.ts'
import { sendPush } from '../_shared/onesignal.ts'
import { renderTemplate, getRandomPreset } from '../_shared/templates.ts'

const REST_KEY = Deno.env.get('ONESIGNAL_REST_KEY')!
const APP_ID   = Deno.env.get('ONESIGNAL_APP_ID')!

serve(async (req) => {
  const { type, data } = await req.json()

  switch (type) {

    case 'reassignment': {
      const { leaving_flatmate_id, start_date, end_date } = data
      const [{ data: leavingFlatmate }, { data: allSubs }] = await Promise.all([
        supabase.from('flatmates').select('name').eq('id', leaving_flatmate_id).single(),
        supabase.from('push_subscriptions').select('flatmate_id'),
      ])
      const daysAway = diffDays(end_date, start_date) + 1
      const returnDate = fmtDate(addOneDay(end_date))
      const template = await getRandomPreset('reassignment')
      if (!template) break
      for (const sub of (allSubs ?? [])) {
        const msg = renderTemplate(template, {
          leaving_name: leavingFlatmate?.name ?? '',
          days_away: String(daysAway),
          return_date: returnDate,
        })
        await sendPush(REST_KEY, APP_ID, sub.flatmate_id, msg)
      }
      break
    }

    case 'supply_out':
    case 'supply_low': {
      const { supply_id } = data
      const { data: nextBuyerId } = await supabase.rpc('get_next_buyer', { p_supply_id: supply_id })
      if (!nextBuyerId) break
      const [{ data: supply }, { data: buyer }, { data: sub }] = await Promise.all([
        supabase.from('supplies').select('name').eq('id', supply_id).single(),
        supabase.from('flatmates').select('name').eq('id', nextBuyerId).single(),
        supabase.from('push_subscriptions').select('flatmate_id').eq('flatmate_id', nextBuyerId).single(),
      ])
      if (!sub) break
      const template = await getRandomPreset(type)
      if (!template) break
      const msg = renderTemplate(template, { name: buyer?.name ?? '', item_name: supply?.name ?? '' })
      await sendPush(REST_KEY, APP_ID, nextBuyerId, msg)
      break
    }

    case 'motivation': {
      const { logged_by_id, week_start } = data
      if (new Date().getDay() < 3) break // Mon/Tue too early

      const [{ data: logger }, { data: others }, { data: subs }] = await Promise.all([
        supabase.from('flatmates').select('name').eq('id', logged_by_id).single(),
        supabase.from('flatmates').select('id, name').eq('active', true).neq('id', logged_by_id),
        supabase.from('push_subscriptions').select('flatmate_id'),
      ])

      for (const fm of (others ?? [])) {
        if (!subs?.some(s => s.flatmate_id === fm.id)) continue

        const { count: doneCount } = await supabase
          .from('chore_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('flatmate_id', fm.id)
          .eq('week_start', week_start)
          .eq('completed', true)
        if ((doneCount ?? 0) > 0) continue

        const { data: nudged } = await supabase
          .from('notification_log')
          .select('id')
          .eq('flatmate_id', fm.id)
          .eq('notification_type', 'motivation')
          .eq('week_start', week_start)
          .limit(1)
        if (nudged?.length) continue

        const template = await getRandomPreset('motivation')
        if (!template) continue
        const msg = renderTemplate(template, { name: fm.name, logger_name: logger?.name ?? '' })
        await sendPush(REST_KEY, APP_ID, fm.id, msg)
        await supabase.from('notification_log').insert({
          flatmate_id: fm.id,
          notification_type: 'motivation',
          week_start,
        })
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
})

function diffDays(later: string, earlier: string): number {
  return Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / 86_400_000)
}

function addOneDay(dateStr: string): Date {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
