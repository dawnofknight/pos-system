import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request) {
  const { user, error } = await authMiddleware(request)
  
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total sales
    const totalSales = await prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true }
    })

    // Get today's sales
    const todaySales = await prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        createdAt: {
          gte: startOfDay
        }
      }
    })

    // Get this week's sales
    const weekSales = await prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        createdAt: {
          gte: startOfWeek
        }
      }
    })

    // Get this month's sales
    const monthSales = await prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Get total items and low stock items
    const totalItems = await prisma.item.count()
    const lowStockItems = await prisma.item.count({
      where: {
        stock: {
          lt: 10
        }
      }
    })

    // Get recent sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        items: {
          include: {
            item: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Get top selling items
    const topItems = await prisma.saleItem.groupBy({
      by: ['itemId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    // Get item details for top selling items
    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        const itemDetails = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: { name: true, price: true }
        })
        return {
          ...itemDetails,
          totalSold: item._sum.quantity
        }
      })
    )

    return Response.json({
      stats: {
        totalSales: {
          amount: totalSales._sum.total || 0,
          count: totalSales._count.id || 0
        },
        todaySales: {
          amount: todaySales._sum.total || 0,
          count: todaySales._count.id || 0
        },
        weekSales: {
          amount: weekSales._sum.total || 0,
          count: weekSales._count.id || 0
        },
        monthSales: {
          amount: monthSales._sum.total || 0,
          count: monthSales._count.id || 0
        },
        totalItems,
        lowStockItems
      },
      recentSales,
      topItems: topItemsWithDetails
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
