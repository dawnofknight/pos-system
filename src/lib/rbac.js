import { NextResponse } from 'next/server'
import { prisma } from './prisma'

export async function checkPermission(userId, resource, action) {
  try {
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return false
    }

    // Admin has access to everything
    if (user.role === 'ADMIN') {
      return true
    }

    // Check specific permission
    const permission = await prisma.rolePermission.findUnique({
      where: {
        role_resource: {
          role: user.role,
          resource: resource
        }
      }
    })

    if (!permission) {
      return false
    }

    // Map action to permission field
    const permissionMap = {
      'view': 'canView',
      'create': 'canCreate', 
      'edit': 'canEdit',
      'delete': 'canDelete'
    }

    const permissionField = permissionMap[action]
    return permission[permissionField] || false

  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

export function withRoleCheck(resource, action = 'view') {
  return function(handler) {
    return async function(request, params) {
      try {
        const token = request.cookies.get('auth-token')?.value
        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Import here to avoid circular dependency
        const { verifyToken } = await import('@/lib/auth')
        const decoded = verifyToken(token)
        if (!decoded) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Check permission
        const hasPermission = await checkPermission(decoded.userId, resource, action)
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        return handler(request, params)
      } catch (error) {
        console.error('Role check middleware error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }
  }
}

export default checkPermission
