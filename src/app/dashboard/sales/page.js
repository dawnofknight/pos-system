'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { useLanguage } from '@/contexts/LanguageContext'
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
  Button
} from '@/components/ui'
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'

export default function SalesPage() {
  const { t } = useLanguage()
  const [sales, setSales] = useState([])
  const [filteredSales, setFilteredSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [periodFilter, setPeriodFilter] = useState('all') // 'all', 'week', 'month', 'year'
  const [settings, setSettings] = useState({
    currency: 'IDR',
    currencySymbol: 'Rp'
  })
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0,
    periodSales: 0,
    periodRevenue: 0
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { color: 'bg-green-100 text-green-800', label: t('completed') },
      ACTIVE: { color: 'bg-blue-100 text-blue-800', label: t('active') },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: t('voided') }
    }
    
    const config = statusConfig[status] || statusConfig.COMPLETED
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  useEffect(() => {
    fetchSales()
    fetchSettings()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, searchTerm, dateFilter, periodFilter, startDate, endDate])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/branding')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          ...data
        }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

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

  const filterSales = () => {
    let filtered = sales

    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => 
          item.item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate.toDateString() === filterDate.toDateString()
      })
    }

    // Apply date range filter
    if (startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= start && saleDate <= end
      })
    } else if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= start
      })
    } else if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate <= end
      })
    }

    setFilteredSales(filtered)
  }

  const calculateStats = (salesData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate period start date based on filter
    const periodStartDate = new Date()
    if (periodFilter === 'week') {
      // Set to beginning of current week (Sunday)
      const day = periodStartDate.getDay()
      periodStartDate.setDate(periodStartDate.getDate() - day)
    } else if (periodFilter === 'month') {
      // Set to beginning of current month
      periodStartDate.setDate(1)
    } else if (periodFilter === 'year') {
      // Set to beginning of current year
      periodStartDate.setMonth(0, 1)
    }
    periodStartDate.setHours(0, 0, 0, 0)

    const todaySales = salesData.filter(sale => 
      new Date(sale.createdAt) >= today
    )
    
    const periodSales = periodFilter === 'all' 
      ? salesData 
      : salesData.filter(sale => new Date(sale.createdAt) >= periodStartDate)

    setStats({
      totalSales: salesData.length,
      totalRevenue: salesData.reduce((sum, sale) => sum + sale.total, 0),
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
      periodSales: periodSales.length,
      periodRevenue: periodSales.reduce((sum, sale) => sum + sale.total, 0)
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            {/* Search and Filter Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Sales Table Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <SkeletonTable rows={8} columns={6} headers={['Sale ID', 'Date', 'Items', 'Total', 'Payment', 'Actions']} />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{t('salesHistory')}</h1>
              <p className="text-sm text-gray-600">{t('viewManageSalesTransactions')}</p>
            </div>
            <Link href="/dashboard/sales/create">
              <Button variant="primary" className="button-hover-effect bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                + {t('createNewSale')}
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="card-hover">
              <CardBody className="text-center p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-orange-600 mb-1">
                  {stats.totalSales}
                </div>
                <div className="text-[10px] md:text-sm text-gray-600">{t('totalSales')}</div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-green-600 mb-1">
                  {settings.currencySymbol}{stats.totalRevenue.toFixed(0)}
                </div>
                <div className="text-[10px] md:text-sm text-gray-600">{t('totalRevenue')}</div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-purple-600 mb-1">
                  {stats.periodSales}
                </div>
                <div className="text-[10px] md:text-sm text-gray-600 line-clamp-2">
                  {periodFilter === 'all' ? t('allTimeSales') : 
                   periodFilter === 'week' ? t('thisWeekSales') : 
                   periodFilter === 'month' ? t('thisMonthSales') : 
                   t('thisYearSales')}
                </div>
              </CardBody>
            </Card>
            <Card className="card-hover">
              <CardBody className="text-center p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-orange-600 mb-1">
                  {settings.currencySymbol}{stats.periodRevenue.toFixed(0)}
                </div>
                <div className="text-[10px] md:text-sm text-gray-600 line-clamp-2">
                  {periodFilter === 'all' ? t('allTimeRevenue') : 
                   periodFilter === 'week' ? t('thisWeekRevenue') : 
                   periodFilter === 'month' ? t('thisMonthRevenue') : 
                   t('thisYearRevenue')}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder={t('searchSalesPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">{t('allTime')}</option>
                    <option value="week">{t('thisWeek')}</option>
                    <option value="month">{t('thisMonth')}</option>
                    <option value="year">{t('thisYear')}</option>
                  </select>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSearchTerm('')
                      setDateFilter('')
                      setPeriodFilter('all')
                      setStartDate('')
                      setEndDate('')
                    }}
                  >
                    {t('clear')}
                  </Button>
                </div>
              </div>
              
              {/* Date Range Filter */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-xs md:text-sm font-medium mb-2">{t('dateRangeFilter')}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                   <div className="flex-1">
                     <label className="block text-xs text-gray-500 mb-1">{t('startDate')}</label>
                     <input
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     />
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs text-gray-500 mb-1">{t('endDate')}</label>
                     <input
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     />
                   </div>
                   <div className="flex items-end">
                     <button
                       onClick={() => filterSales()}
                       className="w-full sm:w-auto px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                     >
                       {t('search')}
                     </button>
                   </div>
                 </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader variant="glass" className="card-header-orange">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('recentTransactions')}</h3>
                <div className="text-sm text-gray-500">
                  {filteredSales.length} {t('of')} {sales.length} {t('transactions')}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {filteredSales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">
                    {searchTerm || dateFilter ? '�' : '�🛒'}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm || dateFilter ? t('noMatchingSalesFound') : t('noSalesYet')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || dateFilter 
                      ? t('tryAdjustingSearchFilter') 
                      : t('startMakingSales')
                    }
                  </p>
                  {!searchTerm && !dateFilter && (
                    <Link href="/dashboard/sales/create">
                      <Button variant="primary">{t('createFirstSale')}</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>{t('dateTime')}</TableHeaderCell>
                      <TableHeaderCell>{t('items')}</TableHeaderCell>
                      <TableHeaderCell>{t('totalAmount')}</TableHeaderCell>
                      <TableHeaderCell>{t('status')}</TableHeaderCell>
                      <TableHeaderCell>{t('cashier')}</TableHeaderCell>
                      <TableHeaderCell>{t('actions')}</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
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
                                +{sale.items.length - 2} {t('moreItems')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              Rp{sale.total.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sale.items.reduce((sum, item) => sum + item.quantity, 0)} {t('items')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sale.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium text-sm">
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
                              {t('viewDetails')}
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
