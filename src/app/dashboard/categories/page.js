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
  Input, 
  Modal, 
  LoadingSpinner 
} from '@/components/ui'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showItemsModal, setShowItemsModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryItems, setCategoryItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchCategories()
        setShowModal(false)
        setFormData({ name: '' })
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setShowItemsModal(true)
    setItemsLoading(true)
    
    try {
      const response = await fetch(`/api/items?categoryId=${category.id}`)
      if (response.ok) {
        const data = await response.json()
        setCategoryItems(data.items || [])
      } else {
        setCategoryItems([])
      }
    } catch (error) {
      console.error('Error fetching category items:', error)
      setCategoryItems([])
    } finally {
      setItemsLoading(false)
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
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-orange-50 border border-orange-200/50 backdrop-blur-xl">
            {/* <div className="absolute inset-0 bg-orange-50/50" /> */}
            <div className="relative px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <span className="text-white text-xl">📂</span>
                    </div>
                    <h1 className="text-3xl font-bold text-black">
                      Categories Management
                    </h1>
                  </div>
                  <p className="text-black ml-14">
                    Organize and manage your product categories
                  </p>
                </div>
                <Button 
                  onClick={() => setShowModal(true)}
                  variant="primary"
                  icon="➕"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                >
                  Add New Category
                </Button>
              </div>
            </div>
          </div>

          <Card variant="glass" hover={true} className="backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader variant="glass" className="card-header-orange">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                  <span className="text-white text-sm">📋</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Product Categories
                  </h3>
                  <p className="text-sm text-black">
                    {categories.length} categories total
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Items Count</TableHeaderCell>
                    <TableHeaderCell>Created Date</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow 
                      key={category.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-white/20 shadow-sm flex items-center justify-center">
                            <span className="text-purple-600 text-lg">📂</span>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{category.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50 shadow-sm">
                          {category._count.items} items
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <Modal 
            isOpen={showModal} 
            onClose={() => {
              setShowModal(false)
              setFormData({ name: '' })
            }}
            title={
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-b border-purple-200/30 dark:border-purple-700/30">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                  <span className="text-white text-lg">➕</span>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Add New Category
                </h3>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
                icon="📂"
                variant="glass"
              />
              
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="submit" 
                  variant="primary"
                  icon="✅"
                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Add Category
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '' })
                  }}
                  icon="❌"
                  className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>

          {/* Category Items Modal */}
          <Modal 
            isOpen={showItemsModal} 
            onClose={() => {
              setShowItemsModal(false)
              setSelectedCategory(null)
              setCategoryItems([])
            }}
            title={
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-blue-200/30 dark:border-blue-700/30">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <span className="text-white text-lg">📦</span>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                   Items in &quot;{selectedCategory?.name}&quot;
                 </h3>
              </div>
            }
            size="lg"
          >
            <div className="p-6">
              {itemsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="lg" />
                </div>
              ) : categoryItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {categoryItems.map((item) => (
                      <div 
                         key={item.id} 
                         className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                       >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 shadow-sm flex items-center justify-center">
                             <span className="text-blue-700 text-xl">📦</span>
                           </div>
                          <div>
                             <h4 className="font-semibold text-gray-900">{item.name}</h4>
                             <p className="text-sm text-gray-600">
                               Stock: {item.stock} | Price: Rp {item.price?.toLocaleString('id-ID') || '0'}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-lg font-bold text-gray-900">
                             Rp {item.price?.toLocaleString('id-ID') || '0'}
                           </div>
                           <div className={`text-sm px-2 py-1 rounded-lg ${
                             item.stock > 10 
                               ? 'bg-green-100 text-green-800 border border-green-200' 
                               : item.stock > 0 
                                 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                 : 'bg-red-100 text-red-800 border border-red-200'
                           }`}>
                            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                     <span className="text-gray-500 text-2xl">📦</span>
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">
                     No items found
                   </h3>
                   <p className="text-gray-600">
                     This category doesn&apos;t have any items yet.
                   </p>
                 </div>
              )}
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
