import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

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

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Admin gets all permissions
    if (user.role === 'ADMIN') {
      const allPermissions = [
        { resource: 'dashboard', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'items', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'sales', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'categories', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'users', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'settings', canView: true, canCreate: true, canEdit: true, canDelete: true },
        { resource: 'reports', canView: true, canCreate: true, canEdit: true, canDelete: true }
      ]
      return NextResponse.json(allPermissions)
    }

    // Get role-specific permissions
    const permissions = await prisma.rolePermission.findMany({
      where: { role: user.role },
      select: {
        resource: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true
      }
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Permissions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
