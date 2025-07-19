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

    const items = await prisma.item.findMany({
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, description, price, stock, categoryId, emoji, image, imageType } = await request.json()

    // Validate required fields
    if (!name || !price || !stock || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const item = await prisma.item.create({
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

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
