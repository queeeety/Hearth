import { supabase } from './supabase'

export async function sendEventNotification(type, data) {
  return supabase.functions.invoke('send-event-notification', { body: { type, data } })
}
