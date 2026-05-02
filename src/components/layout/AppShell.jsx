import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import BottomNav from './BottomNav'
import FAB from './FAB'
import LogView from '../log/LogView'
import PullToRefresh from '../ui/PullToRefresh'
import OfflineBanner from '../ui/OfflineBanner'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { LogViewContext } from '../../contexts/LogViewContext'

export default function AppShell({ children }) {
  const queryClient = useQueryClient()
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

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries()
  }, [queryClient])

  return (
    <LogViewContext.Provider value={{ openLogView }}>
      <div className="flex flex-col bg-ios-bg overflow-hidden" style={{ height: '100dvh' }}>
        <OfflineBanner />
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-y-auto">
          <main className="pb-4">
            {children}
          </main>
        </PullToRefresh>
        <FAB onPress={() => openLogView({})} />
        <BottomNav />
        <LogView isOpen={logViewOpen} onClose={handleClose} prefill={logViewPrefill} />
      </div>
    </LogViewContext.Provider>
  )
}
