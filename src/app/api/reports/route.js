import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

// GET /api/reports - Get sales reports with filtering
export async function GET(request) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check user permissions for reports
    const hasPermission = await checkPermission(decoded.userId, 'reports', 'view')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'
    const paymentMethodId = searchParams.get('paymentMethodId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range based on period
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        dateFilter = {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
        break
      case 'week':
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
        break
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        dateFilter = {
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth
          }
        }
        break
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1)
        dateFilter = {
          createdAt: {
            gte: startOfYear,
            lt: endOfYear
          }
        }
        break
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
        break
    }

    // Build where clause
    const whereClause = {
      ...dateFilter,
      ...(paymentMethodId && { paymentMethodId: parseInt(paymentMethodId) })
    }

    // Get sales data
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        paymentMethod: {
          select: {
            name: true
          }
        },
        saleItems: {
          include: {
            item: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate summary statistics
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

    // Group by payment method
    const paymentMethodStats = sales.reduce((acc, sale) => {
      const methodName = sale.paymentMethod?.name || 'Unknown'
      if (!acc[methodName]) {
        acc[methodName] = {
          count: 0,
          total: 0
        }
      }
      acc[methodName].count += 1
      acc[methodName].total += sale.total
      return acc
    }, {})

    // Group by category
    const categoryStats = {}
    sales.forEach(sale => {
      sale.saleItems.forEach(saleItem => {
        const categoryName = saleItem.item.category?.name || 'Uncategorized'
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            count: 0,
            quantity: 0,
            revenue: 0
          }
        }
        categoryStats[categoryName].count += 1
        categoryStats[categoryName].quantity += saleItem.quantity
        categoryStats[categoryName].revenue += saleItem.quantity * saleItem.price
      })
    })

    // Top selling items
    const itemStats = {}
    sales.forEach(sale => {
      sale.saleItems.forEach(saleItem => {
        const itemName = saleItem.item.name
        if (!itemStats[itemName]) {
          itemStats[itemName] = {
            name: itemName,
            quantity: 0,
            revenue: 0
          }
        }
        itemStats[itemName].quantity += saleItem.quantity
        itemStats[itemName].revenue += saleItem.quantity * saleItem.price
      })
    })

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Daily sales for charts (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailySales = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    })

    // Format daily sales data
    const dailyData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayData = dailySales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0]
        return saleDate === dateStr
      })
      
      const dayTotal = dayData.reduce((sum, sale) => sum + (sale._sum.total || 0), 0)
      const dayCount = dayData.reduce((sum, sale) => sum + (sale._count.id || 0), 0)
      
      dailyData.push({
        date: dateStr,
        revenue: dayTotal,
        sales: dayCount
      })
    }

    return NextResponse.json({
      summary: {
        totalSales,
        totalRevenue,
        averageSale,
        period
      },
      paymentMethods: paymentMethodStats,
      categories: categoryStats,
      topItems,
      dailyData,
      sales: sales.map(sale => ({
        id: sale.id,
        total: sale.total,
        createdAt: sale.createdAt,
        user: sale.user,
        paymentMethod: sale.paymentMethod,
        itemCount: sale.saleItems.length
      }))
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}