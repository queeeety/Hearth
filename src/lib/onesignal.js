import OneSignal from 'react-onesignal'

let _promise = null

export function ensureOneSignalInit(appId) {
  if (_promise) return _promise
  _promise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: true,
    notifyButton: { enable: false },
  }).catch(() => {})
  return _promise
}

export function getOneSignalInitPromise() {
  return _promise ?? Promise.resolve()
}
