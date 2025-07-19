'use client'

import { useState, useEffect } from 'react'

export default function SimpleThemeTest() {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('simple-theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  const toggleTheme = () => {
    console.log('Simple toggle clicked, current isDark:', isDark)
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('simple-theme', 'dark')
      console.log('Applied dark theme')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('simple-theme', 'light')
      console.log('Applied light theme')
    }
    
    console.log('Document classes:', document.documentElement.classList.toString())
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
          Simple Theme Test
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-800 dark:text-gray-200">
            Current state: {isDark ? 'Dark' : 'Light'}
          </p>
          
          <button
            onClick={toggleTheme}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Toggle to {isDark ? 'Light' : 'Dark'} Mode
          </button>
          
          <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Test Card
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This card should change colors when you toggle the theme.
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded text-red-900 dark:text-red-100">
                Red variant
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded text-green-900 dark:text-green-100">
                Green variant
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-gray-300 dark:border-gray-700 rounded">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Debug Info</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              React state: {isDark ? 'dark' : 'light'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              HTML classes: {typeof document !== 'undefined' ? document.documentElement.classList.toString() : 'loading...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
