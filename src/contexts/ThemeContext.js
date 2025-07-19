'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted first, then get theme
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light'
      console.log('Loading saved theme:', savedTheme)
      setTheme(savedTheme)
      
      // Apply theme immediately
      const html = document.documentElement
      if (savedTheme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
      console.log('Initial theme applied:', savedTheme, 'Classes:', html.classList.toString())
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return
    
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Toggling from', theme, 'to', newTheme)
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    console.log('Theme toggled:', newTheme, 'Classes:', html.classList.toString())
    
    // Force a small delay and check again
    setTimeout(() => {
      console.log('After timeout - Classes:', html.classList.toString())
    }, 100)
  }

  const value = {
    theme,
    toggleTheme,
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
  return context
}
