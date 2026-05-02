import { format, startOfWeek } from 'date-fns'
import { supabase } from './supabase'
import { ASSIGNMENTS_STORAGE_KEY_PREFIX } from '../constants'

export async function ensureWeeklyAssignments() {
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const storageKey = ASSIGNMENTS_STORAGE_KEY_PREFIX + weekStart
  if (localStorage.getItem(storageKey)) return
  await supabase.rpc('generate_weekly_assignments', { p_week_start: weekStart })
  localStorage.setItem(storageKey, '1')
}
