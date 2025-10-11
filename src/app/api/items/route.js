import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCacheOrSet, invalidateCache, CACHE_PREFIXES, DEFAULT_TTL } from '@/lib/cache'

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

    // Cache key for items list
    const cacheKey = `${CACHE_PREFIXES.ITEMS}list`
    
    // Use cache or fetch fresh data
    const items = await getCacheOrSet(
      cacheKey,
      async () => {
        return await prisma.item.findMany({
          include: {
            category: true
          },
          orderBy: { createdAt: 'desc' }
        })
      },
      DEFAULT_TTL.LONG // Cache for 30 minutes
    )

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

    // Invalidate related caches
    await invalidateCache.items()
    await invalidateCache.categories()
    await invalidateCache.dashboard()

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
