import OneSignal from 'react-onesignal'

let _promise = null

export function ensureOneSignalInit(appId) {
  if (_promise) return _promise
  console.log('[OneSignal] init starting, appId:', appId)
  _promise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: true,
    notifyButton: { enable: false },
    serviceWorkerParam: { scope: '/Hearth/' },
  }).then(() => {
    console.log('[OneSignal] init resolved')
    console.log('[OneSignal] optedIn:', OneSignal.User?.PushSubscription?.optedIn)
    console.log('[OneSignal] subscriptionId:', OneSignal.User?.PushSubscription?.id)
  }).catch((err) => {
    console.error('[OneSignal] init failed:', err)
  })
  return _promise
}

export function getOneSignalInitPromise() {
  return _promise ?? Promise.resolve()
}
