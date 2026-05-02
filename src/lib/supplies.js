import { supabase } from './supabase'

export async function logPurchase({ supplyId, flatmateId, note = null }) {
  await supabase.from('supply_logs').insert({
    supply_id:   supplyId,
    flatmate_id: flatmateId,
    action:      'bought',
    new_status:  'stocked',
    note,
  })
  await supabase.from('supplies').update({
    status:        'stocked',
    last_bought_by: flatmateId,
    last_bought_at: new Date().toISOString(),
  }).eq('id', supplyId)
  await supabase.rpc('increment_purchase_count', {
    p_supply_id:   supplyId,
    p_flatmate_id: flatmateId,
  })
}

export async function updateSupplyStatus({ supplyId, flatmateId, oldStatus, newStatus }) {
  await supabase.from('supply_logs').insert({
    supply_id:   supplyId,
    flatmate_id: flatmateId,
    action:      'status_changed',
    old_status:  oldStatus,
    new_status:  newStatus,
  })
  await supabase.from('supplies').update({ status: newStatus }).eq('id', supplyId)
}
