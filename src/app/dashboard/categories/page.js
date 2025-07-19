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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories Management</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              variant="primary"
            >
              Add New Category
            </Button>
          </div>

          <Card>
            <CardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Items Count</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>{category._count.items}</TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
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
            title="Add New Category"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
              />
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" variant="primary">
                  Add Category
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '' })
                  }}
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
