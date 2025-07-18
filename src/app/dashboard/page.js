'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody, Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell, LoadingSpinner } from '@/components/ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your POS system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${stats?.stats?.totalSales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {stats?.stats?.totalSales?.count || 0} transactions
                    </dd>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Today's Sales</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${stats?.stats?.todaySales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {stats?.stats?.todaySales?.count || 0} transactions
                    </dd>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">📦</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Total Items</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.totalItems || 0}
                    </dd>
                    <dd className="text-sm text-gray-500">In inventory</dd>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">Low Stock</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.lowStockItems || 0}
                    </dd>
                    <dd className="text-sm text-gray-500">Items under 10</dd>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Sales and Top Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Sales</h3>
              </CardHeader>
              <CardBody>
                {stats?.recentSales?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Cashier</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${sale.total.toFixed(2)}</TableCell>
                          <TableCell>{sale.user.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent sales</p>
                )}
              </CardBody>
            </Card>

            {/* Top Items */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Top Selling Items</h3>
              </CardHeader>
              <CardBody>
                {stats?.topItems?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Item</TableHeaderCell>
                        <TableHeaderCell>Sold</TableHeaderCell>
                        <TableHeaderCell>Price</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.totalSold}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales data</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
