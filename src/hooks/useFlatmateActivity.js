import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useFlatmateActivity(flatmateId, limit = 10) {
  return useQuery({
    queryKey: ['flatmate_activity', flatmateId, limit],
    queryFn: async () => {
      const [{ data: choreLogs }, { data: supplyLogs }] = await Promise.all([
        supabase
          .from('chore_logs')
          .select('id, done_at, logged_at, note, chore:chores(name, icon)')
          .eq('done_by', flatmateId)
          .order('done_at', { ascending: false, nullsLast: true })
          .limit(limit),
        supabase
          .from('supply_logs')
          .select('id, done_at, logged_at, note, supply:supplies(name, icon)')
          .eq('flatmate_id', flatmateId)
          .eq('action', 'bought')
          .order('done_at', { ascending: false, nullsLast: true })
          .limit(limit),
      ])

      const dateOf = l => l.done_at ?? l.logged_at
      const all = [
        ...(choreLogs ?? []).map(l => ({ ...l, _type: 'chore' })),
        ...(supplyLogs ?? []).map(l => ({ ...l, _type: 'supply' })),
      ]
      return all
        .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
        .slice(0, limit)
    },
    enabled: !!flatmateId,
  })
}
