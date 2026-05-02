import { useState, useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { supabase } from '../lib/supabase'
import { useSession } from '../contexts/SessionContext'
import { getOneSignalInitPromise } from '../lib/onesignal'

export function useNotifications() {
  const { flatmate } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getOneSignalInitPromise().then(() => {
      if (cancelled) return
      try {
        const optedIn = OneSignal.User.PushSubscription.optedIn ?? false
        console.log('[Notifications] init done, optedIn:', optedIn)
        setIsSubscribed(optedIn)
      } catch (err) {
        console.warn('[Notifications] could not read optedIn after init:', err)
      }
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  async function subscribe() {
    console.log('[Notifications] subscribe() called, flatmate:', flatmate?.id)
    if (!flatmate?.id) {
      console.warn('[Notifications] no flatmate id, aborting subscribe')
      return
    }
    setIsLoading(true)
    try {
      console.log('[Notifications] calling optIn()...')
      await OneSignal.User.PushSubscription.optIn()
      console.log('[Notifications] optIn resolved')

      OneSignal.User.addTag('flatmate_id', flatmate.id)

      const subscriptionId = OneSignal.User.PushSubscription.id
      console.log('[Notifications] subscriptionId:', subscriptionId)

      if (subscriptionId) {
        const { error } = await supabase.from('push_subscriptions').upsert(
          { flatmate_id: flatmate.id, onesignal_player_id: subscriptionId },
          { onConflict: 'flatmate_id' },
        )
        if (error) console.error('[Notifications] supabase upsert error:', error)
        else console.log('[Notifications] supabase upsert ok')
      } else {
        console.warn('[Notifications] no subscriptionId after optIn')
      }
      setIsSubscribed(true)
    } catch (err) {
      console.error('[Notifications] subscribe error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    console.log('[Notifications] unsubscribe() called')
    setIsLoading(true)
    try {
      await OneSignal.User.PushSubscription.optOut()
      console.log('[Notifications] optOut resolved')
      if (flatmate?.id) {
        await supabase.from('push_subscriptions').delete().eq('flatmate_id', flatmate.id)
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('[Notifications] unsubscribe error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, subscribe, unsubscribe }
}
