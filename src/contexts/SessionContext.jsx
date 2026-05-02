import { createContext, useContext, useState } from 'react'
import { getSession, saveSession, clearSession } from '../lib/auth'
import EircodeScreen from '../screens/EircodeScreen'
import FlatmateSelectScreen from '../screens/FlatmateSelectScreen'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [flatmate, setFlatmateState] = useState(() => getSession())
  const [gateScreen, setGateScreen] = useState('eircode')

  function setFlatmate(f) {
    saveSession(f)
    setFlatmateState({ id: f.id, name: f.name, color: f.color, avatar_emoji: f.avatar_emoji })
  }

  function logout() {
    clearSession()
    setFlatmateState(null)
    setGateScreen('eircode')
  }

  const value = { flatmate, setFlatmate, isAuthenticated: flatmate !== null, logout }

  if (!flatmate) {
    return (
      <SessionContext.Provider value={value}>
        {gateScreen === 'eircode'
          ? <EircodeScreen onSuccess={() => setGateScreen('flatmate_select')} />
          : <FlatmateSelectScreen onSelect={setFlatmate} />
        }
      </SessionContext.Provider>
    )
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
