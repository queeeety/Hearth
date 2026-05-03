import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { QUERY_KEYS } from '../constants'

export function useAssignments(weekStart) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSIGNMENTS, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_assignments')
        .select(`
          *,
          chore:chores(*),
          flatmate:flatmates!flatmate_id(*),
          completed_by_flatmate:flatmates!completed_by(*)
        `)
        .eq('week_start', weekStart)
      if (error) throw error
      return data
    },
    enabled: !!weekStart,
  })
}

export function useAllChores() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHORES],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useChore(choreId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHORES, choreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('id', choreId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!choreId,
  })
}

export function useChoreHistory(choreId, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHORE_LOGS, choreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_logs')
        .select('*, flatmate:flatmates!done_by(*)')
        .eq('chore_id', choreId)
        .order('done_at', { ascending: false, nullsLast: true })
        .limit(limit)
      if (error) throw error
      return data
    },
    enabled: !!choreId,
  })
}

export function useRecentLogs(limit = 5) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHORE_LOGS, 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_logs')
        .select('*, chore:chores(*), flatmate:flatmates!done_by(*)')
        .order('done_at', { ascending: false, nullsLast: true })
        .limit(limit)
      if (error) throw error
      return data
    },
  })
}

export function useMissedAssignments(lastWeekStart) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSIGNMENTS, 'missed', lastWeekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_assignments')
        .select('*, chore:chores(*), flatmate:flatmates!flatmate_id(*)')
        .eq('week_start', lastWeekStart)
        .eq('missed', true)
        .eq('carry_forward', false)
      if (error) throw error
      return data
    },
    enabled: !!lastWeekStart,
  })
}

// Returns the flatmate who should do the on-demand chore next.
// Counts all logs (including vacation skips) so skips correctly
// shift a person down the rotation.
export function useOnDemandNextUp(choreId, isOnDemand) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHORE_LOGS, choreId, 'next_up'],
    queryFn: async () => {
      const [{ data: logs }, { data: flatmates }] = await Promise.all([
        supabase
          .from('chore_logs')
          .select('done_by, done_at, logged_at')
          .eq('chore_id', choreId)
          .order('done_at', { ascending: false, nullsLast: true }),
        supabase
          .from('flatmates')
          .select('*')
          .eq('active', true)
          .order('created_at'),
      ])

      if (!flatmates?.length) return null
      if (!logs?.length) return flatmates[0]

      const counts  = Object.fromEntries(flatmates.map(f => [f.id, 0]))
      const lastAt  = Object.fromEntries(flatmates.map(f => [f.id, null]))

      for (const l of logs) {
        if (l.done_by in counts) {
          counts[l.done_by]++
          if (!lastAt[l.done_by]) lastAt[l.done_by] = l.done_at ?? l.logged_at
        }
      }

      // Fewest turns first; break ties by who did it least recently
      let best = flatmates[0]
      for (const f of flatmates.slice(1)) {
        if (counts[f.id] < counts[best.id]) {
          best = f
        } else if (counts[f.id] === counts[best.id]) {
          const fa = lastAt[f.id], ba = lastAt[best.id]
          if (!ba || (fa && fa < ba)) best = f
        }
      }
      return best
    },
    enabled: !!choreId && !!isOnDemand,
  })
}

export function useVacationPeriods(flatmateId) {
  return useQuery({
    queryKey: [QUERY_KEYS.VACATION_PERIODS, flatmateId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('vacation_periods')
        .select('*')
        .eq('flatmate_id', flatmateId)
        .gte('end_date', today)
        .order('start_date')
      if (error) throw error
      return data
    },
    enabled: !!flatmateId,
  })
}
