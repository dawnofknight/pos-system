'use client'

import { useState } from 'react'

export default function DirectTest() {
  const [isDark, setIsDark] = useState(false)
  
  const handleToggle = () => {
    console.log('Direct toggle clicked')
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    // Direct DOM manipulation
    const html = document.documentElement
    if (newIsDark) {
      html.classList.add('dark')
      console.log('Added dark class')
    } else {
      html.classList.remove('dark')
      console.log('Removed dark class')
    }
    
    // Log all classes
    console.log('All HTML classes:', [...html.classList])
    
    // Check if dark class is really there
    console.log('Has dark class:', html.classList.contains('dark'))
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Direct DOM Test</h1>
      
      <div className="space-y-4">
        <p>Current state: {isDark ? 'Dark' : 'Light'}</p>
        
        <button
          onClick={handleToggle}
          className="px-4 py-2 bg-primary-500 text-white rounded"
        >
          Toggle Theme
        </button>
        
        <div className="p-4 bg-white dark:bg-black text-black dark:text-white border">
          <p>This should change: White bg in light, Black bg in dark</p>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border">
          <p>This should also change: Gray variants</p>
        </div>
      </div>
    </div>
  )
}
