'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function TestThemePage() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Theme Test Page
        </h1>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Current theme: <strong>{theme}</strong>
          </p>
          
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Toggle Theme (Direct Call)
          </button>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Light Card</h3>
              <p className="text-gray-600 dark:text-gray-300">This card should change background</p>
            </div>
            
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Colored Card</h3>
              <p className="text-gray-600 dark:text-gray-300">This card has color variants</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Document Info</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              HTML classList: {typeof document !== 'undefined' ? document.documentElement.classList.toString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
