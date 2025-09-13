'use client'

export default function TestThemePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        Theme Test Page (Light Mode Only)
      </h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          Light Background
        </div>
        <div className="text-gray-900 p-4 rounded-lg shadow border">
          Light Text
        </div>
      </div>
    </div>
  )
}
