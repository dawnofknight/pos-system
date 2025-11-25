import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

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
    const saleId = parseInt(awaitedParams.id)

    if (isNaN(saleId)) {
      return NextResponse.json({ error: 'Invalid sale ID' }, { status: 400 });
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        paymentMethod: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Sanitize the sale object to ensure no null relations are sent
    const sanitizedSale = {
      ...sale,
      table: sale.table || null,
      paymentMethod: sale.paymentMethod || null,
      user: sale.user || null,
    };

    return NextResponse.json({
      success: true,
      sale: sanitizedSale,
    });
  } catch (error) {
    console.error('Error fetching sale details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sales/[id] - Update a sale (add items, change status, etc.)
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
    
    const { id } = params
    const { items, status, total, paymentMethodId } = await request.json()
    
    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true
      }
    })
    
    if (!existingSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }
    
    // Start a transaction to update the sale and its items
    const updatedSale = await prisma.$transaction(async (prisma) => {
      // Update the sale
      const sale = await prisma.sale.update({
        where: { id: parseInt(id) },
        data: {
          status: status || existingSale.status,
          total: total || existingSale.total,
          paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : existingSale.paymentMethodId
        }
      })
      
      // If new items are provided, add them to the sale
      if (items && items.length > 0) {
        // Delete existing items if replacing all items
        if (status === 'COMPLETED') {
          await prisma.saleItem.deleteMany({
            where: { saleId: parseInt(id) }
          })
        }
        
        // Add new items
        for (const item of items) {
          // Check if item already exists in the sale
          const existingItem = existingSale.items.find(
            saleItem => saleItem.itemId === item.itemId
          )
          
          if (existingItem) {
            // Update existing item quantity and price
            await prisma.saleItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: item.quantity,
                price: item.price
              }
            })
          } else {
            // Create new sale item
            await prisma.saleItem.create({
              data: {
                saleId: parseInt(id),
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price
              }
            })
            
            // Update item stock if sale is completed
            if (status === 'COMPLETED') {
              await prisma.item.update({
                where: { id: item.itemId },
                data: {
                  stock: {
                    decrement: item.quantity
                  }
                }
              })
            }
          }
        }
      }

      // If sale is completed, update table status to available
      if (status === 'COMPLETED' && existingSale.tableId) {
        await prisma.table.update({
          where: { id: existingSale.tableId },
          data: { status: 'available' }
        })
      }
      
      return sale
    })

    // Invalidate related caches
    await invalidateCache.sales()
    await invalidateCache.dashboard()
    
    return NextResponse.json({
      success: true,
      sale: updatedSale
    })
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sales/[id] - Void a sale transaction
export async function PATCH(request, { params }) {
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
    const saleId = parseInt(awaitedParams.id)
    const { action } = await request.json()

    if (action !== 'void') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check if sale exists and is not already cancelled
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    })

    if (!existingSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    if (existingSale.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Sale is already cancelled' }, { status: 400 })
    }

    // Void the sale and restore stock
    const voidedSale = await prisma.$transaction(async (prisma) => {
      // Update sale status to cancelled
      const sale = await prisma.sale.update({
        where: { id: saleId },
        data: {
          status: 'CANCELLED'
        }
      })

      // Restore stock for all items in the sale
      for (const saleItem of existingSale.items) {
        await prisma.item.update({
          where: { id: saleItem.itemId },
          data: {
            stock: {
              increment: saleItem.quantity
            }
          }
        })
      }

      // If sale had a table, make it available
      if (existingSale.tableId) {
        await prisma.table.update({
          where: { id: existingSale.tableId },
          data: { status: 'available' }
        })
      }

      return sale
    })

    // Invalidate related caches
    await invalidateCache.sales()
    await invalidateCache.dashboard()
    await invalidateCache.items()

    return NextResponse.json({
      success: true,
      message: 'Sale voided successfully',
      sale: voidedSale
    })
  } catch (error) {
    console.error('Error voiding sale:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
