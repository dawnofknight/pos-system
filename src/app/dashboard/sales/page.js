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
  const [filteredSales, setFilteredSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0
  })

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, searchTerm, dateFilter])

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

    setFilteredSales(filtered)
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
              <h1 className="text-2xl font-bold text-foreground">Sales History</h1>
              <p className="text-gray-600">View and manage all sales transactions</p>
            </div>
            <Link href="/dashboard/sales/create">
              <Button variant="primary" className="button-hover-effect bg-orange-600 hover:bg-orange-700">
                + Create New Sale
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
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

          {/* Search and Filter */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search sales by ID, cashier, or item name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setDateFilter('')
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader variant="glass" className="card-header-orange">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredSales.length} of {sales.length} transactions
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
                    {searchTerm || dateFilter ? 'No matching sales found' : 'No sales yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || dateFilter 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Start making sales to see transactions here'
                    }
                  </p>
                  {!searchTerm && !dateFilter && (
                    <Link href="/dashboard/sales/create">
                      <Button variant="primary">Create First Sale</Button>
                    </Link>
                  )}
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                                <span className="text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                              </div>
                            ))}
                            {sale.items.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </div>
                          </div>
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
