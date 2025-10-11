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

    // Cache key for categories list
    const cacheKey = `${CACHE_PREFIXES.CATEGORIES}list`
    
    // Use cache or fetch fresh data
    const categories = await getCacheOrSet(
      cacheKey,
      async () => {
        return await prisma.category.findMany({
          include: {
            _count: {
              select: { items: true }
            }
          },
          orderBy: { name: 'asc' }
        })
      },
      DEFAULT_TTL.LONG // Cache for 30 minutes
    )

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
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

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || ''
      }
    })

    // Invalidate related caches
    await invalidateCache.categories()
    await invalidateCache.dashboard()

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
