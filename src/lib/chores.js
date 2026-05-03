import { format, startOfWeek } from 'date-fns'
import { supabase } from './supabase'
import { ASSIGNMENTS_STORAGE_KEY_PREFIX } from '../constants'
import { getWeekStart } from './utils'

export async function ensureWeeklyAssignments() {
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const storageKey = ASSIGNMENTS_STORAGE_KEY_PREFIX + weekStart
  if (localStorage.getItem(storageKey)) return
  await supabase.rpc('generate_weekly_assignments', { p_week_start: weekStart })
  localStorage.setItem(storageKey, '1')
}

export async function logChore({ choreId, doneBy, assignedTo, note, loggedAt }) {
  const weekStart = getWeekStart(new Date(loggedAt))

  const { data: log, error } = await supabase.from('chore_logs').insert({
    chore_id:    choreId,
    done_by:     doneBy,
    assigned_to: assignedTo ?? null,
    note:        note ?? null,
    done_at:     loggedAt,
    week_start:  weekStart,
  }).select().single()

  if (error) throw error

  // Mark assignment complete if one exists for this chore this week
  if (assignedTo) {
    await supabase.from('chore_assignments')
      .update({
        completed:    true,
        completed_by: doneBy,
        completed_at: loggedAt,
      })
      .eq('chore_id', choreId)
      .eq('week_start', weekStart)
      .eq('completed', false)
  }

  return log
}
