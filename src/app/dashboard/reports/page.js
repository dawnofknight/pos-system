'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  Input,
  LoadingSpinner
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const { user, token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [reportsData, setReportsData] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [settings, setSettings] = useState({ currencySymbol: '$' })
  
  // Filter states
  const [period, setPeriod] = useState('today')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  // Fetch reports data
  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period,
        ...(paymentMethodId && { paymentMethodId }),
        ...(period === 'custom' && startDate && { startDate }),
        ...(period === 'custom' && endDate && { endDate })
      })

      const response = await fetch(`/api/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReportsData(data)
      } else {
        console.error('Failed to fetch reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSettings()
      fetchPaymentMethods()
      fetchReports()
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchReports()
    }
  }, [period, paymentMethodId, startDate, endDate])

  const formatPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'year': return 'This Year'
      case 'custom': return 'Custom Range'
      default: return 'Today'
    }
  }

  if (loading && !reportsData) {
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
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                📊 Sales Reports
              </h1>
              <p className="text-gray-600">
                View sales analytics and performance metrics
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-foreground">
                Filters
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <Select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                  >
                    <option value="">All Methods</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {period === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : reportsData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {reportsData.summary.totalSales}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Sales
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatPeriodLabel(reportsData.summary.period)}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportsData.summary.totalRevenue, settings.currencySymbol)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatPeriodLabel(reportsData.summary.period)}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reportsData.summary.averageSale, settings.currencySymbol)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Average Sale
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Per transaction
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(reportsData.paymentMethods).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Payment Methods
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Used in period
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Payment Methods Breakdown */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-foreground">
                    💳 Payment Methods Breakdown
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {Object.entries(reportsData.paymentMethods).map(([method, stats]) => (
                      <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{method}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.count} transactions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {formatCurrency(stats.total, settings.currencySymbol)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((stats.total / reportsData.summary.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Top Selling Items */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-foreground">
                    🏆 Top Selling Items
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {reportsData.topItems.slice(0, 10).map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.quantity} units sold
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {formatCurrency(item.revenue, settings.currencySymbol)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-foreground">
                    📂 Category Performance
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {Object.entries(reportsData.categories).map(([category, stats]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{category}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.quantity} items • {stats.count} transactions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {formatCurrency(stats.revenue, settings.currencySymbol)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-foreground">
                    🕒 Recent Sales
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {reportsData.sales.slice(0, 10).map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">
                            Sale #{sale.id}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {sale.user.name} • {sale.paymentMethod?.name || 'Unknown'} • {sale.itemCount} items
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {formatCurrency(sale.total, settings.currencySymbol)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>No data available for the selected period</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}