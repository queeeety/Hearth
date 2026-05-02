import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { SessionProvider } from './contexts/SessionContext'
import { ErrorProvider } from './contexts/ErrorContext'
import AppShell from './components/layout/AppShell'
import { ensureWeeklyAssignments } from './lib/chores'

import HomeScreen        from './screens/HomeScreen'
import AllChoresScreen   from './screens/AllChoresScreen'
import ChoreDetailScreen from './screens/ChoreDetailScreen'
import AllBuyingsScreen  from './screens/AllBuyingsScreen'
import ItemDetailScreen  from './screens/ItemDetailScreen'
import MyWorkScreen      from './screens/MyWorkScreen'
import MeScreen          from './screens/MeScreen'
import VacationScreen    from './screens/VacationScreen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: true,
    },
  },
})

function MainApp() {
  useEffect(() => {
    ensureWeeklyAssignments()
  }, [])

  useEffect(() => {
    OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      serviceWorkerPath: '/Hearth/OneSignalSDKWorker.js',
      allowLocalhostAsSecureOrigin: true,
    }).catch(() => {})
  }, [])

  return (
    <AppShell>
      <Routes>
        <Route path="/"            element={<HomeScreen />} />
        <Route path="/chores"      element={<AllChoresScreen />} />
        <Route path="/chores/:id"  element={<ChoreDetailScreen />} />
        <Route path="/buyings"     element={<AllBuyingsScreen />} />
        <Route path="/buyings/:id" element={<ItemDetailScreen />} />
        <Route path="/my-work"     element={<MyWorkScreen />} />
        <Route path="/me"          element={<MeScreen />} />
        <Route path="/me/vacation" element={<VacationScreen />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/Hearth">
        <SessionProvider>
          <ErrorProvider>
            <MainApp />
          </ErrorProvider>
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
