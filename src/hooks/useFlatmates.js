import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { QUERY_KEYS } from '../constants'

export function useFlatmates() {
  return useQuery({
    queryKey: [QUERY_KEYS.FLATMATES],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flatmates')
        .select('*')
        .eq('active', true)
        .order('created_at')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}
