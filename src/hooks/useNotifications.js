import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../contexts/SessionContext'

export function useNotifications() {
  const { flatmate } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!window.OneSignal) return
    window.OneSignal.push(() => {
      window.OneSignal.isPushNotificationsEnabled(enabled => setIsSubscribed(enabled))
    })
  }, [])

  async function subscribe() {
    if (!window.OneSignal) return
    setIsLoading(true)
    try {
      await new Promise(resolve => window.OneSignal.push(resolve))
      await window.OneSignal.showNativePrompt()
      const playerId = await window.OneSignal.getUserId()
      if (playerId && flatmate?.id) {
        await supabase.from('push_subscriptions').upsert(
          { flatmate_id: flatmate.id, onesignal_player_id: playerId },
          { onConflict: 'flatmate_id' }
        )
        setIsSubscribed(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    if (!window.OneSignal) return
    setIsLoading(true)
    try {
      await new Promise(resolve => window.OneSignal.push(resolve))
      await window.OneSignal.setSubscription(false)
      if (flatmate?.id) {
        await supabase.from('push_subscriptions').delete().eq('flatmate_id', flatmate.id)
      }
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, subscribe, unsubscribe }
}
