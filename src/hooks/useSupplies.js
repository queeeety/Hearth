import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { QUERY_KEYS } from '../constants'

export function useSupplies() {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIES],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplies')
        .select('*, last_buyer:flatmates!last_bought_by(*)')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useSupply(supplyId) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIES, supplyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplies')
        .select('*, last_buyer:flatmates!last_bought_by(*)')
        .eq('id', supplyId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!supplyId,
  })
}

export function useNextBuyer(supplyId) {
  return useQuery({
    queryKey: [QUERY_KEYS.NEXT_BUYER, supplyId],
    queryFn: async () => {
      const { data: flatmateId, error } = await supabase
        .rpc('get_next_buyer', { p_supply_id: supplyId })
      if (error) throw error
      if (!flatmateId) return null
      const { data: flatmate } = await supabase
        .from('flatmates')
        .select('*')
        .eq('id', flatmateId)
        .single()
      return flatmate
    },
    enabled: !!supplyId,
  })
}

export function useSuppliesForFlatmate(flatmateId) {
  return useQuery({
    queryKey: [QUERY_KEYS.NEXT_BUYER, 'for', flatmateId],
    queryFn: async () => {
      const [{ data: supplies }, { data: counts }] = await Promise.all([
        supabase
          .from('supplies')
          .select('*, last_buyer:flatmates!last_bought_by(*)')
          .eq('active', true)
          .order('name'),
        supabase
          .from('supply_purchase_counts')
          .select('supply_id, flatmate_id, purchase_count, last_purchased_at')
          .order('purchase_count', { ascending: true })
          .order('last_purchased_at', { ascending: true, nullsFirst: true }),
      ])

      const nextForSupply = new Map()
      for (const row of (counts ?? [])) {
        if (!nextForSupply.has(row.supply_id)) {
          nextForSupply.set(row.supply_id, row.flatmate_id)
        }
      }
      return (supplies ?? []).filter(s => nextForSupply.get(s.id) === flatmateId)
    },
    enabled: !!flatmateId,
  })
}

export function useSupplyHistory(supplyId, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLY_LOGS, supplyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supply_logs')
        .select('*, flatmate:flatmates(*)')
        .eq('supply_id', supplyId)
        .eq('action', 'bought')
        .order('logged_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data
    },
    enabled: !!supplyId,
  })
}
