import { createContext, useContext, useState, useEffect } from 'react'
import ErrorBanner from '../components/ui/ErrorBanner'

const ErrorContext = createContext(null)

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
