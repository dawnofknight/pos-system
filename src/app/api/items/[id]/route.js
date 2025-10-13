import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteImage } from '@/lib/imageUtils'
import { invalidateCache } from '@/lib/cache'
import { logActivity } from '@/lib/auditLogger'

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const awaitedParams = await params
    const item = await prisma.item.findUnique({
      where: { id: parseInt(awaitedParams.id) },
      include: {
        category: true
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Fetch complete user data for audit logging
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { name, description, price, stock, categoryId, emoji, image, imageType } = await request.json()

    // Validate required fields
    if (!name || !price || !stock || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const awaitedParams = await params
    const item = await prisma.item.update({
      where: { id: parseInt(awaitedParams.id) },
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        emoji: emoji || '📦',
        image: image || null,
        imageType: imageType || null
      },
      include: {
        category: true
      }
    })

    // Invalidate related caches after item update
    await invalidateCache.items()
    await invalidateCache.categories()
    await invalidateCache.dashboard()
    
    // Log the update activity
    await logActivity({
      action: 'update',
      resource: 'item',
      resourceId: awaitedParams.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      details: {
        description: `Updated item: ${name}`,
        changes: { name, price, stock, categoryId }
      }
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const awaitedParams = await params
    
    // Get item data before deletion to clean up image
    const item = await prisma.item.findUnique({
      where: { id: parseInt(awaitedParams.id) }
    })
    
    if (item && item.image && item.imageType === 'upload') {
      // Delete the image file for uploaded images
      await deleteImage(item.image)
    }
    
    await prisma.item.delete({
      where: { id: parseInt(awaitedParams.id) }
    })

    // Invalidate related caches after item deletion
    await invalidateCache.items()
    await invalidateCache.categories()
    await invalidateCache.dashboard()

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
