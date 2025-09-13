'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted flag to indicate hydration is complete
    setMounted(true)
    
    // Remove any dark mode classes if they exist
    if (typeof window !== 'undefined') {
      const html = document.documentElement
      html.classList.remove('dark')
      
      // Clear any theme from localStorage
      localStorage.removeItem('theme')
    }
  }, [])

  const value = {
    mounted
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  // Return a simplified context with light theme values
  return {
    ...context,
    theme: 'light',
    isDark: false
  }
}
