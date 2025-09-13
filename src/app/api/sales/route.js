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

    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            item: true
          }
        },
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Error fetching sales:', error)
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

    const { items, total, userId, paymentMethodId } = await request.json()

    const sale = await prisma.$transaction(async (prisma) => {
      // Create the sale
      const newSale = await prisma.sale.create({
        data: {
          total: parseFloat(total),
          userId: parseInt(userId || decoded.userId),
          paymentMethodId: parseInt(paymentMethodId || 1) // Default to first payment method if not provided
        }
      })

      // Create sale items and update stock
      for (const item of items) {
        await prisma.saleItem.create({
          data: {
            saleId: newSale.id,
            itemId: parseInt(item.itemId),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }
        })

        // Update item stock
        await prisma.item.update({
          where: { id: parseInt(item.itemId) },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        })
      }

      return newSale
    })

    // Fetch the complete sale data
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: {
          include: {
            item: true
          }
        },
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ sale: completeSale }, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
