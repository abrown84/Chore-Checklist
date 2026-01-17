import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface PasswordFlowContextValue {
  isInPasswordFlow: boolean
  setPasswordFlow: (inFlow: boolean) => void
}

const PasswordFlowContext = createContext<PasswordFlowContextValue | null>(null)

export function PasswordFlowProvider({ children }: { children: React.ReactNode }) {
  const [isInPasswordFlow, setIsInPasswordFlow] = useState(false)

  const setPasswordFlow = useCallback((inFlow: boolean) => {
    setIsInPasswordFlow(inFlow)
  }, [])

  const value = useMemo(() => ({
    isInPasswordFlow,
    setPasswordFlow
  }), [isInPasswordFlow, setPasswordFlow])

  return (
    <PasswordFlowContext.Provider value={value}>
      {children}
    </PasswordFlowContext.Provider>
  )
}

export function usePasswordFlow() {
  const context = useContext(PasswordFlowContext)
  if (!context) {
    throw new Error('usePasswordFlow must be used within PasswordFlowProvider')
  }
  return context
}
