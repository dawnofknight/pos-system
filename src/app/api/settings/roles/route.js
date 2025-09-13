import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin required.' }, { status: 403 })
    }

    // Get or create default role permissions
    let rolePermissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: 'asc' }, { resource: 'asc' }]
    })
    
    if (rolePermissions.length === 0) {
      // Create default permissions
      const resources = ['dashboard', 'items', 'sales', 'categories', 'users', 'settings', 'reports']
      const defaultPermissions = []

      // Admin permissions - full access to everything
      resources.forEach(resource => {
        defaultPermissions.push({
          role: 'ADMIN',
          resource,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true
        })
      })

      // Cashier permissions - limited access
      defaultPermissions.push(
        { role: 'CASHIER', resource: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'items', canView: true, canCreate: false, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'sales', canView: true, canCreate: true, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'categories', canView: true, canCreate: false, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'users', canView: false, canCreate: false, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
        { role: 'CASHIER', resource: 'reports', canView: true, canCreate: false, canEdit: false, canDelete: false }
      )

      await prisma.rolePermission.createMany({
        data: defaultPermissions
      })

      rolePermissions = await prisma.rolePermission.findMany({
        orderBy: [{ role: 'asc' }, { resource: 'asc' }]
      })
    }

    return NextResponse.json(rolePermissions)
  } catch (error) {
    console.error('Role permissions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin required.' }, { status: 403 })
    }

    const { role, resource, canView, canCreate, canEdit, canDelete } = await request.json()

    // Prevent admin from losing settings access
    if (role === 'ADMIN' && resource === 'settings') {
      return NextResponse.json({ error: 'Cannot modify admin settings permissions' }, { status: 400 })
    }

    const permission = await prisma.rolePermission.upsert({
      where: {
        role_resource: { role, resource }
      },
      update: {
        canView: canView !== undefined ? canView : undefined,
        canCreate: canCreate !== undefined ? canCreate : undefined,
        canEdit: canEdit !== undefined ? canEdit : undefined,
        canDelete: canDelete !== undefined ? canDelete : undefined
      },
      create: {
        role,
        resource,
        canView: canView || false,
        canCreate: canCreate || false,
        canEdit: canEdit || false,
        canDelete: canDelete || false
      }
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Role permission update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
