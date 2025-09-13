'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const RBACContext = createContext()

export function RBACProvider({ children }) {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPermissions()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/auth/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (resource, action = 'view') => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    
    const permission = permissions.find(p => p.resource === resource)
    if (!permission) return false
    
    const permissionMap = {
      'view': 'canView',
      'create': 'canCreate',
      'edit': 'canEdit', 
      'delete': 'canDelete'
    }
    
    return permission[permissionMap[action]] || false
  }

  const canAccess = (resource) => hasPermission(resource, 'view')

  return (
    <RBACContext.Provider value={{
      permissions,
      hasPermission,
      canAccess,
      loading,
      user
    }}>
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withPermission(WrappedComponent, resource, action = 'view') {
  return function PermissionWrappedComponent(props) {
    const { hasPermission, loading } = useRBAC()
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )
    }
    
    if (!hasPermission(resource, action)) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this resource.</p>
        </div>
      )
    }
    
    return <WrappedComponent {...props} />
  }
}
