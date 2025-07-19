'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return <div className={`w-20 h-6 ${className}`}></div>
  }

  const isDark = theme === 'dark'

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span 
        className="text-sm"
        style={{ 
          opacity: isDark ? 0.5 : 1,
          fontWeight: isDark ? 'normal' : 'bold'
        }}
      >
        ☀️
      </span>
      
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{
          backgroundColor: isDark ? '#2563eb' : '#d1d5db'
        }}
      >
        <span
          className="inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200"
          style={{
            transform: isDark ? 'translateX(20px)' : 'translateX(2px)'
          }}
        />
        <span className="sr-only">Toggle theme ({theme})</span>
      </button>
      
      <span 
        className="text-sm"
        style={{ 
          opacity: isDark ? 1 : 0.5,
          fontWeight: isDark ? 'bold' : 'normal'
        }}
      >
        🌙
      </span>
    </div>
  )
}
