'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRBAC } from '@/contexts/RBACContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { canAccess } = useRBAC()

  const router = useRouter()
  const pathname = usePathname()

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', resource: 'dashboard', description: 'Overview & Analytics' },
    { name: 'Items', href: '/dashboard/items', icon: '📦', resource: 'items', description: 'Menu Items' },
    { name: 'Categories', href: '/dashboard/categories', icon: '🏷️', resource: 'categories', description: 'Product Groups' },
    { name: 'Sales', href: '/dashboard/sales', icon: '💰', resource: 'sales', description: 'POS & Orders' },
    { name: 'Create Sale', href: '/dashboard/sales/create', icon: '🛒', resource: 'sales', description: 'New Transaction' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈', resource: 'reports', description: 'Analytics & Reports' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', resource: 'settings', description: 'System Config' },
  ]

  // Filter navigation based on permissions
  const navigation = allNavigation.filter(item => canAccess(item.resource))

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col modern-card border-0 rounded-none">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 h-0 overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">POS System</h1>
                  <p className="text-xs text-gray-500">Restaurant Management</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-orange-100 text-orange-900 shadow-lg shadow-orange-100/25' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-4 text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                         isActive ? 'text-black-900' : 'text-gray-500'
                       }`}>
                        {item.description}
                      </div>
                    </div>
                  </a>
                )
              })}
            </nav>
            
            {/* Mobile Footer */}
            <div className="px-4 py-4 border-t border-gray-200">
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col modern-card border-0 rounded-none border-r border-gray-200">
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Desktop Header */}
            <div className="flex-shrink-0 px-6 py-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">POS System</h1>
                  <p className="text-sm text-gray-500">Restaurant Management</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-orange-100 text-orange-900 shadow-lg shadow-orange-100/25' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-4 text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? 'font-semibold' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-orange-600 rounded-full opacity-80"></div>
                    )}
                  </a>
                )
              })}
            </nav>
            
            {/* Desktop Footer */}
            <div className="px-4 py-6 border-t border-gray-200">
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-20 modern-card border-0 rounded-none border-b border-gray-200 backdrop-blur-xl bg-white/80">
          <button
            type="button"
            className="border-r border-gray-200 px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 lg:hidden transition-all duration-200 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <span className="text-2xl text-gray-900">☰</span>
          </button>
          
          <div className="flex flex-1 justify-between px-6">
            {/* Search and breadcrumb area */}
            <div className="flex flex-1 items-center">
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <span>🏠</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium capitalize">
                    {pathname.split('/').pop() || 'Dashboard'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="hidden md:inline">Logout</span>
                <span className="md:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>

        <main className="p-6 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
