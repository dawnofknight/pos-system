'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'
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
  Button, 
  Input, 
  Select, 
  Modal, 
  SkeletonItemsGrid,
  SkeletonTable 
} from '@/components/ui'

export default function ItemsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('items')
  const [salesData, setSalesData] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredSalesData, setFilteredSalesData] = useState([])
  const [settings, setSettings] = useState({
    currency: 'IDR',
    currencySymbol: 'Rp'
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    emoji: '',
    image: '',
    imageType: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchCategories()
    fetchSettings()
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      console.log('Fetching sales data...')
      const response = await fetch('/api/sales')
      console.log('Sales API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Sales data fetched:', data)
        
        if (data && data.sales && Array.isArray(data.sales) && data.sales.length > 0) {
          // Transform the data to match our expected format
          const transformedSales = data.sales.map(sale => ({
            id: sale.id,
            date: sale.createdAt,
            items: sale.items.map(saleItem => ({
              name: saleItem.item.name,
              price: saleItem.price,
              quantity: saleItem.quantity
            }))
          }))
          
          console.log('Transformed sales data:', transformedSales)
          setSalesData(transformedSales)
          setFilteredSalesData(transformedSales)
        } else {
          console.log('No sales data found, using sample data')
          // Use sample data if API returns empty or invalid data
          const sampleData = [
            {
              id: '1',
              date: new Date().toISOString(),
              items: [
                { name: 'Sample Item 1', price: 10.99, quantity: 2 },
                { name: 'Sample Item 2', price: 15.99, quantity: 1 }
              ]
            },
            {
              id: '2',
              date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              items: [
                { name: 'Sample Item 3', price: 5.99, quantity: 3 },
                { name: 'Sample Item 4', price: 20.99, quantity: 1 }
              ]
            }
          ]
          setSalesData(sampleData)
          setFilteredSalesData(sampleData)
        }
      } else {
        console.error('Sales API error:', response.status, response.statusText)
        // Use sample data if API fails
        const sampleData = [
          {
            id: '1',
            date: new Date().toISOString(),
            items: [
              { name: 'Sample Item 1', price: 10.99, quantity: 2 },
              { name: 'Sample Item 2', price: 15.99, quantity: 1 }
            ]
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            items: [
              { name: 'Sample Item 3', price: 5.99, quantity: 3 },
              { name: 'Sample Item 4', price: 20.99, quantity: 1 }
            ]
          }
        ]
        setSalesData(sampleData)
        setFilteredSalesData(sampleData)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      // Use sample data if API fails
      const sampleData = [
        {
          id: '1',
          date: new Date().toISOString(),
          items: [
            { name: 'Sample Item 1', price: 10.99, quantity: 2 },
            { name: 'Sample Item 2', price: 15.99, quantity: 1 }
          ]
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          items: [
            { name: 'Sample Item 3', price: 5.99, quantity: 3 },
            { name: 'Sample Item 4', price: 20.99, quantity: 1 }
          ]
        }
      ]
      setSalesData(sampleData)
      setFilteredSalesData(sampleData)
    }
  }

  // Filter sales data by date range
  const filterSalesByDate = () => {
    if (!startDate && !endDate) {
      setFilteredSalesData(salesData);
      return;
    }

    const filtered = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        return saleDate >= start && saleDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return saleDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return saleDate <= end;
      }
      
      return true;
    });
    
    setFilteredSalesData(filtered);
  }

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

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater'
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchItems()
        setShowModal(false)
        setEditingItem(null)
        resetForm()
        alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to save item'}`)
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    console.log('Edit clicked for item:', item)
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      stock: item.stock.toString(),
      categoryId: item.categoryId.toString(),
      emoji: item.emoji || '',
      image: item.image || '',
      imageType: item.imageType || ''
    })
    setErrors({})
    setShowModal(true)
    console.log('Modal should be showing now, showModal:', true)
  }

  const handleAddNew = () => {
    console.log('Add new clicked')
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      emoji: '',
      image: '',
      imageType: ''
    })
    setErrors({})
    setShowModal(true)
    console.log('Modal should be showing now, showModal:', true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchItems()
        }
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const handleImageUploaded = (filename, type) => {
    setFormData(prev => ({
      ...prev,
      image: filename,
      imageType: type
    }))
  }

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imageType: ''
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      emoji: '',
      image: '',
      imageType: ''
    })
    setErrors({})
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }))

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-8">
            {/* Header Section Skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-orange-50 to-red-50 p-8">
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Tab Navigation Skeleton */}
            <div className="flex space-x-8 border-b border-gray-200">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <SkeletonTable rows={8} columns={5} headers={['Item', 'Category', 'Price', 'Stock', 'Actions']} />
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
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-orange-50 to-red-50 p-8">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-black">
                    {t("itemsManagement")}
                  </h1>
                  <p className="text-black mt-1">
                    {t("manageInventoryItems")}
                  </p>
                </div>
              </div>
              {activeTab === 'items' && (
                <Button 
                  onClick={handleAddNew}
                  variant="primary"
                  icon="+"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-600 hover:bg-orange-700"
                >
                  {t("addNewItem")}
                </Button>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-red-400/10 rounded-full blur-3xl"></div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('items')}
            >
              {t("itemsInventory")}
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'stock-report'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('stock-report')}
            >
              {t("stockReport")}
            </button>
          </div>

          <Card variant="glass" hover={true} className="backdrop-blur-xl border border-white/20 shadow-2xl">
           <CardHeader variant="glass" className="card-header-orange">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {activeTab === 'items' ? t("inventoryItems") : t("stockReport")}
                    </h3>
                    <p className="text-sm text-orange-600">
                      {activeTab === 'items' ? `${items.length} ${t("itemsInStock")}` : `${filteredSalesData.length} ${t("salesRecords")}`}
                    </p>
                  </div>
                </div>
                {activeTab === 'stock-report' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <label htmlFor="startDate" className="text-sm font-medium">
                        {t("startDate")}:
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <label htmlFor="endDate" className="text-sm font-medium">
                        {t("endDate")}:
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <Button
                      onClick={filterSalesByDate}
                      variant="secondary"
                      className="mt-2 sm:mt-0"
                    >
                      {t("search")}
                    </Button>
                    <Button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setFilteredSalesData(salesData);
                      }}
                      variant="outline"
                      className="mt-2 sm:mt-0"
                    >
                      {t("clear")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {activeTab === 'items' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>{t("item")}</TableHeaderCell>
                      <TableHeaderCell>{t("category")}</TableHeaderCell>
                      <TableHeaderCell>{t("price")}</TableHeaderCell>
                      <TableHeaderCell>{t("stock")}</TableHeaderCell>
                      <TableHeaderCell>{t("actions")}</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <div className="w-14 h-14 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg">
                                <img
                                  src={item.image.startsWith('http') ? item.image : `/uploads/items/${item.image}`}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl shadow-lg">
                                {item.emoji || '📦'}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-foreground">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category.name}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-emerald-600">
                            {settings.currencySymbol}{item.price.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                            item.stock < 10 
                              ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-200' 
                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                          }`}>
                            {item.stock} {t("units")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              icon="✏️"
                              className="hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                            >
                              {t("edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(item.id)}
                              icon="🗑️"
                              className="hover:shadow-lg transition-all duration-200"
                            >
                              {t("delete")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-6">
                  {/* Stock Info Widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Items Widget */}
                    <Card variant="glass" className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">{t("totalItems")}</p>
                          <p className="text-2xl font-bold text-blue-800">{items.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      </div>
                    </Card>

                    {/* Low Stock Items Widget */}
                    <Card variant="glass" className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">{t("lowStockItems")}</p>
                          <p className="text-2xl font-bold text-red-800">
                            {items.filter(item => item.stock < 10).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">⚠️</span>
                        </div>
                      </div>
                    </Card>

                    {/* Total Stock Value Widget */}
                    <Card variant="glass" className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">{t("totalStockValue")}</p>
                          <p className="text-2xl font-bold text-green-800">
                            {settings.currencySymbol}{items.reduce((total, item) => total + (item.price * item.stock), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">💰</span>
                        </div>
                      </div>
                    </Card>

                    {/* Out of Stock Items Widget */}
                    <Card variant="glass" className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">{t("outOfStock")}</p>
                          <p className="text-2xl font-bold text-orange-800">
                            {items.filter(item => item.stock === 0).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📭</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Low Stock Items List */}
                  {items.filter(item => item.stock < 10).length > 0 && (
                    <Card variant="glass" className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm">⚠️</span>
                        </div>
                        <h4 className="text-lg font-semibold text-yellow-800">{t("lowStockAlert")}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items
                          .filter(item => item.stock < 10)
                          .map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-sm">
                                  {item.emoji || '📦'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{item.name}</p>
                                  <p className="text-sm text-gray-600">{item.category.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${item.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                  {item.stock} {t("units")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {settings.currencySymbol}{item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </Card>
                  )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>{t("itemName")}</TableHeaderCell>
                      <TableHeaderCell>{t("category")}</TableHeaderCell>
                      <TableHeaderCell>{t("originStock")}</TableHeaderCell>
                      <TableHeaderCell>{t("soldQuantity")}</TableHeaderCell>
                      <TableHeaderCell>{t("remainingStock")}</TableHeaderCell>
                      <TableHeaderCell>{t("unitPrice")}</TableHeaderCell>
                      <TableHeaderCell>{t("totalSalesValue")}</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items && items.length > 0 ? (
                      items.map(item => {
                        // Calculate sold quantity from sales data
                        const soldQuantity = filteredSalesData
                          .filter(sale => sale && sale.items && Array.isArray(sale.items))
                          .flatMap(sale => sale.items)
                          .filter(saleItem => saleItem && saleItem.name === item.name)
                          .reduce((total, saleItem) => total + (saleItem.quantity || 0), 0);
                        
                        // Calculate origin stock (current stock + sold quantity)
                        const originStock = (item.stock || 0) + soldQuantity;
                        const remainingStock = item.stock || 0;
                        const totalSalesValue = soldQuantity * (item.price || 0);
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {item.emoji && <span className="text-lg">{item.emoji}</span>}
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-gray-500">{item.description}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {categories.find(cat => cat.id === item.categoryId)?.name || t("uncategorized")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-blue-600">
                                {originStock}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-orange-600">
                                {soldQuantity}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`font-semibold ${
                                remainingStock === 0 ? 'text-red-600' : 
                                remainingStock < 10 ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                {remainingStock}
                                {remainingStock === 0 && <span className="ml-1">⚠️</span>}
                                {remainingStock > 0 && remainingStock < 10 && <span className="ml-1">⚡</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-emerald-600">
                                {settings.currencySymbol}{(item.price || 0).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-emerald-600">
                                {settings.currencySymbol}{totalSalesValue.toFixed(2)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-gray-500">
                            <div className="text-4xl mb-2">📦</div>
                            <div className="font-medium">{t("noItemsAvailable")}</div>
                            <div className="text-sm">{t("addItemsToSeeStock")}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardBody>
          </Card>

          <Modal 
            isOpen={showModal} 
            onClose={() => {
              setShowModal(false)
              setEditingItem(null)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <span className="text-lg">{editingItem ? '✏️' : '➕'}</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent">
                  {editingItem ? t("editItem") : t("addNewItem")}
                </span>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t("itemName")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={errors.name}
                icon="🏷️"
                variant="glass"
                placeholder={t("enterItemName")}
              />
              
              <Input
                label={t("description")}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t("optionalDescription")}
                icon="📝"
                variant="glass"
              />

              <Input
                label={t("emojiIcon")}
                name="emoji"
                value={formData.emoji}
                onChange={handleInputChange}
                placeholder={t("emojiPlaceholder")}
                maxLength={4}
                icon="😊"
                variant="glass"
              />

              <ImageUpload
                currentImage={formData.image}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${t("price")} (${settings.currencySymbol})`}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  error={errors.price}
                  icon="💰"
                  variant="glass"
                  placeholder="0.00"
                />
                
                <Input
                  label={t("stockQuantity")}
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  error={errors.stock}
                  icon="📊"
                  variant="glass"
                  placeholder="0"
                />
              </div>
              
              <Select
                label={t("category")}
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: t("selectCategory") },
                  ...categoryOptions
                ]}
                required
                error={errors.categoryId}
                icon="📂"
                variant="glass"
              />
              
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting}
                  icon={isSubmitting ? "⏳" : (editingItem ? "✅" : "➕")}
                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? t("saving") : (editingItem ? t("updateItem") : t("addItem"))}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  icon="❌"
                  className="flex-1 hover:bg-gray-50 transition-all duration-200"
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
