import { createContext, useContext } from 'react'

const LogViewContext = createContext(null)

export function useLogView() {
  return useContext(LogViewContext)
}

export { LogViewContext }
