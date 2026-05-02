import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { SessionProvider, useSession } from './contexts/SessionContext'
import { ensureWeeklyAssignments } from './lib/chores'

const queryClient = new QueryClient()

function MainApp() {
  const { flatmate } = useSession()

  useEffect(() => {
    ensureWeeklyAssignments()
  }, [])

  return (
    <div className="min-h-screen bg-ios-bg font-sans flex items-center justify-center">
      <p className="text-[17px] text-[rgba(60,60,67,0.6)]">
        Welcome, {flatmate?.name} 👋
      </p>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/Hearth">
        <SessionProvider>
          <MainApp />
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
