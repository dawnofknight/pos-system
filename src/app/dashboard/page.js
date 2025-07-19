'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
            <h1 
              className="text-2xl font-bold transition-colors"
              style={{ color: isDark ? '#ffffff' : '#111827' }}
            >
              Dashboard
            </h1>
            <p 
              className="transition-colors"
              style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
            >
              Overview of your POS system
            </p>
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
                    <dt 
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      Total Sales
                    </dt>
                    <dd 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      ${stats?.stats?.totalSales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
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
                    <dt 
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      Today's Sales
                    </dt>
                    <dd 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      ${stats?.stats?.todaySales?.amount?.toFixed(2) || '0.00'}
                    </dd>
                    <dd 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
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
                    <dt 
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      Total Items
                    </dt>
                    <dd 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      {stats?.stats?.totalItems || 0}
                    </dd>
                    <dd 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      In inventory
                    </dd>
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
                    <dt 
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      Low Stock
                    </dt>
                    <dd 
                      className="text-lg font-semibold transition-colors"
                      style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                      {stats?.stats?.lowStockItems || 0}
                    </dd>
                    <dd 
                      className="text-sm transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                      Items under 10
                    </dd>
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
                <h3 
                  className="text-lg font-semibold transition-colors"
                  style={{ color: isDark ? '#ffffff' : '#111827' }}
                >
                  Recent Sales
                </h3>
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
                  <p 
                    className="text-center py-4 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    No recent sales
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Top Items */}
            <Card>
              <CardHeader>
                <h3 
                  className="text-lg font-semibold transition-colors"
                  style={{ color: isDark ? '#ffffff' : '#111827' }}
                >
                  Top Selling Items
                </h3>
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
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.totalSold}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p 
                    className="text-center py-4 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    No sales data
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
