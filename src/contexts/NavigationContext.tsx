import React, { createContext, useContext, ReactNode } from 'react'

interface NavigationContextType {
  navigateToTab: (tab: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
  onTabChange: (tab: string) => void
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, onTabChange }) => {
  const navigateToTab = (tab: string) => {
    onTabChange(tab)
  }

  return (
    <NavigationContext.Provider value={{ navigateToTab }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}








