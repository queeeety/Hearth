import { useState, useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { supabase } from '../lib/supabase'
import { useSession } from '../contexts/SessionContext'

export function useNotifications() {
  const { flatmate } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      setIsSubscribed(OneSignal.User.PushSubscription.optedIn ?? false)
    } catch {
      // OneSignal not ready yet
    }
  }, [])

  async function subscribe() {
    if (!flatmate?.id) return
    setIsLoading(true)
    try {
      await OneSignal.User.PushSubscription.optIn()
      OneSignal.User.addTag('flatmate_id', flatmate.id)
      const subscriptionId = OneSignal.User.PushSubscription.id
      if (subscriptionId) {
        await supabase.from('push_subscriptions').upsert(
          { flatmate_id: flatmate.id, onesignal_player_id: subscriptionId },
          { onConflict: 'flatmate_id' },
        )
      }
      setIsSubscribed(true)
    } catch {
      // Permission denied or OneSignal unavailable
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    setIsLoading(true)
    try {
      await OneSignal.User.PushSubscription.optOut()
      if (flatmate?.id) {
        await supabase.from('push_subscriptions').delete().eq('flatmate_id', flatmate.id)
      }
      setIsSubscribed(false)
    } catch {
      // OneSignal unavailable
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, subscribe, unsubscribe }
}
