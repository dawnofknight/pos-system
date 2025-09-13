'use client'

import { useState } from 'react'

export default function DirectTest() {
  // Theme functionality removed
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Direct DOM Test</h1>
      
      <div className="space-y-4">
        <p>Light theme only</p>
        
        <div className="p-4 bg-white text-black border">
          <p>This should change: White bg in light, Black bg in dark</p>
        </div>
        
        <div className="p-4 bg-gray-100 text-gray-900 border">
          <p>This should also change: Gray variants</p>
        </div>
      </div>
    </div>
  )

