'use client'

export default function SimpleThemeTest() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Simple Theme Test (Light Mode Only)
        </h1>
        
        <div className="space-y-4">
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Test Card
            </h2>
            <p className="text-gray-600">
              This card is in light mode only.
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-100 rounded text-red-900">
                Red variant
              </div>
              <div className="p-4 bg-green-100 rounded text-green-900">
                Green variant
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-gray-300 dark:border-gray-700 rounded">
            <h3 className="font-bold text-foreground mb-2">Debug Info</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              React state: light
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
