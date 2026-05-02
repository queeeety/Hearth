import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      className="fixed inset-x-0 z-50 bg-[rgba(0,0,0,0.78)] backdrop-blur-sm text-white text-[13px] font-medium flex items-center justify-center gap-2 px-4"
      style={{ top: 0, paddingTop: 'max(10px, env(safe-area-inset-top))', paddingBottom: '10px' }}
    >
      <WifiOff size={14} className="flex-shrink-0" />
      <span>Can't reach the server. Showing cached data.</span>
    </div>
  )
}
