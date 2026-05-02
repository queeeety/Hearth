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
