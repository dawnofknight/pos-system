'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeaderCell, 
  Button, 
  LoadingSpinner 
} from '@/components/ui'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0
  })

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data.sales)
        calculateStats(data.sales)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (salesData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySales = salesData.filter(sale => 
      new Date(sale.createdAt) >= today
    )

    setStats({
      totalSales: salesData.length,
      totalRevenue: salesData.reduce((sum, sale) => sum + sale.total, 0),
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0)
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
              <p className="text-gray-600">View and manage all sales transactions</p>
            </div>
            <Link href="/dashboard/sales/create">
              <Button variant="primary" className="button-hover-effect">
                + Create New Sale
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats.totalSales}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.todaySales}
                </div>
                <div className="text-sm text-gray-600">Today's Sales</div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  ${stats.todayRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Today's Revenue</div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <div className="text-sm text-gray-500">
                  {sales.length} total transactions
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {sales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales yet</h3>
                  <p className="text-gray-600 mb-6">Start making sales to see transactions here</p>
                  <Link href="/dashboard/sales/create">
                    <Button variant="primary">Create First Sale</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Date & Time</TableHeaderCell>
                      <TableHeaderCell>Items</TableHeaderCell>
                      <TableHeaderCell>Total Amount</TableHeaderCell>
                      <TableHeaderCell>Cashier</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id} className="table-row-hover">
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(sale.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {sale.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <ProductImage item={item.item} size="xs" />
                                <span>{item.item.name}</span>
                                <span className="text-gray-500">×{item.quantity}</span>
                              </div>
                            ))}
                            {sale.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{sale.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${sale.total.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {sale.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{sale.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/sales/${sale.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="button-hover-effect"
                            >
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
