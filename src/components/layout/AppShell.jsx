import { useState } from 'react'
import BottomNav from './BottomNav'
import FAB from './FAB'
import LogView from '../log/LogView'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'

export default function AppShell({ children }) {
  const [logViewOpen, setLogViewOpen] = useState(false)
  useRealtimeSync()

  return (
    <div className="flex flex-col bg-ios-bg min-h-screen">
      <main
        className="flex-1"
        style={{ paddingBottom: 'calc(49px + env(safe-area-inset-bottom) + 8px)' }}
      >
        {children}
      </main>
      <FAB onPress={() => setLogViewOpen(true)} />
      <BottomNav />
      <LogView isOpen={logViewOpen} onClose={() => setLogViewOpen(false)} />
    </div>
  )
}
