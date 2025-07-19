'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRBAC } from '@/contexts/RBACContext'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { canAccess } = useRBAC()
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const isDark = theme === 'dark'

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', resource: 'dashboard' },
    { name: 'Items', href: '/dashboard/items', icon: '📦', resource: 'items' },
    { name: 'Categories', href: '/dashboard/categories', icon: '🏷️', resource: 'categories' },
    { name: 'Sales', href: '/dashboard/sales', icon: '💰', resource: 'sales' },
    { name: 'Create Sale', href: '/dashboard/sales/create', icon: '🛒', resource: 'sales' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', resource: 'settings' },
  ]

  // Filter navigation based on permissions
  const navigation = allNavigation.filter(item => canAccess(item.resource))

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: isDark ? '#111827' : '#f3f4f6' 
      }}
    >
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-opacity-75 transition-opacity"
          style={{ 
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(75, 85, 99, 0.75)' 
          }}
          onClick={() => setSidebarOpen(false)} 
        />
        <div 
          className="relative flex w-full max-w-xs flex-1 flex-col transition-colors"
          style={{ 
            backgroundColor: isDark ? '#1f2937' : '#ffffff' 
          }}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 px-4">
              <h1 
                className="text-xl font-bold transition-colors"
                style={{ 
                  color: isDark ? '#ffffff' : '#111827' 
                }}
              >
                POS System
              </h1>
            </div>
            <nav className="mt-5 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200"
                    style={{
                      backgroundColor: isActive 
                        ? (isDark ? '#374151' : '#f3f4f6')
                        : 'transparent',
                      color: isActive
                        ? (isDark ? '#ffffff' : '#111827')
                        : (isDark ? '#d1d5db' : '#4b5563')
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = isDark ? '#374151' : '#f9fafb'
                        e.target.style.color = isDark ? '#ffffff' : '#111827'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = isDark ? '#d1d5db' : '#4b5563'
                      }
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </a>
                )
              })}
            </nav>
            
            {/* Theme toggle at bottom of sidebar */}
            <div 
              className="px-4 py-4 border-t transition-colors"
              style={{ 
                borderColor: isDark ? '#374151' : '#e5e7eb' 
              }}
            >
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div 
          className="flex min-h-0 flex-1 flex-col border-r transition-colors"
          style={{ 
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 
                className="text-xl font-bold transition-colors"
                style={{ 
                  color: isDark ? '#ffffff' : '#111827' 
                }}
              >
                POS System
              </h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                    style={{
                      backgroundColor: isActive 
                        ? (isDark ? '#374151' : '#f3f4f6')
                        : 'transparent',
                      color: isActive
                        ? (isDark ? '#ffffff' : '#111827')
                        : (isDark ? '#d1d5db' : '#4b5563')
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = isDark ? '#374151' : '#f9fafb'
                        e.target.style.color = isDark ? '#ffffff' : '#111827'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = isDark ? '#d1d5db' : '#4b5563'
                      }
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </a>
                )
              })}
            </nav>
            
            {/* Theme toggle at bottom of desktop sidebar */}
            <div 
              className="px-4 py-4 border-t transition-colors"
              style={{ 
                borderColor: isDark ? '#374151' : '#e5e7eb' 
              }}
            >
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top navigation */}
        <div 
          className="sticky top-0 z-40 flex h-16 shadow transition-colors"
          style={{ 
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            shadowColor: isDark ? '#111827' : '#00000010'
          }}
        >
          <button
            type="button"
            className="border-r px-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden transition-colors"
            style={{ 
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#6b7280' : '#9ca3af'
            }}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <span className="text-xl">☰</span>
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex w-full md:ml-0">
                <div 
                  className="relative w-full transition-colors"
                  style={{ 
                    color: isDark ? '#6b7280' : '#9ca3af'
                  }}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span 
                    className="text-sm font-medium transition-colors"
                    style={{ 
                      color: isDark ? '#d1d5db' : '#374151'
                    }}
                  >
                    {user?.name} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main 
          className="p-6 min-h-screen transition-colors duration-300"
          style={{ 
            backgroundColor: isDark ? '#111827' : '#f9fafb'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
