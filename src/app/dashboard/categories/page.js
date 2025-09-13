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
          <div className="relative overflow-hidden rounded-2xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-700/30 backdrop-blur-xl">
            {/* <div className="absolute inset-0 bg-orange-50/50 dark:bg-orange-900/20" /> */}
            <div className="relative px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <span className="text-white text-xl">📂</span>
                    </div>
                    <h1 className="text-3xl font-bold text-black dark:bg-gradient-to-r dark:from-orange-400 dark:via-orange-500 dark:to-orange-300 dark:bg-clip-text dark:text-transparent">
                      Categories Management
                    </h1>
                  </div>
                  <p className="text-black dark:text-orange-300 ml-14">
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

          <Card variant="glass" hover={true} className="backdrop-blur-xl border-white/20 dark:border-gray-700/30 shadow-xl">
            <CardHeader variant="glass" className="card-header-orange">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                  <span className="text-white text-sm">📋</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black dark:bg-gradient-to-r dark:from-orange-400 dark:to-orange-500 dark:bg-clip-text dark:text-transparent">
                    Product Categories
                  </h3>
                  <p className="text-sm text-black dark:text-orange-400">
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
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 border-2 border-white/20 dark:border-gray-700/30 shadow-sm flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 text-lg">📂</span>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{category.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm">
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
