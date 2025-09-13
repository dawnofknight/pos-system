'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'

import { Card, CardHeader, CardBody } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableHeaderCell
} from '@/components/ui'
import ProductImage from '@/components/ProductImage'

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
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-gray-900"
                >
                  Dashboard
                </h1>
                <p 
                  className="text-lg transition-colors text-gray-600"
                >
                  Real-time insights into your business performance
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="glass" hover={true}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg transition-all duration-300">
                        <span className="text-xl">💰</span>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                          Total Sales
                        </dt>
                      </div>
                    </div>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-1">
                      ${stats?.stats?.totalSales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd className="text-sm font-medium text-orange-600">
                      {stats?.stats?.totalSales?.count || 0} transactions
                    </dd>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 opacity-20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="glass" hover={true}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-lg transition-all duration-300">
                        <span className="text-xl">📈</span>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                          Today's Sales
                        </dt>
                      </div>
                    </div>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent mb-1">
                      ${stats?.stats?.todaySales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd className="text-sm font-medium text-gray-600">
                      {stats?.stats?.todaySales?.count || 0} transactions
                    </dd>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-orange-600 opacity-20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="glass" hover={true}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg transition-all duration-300">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                          Total Items
                        </dt>
                      </div>
                    </div>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-1">
                      {stats?.stats?.totalItems || 0}
                    </dd>
                    <dd className="text-sm font-medium text-orange-600">
                      In inventory
                    </dd>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 opacity-20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="glass" hover={true}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg transition-all duration-300">
                        <span className="text-xl">⚠️</span>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                          Low Stock
                        </dt>
                      </div>
                    </div>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                      {stats?.stats?.lowStockItems || 0}
                    </dd>
                    <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Items under 10
                    </dd>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 opacity-20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Sales and Top Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Sales */}
            <Card variant="glass" hover={true}>
              <CardHeader variant="glass" className="card-header-orange">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🧾</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Recent Sales
                    </h3>
                    <p className="text-sm text-gray-600">
                      Latest transactions
                    </p>
                  </div>
                </div>
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-2xl opacity-50">📊</span>
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No recent sales
                    </p>
                    <p className="text-sm text-gray-500">
                      Sales will appear here once you start making transactions
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Top Items */}
            <Card variant="glass" hover={true}>
              <CardHeader variant="glass" className="card-header-orange">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Top Selling Items
                    </h3>
                    <p className="text-sm text-gray-600">
                      Best performers
                    </p>
                  </div>
                </div>
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
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ProductImage item={item} size="sm" />
                              <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.totalSold}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-2xl opacity-50">🏆</span>
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No sales data
                    </p>
                    <p className="text-sm text-gray-500">
                      Top selling items will appear here after sales are made
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
