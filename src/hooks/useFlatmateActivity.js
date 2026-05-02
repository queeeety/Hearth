import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useFlatmateActivity(flatmateId, limit = 10) {
  return useQuery({
    queryKey: ['flatmate_activity', flatmateId, limit],
    queryFn: async () => {
      const [{ data: choreLogs }, { data: supplyLogs }] = await Promise.all([
        supabase
          .from('chore_logs')
          .select('id, logged_at, note, chore:chores(name, icon)')
          .eq('done_by', flatmateId)
          .order('logged_at', { ascending: false })
          .limit(limit),
        supabase
          .from('supply_logs')
          .select('id, logged_at, note, supply:supplies(name, icon)')
          .eq('flatmate_id', flatmateId)
          .eq('action', 'bought')
          .order('logged_at', { ascending: false })
          .limit(limit),
      ])

      const all = [
        ...(choreLogs ?? []).map(l => ({ ...l, _type: 'chore' })),
        ...(supplyLogs ?? []).map(l => ({ ...l, _type: 'supply' })),
      ]
      return all
        .sort((a, b) => b.logged_at.localeCompare(a.logged_at))
        .slice(0, limit)
    },
    enabled: !!flatmateId,
  })
}
