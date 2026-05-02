import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { QUERY_KEYS } from '../constants'

export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('hearth-sync')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chore_logs' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHORE_LOGS] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'supply_logs' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'supplies' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chore_assignments' },
        () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])
}
