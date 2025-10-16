'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  Input
} from '@/components/ui'
import { SkeletonCard, SkeletonReports } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const { user, token } = useAuth()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [reportsData, setReportsData] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [settings, setSettings] = useState({ currencySymbol: 'Rp' })
  
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
          <SkeletonReports />
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
                📊 {t('salesReports')}
              </h1>
              <p className="text-gray-600">
                {t('viewSalesAnalytics')}
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-foreground">
                {t('filters')}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('period')}
                  </label>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="today">{t('today')}</option>
                    <option value="week">{t('thisWeek')}</option>
                    <option value="month">{t('thisMonth')}</option>
                    <option value="year">{t('thisYear')}</option>
                    <option value="custom">{t('customRange')}</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('paymentMethod')}
                  </label>
                  <Select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                  >
                    <option value="">{t('allMethods')}</option>
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
                        {t('startDate')}
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('endDate')}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
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
                      {t('totalSales')}
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
                      {t('totalRevenue')}
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
                      {t('averageSale')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {t('perTransaction')}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(reportsData.paymentMethods).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('paymentMethods')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {t('usedInPeriod')}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Payment Methods Breakdown */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-foreground">
                    💳 {t('paymentMethodsBreakdown')}
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {Object.entries(reportsData.paymentMethods).map(([method, stats]) => (
                      <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{method}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.count} {t('transactions')}
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
                    🏆 {t('topSellingItems')}
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
                              {item.quantity} {t('unitsSold')}
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
                    📂 {t('categoryPerformance')}
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {Object.entries(reportsData.categories).map(([category, stats]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{category}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.quantity} {t('items')} • {stats.count} {t('transactions')}
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
                    🕒 {t('recentSales')}
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {reportsData.sales.slice(0, 10).map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">
                            {t('sale')} #{sale.id}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {sale.user.name} • {sale.paymentMethod?.name || t('unknown')} • {sale.itemCount} {t('items')}
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
                  <p>{t('noDataAvailable')}</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}