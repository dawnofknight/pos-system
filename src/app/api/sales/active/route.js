import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/sales/active - Get all active sales with table information
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
    
    const activeSales = await prisma.sale.findMany({
      where: {
        status: 'active'
      },
      include: {
        table: true,
        items: {
          include: {
            item: true
          }
        }
      }
    })
    
    return NextResponse.json(activeSales)
  } catch (error) {
    console.error('Error fetching active sales:', error)
    return NextResponse.json({ error: 'Failed to fetch active sales' }, { status: 500 })
  }
}