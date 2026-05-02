import { useState } from 'react'
import BottomNav from './BottomNav'
import FAB from './FAB'
import LogView from '../log/LogView'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { LogViewContext } from '../../contexts/LogViewContext'

export default function AppShell({ children }) {
  const [logViewOpen, setLogViewOpen] = useState(false)
  const [logViewPrefill, setLogViewPrefill] = useState({})
  useRealtimeSync()

  function openLogView(prefill = {}) {
    setLogViewPrefill(prefill)
    setLogViewOpen(true)
  }

  function handleClose() {
    setLogViewOpen(false)
    setLogViewPrefill({})
  }

  return (
    <LogViewContext.Provider value={{ openLogView }}>
      <div className="flex flex-col bg-ios-bg min-h-screen">
        <main
          className="flex-1"
          style={{ paddingBottom: 'calc(49px + env(safe-area-inset-bottom) + 8px)' }}
        >
          {children}
        </main>
        <FAB onPress={() => openLogView({})} />
        <BottomNav />
        <LogView isOpen={logViewOpen} onClose={handleClose} prefill={logViewPrefill} />
      </div>
    </LogViewContext.Provider>
  )
}
